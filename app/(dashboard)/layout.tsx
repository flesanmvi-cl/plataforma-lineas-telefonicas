import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { BreadcrumbProvider } from "@/components/breadcrumb-context";
import { UserProvider } from "@/components/user-context";
import { SwrProvider } from "@/components/swr-provider";
import { NavStyleProvider } from "@/components/nav-style-context";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
      }
    : null;

  return (
    <UserProvider user={user}>
      <SwrProvider>
        <BreadcrumbProvider>
          <NavStyleProvider>
            <AppShell>{children}</AppShell>
          </NavStyleProvider>
        </BreadcrumbProvider>
      </SwrProvider>
    </UserProvider>
  );
}
