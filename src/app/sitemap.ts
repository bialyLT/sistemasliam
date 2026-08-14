import type { MetadataRoute } from "next";
import { getNovedades } from "@/features/novedades";
import { getProjects } from "@/features/projects";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, novedades] = await Promise.all([
    getProjects(),
    getNovedades(),
  ]);

  const baseUrl = siteConfig.url;

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const novedadEntries: MetadataRoute.Sitemap = novedades.map((novedad) => ({
    url: `${baseUrl}/novedades/${novedad.id}`,
    lastModified: new Date(novedad.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...projectEntries,
    ...novedadEntries,
  ];
}