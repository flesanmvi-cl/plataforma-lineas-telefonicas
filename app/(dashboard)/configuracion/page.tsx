import Link from "next/link";
import { Presentation, Users, type LucideIcon } from "lucide-react";
import { auth } from "@/auth";
import { esAdmin } from "@/lib/roles";
import { PageHeader } from "@/components/page-header";

/**
 * Landing de /configuracion como grilla de secciones. Configuración está abierta a todos y cada
 * sección se muestra según el rol: las `soloAdmin` (como «Usuarios y roles», que requiere
 * DATABASE_URL, ver docs/ARQUITECTURA.md) solo a administradores, y además tienen su propio gate
 * en su layout. Agrega una entrada acá (y en NAV_CONFIG de lib/nav.ts) por cada subsección nueva.
 */
interface Seccion {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  soloAdmin?: boolean;
}

const SECCIONES: Seccion[] = [
  {
    href: "/configuracion/usuarios",
    title: "Usuarios y roles",
    description: "Asigna el rol administrador o miembro a cualquier colaborador de Flesan.",
    icon: Users,
    soloAdmin: true,
  },
  {
    href: "/configuracion/presentaciones",
    title: "Presentaciones",
    description: "Activa o desactiva «Agregar a presentación» y administra tus presentaciones.",
    icon: Presentation,
  },
];

export default async function ConfiguracionPage() {
  const session = await auth();
  const admin = esAdmin(session?.user?.role);
  const secciones = SECCIONES.filter((s) => !s.soloAdmin || admin);
  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8">
      <PageHeader
        title="Configuración"
        description="Preferencias de la plataforma. Algunas secciones son solo para administradores."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        {secciones.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} href={href} className="card card-hover flex flex-col dens-gap dens-card h-full cursor-pointer block">
            <div className="w-10 h-10 flex items-center justify-center bg-flesan-red/10 text-flesan-red">
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-label font-600 text-base text-text mb-1 tracking-wide">{title}</h2>
              <p className="font-body text-sm text-muted leading-snug">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
