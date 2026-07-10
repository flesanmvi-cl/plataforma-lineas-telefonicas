"use client";

import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { useUsuarioActual } from "@/components/user-context";
import { cn } from "@/lib/cn";
import { esAdmin } from "@/lib/roles";
import { useBreadcrumbContext } from "@/components/breadcrumb-context";
import { NAV_ITEMS, isNavActive, tituloDe } from "@/lib/nav";

export function TopBar() {
  const pathname = usePathname();
  const { state: breadcrumb } = useBreadcrumbContext();
  const user = useUsuarioActual();
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || esAdmin(user?.role));

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 h-14 px-4 lg:px-6 border-b border-border bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
      {/* Nav móvil */}
      <nav className="flex md:hidden items-center gap-1 overflow-x-auto">
        {items.map(({ href, label, icon: IconCmp }) => {
          const active = isNavActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 font-label text-[10px] tracking-[0.06em] uppercase whitespace-nowrap border",
                active
                  ? "border-flesan-red text-text"
                  : "border-transparent text-muted",
              )}
            >
              <IconCmp size={14} />
              {label}
            </Link>
          );
        })}
      </nav>

      {breadcrumb ? (
        <nav className="hidden md:flex items-center gap-1.5 font-label text-xs tracking-[0.08em] uppercase">
          {breadcrumb.items.map((label, i) => {
            const esUltimo = i === breadcrumb.items.length - 1;
            return (
              <span key={i} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <ChevronRight size={11} className="text-faint shrink-0" />}
                {esUltimo ? (
                  <span className="text-text truncate max-w-[280px]">{label}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => breadcrumb.onNavigate(i)}
                    className="text-faint hover:text-flesan-red truncate max-w-[200px] cursor-pointer"
                  >
                    {label}
                  </button>
                )}
              </span>
            );
          })}
        </nav>
      ) : (
        <span className="hidden md:block font-label text-xs tracking-[0.12em] uppercase text-faint">
          {tituloDe(pathname)}
        </span>
      )}

      <div className="flex-1" />

      <ThemeToggle />
      <UserMenu name={user?.name} email={user?.email} image={user?.image} role={user?.role} />
    </header>
  );
}
