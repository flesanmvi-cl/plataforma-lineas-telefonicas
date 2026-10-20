"use client";

import { useState, type CSSProperties, type MouseEvent } from "react";
import { flushSync } from "react-dom";
import { useTheme } from "next-themes";
import { ArrowLeft, Building2, Moon, Sun } from "lucide-react";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { OBRAS_MV, pct, useMovimiento } from "../efectos/comun";
import { docVT, transicionLocal, useNombresVT, useVtSoportado } from "./comun";

function Aviso({ t }: { t: TokensLab }) {
  const soportado = useVtSoportado();
  if (soportado) return null;
  return <p style={{ margin: 0, fontSize: 11.5, color: t.textoSuave }}>Este navegador no soporta View Transitions: el cambio es instantáneo.</p>;
}

const chip = (t: TokensLab, activo: boolean): CSSProperties => ({
  fontSize: 12.5,
  padding: "3px 10px",
  borderRadius: 999,
  border: `1px solid ${activo ? t.texto : t.grilla}`,
  background: activo ? t.texto : "transparent",
  color: activo ? t.fondoTarjeta : t.texto,
  cursor: "pointer",
  fontFamily: t.fuente,
});

// Lista → ficha: la miniatura y el nombre de la obra viajan desde la fila hasta el encabezado
// de la ficha. Es el uso más claro de View Transitions en nuestras plataformas.
export function ListaAFicha({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const { activo, seg } = useMovimiento(t);
  const n = useNombresVT("lf");
  const [sel, setSel] = useState<number | null>(null);
  const obras = OBRAS_MV.slice(0, 4);
  const ir = (i: number | null) => transicionLocal(activo, seg(0.42) * 1000, () => setSel(i));
  const miniatura = (i: number, tam: number): CSSProperties => ({
    width: tam,
    height: tam,
    flexShrink: 0,
    borderRadius: Math.min(t.radio, tam / 4),
    background: i % 2 ? t.texto : t.acento,
    color: t.fondoTarjeta,
    display: "grid",
    placeItems: "center",
    viewTransitionName: n(`m${i}`),
  });

  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", gap: 8, fontFamily: t.fuente }}>
      {sel === null ? (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {obras.map((o, i) => (
            <li key={o.codigo}>
              <button
                type="button"
                onClick={() => ir(i)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: 8, border: `1px solid ${t.grilla}`, borderRadius: t.radio, background: t.fondoTarjeta, cursor: "pointer", textAlign: "left", color: t.texto }}
              >
                <span style={miniatura(i, 34)}>
                  <Building2 className="w-4 h-4" />
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14, fontWeight: 600, viewTransitionName: n(`t${i}`), width: "fit-content" }}>{o.nombre}</span>
                  <span style={{ fontSize: 12, color: t.textoSuave }}>
                    {o.codigo} · {o.negocio}
                  </span>
                </span>
                <span style={{ fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{pct(o.avance)}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button type="button" onClick={() => ir(null)} style={{ ...chip(t, false), alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 4 }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Volver a la lista
          </button>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <span style={miniatura(sel, 72)}>
              <Building2 className="w-8 h-8" />
            </span>
            <div>
              <span style={{ fontSize: 12, color: t.textoSuave }}>
                {obras[sel].codigo} · {obras[sel].negocio}
              </span>
              <h4 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: t.texto, viewTransitionName: n(`t${sel}`), width: "fit-content" }}>{obras[sel].nombre}</h4>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}>
            {[
              ["Avance real", pct(obras[sel].avance)],
              ["Programado", pct(obras[sel].programado)],
              ["Desvío", `${(obras[sel].avance - obras[sel].programado).toLocaleString("es-CL", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} pp`],
            ].map(([l, v]) => (
              <div key={l} style={{ border: `1px solid ${t.grilla}`, borderRadius: t.radio, padding: "8px 10px" }}>
                <div style={{ fontSize: 11.5, color: t.textoSuave }}>{l}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: t.texto, fontVariantNumeric: "tabular-nums" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <Aviso t={t} />
    </div>
  );
}

// Cambio de tema con un círculo que se abre desde el botón. Candidato a reemplazar el cambio
// instantáneo del botón de tema del shell. Al lado, el cambio de hoy para comparar.
export function TemaCircular({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const { activo, seg } = useMovimiento(t);
  const { resolvedTheme, setTheme } = useTheme();
  const oscuro = resolvedTheme === "dark";
  const siguiente = oscuro ? "light" : "dark";

  const conCirculo = (e: MouseEvent<HTMLButtonElement>) => {
    const doc = docVT();
    if (!activo || !doc.startViewTransition) {
      setTheme(siguiente);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.detail === 0 ? r.left + r.width / 2 : e.clientX;
    const y = e.detail === 0 ? r.top + r.height / 2 : e.clientY;
    const radio = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    const raiz = document.documentElement;
    raiz.classList.add("mv-vt-tema");
    const vt = doc.startViewTransition(() =>
      flushSync(() => {
        // next-themes aplica la clase en un efecto; aquí se aplica de inmediato para que la
        // captura «nueva» ya tenga el tema siguiente.
        raiz.classList.toggle("dark", siguiente === "dark");
        raiz.style.colorScheme = siguiente;
        setTheme(siguiente);
      }),
    );
    vt.ready.then(() => {
      raiz.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radio}px at ${x}px ${y}px)`] },
        { duration: seg(0.6) * 1000, easing: "cubic-bezier(.4,0,.2,1)", pseudoElement: "::view-transition-new(root)" },
      );
    });
    vt.finished.finally(() => raiz.classList.remove("mv-vt-tema"));
  };

  const boton = (primario: boolean): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: t.boton.alto.md,
    padding: "0 16px",
    borderRadius: t.boton.radio,
    fontSize: t.boton.tamanoTexto.md,
    fontWeight: t.boton.fontWeight,
    fontFamily: t.fuente,
    cursor: "pointer",
    border: primario ? 0 : `1px solid ${t.grilla}`,
    background: primario ? t.acento : t.fondoTarjeta,
    color: primario ? "#FFFFFF" : t.texto,
  });
  const Icono = oscuro ? Sun : Moon;

  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, fontFamily: t.fuente }}>
      <p style={{ margin: 0, fontSize: 13.5, color: t.textoSuave }}>Cambia el tema de toda la plataforma. El primero abre un círculo desde donde haces clic; el segundo es el cambio de hoy.</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <button type="button" onClick={conCirculo} style={boton(true)}>
          <Icono className="w-4 h-4" /> Con círculo
        </button>
        <button type="button" onClick={() => setTheme(siguiente)} style={boton(false)}>
          <Icono className="w-4 h-4" /> Cambio de hoy
        </button>
      </div>
      <Aviso t={t} />
    </div>
  );
}

const NEGOCIOS = ["Todos", "Edificación", "Minería", "Infraestructura"] as const;

// Filtro que reordena una grilla: cada tarjeta viaja a su nueva posición y las que sobran se
// desvanecen. Lo mismo se logra con Motion (layout); aquí lo hace el navegador.
export function GrillaFiltro({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const { activo, seg } = useMovimiento(t);
  const n = useNombresVT("gf");
  const [neg, setNeg] = useState<(typeof NEGOCIOS)[number]>("Todos");
  const lista = OBRAS_MV.filter((o) => neg === "Todos" || o.negocio === neg);
  const filtrar = (v: (typeof NEGOCIOS)[number]) => transicionLocal(activo, seg(0.45) * 1000, () => setNeg(v));

  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", gap: 10, fontFamily: t.fuente }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {NEGOCIOS.map((v) => (
          <button key={v} type="button" onClick={() => filtrar(v)} style={chip(t, v === neg)} aria-pressed={v === neg}>
            {v}
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
        {lista.map((o) => (
          <div
            key={o.codigo}
            style={{ viewTransitionName: n(o.codigo), border: `1px solid ${t.grilla}`, borderRadius: t.radio, padding: "8px 10px", background: t.fondoTarjeta, display: "flex", flexDirection: "column", gap: 4 }}
          >
            <span style={{ fontSize: 11, color: t.textoSuave }}>
              {o.codigo} · {o.negocio}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: t.texto, lineHeight: 1.25 }}>{o.nombre}</span>
            <span style={{ height: 4, background: t.grilla, position: "relative", marginTop: 2 }}>
              <span style={{ position: "absolute", inset: 0, width: `${o.avance}%`, background: o.avance < o.programado - 2 ? t.acento : t.texto }} />
            </span>
          </div>
        ))}
      </div>
      <Aviso t={t} />
    </div>
  );
}

const PESTANAS = [
  { id: "resumen", nombre: "Resumen" },
  { id: "costos", nombre: "Costos" },
  { id: "plazo", nombre: "Plazo" },
] as const;

// Pestañas donde el subrayado viaja a la pestaña elegida y el contenido se desliza hacia el lado
// correcto (izquierda o derecha según el orden).
export function PestanasDeslizan({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const { activo, seg } = useMovimiento(t);
  const n = useNombresVT("pd");
  const [actual, setActual] = useState(0);
  const cambiar = (i: number) => {
    if (i === actual) return;
    transicionLocal(activo, seg(0.4) * 1000, () => setActual(i), [i > actual ? "mv-dir-der" : "mv-dir-izq"]);
  };

  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", gap: 12, fontFamily: t.fuente }}>
      <div role="tablist" style={{ display: "flex", gap: 4, borderBottom: `1px solid ${t.grilla}` }}>
        {PESTANAS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={i === actual}
            onClick={() => cambiar(i)}
            style={{ position: "relative", padding: "8px 14px", background: "none", border: 0, cursor: "pointer", fontSize: 13.5, fontWeight: i === actual ? 600 : 400, color: i === actual ? t.texto : t.textoSuave, fontFamily: t.fuente }}
          >
            {p.nombre}
            {i === actual && <span style={{ position: "absolute", left: 8, right: 8, bottom: -1, height: 2, background: t.acento, viewTransitionName: n("sub") }} />}
          </button>
        ))}
      </div>
      <div style={{ overflow: "hidden" }}>
        <div key={actual} style={{ viewTransitionName: n("panel"), ["viewTransitionClass" as string]: "mv-panel", display: "flex", flexDirection: "column", gap: 8 }}>
          <Panel t={t} id={PESTANAS[actual].id} />
        </div>
      </div>
      <Aviso t={t} />
    </div>
  );
}

function Panel({ t, id }: { t: TokensLab; id: string }) {
  const fila = (a: string, b: string) => (
    <div key={a} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "6px 0", borderBottom: `1px solid ${t.grilla}`, color: t.texto }}>
      <span style={{ color: t.textoSuave }}>{a}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{b}</span>
    </div>
  );
  if (id === "resumen") return <>{[fila("Obra", "Hospital Antofagasta"), fila("Avance real", "68,4 %"), fila("Programado", "71,0 %"), fila("Estado", "En riesgo")]}</>;
  if (id === "costos")
    return (
      <>
        {[
          ["Obra gruesa", 82],
          ["Instalaciones", 54],
          ["Terminaciones", 23],
        ].map(([l, v]) => (
          <div key={l} style={{ display: "grid", gridTemplateColumns: "110px 1fr 44px", gap: 8, alignItems: "center", fontSize: 13 }}>
            <span style={{ color: t.textoSuave }}>{l}</span>
            <span style={{ height: 8, background: conAlfa(t.texto, 0.1) }}>
              <span style={{ display: "block", height: "100%", width: `${v}%`, background: t.texto }} />
            </span>
            <span style={{ textAlign: "right", color: t.texto }}>{v} %</span>
          </div>
        ))}
      </>
    );
  return <>{[fila("Inicio", "Mar 2025"), fila("Término programado", "Ago 2027"), fila("Holgura", "−18 días"), fila("Próximo hito", "Losa piso 9")]}</>;
}
