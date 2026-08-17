import type { Novedad } from "@/features/novedades/types";
import { ensureSchema, getPoolOrNull } from "@/lib/db";

const SELECT_ALL =
  'SELECT id, title, excerpt, category, source, date, href, image_url AS "imageUrl" FROM novedades ORDER BY date DESC';

export async function getNovedades(): Promise<Novedad[]> {
  const pool = await getPoolOrNull();
  if (!pool) return [];

  await ensureSchema();

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