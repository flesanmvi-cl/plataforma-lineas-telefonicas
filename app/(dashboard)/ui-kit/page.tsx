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

export default function UiKitPage() {
  const [chipActivo, setChipActivo] = useState("Construcción");

  return (
    <div className="animate-fade-in px-4 py-8 lg:px-8 lg:py-10 max-w-5xl mx-auto">
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
        <p className="display-title text-3xl text-text">Display — Barlow Condensed</p>
        <p className="label-meta text-text">Label — Barlow Semi Condensed</p>
        <p className="body-lede">Body lede — Barlow, para subtítulos y descripciones.</p>
        <p className="font-body text-sm text-muted">Body regular, tamaño base para párrafos.</p>
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
