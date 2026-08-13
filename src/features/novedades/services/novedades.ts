import type { Novedad } from "@/features/novedades/types";
import { ensureSchema, getPoolOrNull } from "@/lib/db";
import { readJsonFile } from "@/lib/store";

const SELECT_ALL = "SELECT id, title, excerpt, category, source, date, href FROM novedades";

async function loadSeed(): Promise<Novedad[]> {
  return readJsonFile<Novedad[]>("seed/novedades.json", []);
}

async function seedIfEmpty(): Promise<void> {
  const pool = await getPoolOrNull();
  const seed = await loadSeed();
  const result = await pool?.query(`SELECT COUNT(*)::int AS count FROM novedades`);
  if (result?.rows[0].count === 0 && seed.length > 0) {
    for (const novedad of seed) {
      await pool!.query(
        `INSERT INTO novedades (id, title, excerpt, category, source, date, href)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          novedad.id,
          novedad.title,
          novedad.excerpt,
          novedad.category,
          novedad.source ?? null,
          novedad.date,
          novedad.href,
        ],
      );
    }
  }
}

export async function getNovedades(): Promise<Novedad[]> {
  const pool = await getPoolOrNull();
  const seed = await loadSeed();

  if (!pool) return seed;

  await ensureSchema();
  await seedIfEmpty();

  const result = await pool.query<Novedad>(SELECT_ALL);
  return result.rows;
}
