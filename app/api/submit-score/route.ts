import { NextResponse } from "next/server";
import { saveTopicScoreToTurso, getTopicScoresFromTurso } from "@/lib/turso";

export async function POST(req: Request) {
  const data = await req.json();
  const { userId, topicIndex, topicName, score, total } = data;

  if (!userId || topicIndex === undefined || !topicName || score === undefined || total === undefined) {
    return NextResponse.json({ error: "Faltan datos de la nota" }, { status: 400 });
  }

  try {
    await saveTopicScoreToTurso(userId, topicIndex, topicName, score, total);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/submit-score error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error guardando nota"
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Falta userId" }, { status: 400 });
  }

  try {
    const scores = await getTopicScoresFromTurso(Number(userId));
    return NextResponse.json({ scores });
  } catch (error) {
    console.error("/api/submit-score GET error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error obteniendo notas"
      },
      { status: 500 }
    );
  }
}
