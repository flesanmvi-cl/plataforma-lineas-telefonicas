"use client";

import { useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { Check, Copy, Download, RotateCcw, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useLabTema } from "@/components/lab-graficos/tema-context";
import {
  ANIMACIONES,
  exportarCss,
  FUENTES,
  PALETAS,
  SUPERFICIES,
  type AnimacionId,
  type Curva,
  type Densidad,
  type Etiquetas,
  type FuenteId,
  type GrillaModo,
  type PaletaId,
  type Superficie,
  type TooltipId,
  type BotonCaja,
  type BotonForma,
  type BotonRelleno,
  type KpiAcento,
  type KpiCifra,
  type TablaBordes,
  type TablaEncabezado,
} from "@/lib/lab-graficos/tema";
import type { Seccion } from "@/components/lab-graficos/tipos";

/**
 * Panel «Tema» del laboratorio: arriba lo global (paleta, letra, superficie…), abajo lo propio
 * de la sección abierta. En «En contexto» (seccion null) se muestra todo.
 */
export function PanelTema({ seccion = null }: { seccion?: Seccion | null }) {
  const { tema, setTema, reiniciar, tokens } = useLabTema();
  const { setTheme } = useTheme();
  const [exportando, setExportando] = useState(false);

  const mostrar = (s: Seccion) => seccion === null || seccion === s;
  const fueraDeMarca = !PALETAS[tema.paleta].deMarca || !SUPERFICIES[tema.superficie].deMarca;

  return (
    <div
      data-superficie={tema.superficie}
      className="lab-card p-4 flex flex-col gap-5 text-text"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <div className="flex items-center gap-2">
        <h2 className="font-label text-xs font-semibold tracking-[0.12em] uppercase">Tema</h2>
        <button
          type="button"
          onClick={reiniciar}
          title="Volver al tema inicial"
          className="ml-auto flex items-center gap-1.5 font-label text-[0.6875rem] tracking-[0.06em] uppercase text-muted hover:text-text cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reiniciar
        </button>
      </div>

      {fueraDeMarca && (
        <p className="flex gap-2 text-xs text-status-warn leading-snug">
          <TriangleAlert className="w-4 h-4 shrink-0" />
          Esta combinación sale de la guía de marca (rojo como único acento, identidad plana).
        </p>
      )}

      <Grupo titulo="Paleta">
        <div className="flex flex-col gap-1">
          {(Object.keys(PALETAS) as PaletaId[]).map((id) => {
            const p = PALETAS[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTema({ paleta: id })}
                aria-pressed={tema.paleta === id}
                className={cn("lab-opcion flex-col !items-start", tema.paleta === id && "is-active")}
              >
                <span className="flex items-center gap-2 w-full text-[0.8125rem] font-medium">
                  {p.nombre}
                  {p.deMarca && (
                    <span className="ml-auto font-label text-[0.625rem] tracking-[0.1em] uppercase text-faint">
                      Marca
                    </span>
                  )}
                </span>
                <span className="flex w-full h-3 rounded-sm overflow-hidden">
                  {p.colores.slice(0, 8).map((c) => (
                    <span key={c} className="flex-1" style={{ background: c }} />
                  ))}
                </span>
              </button>
            );
          })}
        </div>
      </Grupo>

      <Grupo titulo="Letra">
        <div className="flex flex-col gap-1">
          {(Object.keys(FUENTES) as FuenteId[]).map((id) => {
            const f = FUENTES[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTema({ fuente: id })}
                aria-pressed={tema.fuente === id}
                className={cn("lab-opcion", tema.fuente === id && "is-active")}
              >
                <span className="text-[0.9375rem] leading-tight" style={{ fontFamily: `var(${f.variable})` }}>
                  {f.nombre}
                  <span className="block text-[0.6875rem] text-faint" style={{ fontFamily: "var(--font-body)" }}>
                    {f.nota}
                  </span>
                </span>
                <span className="ml-auto tabular text-sm" style={{ fontFamily: `var(${f.variable})` }}>
                  1.234,5
                </span>
              </button>
            );
          })}
        </div>
      </Grupo>

      <Grupo titulo="Superficie">
        <Segmento
          valor={tema.superficie}
          opciones={(Object.keys(SUPERFICIES) as Superficie[]).map((id) => ({ id, nombre: SUPERFICIES[id].nombre }))}
          onChange={(superficie) => setTema({ superficie })}
        />
      </Grupo>

      <Grupo titulo={`Radio de esquinas · ${tema.radio}px`}>
        <input
          type="range"
          min={0}
          max={24}
          step={2}
          value={tema.radio}
          onChange={(e) => setTema({ radio: Number(e.target.value) })}
          aria-label="Radio de esquinas"
          className="w-full accent-flesan-red"
        />
      </Grupo>

      <Grupo titulo="Modo">
        <Segmento
          valor={tokens.oscuro ? "oscuro" : "claro"}
          opciones={[
            { id: "claro", nombre: "Claro" },
            { id: "oscuro", nombre: "Oscuro" },
          ]}
          onChange={(v) => setTheme(v === "oscuro" ? "dark" : "light")}
        />
      </Grupo>

      <Grupo titulo="Animación">
        <Segmento
          valor={tema.animacion}
          opciones={(Object.keys(ANIMACIONES) as AnimacionId[]).map((id) => ({ id, nombre: ANIMACIONES[id].nombre }))}
          onChange={(animacion) => setTema({ animacion })}
        />
      </Grupo>

      <Grupo titulo="Densidad">
        <Segmento<Densidad>
          valor={tema.densidad}
          opciones={[
            { id: "compacta", nombre: "Compacta" },
            { id: "comoda", nombre: "Cómoda" },
          ]}
          onChange={(densidad) => setTema({ densidad })}
        />
      </Grupo>

      {mostrar("graficos") && (
        <Bloque titulo="Gráficos">
          <Grupo titulo={`Grosor de línea · ${tema.grosorLinea}px`}>
            <input
              type="range"
              min={1}
              max={4}
              step={0.5}
              value={tema.grosorLinea}
              onChange={(e) => setTema({ grosorLinea: Number(e.target.value) })}
              aria-label="Grosor de línea"
              className="w-full accent-flesan-red"
            />
          </Grupo>

          <Grupo titulo="Tooltip">
            <Segmento<TooltipId>
              valor={tema.tooltip}
              opciones={[
                { id: "oscuro", nombre: "Oscuro" },
                { id: "claro", nombre: "Claro" },
                { id: "tarjeta", nombre: "Tarjeta" },
              ]}
              onChange={(tooltip) => setTema({ tooltip })}
            />
          </Grupo>

          <Grupo titulo="Curva">
            <Segmento<Curva>
              valor={tema.curva}
              opciones={[
                { id: "recta", nombre: "Recta" },
                { id: "suave", nombre: "Suave" },
                { id: "escalonada", nombre: "Escalonada" },
              ]}
              onChange={(curva) => setTema({ curva })}
            />
          </Grupo>

          <Grupo titulo="Grilla">
            <Segmento<GrillaModo>
              valor={tema.grillaModo}
              opciones={[
                { id: "completa", nombre: "Completa" },
                { id: "minima", nombre: "Mínima" },
                { id: "sin", nombre: "Sin" },
              ]}
              onChange={(grillaModo) => setTema({ grillaModo })}
            />
          </Grupo>

          <Grupo titulo="Etiquetas">
            <Segmento<Etiquetas>
              valor={tema.etiquetas}
              opciones={[
                { id: "leyenda", nombre: "Leyenda" },
                { id: "directas", nombre: "Directas" },
              ]}
              onChange={(etiquetas) => setTema({ etiquetas })}
            />
          </Grupo>
        </Bloque>
      )}

      {mostrar("kpis") && (
        <Bloque titulo="KPIs">
          <Grupo titulo="Cifra principal">
            <Segmento<KpiCifra>
              valor={tema.kpiCifra}
              opciones={[
                { id: "m", nombre: "Mediana" },
                { id: "l", nombre: "Grande" },
                { id: "xl", nombre: "Muy grande" },
              ]}
              onChange={(kpiCifra) => setTema({ kpiCifra })}
            />
          </Grupo>
          <Grupo titulo="Acento de la tarjeta">
            <Segmento<KpiAcento>
              valor={tema.kpiAcento}
              opciones={[
                { id: "ninguno", nombre: "Sin" },
                { id: "franja", nombre: "Franja" },
                { id: "punto", nombre: "Punto" },
              ]}
              onChange={(kpiAcento) => setTema({ kpiAcento })}
            />
          </Grupo>
        </Bloque>
      )}

      {mostrar("tablas") && (
        <Bloque titulo="Tablas">
          <Grupo titulo="Encabezado">
            <Segmento<TablaEncabezado>
              valor={tema.tablaEncabezado}
              opciones={[
                { id: "suave", nombre: "Suave" },
                { id: "marcado", nombre: "Marcado" },
                { id: "oscuro", nombre: "Oscuro" },
              ]}
              onChange={(tablaEncabezado) => setTema({ tablaEncabezado })}
            />
          </Grupo>
          <Grupo titulo="Bordes">
            <Segmento<TablaBordes>
              valor={tema.tablaBordes}
              opciones={[
                { id: "filas", nombre: "Entre filas" },
                { id: "grilla", nombre: "Grilla" },
                { id: "ninguno", nombre: "Sin" },
              ]}
              onChange={(tablaBordes) => setTema({ tablaBordes })}
            />
          </Grupo>
          <Grupo titulo="Filas alternas">
            <Segmento<"si" | "no">
              valor={tema.tablaZebra ? "si" : "no"}
              opciones={[
                { id: "no", nombre: "Sin zebra" },
                { id: "si", nombre: "Zebra" },
              ]}
              onChange={(v) => setTema({ tablaZebra: v === "si" })}
            />
          </Grupo>
        </Bloque>
      )}

      {mostrar("botones") && (
        <Bloque titulo="Botones">
          <Grupo titulo="Forma">
            <Segmento<BotonForma>
              valor={tema.botonForma}
              opciones={[
                { id: "recta", nombre: "Recta" },
                { id: "redondeada", nombre: "Redondeada" },
                { id: "pastilla", nombre: "Pastilla" },
              ]}
              onChange={(botonForma) => setTema({ botonForma })}
            />
          </Grupo>
          <Grupo titulo="Texto">
            <Segmento<BotonCaja>
              valor={tema.botonCaja}
              opciones={[
                { id: "mayusculas", nombre: "Mayúsculas" },
                { id: "normal", nombre: "Caja normal" },
              ]}
              onChange={(botonCaja) => setTema({ botonCaja })}
            />
          </Grupo>
          <Grupo titulo="Peso">
            <Segmento<"500" | "600" | "700">
              valor={String(tema.botonPeso) as "500" | "600" | "700"}
              opciones={[
                { id: "500", nombre: "Medio" },
                { id: "600", nombre: "Semibold" },
                { id: "700", nombre: "Bold" },
              ]}
              onChange={(v) => setTema({ botonPeso: Number(v) as 500 | 600 | 700 })}
            />
          </Grupo>
          <Grupo titulo="Relleno del principal">
            <Segmento<BotonRelleno>
              valor={tema.botonRelleno}
              opciones={[
                { id: "solido", nombre: "Sólido" },
                { id: "suave", nombre: "Suave" },
              ]}
              onChange={(botonRelleno) => setTema({ botonRelleno })}
            />
          </Grupo>
          <Grupo titulo="Sombra">
            <Segmento<"si" | "no">
              valor={tema.botonSombra ? "si" : "no"}
              opciones={[
                { id: "no", nombre: "Sin" },
                { id: "si", nombre: "Con sombra" },
              ]}
              onChange={(v) => setTema({ botonSombra: v === "si" })}
            />
          </Grupo>
        </Bloque>
      )}

      <button type="button" onClick={() => setExportando(true)} className="btn-flesan btn-flesan-primary w-full">
        <Download className="w-4 h-4" />
        Exportar tema
      </button>

      {exportando && (
        <DialogoExportar
          css={exportarCss(tokens)}
          json={JSON.stringify(tema, null, 2)}
          onCerrar={() => setExportando(false)}
        />
      )}
    </div>
  );
}

function Bloque({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-5 pt-4 border-t border-border">
      <span className="font-label text-xs font-semibold tracking-[0.12em] uppercase text-text">{titulo}</span>
      {children}
    </div>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-label text-[0.625rem] font-semibold tracking-[0.14em] uppercase text-faint">{titulo}</span>
      {children}
    </div>
  );
}

function Segmento<T extends string>({
  valor,
  opciones,
  onChange,
}: {
  valor: T;
  opciones: { id: T; nombre: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="lab-seg" role="group">
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={valor === o.id}
          onClick={() => onChange(o.id)}
          className={cn(valor === o.id && "is-active")}
        >
          {o.nombre}
        </button>
      ))}
    </div>
  );
}

function DialogoExportar({ css, json, onCerrar }: { css: string; json: string; onCerrar: () => void }) {
  const [copiado, setCopiado] = useState<"css" | "json" | null>(null);

  async function copiar(tipo: "css" | "json") {
    try {
      await navigator.clipboard.writeText(tipo === "css" ? css : json);
      setCopiado(tipo);
      setTimeout(() => setCopiado(null), 1500);
    } catch {}
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Exportar tema"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onCerrar}
    >
      <div className="card w-full max-w-2xl p-5 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <h2 className="display-title text-xl text-text">Exportar tema</h2>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="ml-auto text-muted hover:text-text cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-muted">
          Estos tokens son los que se llevan al <code className="font-label text-xs">@theme</code> de la plantilla
          cuando definamos el estándar. El JSON sirve para volver a cargar esta misma combinación.
        </p>
        {[
          { tipo: "css" as const, titulo: "Tokens CSS", texto: css },
          { tipo: "json" as const, titulo: "Combinación (JSON)", texto: json },
        ].map((b) => (
          <div key={b.tipo} className="flex flex-col gap-2">
            <div className="flex items-center">
              <span className="label-eyebrow">{b.titulo}</span>
              <button
                type="button"
                onClick={() => copiar(b.tipo)}
                className="ml-auto btn-flesan btn-flesan-ghost btn-flesan-sm"
              >
                {copiado === b.tipo ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiado === b.tipo ? "Copiado" : "Copiar"}
              </button>
            </div>
            <pre className="max-h-56 overflow-auto rounded-flesan-sm bg-bg border border-border p-3 text-xs leading-relaxed text-text">
              {b.texto}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
