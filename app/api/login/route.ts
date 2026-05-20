import { NextResponse } from "next/server";
import { saveUserToTurso } from "@/lib/turso";
import { isNameInSheet } from "@/lib/sheets";

export async function POST(req: Request) {
  const data = await req.json();
  const { name, age } = data;

  if (!name || !age) {
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

    const result = await saveUserToTurso(name, age);
    return NextResponse.json({ success: true, userId: result.userId ?? Date.now() });
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
