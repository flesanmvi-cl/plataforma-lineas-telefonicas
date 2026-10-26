import Link from "next/link";
import { ArrowRight, Phone, Smartphone, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/page-header";

// PLATAFORMA · Inicio de Líneas Telefónicas: accesos a cada sección, como el «Menú de bandejas»
// del aplicativo antiguo (docs/MIGRACION.md §2).

interface Acceso {
  href: string;
  titulo: string;
  descripcion: string;
  icono: LucideIcon;
}

const ACCESOS: Acceso[] = [
  {
    href: "/lineas/chile",
    titulo: "Líneas Chile",
    descripcion: "Líneas telefónicas corporativas de Chile: titular, empresa, centro de costo y estado.",
    icono: Phone,
  },
  {
    href: "/lineas/peru",
    titulo: "Líneas Perú",
    descripcion: "Consulta de las líneas telefónicas corporativas de Perú.",
    icono: Phone,
  },
  {
    href: "/dispositivos",
    titulo: "Dispositivos",
    descripcion: "Celulares y equipos BAM asignados a colaboradores, con marca, modelo e IMEI.",
    icono: Smartphone,
  },
];

export default function InicioPage() {
  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8 flex flex-col gap-6">
      <PageHeader
        title="Líneas Telefónicas"
        description="Registro de las líneas telefónicas corporativas y de los dispositivos móviles asignados a colaboradores de Grupo Flesan."
        className="mb-0"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ACCESOS.map(({ href, titulo, descripcion, icono: Icono }) => (
          <Link key={href} href={href} className="card card-hover dens-card flex flex-col gap-3 group">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 flex items-center justify-center bg-flesan-red/10 text-flesan-red">
                <Icono className="w-5 h-5" />
              </span>
              <h2 className="font-label font-600 text-lg text-text tracking-wide">{titulo}</h2>
              <ArrowRight className="ml-auto w-4 h-4 text-faint group-hover:text-flesan-red transition-colors" />
            </div>
            <p className="font-body text-sm text-muted leading-snug">{descripcion}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
