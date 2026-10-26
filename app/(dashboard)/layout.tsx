import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { BreadcrumbProvider } from "@/components/breadcrumb-context";
import { UserProvider } from "@/components/user-context";
import { SwrProvider } from "@/components/swr-provider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // Sin acceso a la plataforma (no registrado, desactivado o sin perfil): fuera del dashboard. Las
  // páginas que leen datos lo comprueban además por su cuenta (lib/acceso-paginas.ts).
  if (!session) redirect("/login");
  if (!session.acceso?.habilitado) redirect("/sin-acceso");
  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: session.user.role,
  };

  return (
    <UserProvider user={user}>
      <SwrProvider>
        <BreadcrumbProvider>
          <AppShell>{children}</AppShell>
        </BreadcrumbProvider>
      </SwrProvider>
    </UserProvider>
  );
}
