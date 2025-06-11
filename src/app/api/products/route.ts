/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { getProductById, createProduct, deleteProduct } from "@/lib/queries";

// GET - Récupérer un produit par ID ou par phaseId
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const phaseId = searchParams.get("phaseId");

    const product = await getProductById(id || undefined, phaseId || undefined);
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Erreur lors de la récupération du produit:", error);
    if (error.message === "ID du produit ou ID de la phase requis") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else if (error.message === "Produit non trouvé") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    } else {
      return NextResponse.json(
        { error: "Erreur lors de la récupération du produit" },
        { status: 500 }
      );
    }
  }
}

// POST - Créer un nouveau produit pour une phase
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phaseId } = body;

    const product = await createProduct(phaseId);
    return NextResponse.json(product);
  } catch (error: any) {
    console.error("Erreur lors de la création du produit:", error);
    if (error.message === "ID de la phase requis") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else if (error.message === "Phase non trouvée") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    } else if (error.message === "Un produit existe déjà pour cette phase") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "Erreur lors de la création du produit" },
        { status: 500 }
      );
    }
  }
}

// DELETE - Supprimer un produit
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await deleteProduct(id || "");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur lors de la suppression du produit:", error);
    if (error.message === "ID du produit requis") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else if (error.message === "Produit non trouvé") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    } else {
      return NextResponse.json(
        { error: "Erreur lors de la suppression du produit" },
        { status: 500 }
      );
    }
  }
}
