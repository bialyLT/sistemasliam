import { redirect } from "next/navigation";
import { AdminDashboard, isAdminSession } from "@/features/admin";
import { getNovedades } from "@/features/novedades";
import { getProjects } from "@/features/projects";

export default async function AdminPage() {
  if (!(await isAdminSession())) {
    redirect("/admin/login");
  }

  const [projects, novedades] = await Promise.all([
    getProjects(),
    getNovedades(),
  ]);

  return <AdminDashboard projects={projects} novedades={novedades} />;
}