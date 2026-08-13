"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  EditableItemList,
  type FieldConfig,
} from "@/features/admin/components/EditableItemList";
import {
  deleteNovedad,
  saveNovedad,
} from "@/features/novedades/actions/novedadActions";
import {
  deleteProject,
  saveProject,
} from "@/features/projects/actions/projectActions";
import type { Novedad } from "@/features/novedades";
import type { Project } from "@/features/projects";

type AdminDashboardProps = {
  projects: Project[];
  novedades: Novedad[];
};

type AdminTab = "projects" | "novedades";

type TabButtonProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count: number;
};

function TabButton({ active, onClick, children, count }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        active
          ? "rounded-full bg-zinc-50 px-4 py-1.5 text-sm font-medium text-zinc-950 shadow-[0_4px_20px_-6px_rgba(148,180,255,0.5)] transition-all duration-200"
          : "rounded-full px-4 py-1.5 text-sm font-medium text-zinc-400 transition-all duration-200 hover:bg-white/[.06] hover:text-zinc-50"
      }
    >
      {children} ({count})
    </button>
  );
}

const projectFields: FieldConfig[] = [
  { key: "title", label: "Título" },
  { key: "description", label: "Descripción", type: "textarea" },
  { key: "video", label: "Video", videoUpload: true },
  { key: "year", label: "Año", type: "number" },
  { key: "href", label: "Link" },
  {
    key: "tags",
    label: "Etiquetas (separadas por coma, sin #)",
    listOf: true,
  },
  {
    key: "highlights",
    label: "Highlights (separados por coma)",
    type: "textarea",
    listOf: true,
  },
  { key: "slug", label: "Slug", hidden: true },
];

const projectColumns = ["title", "year", "tags"];

const novedadFields: FieldConfig[] = [
  { key: "title", label: "Título" },
  { key: "excerpt", label: "Resumen", type: "textarea" },
  { key: "category", label: "Categoría" },
  { key: "source", label: "Medio (revista, diario…)" },
  { key: "date", label: "Fecha" },
  { key: "href", label: "Link" },
  { key: "id", label: "Id", hidden: true },
];

const novedadColumns = ["title", "category", "date"];

function newProject(): Project {
  return {
    slug: "",
    title: "",
    description: "",
    video: "",
    year: new Date().getFullYear(),
    tags: [],
    href: "/",
    highlights: [],
  };
}

function newNovedad(): Novedad {
  return {
    id: "",
    title: "",
    excerpt: "",
    category: "Comunicado",
    source: "",
    date: "",
    href: "/",
  };
}

export function AdminDashboard({ projects, novedades }: AdminDashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("projects");

  function refresh() {
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-8">
      <div
        role="tablist"
        aria-label="Secciones del panel"
        className="flex w-fit gap-1 rounded-full border border-black/[.08] p-1 dark:border-white/[.12]"
      >
        <TabButton
          active={tab === "projects"}
          onClick={() => setTab("projects")}
          count={projects.length}
        >
          Proyectos
        </TabButton>
        <TabButton
          active={tab === "novedades"}
          onClick={() => setTab("novedades")}
          count={novedades.length}
        >
          Novedades
        </TabButton>
      </div>

      <section
        className={tab === "projects" ? "flex flex-col gap-6" : "hidden"}
      >
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Proyectos</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Los videos, etiquetas y textos de la sección Proyectos.
            </p>
          </div>
          <EditableItemList
            items={projects}
            fields={projectFields}
            columns={projectColumns}
            newItem={newProject}
            keyOf={(project) => project.slug}
            onSave={async (project) => {
              const result = await saveProject(project);
              refresh();
              return result;
            }}
            onDelete={async (project) => {
              const result = await deleteProject(project.slug);
              refresh();
              return result;
            }}
          />
        </div>
      </section>

      <section
        className={tab === "novedades" ? "flex flex-col gap-6" : "hidden"}
      >
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Novedades</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Publicaciones, prensa y comunicados del home.
            </p>
          </div>
          <EditableItemList
            items={novedades}
            fields={novedadFields}
            columns={novedadColumns}
            newItem={newNovedad}
            keyOf={(novedad) => novedad.id}
            onSave={async (novedad) => {
              const result = await saveNovedad(novedad);
              refresh();
              return result;
            }}
            onDelete={async (novedad) => {
              const result = await deleteNovedad(novedad.id);
              refresh();
              return result;
            }}
          />
        </div>
      </section>
    </div>
  );
}