"use server";

import { revalidatePath } from "next/cache";
import { getPoolOrNull } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { Project } from "@/features/projects/types";

export type ProjectMutationResult = {
  error?: string;
};

const UPSERT = `
INSERT INTO projects (slug, title, description, video, year, tags, href, seo_title, highlights)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  video = EXCLUDED.video,
  year = EXCLUDED.year,
  tags = EXCLUDED.tags,
  href = EXCLUDED.href,
  seo_title = EXCLUDED.seo_title,
  highlights = EXCLUDED.highlights
`;

export async function saveProject(
  project: Project,
): Promise<ProjectMutationResult> {
  const pool = await getPoolOrNull();
  if (!pool) {
    return {
      error:
        "Base de datos no disponible. Configurá DATABASE_URL en .env.local.",
    };
  }

  const slug = slugify(project.slug) || slugify(project.title);
  if (!slug) {
    return { error: "El proyecto necesita un título o un slug." };
  }

  try {
    await pool.query(UPSERT, [
      slug,
      project.title,
      project.description,
      project.video,
      project.year,
      project.tags,
      project.href,
      project.seoTitle ?? null,
      project.highlights,
    ]);
    revalidatePath("/");
    revalidatePath("/projects");
    return {};
  } catch (error) {
    console.error("[projects] saveProject failed:", error);
    return { error: "No se pudo guardar el proyecto." };
  }
}

export async function deleteProject(
  slug: string,
): Promise<ProjectMutationResult> {
  const pool = await getPoolOrNull();
  if (!pool) {
    return {
      error:
        "Base de datos no disponible. Configurá DATABASE_URL en .env.local.",
    };
  }

  try {
    await pool.query("DELETE FROM projects WHERE slug = $1", [slug]);
    revalidatePath("/");
    revalidatePath("/projects");
    return {};
  } catch (error) {
    console.error("[projects] deleteProject failed:", error);
    return { error: "No se pudo eliminar el proyecto." };
  }
}