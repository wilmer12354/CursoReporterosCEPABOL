const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_SHEET_TAB_NAME = process.env.GOOGLE_SHEET_TAB_NAME ?? "Sheet1";
const GOOGLE_SHEET_RANGE = process.env.GOOGLE_SHEET_RANGE ?? "B2:B";

if (!GOOGLE_SHEET_ID) {
  console.warn("Sheets: falta la variable de entorno GOOGLE_SHEET_ID.");
}

async function fetchSheetData(): Promise<string[]> {
  if (!GOOGLE_SHEET_ID) {
    throw new Error("GOOGLE_SHEET_ID no está configurado.");
  }

  const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
    GOOGLE_SHEET_TAB_NAME
  )}&range=${encodeURIComponent(GOOGLE_SHEET_RANGE)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("No se pudo leer el Google Sheet público.");
  }

  const text = await response.text();

const jsonStart = text.indexOf("{");
const jsonEnd = text.lastIndexOf("}");

if (jsonStart === -1 || jsonEnd === -1) {
  throw new Error("Formato inesperado del Sheet público.");
}

const jsonString = text.substring(jsonStart, jsonEnd + 1);

const sheetJson = JSON.parse(jsonString);
  const rows = sheetJson.table?.rows ?? [];
  return rows
    .map((row: any) => {
      const cell = row.c?.[0];
      return cell?.v ?? "";
    })
    .filter((value: unknown) => typeof value === "string") as string[];
}

export async function isNameInSheet(name: string): Promise<boolean> {
  const normalizedName = name.trim().toLowerCase();
  if (!normalizedName) {
    return false;
  }

  try {
    const names = await fetchSheetData();
    return names.some((sheetName) => sheetName.trim().toLowerCase() === normalizedName);
  } catch (error) {
    console.error("isNameInSheet error:", error);
    throw error;
  }
}
