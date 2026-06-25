import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";
import { BreadcrumbProvider } from "@/components/breadcrumb-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <BreadcrumbProvider>
      <div className="h-screen flex bg-bg overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
