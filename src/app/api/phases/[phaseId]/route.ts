import { NextResponse } from "next/server";
import { getPhaseById } from "@/lib/queries";
type params = Promise<{ phaseId: string }>;
// GET - Récupérer une phase par ID
export async function GET(req: Request, { params }: { params: params }) {
  try {
    const { phaseId } = await params;
    const phase = await getPhaseById(phaseId);
    return NextResponse.json(phase);
  } catch (error: any) {
    console.error("Erreur lors de la récupération de la phase:", error);
    if (error.message === "ID de la phase requis") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    } else if (error.message === "Phase non trouvée") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    } else {
      return NextResponse.json(
        { error: "Erreur lors de la récupération de la phase" },
        { status: 500 }
      );
    }
  }
}
