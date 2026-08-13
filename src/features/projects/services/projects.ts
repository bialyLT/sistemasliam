import type { Project } from "@/features/projects/types";
import { ensureSchema, getPoolOrNull } from "@/lib/db";
import { readJsonFile } from "@/lib/store";

const SELECT_COLUMNS =
  "slug, title, description, video, year, tags, href, highlights";
const SELECT_ALL = `SELECT ${SELECT_COLUMNS} FROM projects`;
const SELECT_BY_SLUG = `${SELECT_ALL} WHERE slug = $1`;

async function loadSeed(): Promise<Project[]> {
  return readJsonFile<Project[]>("seed/projects.json", []);
}

async function seedIfEmpty(): Promise<void> {
  const pool = await getPoolOrNull();
  const seed = await loadSeed();
  const result = await pool?.query(`SELECT COUNT(*)::int AS count FROM projects`);
  if (result?.rows[0].count === 0 && seed.length > 0) {
    for (const project of seed) {
      await pool!.query(
        `INSERT INTO projects (slug, title, description, video, year, tags, href, highlights)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          project.slug,
          project.title,
          project.description,
          project.video,
          project.year,
          project.tags,
          project.href,
          project.highlights,
        ],
      );
    }
  }
}

export async function getProjects(): Promise<Project[]> {
  const pool = await getPoolOrNull();
  const seed = await loadSeed();

  if (!pool) return seed;

  await ensureSchema();
  await seedIfEmpty();

  const result = await pool.query<Project>(SELECT_ALL);
  return result.rows;
}

export async function getProjectBySlug(
  slug: string,
): Promise<Project | null> {
  const pool = await getPoolOrNull();
  const seed = await loadSeed();

  if (!pool) return seed.find((project) => project.slug === slug) ?? null;

  await ensureSchema();
  const result = await pool.query<Project>(SELECT_BY_SLUG, [slug]);
  return result.rows[0] ?? null;
}

export async function getProjectTags(): Promise<string[]> {
  const pool = await getPoolOrNull();
  const seed = await loadSeed();

  if (!pool) return seedTags(seed);

  await ensureSchema();
  const result = await pool.query<{ tag: string }>(
    "SELECT DISTINCT unnest(tags) AS tag FROM projects ORDER BY tag ASC",
  );
  const tags = result.rows.map((row) => row.tag);
  return tags.length > 0 ? tags : seedTags(seed);
}

function seedTags(seed: Project[]): string[] {
  return Array.from(new Set(seed.flatMap((project) => project.tags))).sort();
}
