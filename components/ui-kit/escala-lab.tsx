"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Download, Filter } from "lucide-react";
import { cn } from "@/lib/cn";
import { GL201LineaSimple } from "@/components/charts/gl-201-linea-simple";

/**
 * Laboratorio de escala (/ui-kit/escala). La plataforma usa por defecto la raíz fluida
 * suave (B) y densidad compacta. Aquí se compara contra la raíz fija (A) y la anterior (C),
 * que se aplican como `data-escala` en <html> solo mientras esta página está abierta.
 * Ver la sección ESCALA Y DENSIDAD de app/globals.css.
 */

type Escala = "fija" | "suave" | "anterior";
type Densidad = "comoda" | "compacta";
type Estilo = "barlow" | "reporte";

const ESCALAS: { id: Escala; label: string; detalle: string }[] = [
  { id: "fija", label: "A · Fija", detalle: "16px. Windows y el zoom escalan normal." },
  { id: "suave", label: "B · Fluida suave (default)", detalle: "14 a 16px según viewport." },
  { id: "anterior", label: "C · Anterior", detalle: "clamp(13px, 1.05vw, 20px)." },
];

const DENSIDADES: { id: Densidad; label: string }[] = [
  { id: "compacta", label: "Compacta (default)" },
  { id: "comoda", label: "Cómoda" },
];

const ESTILOS: { id: Estilo; label: string }[] = [
  { id: "reporte", label: "Reporte · Inter Tight" },
  { id: "barlow", label: "Barlow" },
];

const CLAVE_STORAGE = "cia-escala-lab-v2";

interface Medidas {
  viewport: number;
  dpr: number;
  raiz: number;
}

function medir(): Medidas {
  return {
    viewport: window.innerWidth,
    dpr: window.devicePixelRatio,
    raiz: parseFloat(getComputedStyle(document.documentElement).fontSize),
  };
}

export function EscalaLab() {
  const [escala, setEscala] = useState<Escala>("suave");
  const [densidad, setDensidad] = useState<Densidad>("compacta");
  const [estilo, setEstilo] = useState<Estilo>("reporte");
  const [medidas, setMedidas] = useState<Medidas | null>(null);

  // Recupera la última combinación probada (conveniencia, no estado crítico).
  useEffect(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(CLAVE_STORAGE) ?? "null");
      if (guardado?.escala) setEscala(guardado.escala);
      if (guardado?.densidad) setDensidad(guardado.densidad);
      if (guardado?.estilo) setEstilo(guardado.estilo);
    } catch {}
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (escala === "suave") html.removeAttribute("data-escala");
    else html.setAttribute("data-escala", escala);
    try {
      localStorage.setItem(CLAVE_STORAGE, JSON.stringify({ escala, densidad, estilo }));
    } catch {}
    setMedidas(medir());
  }, [escala, densidad, estilo]);

  // El zoom del navegador y el cambio de escala de Windows disparan resize.
  useEffect(() => {
    const actualizar = () => setMedidas(medir());
    window.addEventListener("resize", actualizar);
    return () => {
      window.removeEventListener("resize", actualizar);
      document.documentElement.removeAttribute("data-escala");
    };
  }, []);

  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8">
      <div className="card p-5 mb-8 flex flex-col gap-5">
        <div className="flex flex-wrap items-start gap-x-10 gap-y-4">
          <Selector
            titulo="Escala raíz"
            opciones={ESCALAS}
            valor={escala}
            onChange={setEscala}
          />
          <Selector
            titulo="Densidad"
            opciones={DENSIDADES}
            valor={densidad}
            onChange={setDensidad}
          />
          <Selector
            titulo="Estilo del reporte"
            opciones={ESTILOS}
            valor={estilo}
            onChange={setEstilo}
          />
        </div>
        <p className="font-body text-sm text-muted">
          {ESCALAS.find((e) => e.id === escala)?.detalle} Prueba cada combinación en tu notebook y en
          un monitor, a 100, 125 y 150% de Windows, y con Ctrl + / Ctrl − en el navegador.
        </p>
        {medidas && <Lectura medidas={medidas} />}
      </div>

      <div data-densidad={densidad} className="grid grid-cols-1 xl:grid-cols-5 dens-gap">
        <section className="xl:col-span-2 flex flex-col dens-gap">
          <p className="label-eyebrow brand-bullet">Formulario</p>
          <Formulario />
        </section>
        <section className="xl:col-span-3 flex flex-col dens-gap">
          <p className="label-eyebrow brand-bullet">Reporte</p>
          <div data-estilo={estilo === "reporte" ? "reporte" : undefined} className="flex flex-col dens-gap">
            <Reporte />
          </div>
        </section>
      </div>
    </div>
  );
}

function Selector<T extends string>({
  titulo,
  opciones,
  valor,
  onChange,
}: {
  titulo: string;
  opciones: { id: T; label: string }[];
  valor: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="label-meta text-faint">{titulo}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={titulo}>
        {opciones.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={valor === o.id}
            onClick={() => onChange(o.id)}
            className={cn("chip-flesan", valor === o.id && "is-active")}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Lectura({ medidas }: { medidas: Medidas }) {
  const { viewport, dpr, raiz } = medidas;
  const datos = [
    { label: "Viewport CSS", valor: `${viewport}px` },
    { label: "Escala total (SO × zoom)", valor: `${Math.round(dpr * 100)}%` },
    { label: "Raíz CSS", valor: `${raiz.toFixed(1)}px` },
    { label: "Raíz en pantalla", valor: `${(raiz * dpr).toFixed(1)}px físicos` },
    { label: "Ancho en rem", valor: `${Math.round(viewport / raiz)}rem` },
  ];
  return (
    <dl className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 border-t border-border pt-4">
      {datos.map((d) => (
        <div key={d.label}>
          <dt className="label-meta text-faint">{d.label}</dt>
          <dd className="font-body text-base text-text tabular mt-0.5">{d.valor}</dd>
        </div>
      ))}
    </dl>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label-meta text-muted">{label}</span>
      {children}
    </label>
  );
}

function Formulario() {
  return (
    <form className="card dens-card flex flex-col dens-gap" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 sm:grid-cols-2 dens-gap">
        <Campo label="Obra">
          <select className="field-input dens-control" defaultValue="vespucio">
            <option value="vespucio">Obra Vespucio</option>
            <option value="aysen">Obra Aysén</option>
            <option value="toro">Obra Toro</option>
          </select>
        </Campo>
        <Campo label="Fecha de cierre">
          <input type="date" className="field-input dens-control" defaultValue="2026-09-30" />
        </Campo>
        <Campo label="Monto estimado (CLP)">
          <input className="field-input dens-control tabular" defaultValue="125.400.000" />
        </Campo>
        <Campo label="Responsable">
          <input className="field-input dens-control" placeholder="Nombre o correo" />
        </Campo>
      </div>
      <Campo label="Observaciones">
        <textarea className="field-input dens-control" rows={3} placeholder="Detalle del avance o del riesgo detectado" />
      </Campo>
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className="btn-flesan btn-flesan-ghost">Cancelar</button>
        <button type="submit" className="btn-flesan btn-flesan-primary">Guardar</button>
      </div>
    </form>
  );
}

const KPIS = [
  { label: "Avance físico", valor: "68%", variacion: 4.2 },
  { label: "Avance financiero", valor: "61%", variacion: 2.8 },
  { label: "Desviación costo", valor: "−3,1%", variacion: -1.4 },
  { label: "Obras activas", valor: "24", variacion: 0 },
];

const FILAS = [
  { obra: "Obra Vespucio", region: "Metropolitana", presupuesto: 18_450, real: 17_980, avance: 92 },
  { obra: "Obra Aysén", region: "Aysén", presupuesto: 9_320, real: 9_910, avance: 78 },
  { obra: "Obra Toro", region: "Metropolitana", presupuesto: 12_100, real: 11_640, avance: 65 },
  { obra: "Obra Dolores", region: "Valparaíso", presupuesto: 7_850, real: 8_020, avance: 54 },
  { obra: "Obra Colina", region: "Metropolitana", presupuesto: 15_600, real: 14_210, avance: 41 },
  { obra: "Obra Antofagasta", region: "Antofagasta", presupuesto: 21_300, real: 20_870, avance: 37 },
  { obra: "Obra Temuco", region: "Araucanía", presupuesto: 6_740, real: 6_990, avance: 29 },
  { obra: "Obra Rancagua", region: "O'Higgins", presupuesto: 8_910, real: 8_400, avance: 18 },
];

const miles = new Intl.NumberFormat("es-CL");

function Reporte() {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip-flesan is-active">Sep 2026</span>
        <span className="chip-flesan">Todas las regiones</span>
        <span className="chip-flesan">
          <Filter className="w-3.5 h-3.5" />
          Más filtros
        </span>
        <button type="button" className="btn-flesan btn-flesan-ghost ml-auto">
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      <div className="kpi-fila grid grid-cols-2 lg:grid-cols-4 dens-gap">
        {KPIS.map((k) => (
          <div key={k.label} className="card kpi-card dens-card">
            <p className="label-eyebrow">{k.label}</p>
            <p className="display-title text-3xl text-text">{k.valor}</p>
            <p
              className={cn(
                "font-label text-xs flex items-start gap-1",
                k.variacion > 0 ? "text-status-ok" : k.variacion < 0 ? "text-status-down" : "text-faint",
              )}
            >
              {k.variacion > 0 && <ArrowUp className="w-3 h-3 shrink-0 mt-0.5" />}
              {k.variacion < 0 && <ArrowDown className="w-3 h-3 shrink-0 mt-0.5" />}
              {k.variacion === 0 ? "sin cambio" : `${Math.abs(k.variacion)}% vs mes anterior`}
            </p>
          </div>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="dens-tabla w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left">Obra</th>
              <th className="text-left">Región</th>
              <th className="text-right">Presupuesto MM$</th>
              <th className="text-right">Real MM$</th>
              <th className="text-right">Avance</th>
            </tr>
          </thead>
          <tbody>
            {FILAS.map((f, i) => (
              <tr key={f.obra} className={i % 2 === 1 ? "bg-surface-2" : ""}>
                <td className="text-text">{f.obra}</td>
                <td className="text-muted">{f.region}</td>
                <td className="text-right tabular text-text">{miles.format(f.presupuesto)}</td>
                <td className={cn("text-right tabular", f.real > f.presupuesto ? "text-status-down" : "text-text")}>
                  {miles.format(f.real)}
                </td>
                <td className="text-right tabular text-text">{f.avance}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card dens-card">
        <p className="label-eyebrow mb-3">Avance mensual</p>
        <GL201LineaSimple />
      </div>
    </>
  );
}
