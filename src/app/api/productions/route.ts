import { NextResponse } from "next/server";
import {
  getProductionsByProductId,
  createProduction,
  updateProduction,
  deleteProduction,
} from "@/lib/queries";

// GET - Récupérer toutes les productions d'un produit
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    const productions = await getProductionsByProductId(productId || "");
    return NextResponse.json(productions);
  } catch (error: any) {
    console.error("Erreur lors de la récupération des productions:", error);
    if (error.message === "ID du produit requis") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        { error: "Erreur lors de la récupération des productions" },
        { status: 500 }
      );
    }
  }
}

// POST - Créer une nouvelle production
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, date, taux } = body;

    const production = await createProduction(productId, new Date(date), taux);
    return NextResponse.json(production);
  } catch (error: any) {
    console.error("Erreur lors de la création de la production:", error);
    if (error.message === "Tous les champs sont requis") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        {
          error: error.message || "Erreur lors de la création de la production",
        },
        { status: 500 }
      );
    }
  }
}

// PATCH - Mettre à jour une production
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, productId, date, taux } = body;

    const production = await updateProduction(
      id,
      productId,
      new Date(date),
      taux
    );
    return NextResponse.json(production);
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour de la production:", error);
    if (error.message === "Tous les champs sont requis") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      return NextResponse.json(
        {
          error:
            error.message || "Erreur lors de la mise à jour de la production",
        },
        { status: 500 }
      );
    }
  }
}

// DELETE - Supprimer une production
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    await deleteProduction(id || "");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur lors de la suppression de la production:", error);
    if (error.message === "ID de la production requis") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else if (error.message === "Production non trouvée") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    } else {
      return NextResponse.json(
        { error: "Erreur lors de la suppression de la production" },
        { status: 500 }
      );
    }
  }
}
