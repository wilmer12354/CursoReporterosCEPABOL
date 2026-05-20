import { NextResponse } from "next/server";
import { saveAnswerToTurso } from "@/lib/turso";

export async function POST(req: Request) {
  const data = await req.json();
  const { userId, questionId, answer } = data;

  if (!userId || questionId === undefined || !answer) {
    return NextResponse.json({ error: "Faltan datos de la respuesta" }, { status: 400 });
  }

  try {
    await saveAnswerToTurso(userId, questionId, answer);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/submit-answer error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error guardando respuesta"
      },
      { status: 500 }
    );
  }
}
