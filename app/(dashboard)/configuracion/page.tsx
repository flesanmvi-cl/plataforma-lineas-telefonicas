import Link from "next/link";
import { Users, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";

/**
 * Landing de /configuracion como grilla de secciones — escala mejor que un formulario único
 * a medida que se agregan páginas adminOnly. "Usuarios y roles" es un ejemplo funcional
 * (requiere DATABASE_URL, ver docs/ARQUITECTURA.md); agrega una entrada acá por cada
 * subsección nueva bajo /configuracion/*.
 */
interface Seccion {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

const SECCIONES: Seccion[] = [
  {
    href: "/configuracion/usuarios",
    title: "Usuarios y roles",
    description: "Asigna el rol administrador o miembro a cualquier colaborador de Flesan.",
    icon: Users,
  },
];

export default function ConfiguracionPage() {
  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8">
      <PageHeader
        title="Configuración"
        description="Administración de la plataforma, visible solo para administradores."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        {SECCIONES.map(({ href, title, description, icon: Icon }) => (
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
