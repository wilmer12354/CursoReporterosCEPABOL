import { createClient } from "@libsql/client";

type TursoResult = {
  userId: number;
};

const TURSO_API_BASE_URL = process.env.TURSO_API_BASE_URL;
const TURSO_API_KEY = process.env.TURSO_API_KEY;

function getDb() {
  if (!TURSO_API_BASE_URL || !TURSO_API_KEY) {
    throw new Error("Turso: faltan variables de entorno TURSO_API_BASE_URL o TURSO_API_KEY.");
  }
  return createClient({
    url: TURSO_API_BASE_URL,
    authToken: TURSO_API_KEY,
    tls: true
  });
}

export async function saveUserToTurso(name: string): Promise<TursoResult> {
  if (!TURSO_API_BASE_URL || !TURSO_API_KEY) {
    console.warn("Turso variables de entorno no configuradas. Se usa ID temporal.");
    return { userId: Math.floor(Math.random() * 900000) + 100000 };
  }

  const db = getDb();
  // Check if user already exists
  const existingUser = await db.execute({
    sql: "SELECT id FROM users WHERE name = ? LIMIT 1",
    args: [name]
  });

  if (existingUser.rows.length > 0) {
    return { userId: Number(existingUser.rows[0].id) };
  }

  // Insert new user if not exists
  const result = await db.execute({
    sql: "INSERT INTO users (name, age, created_at) VALUES (?, ?, ?)",
    args: [name, 0, new Date().toISOString()]
  });

  const userId = result.lastInsertRowid ? Number(result.lastInsertRowid) : Date.now();
  return { userId };
}

export async function saveAnswerToTurso(userId: number, questionId: number, answer: string) {
  if (!TURSO_API_BASE_URL || !TURSO_API_KEY) {
    console.warn("Turso variables de entorno no configuradas. Respuesta no guardada en Turso.");
    return null;
  }

  const db = getDb();
  await db.execute({
    sql: "INSERT INTO answers (user_id, question_id, answer, created_at) VALUES (?, ?, ?, ?)",
    args: [userId, questionId, answer, new Date().toISOString()]
  });
}

export async function getWatchedVideosFromTurso(userId: number): Promise<number[]> {
  if (!TURSO_API_BASE_URL || !TURSO_API_KEY) {
    return [];
  }

  const db = getDb();
  const result = await db.execute({
    sql: "SELECT watched_videos FROM user_progress WHERE user_id = ? LIMIT 1",
    args: [userId]
  });

  if (result.rows.length === 0) {
    return [];
  }

  const raw = result.rows[0].watched_videos;
  if (typeof raw === "string") {
    return JSON.parse(raw);
  }
  return [];
}

export async function saveWatchedVideosToTurso(userId: number, watchedVideos: number[]) {
  if (!TURSO_API_BASE_URL || !TURSO_API_KEY) {
    console.warn("Turso variables de entorno no configuradas. Progreso no guardado en Turso.");
    return null;
  }

  const db = getDb();
  await db.execute({
    sql: "INSERT INTO user_progress (user_id, watched_videos, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET watched_videos = ?, updated_at = ?",
    args: [userId, JSON.stringify(watchedVideos), new Date().toISOString(), JSON.stringify(watchedVideos), new Date().toISOString()]
  });
}

export async function saveTopicScoreToTurso(userId: number, topicIndex: number, topicName: string, score: number, total: number) {
  if (!TURSO_API_BASE_URL || !TURSO_API_KEY) {
    console.warn("Turso variables de entorno no configuradas. Nota no guardada en Turso.");
    return null;
  }

  const db = getDb();
  await db.execute({
    sql: "INSERT INTO topic_scores (user_id, topic_index, topic_name, score, total, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    args: [userId, topicIndex, topicName, score, total, new Date().toISOString()]
  });
}

export async function getTopicScoresFromTurso(userId: number) {
  if (!TURSO_API_BASE_URL || !TURSO_API_KEY) {
    return [];
  }

  const db = getDb();
  const result = await db.execute({
    sql: "SELECT topic_index, topic_name, score, total FROM topic_scores WHERE user_id = ? ORDER BY topic_index ASC",
    args: [userId]
  });

  return result.rows.map((row) => ({
    topicIndex: Number(row.topic_index),
    topicName: String(row.topic_name),
    score: Number(row.score),
    total: Number(row.total)
  }));
}
