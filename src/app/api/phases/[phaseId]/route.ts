import { NextResponse } from "next/server";
import { getPhaseById } from "@/lib/queries";

// GET - Récupérer une phase par ID
export async function GET(
  req: Request,
  { params }: { params: Promise<{ phaseId: string }> }
) {
  try {
    const { phaseId } = await params;
    const phase = await getPhaseById(phaseId);
    return NextResponse.json(phase);
  } catch (error: unknown) {
    console.error("Erreur lors de la récupération de la phase:", error);

    // Type guard to check if error has a message property
    const errorMessage =
      error instanceof Error ? error.message : "Erreur inconnue";

    if (errorMessage === "ID de la phase requis") {
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    } else if (errorMessage === "Phase non trouvée") {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    } else {
      return NextResponse.json(
        { error: "Erreur lors de la récupération de la phase" },
        { status: 500 }
      );
    }
  }
}
