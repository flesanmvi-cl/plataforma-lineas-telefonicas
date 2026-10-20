"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown, Copy, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { LabTemaFijo, useTokens } from "@/components/estandar/tema-context";
import { BotonLab } from "@/components/estandar/graficos/botones/boton-lab";
import { Aviso, Insignia } from "@/components/estandar/graficos/base/componentes";
import { CurvaS } from "@/components/estandar/graficos/tiempo/curva-s";
import { GanttObra } from "@/components/estandar/graficos/tiempo/gantt-obra";
import { LineaHitos } from "@/components/estandar/graficos/tiempo/linea-hitos";
import { BurbujasObras } from "@/components/estandar/graficos/mapas/burbujas-obras";
import type { PropsGraficoLab } from "@/components/estandar/tipos";
import { ESTANDAR } from "@/lib/estandar/estandar";
import { exportarCss, FUENTES, PALETAS, SUPERFICIES } from "@/lib/estandar/tema";

// Colores de marca: fijos (no dependen de la paleta de datos elegida).
const MARCA = [
  { nombre: "Rojo Flesan", token: "--color-flesan-red", valor: "#E30613" },
  { nombre: "Negro", token: "--color-flesan-black", valor: "#231F20" },
  { nombre: "Acero", token: "--color-flesan-steel", valor: "#58595B" },
  { nombre: "Cálido", token: "--color-flesan-warm", valor: "#A8A9A9" },
  { nombre: "Claro", token: "--color-flesan-light", valor: "#D9D9D9" },
  { nombre: "Fondo", token: "--color-flesan-off", valor: "#F4F4F4" },
];

// Gráficos del estándar que se muestran vivos, con dónde se usan hoy.
const GRAFICOS: { nombre: string; uso: string; ancho?: boolean; Componente: ComponentType<PropsGraficoLab> }[] = [
  { nombre: "Curva S", uso: "Reporte Tipo 5", Componente: CurvaS },
  { nombre: "Línea de hitos", uso: "Reporte Tipo 5", Componente: LineaHitos },
  { nombre: "Gantt de obra", uso: "Reporte Tipo 5", ancho: true, Componente: GanttObra },
  { nombre: "Mapa de obras", uso: "Reporte Tipo 5", ancho: true, Componente: BurbujasObras },
];

/**
 * Guía de estilo (/ui-kit): lo vigente para toda plataforma nueva, dibujado con el tema fijo
 * del estándar (lib/estandar/estandar.ts). Lo que aún se está probando vive en el laboratorio
 * de diseño, que es otro proyecto.
 */
export function Estandar() {
  return (
    <LabTemaFijo tema={ESTANDAR.tema}>
      <Contenido />
    </LabTemaFijo>
  );
}

function Contenido() {
  const t = useTokens();
  const [copiado, setCopiado] = useState(false);
  const { tema } = t;

  async function copiarCss() {
    try {
      await navigator.clipboard.writeText(exportarCss(t));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {}
  }

  return (
    <div className="page-shell py-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-muted">
          Lo vigente para toda plataforma nueva. Se elige en el laboratorio de diseño y se promueve aquí.
        </p>
        <span
          className={cn(
            "badge border",
            ESTANDAR.provisorio ? "border-status-warn/50 text-status-warn" : "border-border-strong text-muted",
          )}
        >
          {ESTANDAR.provisorio
            ? "Provisorio · sin elección formal"
            : `Vigente desde ${ESTANDAR.vigenteDesde} · v${ESTANDAR.version}`}
        </span>
        <span className="ml-auto">
          <BotonLab variante="secundario" icono={copiado ? Check : Copy} onClick={copiarCss}>
            {copiado ? "Copiado" : "Copiar tokens CSS"}
          </BotonLab>
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Tarjeta
          titulo="Identidad y color"
          className="xl:col-span-2"
          tokens={[
            ...MARCA.map((m) => [m.token, m.valor] as [string, string]),
            ...t.colores.slice(0, 6).map((c, i) => [`--color-chart-${i + 1}`, c] as [string, string]),
            ["--color-estado-bueno", t.estado.bueno],
            ["--color-estado-alerta", t.estado.alerta],
            ["--color-estado-malo", t.estado.malo],
          ]}
        >
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {MARCA.map((m) => (
              <Muestra key={m.token} color={m.valor} nombre={m.nombre} />
            ))}
          </div>
          <Fila titulo="Paleta de datos" nota={PALETAS[tema.paleta].nombre}>
            <span className="flex h-3.5 rounded overflow-hidden">
              {t.colores.slice(0, 6).map((c) => (
                <span key={c} className="flex-1" style={{ background: c }} />
              ))}
            </span>
          </Fila>
          <Fila titulo="Estados" nota="Bueno · alerta · malo">
            <span className="flex h-3.5 rounded overflow-hidden">
              {[t.estado.bueno, t.estado.alerta, t.estado.malo].map((c) => (
                <span key={c} className="flex-1" style={{ background: c }} />
              ))}
            </span>
          </Fila>
        </Tarjeta>

        <Tarjeta
          titulo="Tipografía"
          tokens={[
            ["--font-display", "Barlow Condensed 800 itálica"],
            ["--font-body", "Barlow 400"],
            ["--font-label", "Barlow Semi Condensed 600"],
            ["--font-chart", FUENTES[tema.fuente].nombre],
          ]}
        >
          <Tipo nota="Barlow Condensed">
            <span className="display-title text-2xl">Título de vista</span>
          </Tipo>
          <Tipo nota="Barlow">
            <span className="text-[0.9375rem]">Texto de lectura y formularios</span>
          </Tipo>
          <Tipo nota="Semi Condensed">
            <span className="label-meta text-xs">Etiqueta de campo</span>
          </Tipo>
          <Tipo nota={FUENTES[tema.fuente].nombre}>
            <span className="tabular" style={{ fontFamily: t.fuente, fontSize: t.kpi.cifra * 0.8, fontWeight: 700, letterSpacing: "-0.03em" }}>
              1.234,5 M
            </span>
          </Tipo>
        </Tarjeta>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Tarjeta
          titulo="Escala y densidad"
          tokens={[
            ["html font-size", "clamp(14px, calc(8.5px + 0.5vw), 16px)"],
            ["--densidad", tema.densidad],
            ["--densidad-control", `${t.campo.alto} px`],
            ["--tabla-alto-fila", `${t.tabla.altoFila} px`],
          ]}
        >
          <div className="flex items-end gap-1.5 h-14" aria-hidden>
            {[60, 60, 72, 86, 100, 100].map((h, i) => (
              <span
                key={i}
                className="flex-1 rounded-sm"
                style={{ height: `${h}%`, background: h === 100 ? t.acento : i < 2 ? t.grilla : t.eje }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted tabular">
            <span>1100 px · 14 px</span>
            <span>1500 px · 16 px</span>
          </div>
          <p className="text-xs text-muted">
            Fluida suave · densidad {tema.densidad === "compacta" ? "compacta" : "cómoda"} · controles de {t.campo.alto} px
          </p>
        </Tarjeta>

        <Tarjeta
          titulo="Superficie y forma"
          tokens={[
            ["--superficie", tema.superficie],
            ["--radius", `${tema.radio} px`],
            ["--boton-forma", tema.botonForma],
          ]}
        >
          <div className="flex gap-3">
            <div className="flex-1 h-16 border" style={{ borderRadius: tema.radio, borderColor: t.grilla, background: t.fondoTarjeta }} />
            <div className="flex-1 h-16" style={{ borderRadius: tema.radio, background: t.fondo }} />
          </div>
          <p className="text-xs text-muted">
            {SUPERFICIES[tema.superficie].nombre} · radio {tema.radio} px · botones {tema.botonForma}
          </p>
        </Tarjeta>

        <Tarjeta
          titulo="Formularios"
          tokens={[
            ["--campo-estilo", tema.campoEstilo],
            ["--campo-etiqueta", tema.campoEtiqueta],
            ["--campo-alto", `${t.campo.alto} px`],
          ]}
        >
          <label className="flex flex-col gap-1">
            <span className="label-meta text-[0.625rem] text-faint">Obra</span>
            <input
              defaultValue="Obra Centro"
              className="px-2.5 text-sm outline-none"
              style={{
                height: t.campo.alto,
                borderRadius: t.campo.radio,
                background: t.campo.fondo,
                border: `1px solid ${t.campo.borde}`,
                borderBottomColor: tema.campoEstilo === "subrayado" ? t.eje : t.campo.borde,
                fontFamily: t.fuente,
                color: t.texto,
              }}
            />
          </label>
          <p className="text-xs text-muted">
            Campo {tema.campoEstilo} · etiqueta {tema.campoEtiqueta}
          </p>
        </Tarjeta>
      </div>

      <h2 className="label-eyebrow brand-bullet mt-2">Piezas del estándar</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Tarjeta
          titulo="Botones"
          tokens={[
            ["--boton-forma", tema.botonForma],
            ["--boton-alto", `${t.campo.alto} px`],
          ]}
        >
          <div className="flex flex-wrap gap-2">
            <BotonLab variante="solido" icono={Plus}>Agregar</BotonLab>
            <BotonLab variante="secundario">Secundario</BotonLab>
            <BotonLab variante="contorno">Contorno</BotonLab>
            <BotonLab variante="fantasma">Fantasma</BotonLab>
            <BotonLab variante="peligro">Quitar</BotonLab>
          </div>
          <p className="text-xs text-muted">components/estandar/graficos/botones/boton-lab.tsx</p>
        </Tarjeta>
        <Tarjeta
          titulo="Estados y avisos"
          tokens={[
            ["--color-estado-bueno", t.estado.bueno],
            ["--color-estado-alerta", t.estado.alerta],
            ["--color-estado-malo", t.estado.malo],
          ]}
        >
          <div className="flex flex-wrap gap-2">
            <Insignia tono="bueno" punto>Al día</Insignia>
            <Insignia tono="alerta" punto>Por vencer</Insignia>
            <Insignia tono="malo" punto>Atrasado</Insignia>
            <Insignia tono="neutro">Borrador</Insignia>
          </div>
          <Aviso tipo="advertencia" titulo="Faltan 3 respaldos">Se pueden subir hasta el día hábil 5.</Aviso>
        </Tarjeta>
        {GRAFICOS.map((g) => (
          <GraficoEstandar key={g.nombre} {...g} />
        ))}
      </div>
      <p className="text-xs text-muted">
        Campos de formulario (texto, monto, fecha, selección, archivo, casillas) en
        components/estandar/graficos/campos; se ven aplicados en los Formularios Tipo. Piezas de
        reportería (KPIs, barras, donas, rankings) en components/reporte; se ven en los Reportes Tipo.
      </p>
    </div>
  );
}

function Tarjeta({
  titulo,
  enlace,
  tokens,
  className,
  children,
}: {
  titulo: string;
  enlace?: { href: string; texto: string };
  tokens: [string, string][];
  className?: string;
  children: ReactNode;
}) {
  const [abierta, setAbierta] = useState(false);
  const id = `tokens-${titulo.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <section className={cn("card p-4 flex flex-col gap-3 min-w-0", className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-[0.9375rem] font-semibold text-text">{titulo}</h3>
        {enlace && (
          <Link
            href={enlace.href}
            className="ml-auto flex items-center gap-1 font-label text-[0.6875rem] tracking-[0.06em] uppercase text-muted hover:text-flesan-red"
          >
            {enlace.texto}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
      {children}
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        aria-expanded={abierta}
        aria-controls={id}
        className="self-start flex items-center gap-1 font-label text-[0.6875rem] tracking-[0.06em] uppercase text-muted hover:text-text cursor-pointer"
      >
        Ver tokens
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", abierta && "rotate-180")} />
      </button>
      {abierta && (
        <ul id={id} className="flex flex-col border-t border-border">
          {tokens.map(([nombre, valor]) => (
            <FilaToken key={nombre} nombre={nombre} valor={valor} />
          ))}
        </ul>
      )}
    </section>
  );
}

function FilaToken({ nombre, valor }: { nombre: string; valor: string }) {
  const [copiado, setCopiado] = useState(false);
  const esColor = /^#[0-9a-f]{6}$/i.test(valor);
  async function copiar() {
    try {
      await navigator.clipboard.writeText(`${nombre}: ${valor};`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1200);
    } catch {}
  }
  return (
    <li className="flex items-center gap-3 py-1.5 border-b border-border text-xs">
      <code className="text-muted min-w-0 truncate">{nombre}</code>
      <span className="ml-auto flex items-center gap-2 text-text tabular">
        {esColor && <span className="w-3 h-3 rounded-sm border border-border" style={{ background: valor }} />}
        {valor}
      </span>
      <button
        type="button"
        onClick={copiar}
        aria-label={`Copiar ${nombre}`}
        title="Copiar"
        className="text-faint hover:text-text cursor-pointer"
      >
        {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </li>
  );
}

function Muestra({ color, nombre }: { color: string; nombre: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="h-9 rounded-md border border-border" style={{ background: color }} />
      <span className="text-[0.6875rem] text-muted">{nombre}</span>
    </div>
  );
}

function Fila({ titulo, nota, children }: { titulo: string; nota: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)_auto] items-center gap-3">
      <span className="label-meta text-[0.625rem] text-faint">{titulo}</span>
      {children}
      <span className="text-xs text-muted">{nota}</span>
    </div>
  );
}

function Tipo({ nota, children }: { nota: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 min-w-0">
      <span className="min-w-0 truncate text-text">{children}</span>
      <span className="ml-auto shrink-0 text-xs text-muted">{nota}</span>
    </div>
  );
}

// Un gráfico del estándar dibujado vivo. Se monta solo en el navegador: varios usan ids y
// medidas que no calzan entre servidor y cliente.
function GraficoEstandar({ nombre, uso, ancho, Componente }: (typeof GRAFICOS)[number]) {
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  const alto = 260;
  return (
    <section className={cn("card p-4 flex flex-col gap-3 min-w-0", ancho && "md:col-span-2")}>
      <div className="flex items-center gap-2">
        <h3 className="text-[0.9375rem] font-semibold text-text">{nombre}</h3>
        <span className="ml-auto text-xs text-muted">{uso}</span>
      </div>
      <div className="min-w-0 overflow-auto" style={{ height: alto }}>
        {montado ? <Componente alto={alto} /> : <div className="skeleton w-full h-full" />}
      </div>
    </section>
  );
}
