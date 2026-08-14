import type { Novedad } from "@/features/novedades/types";
import { ensureSchema, getPoolOrNull } from "@/lib/db";
import { readJsonFile } from "@/lib/store";

const SELECT_ALL = "SELECT id, title, excerpt, category, source, date, href, image_url AS \"imageUrl\" FROM novedades";

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
        `INSERT INTO novedades (id, title, excerpt, category, source, date, href, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          novedad.id,
          novedad.title,
          novedad.excerpt,
          novedad.category,
          novedad.source ?? null,
          novedad.date,
          novedad.href,
          novedad.imageUrl ?? null,
        ],
      );
      await pool!.query(
        `INSERT INTO novedad_categorias (name) VALUES ($1)
         ON CONFLICT (name) DO NOTHING`,
        [novedad.category],
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

export async function getCategoriasNovedad(): Promise<string[]> {
  const pool = await getPoolOrNull();
  if (!pool) return [];

  await ensureSchema();

  const result = await pool.query<{ name: string }>(
    "SELECT name FROM novedad_categorias ORDER BY name",
  );
  return result.rows.map((row) => row.name);
}
