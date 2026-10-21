"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { Check, ChevronDown, Copy, FileSearch, Inbox, Plus, Save } from "lucide-react";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/page-header";
import { Desplegable } from "@/components/desplegable";
import { BotonExcel } from "@/components/boton-excel";
import { CiaLogo } from "@/components/cia-logo";
import { TarjetaReporte } from "@/components/reporte/tarjeta";
import { elementoPorId } from "@/components/constructor/elementos";
import { LabTemaFijo, useTokens } from "@/components/estandar/tema-context";
import { BotonLab } from "@/components/estandar/graficos/botones/boton-lab";
import { Aviso, Esqueleto, EstadoVacio, Insignia } from "@/components/estandar/graficos/base/componentes";
import { CampoTexto } from "@/components/estandar/graficos/campos/campo-texto";
import { CampoMonto } from "@/components/estandar/graficos/campos/campo-monto";
import { CampoSelect } from "@/components/estandar/graficos/campos/campo-select";
import { CampoCasilla } from "@/components/estandar/graficos/campos/opciones";
import { CurvaS } from "@/components/estandar/graficos/tiempo/curva-s";
import { GanttObra } from "@/components/estandar/graficos/tiempo/gantt-obra";
import { LineaHitos } from "@/components/estandar/graficos/tiempo/linea-hitos";
import { BurbujasObras } from "@/components/estandar/graficos/mapas/burbujas-obras";
import type { PropsGraficoLab } from "@/components/estandar/tipos";
import type { Bloque } from "@/lib/constructor/tipos";
import { ESTANDAR } from "@/lib/estandar/estandar";
import { exportarCss, FUENTES, PALETAS, SUPERFICIES } from "@/lib/estandar/tema";

/**
 * Guía de estilo (/ui-kit): un documento con índice. Cuatro partes (Marca, Fundamentos,
 * Componentes, Patrones); cada pieza con su muestra viva, cuándo usarla, su archivo, sus tokens
 * y las plantillas donde se usa. Se dibuja con el tema fijo del estándar (lib/estandar/estandar.ts).
 * Opción A del rediseño, aprobada el 2026-10-20. Lo que aún se prueba vive en el laboratorio.
 */

type Capa = "Cascarón" | "Contenido";

interface Pieza {
  id: string;
  nombre: string;
  capa?: Capa;
  cuando: ReactNode;
  archivo: string;
  /** Plantillas donde se ve aplicada. */
  usos?: { texto: string; href: string }[];
  tokens?: [string, string][];
  muestra: () => ReactNode;
  /** La muestra ocupa todo el ancho (gráficos, grillas de piezas). */
  ancha?: boolean;
}

interface Parte {
  id: string;
  titulo: string;
  piezas: Pieza[];
}

const P = (n: number) => ({ texto: `Reporte Tipo ${n}`, href: `/plantillas/reportes/tipo-${n}` });
const F = (n: number) => ({ texto: `Formulario Tipo ${n}`, href: `/plantillas/formularios/tipo-${n}` });
const MAQUETAS = { texto: "Constructor de maquetas", href: "/plantillas/maquetas" };
const CONFIGURACION = { texto: "Configuración", href: "/configuracion" };

const MARCA = [
  { nombre: "Rojo Flesan", token: "--color-flesan-red", valor: "#E30613" },
  { nombre: "Negro", token: "--color-flesan-black", valor: "#231F20" },
  { nombre: "Acero", token: "--color-flesan-steel", valor: "#58595B" },
  { nombre: "Cálido", token: "--color-flesan-warm", valor: "#A8A9A9" },
  { nombre: "Claro", token: "--color-flesan-light", valor: "#D9D9D9" },
  { nombre: "Fondo", token: "--color-flesan-off", valor: "#F4F4F4" },
];

export function Estandar() {
  return (
    <LabTemaFijo tema={ESTANDAR.tema}>
      <Guia />
    </LabTemaFijo>
  );
}

function Guia() {
  const t = useTokens();
  const partes = usePartes();
  const [activa, setActiva] = useState(partes[0].piezas[0].id);
  const [copiado, setCopiado] = useState(false);
  // Varias muestras (ECharts, mapas) miden su contenedor: se dibujan solo en el navegador.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  // Marca en el índice la pieza que se está leyendo.
  useEffect(() => {
    if (!montado) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiva(visible.target.id);
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    document.querySelectorAll("[data-pieza]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [montado]);

  async function copiarCss() {
    try {
      await navigator.clipboard.writeText(exportarCss(t));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {}
  }

  return (
    <div className="page-shell py-6 lg:py-8">
      <PageHeader
        title="Guía de Estilo"
        description="Lo vigente para toda plataforma nueva: marca, fundamentos, componentes y patrones. Cada pieza dice cuándo usarla, dónde está y en qué plantillas se ve. Lo que aún se prueba vive en el laboratorio de diseño."
        actions={
          <>
            <span className={cn("badge border", ESTANDAR.provisorio ? "border-status-warn/50 text-status-warn" : "border-border-strong text-muted")}>
              {ESTANDAR.provisorio ? "Provisorio · sin elección formal" : `Vigente desde ${ESTANDAR.vigenteDesde} · v${ESTANDAR.version}`}
            </span>
            <BotonLab variante="secundario" tamano="sm" icono={copiado ? Check : Copy} onClick={copiarCss}>
              {copiado ? "Copiado" : "Copiar tokens CSS"}
            </BotonLab>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[13rem_minmax(0,1fr)] gap-8 items-start">
        <nav aria-label="Índice de la guía" className="hidden lg:block sticky top-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
          {partes.map((parte) => (
            <div key={parte.id} className="mb-4">
              <a href={`#${parte.id}`} className="label-eyebrow brand-bullet block mb-1.5 hover:text-text">
                {parte.titulo}
              </a>
              <ul className="flex flex-col">
                {parte.piezas.map((p) => (
                  <li key={p.id}>
                    <a
                      href={`#${p.id}`}
                      aria-current={activa === p.id ? "location" : undefined}
                      className={cn(
                        "block py-1 pl-3 text-sm border-l-2",
                        activa === p.id ? "border-l-flesan-red text-text font-600" : "border-l-border text-muted hover:text-text",
                      )}
                    >
                      {p.nombre}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-10 min-w-0">
          {partes.map((parte) => (
            <section key={parte.id} id={parte.id} aria-labelledby={`${parte.id}-titulo`} className="flex flex-col gap-4 scroll-mt-4">
              <h2 id={`${parte.id}-titulo`} className="display-title text-xl text-text border-b border-border pb-2">
                {parte.titulo}
              </h2>
              {parte.piezas.map((p) => (
                <FilaPieza key={p.id} pieza={p} montado={montado} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilaPieza({ pieza, montado }: { pieza: Pieza; montado: boolean }) {
  const [tokens, setTokens] = useState(false);
  const ficha = (
    <div className="flex flex-col gap-3 min-w-0">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-[0.9375rem] font-semibold text-text">{pieza.nombre}</h3>
        {pieza.capa && (
          <span className={cn("badge border", pieza.capa === "Cascarón" ? "border-flesan-red/40 text-flesan-red" : "border-border-strong text-muted")}>
            {pieza.capa}
          </span>
        )}
      </div>
      <div className="text-sm text-text leading-snug">
        <span className="label-meta text-faint">Úsala cuando </span>
        {pieza.cuando}
      </div>
      <p className="text-xs text-muted">
        <span className="label-meta text-faint">Archivo </span>
        <code className="break-all">{pieza.archivo}</code>
      </p>
      {pieza.usos && pieza.usos.length > 0 && (
        <p className="text-xs text-muted flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="label-meta text-faint">Se ve en</span>
          {pieza.usos.map((u) => (
            <Link key={u.href + u.texto} href={u.href} className="underline decoration-border-strong underline-offset-2 hover:text-flesan-red">
              {u.texto}
            </Link>
          ))}
        </p>
      )}
      {pieza.tokens && (
        <div>
          <button
            type="button"
            onClick={() => setTokens((v) => !v)}
            aria-expanded={tokens}
            className="flex items-center gap-1 font-label text-[0.6875rem] tracking-[0.06em] uppercase text-muted hover:text-text cursor-pointer"
          >
            Ver tokens
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", tokens && "rotate-180")} />
          </button>
          {tokens && (
            <ul className="mt-1 flex flex-col border-t border-border">
              {pieza.tokens.map(([n, v]) => (
                <FilaToken key={n} nombre={n} valor={v} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
  const muestra = (
    <div className="min-w-0 border border-border bg-bg p-4 rounded-flesan-sm">{montado ? pieza.muestra() : <div className="skeleton h-24" />}</div>
  );

  return (
    <article id={pieza.id} data-pieza className="card dens-card scroll-mt-4">
      {pieza.ancha ? (
        <div className="flex flex-col gap-4">
          {ficha}
          {muestra}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] gap-5 items-start">
          {muestra}
          {ficha}
        </div>
      )}
    </article>
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
      <button type="button" onClick={copiar} aria-label={`Copiar ${nombre}`} title="Copiar" className="text-faint hover:text-text cursor-pointer">
        {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </li>
  );
}

// ---------------------------------------------------------------- contenido

function usePartes(): Parte[] {
  const t = useTokens();
  const { tema } = t;
  return [
    {
      id: "marca",
      titulo: "Marca",
      piezas: [
        {
          id: "color-marca",
          nombre: "Color de marca",
          cuando: "se marca identidad: logos, cascarón y títulos. El rojo Flesan es el único acento del cascarón.",
          archivo: "app/shell.css (@theme, --color-flesan-*)",
          tokens: MARCA.map((m) => [m.token, m.valor]),
          muestra: () => (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {MARCA.map((m) => (
                <div key={m.token} className="flex flex-col gap-1">
                  <span className="h-10 rounded-md border border-border" style={{ background: m.valor }} />
                  <span className="text-[0.6875rem] text-muted">{m.nombre}</span>
                </div>
              ))}
            </div>
          ),
        },
        {
          id: "dos-capas",
          nombre: "Dos capas de color",
          cuando: (
            <>
              elijas un color: depende de dónde está la pieza. <b>Cascarón</b> (sidebar, barra superior,
              títulos, Configuración): rojo Flesan. <b>Contenido</b> (reportes, formularios, gráficos):
              Tableau 10, con el primario en azul. A prueba desde el 20-10-2026.
            </>
          ),
          archivo: "CLAUDE.md (Reglas de marca) · lib/estandar/estandar.ts",
          muestra: () => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-2 p-3 border border-border bg-surface">
                <span className="label-meta text-faint">Cascarón</span>
                <span className="text-sm text-text border-l-2 border-l-flesan-red pl-2">Plantillas</span>
                <button type="button" className="btn-flesan btn-flesan-primary btn-flesan-sm self-start">
                  Guardar ajustes
                </button>
              </div>
              <div className="flex flex-col gap-2 p-3 border border-border bg-surface">
                <span className="label-meta text-faint">Contenido</span>
                <span className="flex h-3 rounded overflow-hidden">
                  {t.colores.slice(0, 7).map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </span>
                <span className="self-start">
                  <BotonLab variante="solido" tamano="sm">
                    Guardar obra
                  </BotonLab>
                </span>
              </div>
            </div>
          ),
        },
        {
          id: "logos",
          nombre: "Logos",
          cuando: "va la marca: Grupo Flesan en portadas, documentos y el login; la Sinapsis para material del área CIA. Sobre fondo oscuro, la versión blanca.",
          archivo: "public/brand/ · components/cia-logo.tsx",
          muestra: () => (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              <div className="h-20 flex items-center justify-center bg-white border border-border p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/Logo Empresa - Grupo Flesan COLOR.png" alt="Grupo Flesan, color" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="h-20 flex items-center justify-center bg-flesan-black p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brand/Logo Empresa - Grupo Flesan BLANCO.png" alt="Grupo Flesan, blanco" className="max-h-full max-w-full object-contain" />
              </div>
              <div className="h-20 flex items-center justify-center gap-2 border border-border p-3">
                <CiaLogo className="w-8 h-8" />
                <span className="font-display text-lg text-text">CIA</span>
              </div>
            </div>
          ),
        },
        {
          id: "voz",
          nombre: "Voz y viñetas",
          cuando: (
            <>
              escribas cualquier texto: español de Chile, institucional, sin emojis, sin «líder»,
              «revolucionar» ni «increíble». Tagline solo «Confianza que construye». Viñeta cuadrada
              roja (<code>.brand-bullet</code>), nunca redonda.
            </>
          ),
          archivo: "~/.claude/skills/grupo-flesan-skill · .brand-bullet en app/shell.css",
          muestra: () => (
            <div className="flex flex-col gap-3">
              <p className="font-display text-2xl text-text">Confianza que construye</p>
              <ul className="flex flex-col gap-1 text-sm text-text">
                <li className="brand-bullet">Faltan 3 respaldos para cerrar el período.</li>
                <li className="brand-bullet">La obra quedó registrada.</li>
              </ul>
            </div>
          ),
        },
      ],
    },
    {
      id: "fundamentos",
      titulo: "Fundamentos",
      piezas: [
        {
          id: "tipografia",
          nombre: "Tipografía",
          cuando: "pongas texto: Inter Tight en negrita para títulos de vista y de sección (la letra del reporte), Barlow para leer y escribir, Semi Condensed para etiquetas y la letra de datos para cifras. Barlow Condensed itálica solo en el nombre de la plataforma (sidebar y login).",
          archivo: "app/layout.tsx (next/font/local) · app/fonts/",
          tokens: [
            [".titulo-vista", "Inter Tight 700"],
            ["--font-display", "Barlow Condensed 800 itálica (nombre de la plataforma)"],
            ["--font-body", "Barlow 400"],
            ["--font-label", "Barlow Semi Condensed 600"],
            ["--font-chart", FUENTES[tema.fuente].nombre],
          ],
          muestra: () => (
            <div className="flex flex-col gap-2">
              <Tipo nota="Barlow Condensed · solo nombre de la plataforma">
                <span className="font-display font-bold italic uppercase tracking-[0.04em] text-xl">Nombre plataforma</span>
              </Tipo>
              <Tipo nota="Inter Tight 700">
                <span className="titulo-vista text-2xl">Título de vista</span>
              </Tipo>
              <Tipo nota="Barlow">
                <span className="text-[0.9375rem]">Texto de lectura y formularios</span>
              </Tipo>
              <Tipo nota="Semi Condensed">
                <span className="label-meta text-xs">Etiqueta de campo</span>
              </Tipo>
              <Tipo nota={FUENTES[tema.fuente].nombre}>
                <span className="tabular" style={{ fontFamily: t.fuente, fontSize: t.kpi.cifra * 0.8, fontWeight: 700, letterSpacing: "-0.03em" }}>
                  1.234,5 MM
                </span>
              </Tipo>
            </div>
          ),
        },
        {
          id: "escala",
          nombre: "Escala y densidad",
          cuando: (
            <>
              definas tamaños: todo en rem (la raíz se ajusta sola entre 14 y 16 px). Densidad compacta
              por defecto; tarjetas nuevas con <code>.dens-card</code>; un formulario largo con{" "}
              <code>data-densidad=&quot;comoda&quot;</code>.
            </>
          ),
          archivo: "app/shell.css (raíz fluida y --densidad-*)",
          tokens: [
            ["html font-size", "clamp(14px, calc(8.5px + 0.5vw), 16px)"],
            ["--densidad", tema.densidad],
            ["--densidad-control", `${t.campo.alto} px`],
            ["--tabla-alto-fila", `${t.tabla.altoFila} px`],
          ],
          muestra: () => (
            <div className="flex flex-col gap-2">
              <div className="flex items-end gap-1.5 h-14" aria-hidden>
                {[60, 60, 72, 86, 100, 100].map((h, i) => (
                  <span key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: h === 100 ? t.acento : i < 2 ? t.grilla : t.eje }} />
                ))}
              </div>
              <div className="flex justify-between text-xs text-muted tabular">
                <span>1100 px · 14 px</span>
                <span>1500 px · 16 px</span>
              </div>
            </div>
          ),
        },
        {
          id: "superficie",
          nombre: "Superficie y radio",
          cuando: "armes una tarjeta: plana, con borde suave y el radio del estándar; sin sombras ni degradados en el contenido.",
          archivo: "lib/estandar/estandar.ts (tema) · .card en app/shell.css",
          tokens: [
            ["--superficie", tema.superficie],
            ["--radius", `${tema.radio} px`],
          ],
          muestra: () => (
            <div className="flex flex-col gap-2">
              <div className="flex gap-3">
                <div className="flex-1 h-16 border" style={{ borderRadius: tema.radio, borderColor: t.grilla, background: t.fondoTarjeta }} />
                <div className="flex-1 h-16" style={{ borderRadius: tema.radio, background: t.fondo }} />
              </div>
              <p className="text-xs text-muted">
                {SUPERFICIES[tema.superficie].nombre} · radio {tema.radio} px
              </p>
            </div>
          ),
        },
        {
          id: "datos",
          nombre: "Paleta de datos y estados",
          capa: "Contenido",
          cuando: "pintes datos: las series distinguen categorías en gráficos, insignias y tablas; los estados son solo bueno, alerta y malo (no se usan como categorías).",
          archivo: "app/shell.css (--color-serie-1…8) · lib/estandar/tema.ts",
          usos: [P(1), P(2), P(3), P(4), P(5)],
          tokens: [
            ...t.colores.slice(0, 8).map((c, i) => [`--color-serie-${i + 1}`, c] as [string, string]),
            ["--color-estado-bueno", t.estado.bueno],
            ["--color-estado-alerta", t.estado.alerta],
            ["--color-estado-malo", t.estado.malo],
          ],
          muestra: () => (
            <div className="flex flex-col gap-3">
              <Fila titulo="Series" nota={PALETAS[tema.paleta].nombre}>
                <span className="flex h-4 rounded overflow-hidden">
                  {t.colores.slice(0, 8).map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </span>
              </Fila>
              <Fila titulo="Estados" nota="Bueno · alerta · malo">
                <span className="flex h-4 rounded overflow-hidden">
                  {[t.estado.bueno, t.estado.alerta, t.estado.malo].map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </span>
              </Fila>
            </div>
          ),
        },
      ],
    },
    {
      id: "componentes",
      titulo: "Componentes",
      piezas: [
        {
          id: "botones-contenido",
          nombre: "Botones del contenido",
          capa: "Contenido",
          cuando: "haya una acción dentro de un reporte o formulario. Un solo primario por vista; «Quitar» con peligro y confirmación.",
          archivo: "components/estandar/graficos/botones/boton-lab.tsx (BotonLab)",
          usos: [F(1), F(2), F(3), P(4), P(5)],
          tokens: [
            ["--boton-forma", tema.botonForma],
            ["--boton-texto", tema.botonCaja],
            ["--boton-primario", t.acento],
          ],
          muestra: () => (
            <div className="flex flex-wrap gap-2">
              <BotonLab variante="solido" icono={Plus}>
                Agregar
              </BotonLab>
              <BotonLab variante="secundario">Secundario</BotonLab>
              <BotonLab variante="contorno" icono={Save}>
                Guardar borrador
              </BotonLab>
              <BotonLab variante="fantasma">Cancelar</BotonLab>
              <BotonLab variante="peligro">Quitar</BotonLab>
            </div>
          ),
        },
        {
          id: "botones-cascaron",
          nombre: "Botones del cascarón",
          capa: "Cascarón",
          cuando: "la acción es del marco: Configuración, avisos, presentaciones, portadas del mockup y el constructor.",
          archivo: "app/shell.css (.btn-flesan, -primary, -ghost, -dark, -sm, -lg)",
          usos: [CONFIGURACION, { texto: "Plantillas (portada)", href: "/plantillas" }, MAQUETAS],
          muestra: () => (
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-flesan btn-flesan-primary">
                Guardar ajustes
              </button>
              <button type="button" className="btn-flesan btn-flesan-ghost">
                Cancelar
              </button>
              <button type="button" className="btn-flesan btn-flesan-dark">
                Oscuro
              </button>
              <button type="button" className="btn-flesan btn-flesan-ghost btn-flesan-sm">
                Chico
              </button>
            </div>
          ),
        },
        {
          id: "campos",
          nombre: "Campos de formulario",
          capa: "Contenido",
          cuando: "se ingresa un dato: etiqueta arriba, ayuda debajo, obligatorio con asterisco y error al salir del campo. Montos con su unidad; selección con desplegable.",
          archivo: "components/estandar/graficos/campos/ (texto, monto, fecha, selección, buscable, archivo, casilla, interruptor, radio, grupos y resumen de errores)",
          usos: [F(1), F(2), F(3)],
          tokens: [
            ["--campo-estilo", tema.campoEstilo],
            ["--campo-etiqueta", tema.campoEtiqueta],
            ["--campo-alto", `${t.campo.alto} px`],
          ],
          muestra: () => <MuestraCampos />,
        },
        {
          id: "desplegable",
          nombre: "Desplegable",
          capa: "Cascarón",
          cuando: "se elige entre opciones, en filtros, configuración o formularios. Reemplaza a todo <select>; desde 12 opciones trae buscador.",
          archivo: "components/desplegable.tsx (variantes filtro, píldora, campo y libre)",
          usos: [P(2), P(3), CONFIGURACION],
          muestra: () => <MuestraDesplegable />,
        },
        {
          id: "avisos",
          nombre: "Avisos e insignias",
          capa: "Contenido",
          cuando: "hay que decir algo sobre la vista (aviso) o marcar el estado de una fila o ficha (insignia).",
          archivo: "components/estandar/graficos/base/componentes.tsx (Aviso, Insignia)",
          usos: [F(1), P(5)],
          muestra: () => (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Insignia tono="bueno" punto>
                  Al día
                </Insignia>
                <Insignia tono="alerta" punto>
                  Por vencer
                </Insignia>
                <Insignia tono="malo" punto>
                  Atrasado
                </Insignia>
                <Insignia tono="neutro">Borrador</Insignia>
              </div>
              <Aviso tipo="advertencia" titulo="Faltan 3 respaldos">
                Se pueden subir hasta el día hábil 5.
              </Aviso>
            </div>
          ),
        },
        {
          id: "vacio",
          nombre: "Estado vacío y carga",
          capa: "Contenido",
          cuando: "una vista no tiene datos todavía (vacío, con la acción que lo resuelve) o los está trayendo (esqueleto con la forma final).",
          archivo: "components/estandar/graficos/base/componentes.tsx (EstadoVacio, Esqueleto)",
          muestra: () => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <EstadoVacio icono={Inbox} titulo="Sin entregas este mes" compacto>
                Cuando el área suba su primera entrega, aparece aquí.
              </EstadoVacio>
              <div className="flex flex-col gap-2 justify-center">
                <Esqueleto ancho="60%" alto={14} />
                <Esqueleto alto={10} />
                <Esqueleto alto={10} />
                <Esqueleto ancho="40%" alto={10} />
              </div>
            </div>
          ),
        },
        {
          id: "kpis",
          nombre: "KPIs",
          capa: "Contenido",
          cuando: "una cifra manda en la vista (KPI principal, uno por reporte) o se ponen varias cifras lado a lado (KPI chico).",
          archivo: "components/reporte/kpi-principal.tsx (KpiPrincipal, PanelCifras) · kpi-tarjeta.tsx",
          usos: [P(1), P(2), P(3)],
          ancha: true,
          muestra: () => <GrillaElementos ids={["rep-kpi-principal", "rep-kpi"]} columnas="md:grid-cols-[2fr_1fr]" />,
        },
        {
          id: "graficos-reporte",
          nombre: "Gráficos de reportería",
          capa: "Contenido",
          cuando: "un reporte compara, compone o sigue en el tiempo. Se elige por la pregunta: composición (dona, participación), contra meta (barras comparadas, ranking), en el tiempo (línea acumulada, flujo), puente (cascada), contra cero (variación), dónde (mapa de Chile, en el Reporte Tipo 2).",
          archivo: "components/reporte/ (21 piezas; receta en docs/REPORTES.md)",
          usos: [P(1), P(2), P(3), MAQUETAS],
          ancha: true,
          muestra: () => (
            <GrillaElementos
              ids={["rep-dona", "rep-barras-comparadas", "rep-linea-acumulada", "rep-ranking-meta", "rep-piramide", "rep-cascada", "rep-flujo", "rep-participacion", "rep-variacion"]}
              columnas="md:grid-cols-2 xl:grid-cols-3"
              alto={200}
            />
          ),
        },
        {
          id: "graficos-obra",
          nombre: "Gráficos de obra y avance",
          capa: "Contenido",
          cuando: "se sigue el avance de una obra o proyecto: Curva S (real contra programado), Gantt, hitos y ubicación.",
          archivo: "components/estandar/graficos/tiempo/ y mapas/ (sobre ECharts, components/estandar/echart.tsx)",
          usos: [P(5), MAQUETAS],
          ancha: true,
          muestra: () => <GrillaGraficos />,
        },
        {
          id: "tablas",
          nombre: "Tabla de detalle",
          capa: "Contenido",
          cuando: "el usuario necesita el dato fila por fila: orden por columna, buscador, «Ver más» desde 10 filas y exportar a Excel.",
          archivo: "app/shell.css (.rep-tabla) · components/reporte/celdas.tsx",
          usos: [P(1), P(2), P(3), P(4)],
          ancha: true,
          muestra: () => <GrillaElementos ids={["rep-tabla"]} columnas="" />,
        },
      ],
    },
    {
      id: "patrones",
      titulo: "Patrones",
      piezas: [
        {
          id: "encabezado",
          nombre: "Encabezado de vista",
          cuando: (
            <>
              armes cualquier vista: título en la letra del reporte, la descripción detrás del
              (i) y las acciones a la derecha. Si la vista tiene subdashboards, el activo va en el
              paralelogramo rojo y sus botones sobre la regla (<code>subvistas</code>,{" "}
              <code>subvista</code>, <code>onSubvista</code>). Sin eyebrow ni párrafo bajo el título.
            </>
          ),
          archivo: "components/page-header.tsx (PageHeader) · .titulo-vista en app/shell.css",
          usos: [P(1), P(2), F(1)],
          muestra: () => <MuestraEncabezado />,
        },
        {
          id: "filtros",
          nombre: "Filtros cruzados",
          cuando: "un reporte tiene varios gráficos sobre los mismos datos: clic en una parte de un gráfico filtra el resto, y la barra muestra lo filtrado y cómo quitarlo.",
          archivo: "components/reporte/filtros.tsx (BarraFiltros) · components/presentaciones/use-filtros-url.ts",
          usos: [P(1), P(2), P(3)],
          ancha: true,
          muestra: () => <GrillaElementos ids={["texto-filtros"]} columnas="" />,
        },
        {
          id: "bloque",
          nombre: "Bloque numerado",
          cuando: "un reporte tiene varias preguntas: cada bloque lleva número, título y qué mide, para poder nombrarlo («mira el bloque 3»).",
          archivo: "components/reporte/tarjeta.tsx (TarjetaReporte)",
          usos: [P(1), P(2), P(3)],
          muestra: () => (
            <TarjetaReporte numero={3} titulo="Unidad de negocio" detalle="donde se contrató">
              <div className="h-16 flex items-center justify-center text-xs text-muted border border-dashed border-border-strong">Gráfico del bloque</div>
            </TarjetaReporte>
          ),
        },
        {
          id: "drilldown",
          nombre: "Drilldown con migas",
          cuando: "los datos tienen jerarquía: se baja con un clic (Línea → Obra → Partida) y cada nivel se suma a la ruta de la barra superior para volver.",
          archivo: "components/breadcrumb-context.tsx (BreadcrumbContext)",
          usos: [P(4)],
          muestra: () => (
            <nav aria-label="Ejemplo de ruta" className="flex flex-wrap items-center gap-1.5 font-label text-xs tracking-[0.06em] uppercase text-muted">
              <span>Inicio</span>
              <span aria-hidden>›</span>
              <span>Costos por obra</span>
              <span aria-hidden>›</span>
              <span>Edificación</span>
              <span aria-hidden>›</span>
              <span className="text-text">Obra Centro</span>
            </nav>
          ),
        },
        {
          id: "acciones-pie",
          nombre: "Acciones al pie del formulario",
          cuando: "un formulario guarda o envía: barra fija al pie con «* Obligatorio» a la izquierda y Cancelar, Guardar borrador y el primario a la derecha.",
          archivo: "components/plantillas/formulario-obra.tsx",
          usos: [F(1), F(3)],
          muestra: () => (
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <span className="text-xs text-muted">
                <span className="text-flesan-red">*</span> Obligatorio
              </span>
              <span className="ml-auto flex flex-wrap gap-2">
                <BotonLab variante="fantasma" tamano="sm">
                  Cancelar
                </BotonLab>
                <BotonLab variante="contorno" tamano="sm" icono={Save}>
                  Guardar borrador
                </BotonLab>
                <BotonLab variante="solido" tamano="sm">
                  Guardar obra
                </BotonLab>
              </span>
            </div>
          ),
        },
        {
          id: "excel",
          nombre: "Exportar a Excel",
          cuando: "una tabla se puede llevar a Excel: el botón va junto a la tabla y el archivo incluye los filtros activos.",
          archivo: "components/boton-excel.tsx · lib/exportar/excel.ts",
          usos: [P(1), P(4)],
          muestra: () => <BotonExcel onDescargar={async () => {}} />,
        },
        {
          id: "tutorial",
          nombre: "Tutorial de la vista",
          cuando: "una pantalla tiene algo que explicar: declara sus pasos con useTutorial y se ofrece la primera vez (nunca se abre solo).",
          archivo: "components/tutorial/tutorial.tsx · components/plantillas/tutoriales.ts",
          usos: [P(1), P(3), F(1)],
          muestra: () => (
            <div className="flex items-center gap-3 text-sm text-muted">
              <FileSearch className="w-5 h-5 text-flesan-red shrink-0" />
              El birrete «Tutorial» del pie del sidebar abre el recorrido de la vista.
            </div>
          ),
        },
      ],
    },
  ];
}

// ---------------------------------------------------------------- muestras

function Tipo({ nota, children }: { nota: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 min-w-0">
      <span className="min-w-0 truncate text-text">{children}</span>
      <span className="ml-auto shrink-0 text-xs text-muted">{nota}</span>
    </div>
  );
}

function Fila({ titulo, nota, children }: { titulo: string; nota: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-3">
      <span className="label-meta text-[0.625rem] text-faint">{titulo}</span>
      {children}
      <span className="text-xs text-muted">{nota}</span>
    </div>
  );
}

function MuestraEncabezado() {
  const [vista, setVista] = useState("tablero");
  return (
    <PageHeader
      title="Ventas"
      description="Qué muestra la vista y cómo se usa, en una o dos frases."
      subvistas={[
        { id: "tablero", texto: "Tablero" },
        { id: "territorio", texto: "Territorio" },
        { id: "matriz", texto: "Vendedor × mes" },
      ]}
      subvista={vista}
      onSubvista={setVista}
      actions={
        <BotonLab variante="contorno" tamano="sm">
          Exportar
        </BotonLab>
      }
      className="mb-0!"
    />
  );
}

function MuestraCampos() {
  const [monto, setMonto] = useState<number | null>(125000);
  const [tipo, setTipo] = useState("edificacion");
  const [avisar, setAvisar] = useState(true);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <CampoTexto etiqueta="Nombre de la obra" requerido defaultValue="Edificio Parque" ayuda="Como aparece en el contrato." />
      <CampoSelect
        etiqueta="Tipo de obra"
        value={tipo}
        onChange={setTipo}
        opciones={[
          { valor: "edificacion", etiqueta: "Edificación" },
          { valor: "civiles", etiqueta: "Obras civiles" },
        ]}
      />
      <CampoMonto etiqueta="Presupuesto" valor={monto} onCambio={setMonto} unidad="M$" />
      <CampoTexto etiqueta="Código" requerido error="El código ya existe." defaultValue="OBR-0012" />
      <div className="sm:col-span-2">
        <CampoCasilla etiqueta="Avisar a la gerencia responsable" marcada={avisar} onCambio={setAvisar} />
      </div>
    </div>
  );
}

function MuestraDesplegable() {
  const [cierre, setCierre] = useState("sep");
  const [linea, setLinea] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Desplegable
        etiqueta="Cierre"
        variante="pildora"
        conRotulo
        valor={cierre}
        onCambio={setCierre}
        opciones={[
          { valor: "ago", texto: "Agosto" },
          { valor: "sep", texto: "Septiembre" },
        ]}
      />
      <Desplegable
        etiqueta="Línea"
        variante="filtro"
        activo={!!linea}
        valor={linea}
        onCambio={setLinea}
        opciones={[
          { valor: "", texto: "Todas" },
          { valor: "edif", texto: "Edificación" },
          { valor: "min", texto: "Minería" },
        ]}
      />
    </div>
  );
}

/** Piezas de reportería con los datos de ejemplo del constructor de maquetas (un solo lugar). */
function GrillaElementos({ ids, columnas, alto }: { ids: string[]; columnas: string; alto?: number }) {
  return (
    <div className={cn("grid grid-cols-1 gap-4", columnas)}>
      {ids.map((id) => {
        const el = elementoPorId(id);
        if (!el) return null;
        const a = alto ?? el.alto;
        const bloque: Bloque = { id, elemento: id, titulo: el.titulo, detalle: el.detalle ?? "", ancho: el.ancho, alto: a, numerado: false };
        const contenido = el.render({ alto: a, bloque });
        return el.marco === "tarjeta" ? (
          <TarjetaReporte key={id} titulo={el.nombre} detalle={el.detalle}>
            <div style={el.crece ? { minHeight: a } : { height: a }} className="min-w-0">
              {contenido}
            </div>
          </TarjetaReporte>
        ) : (
          <div key={id} className="min-w-0">
            {contenido}
          </div>
        );
      })}
    </div>
  );
}

const GRAFICOS_OBRA: { nombre: string; ancho?: boolean; Componente: ComponentType<PropsGraficoLab> }[] = [
  { nombre: "Curva S", Componente: CurvaS },
  { nombre: "Línea de hitos", Componente: LineaHitos },
  { nombre: "Gantt de obra", ancho: true, Componente: GanttObra },
  { nombre: "Mapa de obras", ancho: true, Componente: BurbujasObras },
];

function GrillaGraficos() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {GRAFICOS_OBRA.map(({ nombre, ancho, Componente }) => (
        <TarjetaReporte key={nombre} titulo={nombre} className={ancho ? "md:col-span-2" : undefined}>
          <div style={{ height: 240 }} className="min-w-0">
            <Componente alto={240} />
          </div>
        </TarjetaReporte>
      ))}
    </div>
  );
}
