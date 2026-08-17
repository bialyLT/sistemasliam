import type { Project } from "@/features/projects/types";
import { ensureSchema, getPoolOrNull } from "@/lib/db";

const SELECT_COLUMNS =
  'slug, title, description, video, year, tags, href, seo_title AS "seoTitle", highlights';
const SELECT_ALL = `SELECT ${SELECT_COLUMNS} FROM projects`;
const SELECT_BY_SLUG = `${SELECT_ALL} WHERE slug = $1`;

export async function getProjects(): Promise<Project[]> {
  const pool = await getPoolOrNull();
  if (!pool) return [];

  await ensureSchema();

  const result = await pool.query<Project>(SELECT_ALL);
  return result.rows;
}

export async function getProjectBySlug(
  slug: string,
): Promise<Project | null> {
  const pool = await getPoolOrNull();
  if (!pool) return null;

  await ensureSchema();
  const result = await pool.query<Project>(SELECT_BY_SLUG, [slug]);
  return result.rows[0] ?? null;
}

export async function getProjectTags(): Promise<string[]> {
  const pool = await getPoolOrNull();
  if (!pool) return [];

  await ensureSchema();
  const result = await pool.query<{ tag: string }>(
    "SELECT DISTINCT unnest(tags) AS tag FROM projects ORDER BY tag ASC",
  );
  return result.rows.map((row) => row.tag);
}