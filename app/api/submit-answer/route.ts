import { NextResponse } from "next/server";
import { saveWatchedVideosToTurso } from "@/lib/turso";

export async function POST(req: Request) {
  const data = await req.json();
  const { userId, watchedVideos } = data;

  if (!userId || !watchedVideos || !Array.isArray(watchedVideos)) {
    return NextResponse.json({ error: "Faltan datos del progreso" }, { status: 400 });
  }

  try {
    await saveWatchedVideosToTurso(userId, watchedVideos);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/submit-answer error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error guardando progreso"
      },
      { status: 500 }
    );
  }
}
