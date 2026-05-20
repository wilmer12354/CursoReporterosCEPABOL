import { createClient } from "@libsql/client";

type TursoResult = {
  userId: number;
};

const TURSO_API_BASE_URL = process.env.TURSO_API_BASE_URL;
const TURSO_API_KEY = process.env.TURSO_API_KEY;

if (!TURSO_API_BASE_URL || !TURSO_API_KEY) {
  console.warn("Turso: faltan variables de entorno TURSO_API_BASE_URL o TURSO_API_KEY.");
}

const db = createClient({
  url: TURSO_API_BASE_URL ?? "",
  authToken: TURSO_API_KEY,
  tls: true
});

export async function saveUserToTurso(name: string, age: number): Promise<TursoResult> {
  if (!TURSO_API_BASE_URL || !TURSO_API_KEY) {
    console.warn("Turso variables de entorno no configuradas. Se usa ID temporal.");
    return { userId: Math.floor(Math.random() * 900000) + 100000 };
  }

  const result = await db.execute({
    sql: "INSERT INTO users (name, age, created_at) VALUES (?, ?, ?)",
    args: [name, age, new Date().toISOString()]
  });

  const userId = result.lastInsertRowid ? Number(result.lastInsertRowid) : Date.now();
  return { userId };
}

export async function saveAnswerToTurso(userId: number, questionId: number, answer: string) {
  if (!TURSO_API_BASE_URL || !TURSO_API_KEY) {
    console.warn("Turso variables de entorno no configuradas. Respuesta no guardada en Turso.");
    return null;
  }

  await db.execute({
    sql: "INSERT INTO answers (user_id, question_id, answer, created_at) VALUES (?, ?, ?, ?)",
    args: [userId, questionId, answer, new Date().toISOString()]
  });
}
