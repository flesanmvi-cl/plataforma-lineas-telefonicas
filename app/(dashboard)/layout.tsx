import { auth } from "@/auth";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { BreadcrumbProvider } from "@/components/breadcrumb-context";
import { UserProvider } from "@/components/user-context";
import { SwrProvider } from "@/components/swr-provider";

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
          <div className="h-screen flex bg-bg overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <TopBar />
              <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
            </div>
          </div>
        </BreadcrumbProvider>
      </SwrProvider>
    </UserProvider>
  );
}
