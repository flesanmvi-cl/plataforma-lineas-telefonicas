import Link from "next/link";
import { Palette, Settings, LayoutGrid } from "lucide-react";

const SECCIONES = [
  {
    href: "/ui-kit",
    title: "Guía de Estilo",
    description: "Colores, tipografía, botones, cards, chips, badges e inputs — referencia viva del sistema de diseño.",
    icon: Palette,
    tag: "Diseño",
    available: true,
  },
  {
    href: "/configuracion",
    title: "Configuración",
    description: "Ejemplo de formulario con field-input y botones, listo para adaptar a las opciones reales de la plataforma.",
    icon: Settings,
    tag: "Ejemplo",
    available: true,
  },
  {
    href: "/nueva-seccion",
    title: "Nueva Sección",
    description: "Agrega aquí los módulos propios de la plataforma siguiendo este mismo patrón de card.",
    icon: LayoutGrid,
    tag: "Próximamente",
    available: false,
  },
];

export default function HomePage() {
  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8">
      <div className="mb-10">
        <p className="label-eyebrow brand-bullet mb-3">Grupo Flesan</p>
        <h1 className="display-title text-4xl sm:text-5xl text-text mb-4">
          Nombre Plataforma
        </h1>
        <p className="body-lede max-w-xl">
          Base de plataforma con el sistema de diseño de Grupo Flesan ya instalado — sidebar, dark
          mode, tipografía, componentes y stack de Next.js listos para usar.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SECCIONES.map(({ href, title, description, icon: Icon, tag, available }) => (
          <div key={href} className="relative h-full">
            {available ? (
              <Link href={href} className="card card-hover flex flex-col gap-4 p-6 cursor-pointer block h-full">
                <CardContent title={title} description={description} icon={Icon} tag={tag} />
              </Link>
            ) : (
              <div className="card flex flex-col gap-4 p-6 opacity-50 cursor-not-allowed h-full">
                <CardContent title={title} description={description} icon={Icon} tag={tag} />
                <span className="badge self-start mt-auto">Próximamente</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CardContent({
  title,
  description,
  icon: Icon,
  tag,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  tag: string;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="w-10 h-10 flex items-center justify-center bg-flesan-red/10 text-flesan-red">
          <Icon className="w-5 h-5" />
        </div>
        <span className="label-meta text-faint text-[10px]">{tag}</span>
      </div>
      <div>
        <h2 className="font-label font-600 text-base text-text mb-1 tracking-wide">{title}</h2>
        <p className="font-body text-sm text-muted leading-snug">{description}</p>
      </div>
    </>
  );
}
