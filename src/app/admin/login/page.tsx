import { redirect } from "next/navigation";
import { LoginForm, isAdminSession } from "@/features/admin";

export default async function AdminLoginPage() {
  if (await isAdminSession()) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto w-full max-w-sm">
      <h2 className="text-lg font-semibold tracking-tight">
        Acceso restringido
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Esta sección es solo para el administrador del sitio.
      </p>
      <div className="mt-6">
        <LoginForm />
      </div>
    </div>
  );
}