import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET - Récupérer un produit par ID ou par phaseId
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const phaseId = searchParams.get("phaseId");

    if (!id && !phaseId) {
      return NextResponse.json(
        { error: "ID du produit ou ID de la phase requis" },
        { status: 400 }
      );
    }

    let product;
    if (id) {
      product = await db.product.findUnique({
        where: { id },
        include: {
          Productions: true,
          Phase: true,
        },
      });
    } else if (phaseId) {
      product = await db.product.findUnique({
        where: { phaseId },
        include: {
          Productions: true,
          Phase: true,
        },
      });
    }

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erreur lors de la récupération du produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du produit" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau produit pour une phase
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phaseId } = body;

    if (!phaseId) {
      return NextResponse.json(
        { error: "ID de la phase requis" },
        { status: 400 }
      );
    }

    // Vérifier si la phase existe
    const phase = await db.phase.findUnique({
      where: { id: phaseId },
    });

    if (!phase) {
      return NextResponse.json({ error: "Phase non trouvée" }, { status: 404 });
    }

    // Vérifier si un produit existe déjà pour cette phase
    const existingProduct = await db.product.findUnique({
      where: { phaseId },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: "Un produit existe déjà pour cette phase" },
        { status: 400 }
      );
    }

    // Créer le produit avec taux initial à 0%
    const product = await db.product.create({
      data: {
        phaseId,
        date: new Date(),
        taux: 0,
        montantProd: 0,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du produit" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un produit
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID du produit requis" },
        { status: 400 }
      );
    }

    // Vérifier si le produit existe
    const product = await db.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le produit (les productions seront supprimées en cascade)
    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du produit:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du produit" },
      { status: 500 }
    );
  }
}
