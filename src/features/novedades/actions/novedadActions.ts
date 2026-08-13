"use server";

import { revalidatePath } from "next/cache";
import { getPoolOrNull } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { Novedad } from "@/features/novedades/types";

export type NovedadMutationResult = {
  error?: string;
};

const UPSERT = `
INSERT INTO novedades (id, title, excerpt, category, source, date, href)
VALUES ($1, $2, $3, $4, $5, $6, $7)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  category = EXCLUDED.category,
  source = EXCLUDED.source,
  date = EXCLUDED.date,
  href = EXCLUDED.href
`;

export async function saveNovedad(
  novedad: Novedad,
): Promise<NovedadMutationResult> {
  const pool = await getPoolOrNull();
  if (!pool) {
    return {
      error:
        "Base de datos no disponible. Configurá DATABASE_URL en .env.local.",
    };
  }

  const id = slugify(novedad.id) || slugify(novedad.title);
  if (!id) {
    return { error: "La novedad necesita un título o un id." };
  }

  try {
    await pool.query(UPSERT, [
      id,
      novedad.title,
      novedad.excerpt,
      novedad.category,
      novedad.source ?? null,
      novedad.date,
      novedad.href,
    ]);
    revalidatePath("/");
    return {};
  } catch (error) {
    console.error("[novedades] saveNovedad failed:", error);
    return { error: "No se pudo guardar la novedad." };
  }
}

export async function deleteNovedad(
  id: string,
): Promise<NovedadMutationResult> {
  const pool = await getPoolOrNull();
  if (!pool) {
    return {
      error:
        "Base de datos no disponible. Configurá DATABASE_URL en .env.local.",
    };
  }

  try {
    await pool.query("DELETE FROM novedades WHERE id = $1", [id]);
    revalidatePath("/");
    return {};
  } catch (error) {
    console.error("[novedades] deleteNovedad failed:", error);
    return { error: "No se pudo eliminar la novedad." };
  }
}