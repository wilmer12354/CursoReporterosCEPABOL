import { NextResponse } from "next/server";
import { saveUserToTurso, getWatchedVideosFromTurso } from "@/lib/turso";
import { isNameInSheet } from "@/lib/sheets";

export async function POST(req: Request) {
  const data = await req.json();
  const { name, age } = data;

  if (!name) {
    return NextResponse.json({ error: "Faltan nombre o edad" }, { status: 400 });
  }

  try {
    const nameIsValid = await isNameInSheet(name);
    if (!nameIsValid) {
      return NextResponse.json(
        {
          error: "Primero debes llenar el formulario para poder ingresar al curso."
        },
        { status: 400 }
      );
    }

    const result = await saveUserToTurso(name);
    const userId = result.userId ?? Date.now();
    const watchedVideos = await getWatchedVideosFromTurso(userId);
    return NextResponse.json({ success: true, userId, watchedVideos });
  } catch (error) {
    console.error("/api/login error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Error guardando usuario"
      },
      { status: 500 }
    );
  }
}
