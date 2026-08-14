import { redirect } from "next/navigation";
import { AdminDashboard, isAdminSession } from "@/features/admin";
import { getCategoriasNovedad, getNovedades } from "@/features/novedades";
import { getProjects } from "@/features/projects";

export default async function AdminPage() {
  if (!(await isAdminSession())) {
    redirect("/admin/login");
  }

  const [projects, novedades, categoriasNovedad] = await Promise.all([
    getProjects(),
    getNovedades(),
    getCategoriasNovedad(),
  ]);

  return (
    <AdminDashboard
      projects={projects}
      novedades={novedades}
      categoriasNovedad={categoriasNovedad}
    />
  );
}