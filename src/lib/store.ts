import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");

export async function readJsonFile<T>(
  filePath: string,
  fallback: T,
): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, filePath), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}