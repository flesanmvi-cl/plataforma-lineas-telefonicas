"use client";

import { useState } from "react";

const COLORES = [
  { nombre: "flesan-red", valor: "#E30613", clase: "bg-flesan-red" },
  { nombre: "flesan-black", valor: "#231F20", clase: "bg-flesan-black" },
  { nombre: "flesan-steel", valor: "#58595B", clase: "bg-flesan-steel" },
  { nombre: "flesan-warm", valor: "#A8A9A9", clase: "bg-flesan-warm" },
  { nombre: "flesan-off", valor: "#F4F4F4", clase: "bg-flesan-off" },
  { nombre: "status-ok", valor: "#16A34A", clase: "bg-status-ok" },
  { nombre: "status-warn", valor: "#F59E0B", clase: "bg-status-warn" },
  { nombre: "status-down", valor: "#E30613", clase: "bg-status-down" },
];

const SECCION_CLASES = "flex flex-col gap-4 py-8 border-b border-border";

/* Escala tipográfica — el nombre es el rol en la interfaz, no la clase.
   Los tamaños en px son a raíz 16px (viewport de referencia 1280px CSS);
   la raíz escala hasta 20px en 1920px, así que todo crece en proporción. */
const TIPOGRAFIA = [
  {
    nombre: "Título de página (H1)",
    muestra: "Confianza que construye",
    clase: "display-title text-4xl sm:text-5xl",
    tamano: "2.25rem / 36px — 3rem / 48px en ≥640px",
  },
  {
    nombre: "Título de sección (H2)",
    muestra: "Indicadores del mes",
    clase: "display-title text-3xl",
    tamano: "1.875rem / 30px",
  },
  {
    nombre: "Subtítulo (H3)",
    muestra: "Avance por faena",
    clase: "display-title text-2xl",
    tamano: "1.5rem / 24px",
  },
  {
    nombre: "Título de card (H4)",
    muestra: "Obras activas",
    clase: "font-label text-base font-semibold",
    tamano: "1rem / 16px",
  },
  {
    nombre: "Antetítulo (eyebrow)",
    muestra: "Sistema de diseño",
    clase: "label-eyebrow",
    tamano: "0.75rem / 12px",
  },
  {
    nombre: "Etiqueta / meta",
    muestra: "Actualizado hoy",
    clase: "label-meta text-text",
    tamano: "0.75rem / 12px",
  },
  {
    nombre: "Bajada (lede)",
    muestra: "Descripción de apoyo bajo el título de la página.",
    clase: "body-lede",
    tamano: "1.125rem / 18px",
  },
  {
    nombre: "Cuerpo",
    muestra: "Texto base para párrafos y contenido general.",
    clase: "font-body text-base text-text",
    tamano: "1rem / 16px",
  },
  {
    nombre: "Cuerpo secundario",
    muestra: "Texto de apoyo dentro de cards y tablas.",
    clase: "font-body text-sm text-muted",
    tamano: "0.875rem / 14px",
  },
  {
    nombre: "Nota al pie",
    muestra: "Fuente: control de gestión.",
    clase: "font-body text-xs text-faint",
    tamano: "0.75rem / 12px",
  },
  {
    nombre: "Cifra KPI",
    muestra: "1.248",
    clase: "display-title text-4xl text-text tabular",
    tamano: "2.25rem / 36px",
  },
];

export default function UiKitPage() {
  const [chipActivo, setChipActivo] = useState("Construcción");

  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8">
      {/* Colores */}
      <section className={`${SECCION_CLASES} pt-0`}>
        <h2 className="label-meta text-faint">Colores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COLORES.map(({ nombre, valor, clase }) => (
            <div key={nombre} className="flex flex-col gap-2">
              <div className={`h-16 border border-border ${clase}`} />
              <div>
                <p className="font-label text-xs text-text">{nombre}</p>
                <p className="font-label text-[11px] text-faint">{valor}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tipografía */}
      <section className={SECCION_CLASES}>
        <h2 className="label-meta text-faint">Tipografía</h2>
        <p className="font-body text-sm text-muted max-w-2xl">
          Tres familias: <span className="text-text">Barlow Condensed</span> (display),{" "}
          <span className="text-text">Barlow Semi Condensed</span> (labels) y{" "}
          <span className="text-text">Barlow</span> (cuerpo). Los px son a raíz 16px; la raíz
          escala hasta 20px en pantallas de 1920px, así que la jerarquía se mantiene.
        </p>
        <div className="flex flex-col divide-y divide-border">
          {TIPOGRAFIA.map(({ nombre, muestra, clase, tamano }) => (
            <div
              key={nombre}
              className="flex flex-col gap-2 py-4 sm:flex-row sm:items-baseline sm:gap-6"
            >
              <div className="sm:w-52 sm:shrink-0">
                <p className="font-label text-sm text-text">{nombre}</p>
                <p className="font-label text-[11px] text-faint tabular">{tamano}</p>
                <code className="block font-label text-[11px] text-muted break-words">{clase}</code>
              </div>
              <p className={`${clase} min-w-0`}>{muestra}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cards */}
      <section className={SECCION_CLASES}>
        <h2 className="label-meta text-faint">Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card card-hover p-5">
            <p className="font-label text-sm text-text mb-1">Card con hover</p>
            <p className="font-body text-sm text-muted">Borde rojo y sombra al pasar el mouse.</p>
          </div>
          <div className="card p-5">
            <p className="font-label text-sm text-text mb-1">Card simple</p>
            <p className="font-body text-sm text-muted">Sin interacción, solo contenedor.</p>
          </div>
        </div>
      </section>

      {/* Chips y badges */}
      <section className={SECCION_CLASES}>
        <h2 className="label-meta text-faint">Chips y badges</h2>
        <div className="flex flex-wrap gap-2">
          {["Construcción", "Minería", "Vialidad"].map((sector) => (
            <button
              key={sector}
              onClick={() => setChipActivo(sector)}
              className={`chip-flesan ${chipActivo === sector ? "is-active" : ""}`}
            >
              {sector}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="badge">Activo</span>
          <span className="badge">Próximamente</span>
        </div>
      </section>

      {/* Formularios */}
      <section className={SECCION_CLASES}>
        <h2 className="label-meta text-faint">Inputs</h2>
        <input className="field-input max-w-sm" placeholder="Campo de texto" />
      </section>

      {/* Skeleton */}
      <section className="flex flex-col gap-4 py-8">
        <h2 className="label-meta text-faint">Loading skeleton</h2>
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
        </div>
      </section>
    </div>
  );
}
