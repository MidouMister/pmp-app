import { NextResponse } from "next/server";
import { db } from "@/lib/db";
type params = Promise<{ phaseId: string }>;
// GET - Récupérer une phase par ID
export async function GET(req: Request, { params }: { params: params }) {
  try {
    const { phaseId } = await params;

    if (!phaseId) {
      return NextResponse.json(
        { error: "ID de la phase requis" },
        { status: 400 }
      );
    }

    const phase = await db.phase.findUnique({
      where: { id: phaseId },
    });

    if (!phase) {
      return NextResponse.json({ error: "Phase non trouvée" }, { status: 404 });
    }

    return NextResponse.json(phase);
  } catch (error) {
    console.error("Erreur lors de la récupération de la phase:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la phase" },
      { status: 500 }
    );
  }
}
