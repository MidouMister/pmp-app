import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  validateProductionTaux,
  updateProductTaux,
} from "@/lib/utils";

// GET - Récupérer toutes les productions d'un produit
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "ID du produit requis" },
        { status: 400 }
      );
    }

    const productions = await db.production.findMany({
      where: { productId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(productions);
  } catch (error) {
    console.error("Erreur lors de la récupération des productions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des productions" },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle production
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, date, taux } = body;

    if (!productId || !date || taux === undefined) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Valider le taux de production
    const validation = await validateProductionTaux(productId, taux);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    // Créer la production
    const production = await db.production.create({
      data: {
        productId,
        date: new Date(date),
        taux,
        mntProd: validation.montantProduit || 0,
      },
    });

    // Mettre à jour le taux total du produit
    await updateProductTaux(productId);

    return NextResponse.json(production);
  } catch (error) {
    console.error("Erreur lors de la création de la production:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la production" },
      { status: 500 }
    );
  }
}

// PATCH - Mettre à jour une production
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, productId, date, taux } = body;

    if (!id || !productId || !date || taux === undefined) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    // Valider le taux de production
    const validation = await validateProductionTaux(productId, taux, id);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.message }, { status: 400 });
    }

    // Mettre à jour la production
    const production = await db.production.update({
      where: { id },
      data: {
        date: new Date(date),
        taux,
        mntProd: validation.montantProduit || 0,
      },
    });

    // Mettre à jour le taux total du produit
    await updateProductTaux(productId);

    return NextResponse.json(production);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la production:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la production" },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une production
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID de la production requis" },
        { status: 400 }
      );
    }

    // Récupérer la production pour connaître son productId avant suppression
    const production = await db.production.findUnique({
      where: { id },
    });

    if (!production) {
      return NextResponse.json(
        { error: "Production non trouvée" },
        { status: 404 }
      );
    }

    const productId = production.productId;

    // Supprimer la production
    await db.production.delete({
      where: { id },
    });

    // Mettre à jour le taux total du produit
    await updateProductTaux(productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la production:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la production" },
      { status: 500 }
    );
  }
}
