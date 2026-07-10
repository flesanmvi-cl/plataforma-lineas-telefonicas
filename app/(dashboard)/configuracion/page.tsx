import Link from "next/link";
import { Users, type LucideIcon } from "lucide-react";

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
    <div className="animate-fade-in px-4 py-8 lg:px-8 lg:py-10 max-w-5xl mx-auto">
      <div className="mb-10">
        <p className="label-eyebrow brand-bullet mb-3">Grupo Flesan</p>
        <h1 className="display-title text-3xl sm:text-4xl text-text mb-4">Configuración</h1>
        <p className="body-lede max-w-xl">Administración de la plataforma — visible solo para administradores.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        {SECCIONES.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} href={href} className="card card-hover flex flex-col gap-4 p-6 h-full cursor-pointer block">
            <div className="w-10 h-10 flex items-center justify-center bg-flesan-red/10 text-flesan-red">
              <Icon size={20} />
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
