"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Map as MapaML, Popup as PopupML } from "maplibre-gl";
import type { ExpressionSpecification as Expr } from "@maplibre/maplibre-gl-style-spec";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { formato, LINEAS, OBRAS_MAPA } from "@/lib/lab-graficos/datos";
import { conAlfa, type TokensLab } from "@/lib/lab-graficos/tema";
import { AvisoMapa } from "./aviso-mapa";

const ESTILO_CLARO = "https://tiles.openfreemap.org/styles/positron";
const ESTILO_OSCURO = "https://tiles.openfreemap.org/styles/dark";
/** Si el mapa base no termina de cargar en este plazo, se asume red bloqueada. */
const PLAZO_MS = 12000;
const FUENTE = "obras";
const CAPAS = ["obras-halo", "obras-circulo"];

const TEXTOS_ES = {
  "CooperativeGesturesHandler.WindowsHelpText": "Usa Ctrl + rueda para hacer zoom",
  "CooperativeGesturesHandler.MacHelpText": "Usa ⌘ + rueda para hacer zoom",
  "CooperativeGesturesHandler.MobileHelpText": "Usa dos dedos para mover el mapa",
  "NavigationControl.ZoomIn": "Acercar",
  "NavigationControl.ZoomOut": "Alejar",
  "NavigationControl.ResetBearing": "Restablecer orientación",
};

const DATOS_OBRAS = {
  type: "FeatureCollection" as const,
  features: OBRAS_MAPA.map((o, i) => ({
    type: "Feature" as const,
    id: i,
    properties: { nombre: o.nombre, ciudad: o.ciudad, linea: o.linea, monto: o.monto },
    geometry: { type: "Point" as const, coordinates: [o.lon, o.lat] },
  })),
};

/** Expresión MapLibre: color por línea de negocio. */
function colorPorLinea(t: TokensLab): Expr {
  const pares = LINEAS.flatMap((l, i) => [l, t.colores[i % t.colores.length]]);
  return ["match", ["get", "linea"], ...pares, t.textoSuave] as unknown as Expr;
}

const RADIO: Expr = ["interpolate", ["linear"], ["sqrt", ["get", "monto"]], 5, 7, 12.5, 20];

/** Quita y vuelve a poner la fuente y las capas de obras con los tokens actuales. */
function aplicarCapas(mapa: MapaML, t: TokensLab) {
  for (const id of CAPAS) if (mapa.getLayer(id)) mapa.removeLayer(id);
  if (!mapa.getSource(FUENTE)) mapa.addSource(FUENTE, { type: "geojson", data: DATOS_OBRAS });
  const color = colorPorLinea(t);
  const contorno = t.superficie === "contorno";
  const halo = t.superficie === "sombras" || t.superficie === "glass" || t.superficie === "degradado";

  // Halo difuso bajo cada obra: es como se nota la superficie con sombra o degradado.
  mapa.addLayer({
    id: "obras-halo",
    type: "circle",
    source: FUENTE,
    paint: {
      "circle-radius": ["*", RADIO, t.superficie === "glass" ? 1.9 : 1.6],
      "circle-color": color,
      "circle-blur": 1,
      "circle-opacity": halo ? (t.superficie === "degradado" ? 0.45 : 0.55) : 0,
      "circle-translate": t.superficie === "sombras" ? [0, 4] : [0, 0],
    },
  });
  mapa.addLayer({
    id: "obras-circulo",
    type: "circle",
    source: FUENTE,
    paint: {
      "circle-radius": RADIO,
      "circle-color": color,
      "circle-opacity": contorno ? 0.18 : t.superficie === "glass" ? 0.7 : 0.88,
      "circle-stroke-width": ["case", ["boolean", ["feature-state", "activa"], false], 2.5, contorno ? 1.75 : 1.25],
      "circle-stroke-color": contorno ? color : ["case", ["boolean", ["feature-state", "activa"], false], t.texto, t.fondoTarjeta],
      "circle-opacity-transition": { duration: t.animacion.duracion },
    },
  });
}

function htmlPopup(p: { nombre: string; ciudad: string; linea: string; monto: number }) {
  return `<div class="lab-popup-titulo">${p.nombre}</div><div class="lab-popup-meta">${p.linea} · ${p.ciudad}</div><div class="lab-popup-monto">Monto <b>${formato.millones(Number(p.monto))}</b></div>`;
}

// Mapa real con teselas vectoriales (MapLibre + OpenFreeMap, sin API key) y las obras como
// capa de círculos. Si la red bloquea el mapa base, muestra un aviso en vez de romper.
export function MapaObrasMaplibre({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const contenedor = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<MapaML | null>(null);
  const tokensRef = useRef(t);
  tokensRef.current = t;
  const [estado, setEstado] = useState<"cargando" | "listo" | "sin-red" | "sin-webgl">("cargando");
  const clase = `lab-ml-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  // El mapa se crea de nuevo al cambiar entre claro y oscuro (otro estilo base).
  useEffect(() => {
    let vivo = true;
    let mapa: MapaML | null = null;
    let popup: PopupML | null = null;
    let cargado = false;
    setEstado("cargando");
    const plazo = window.setTimeout(() => {
      if (vivo && !cargado) setEstado("sin-red");
    }, PLAZO_MS);

    (async () => {
      const ml = await import("maplibre-gl");
      if (!vivo || !contenedor.current) return;
      // MapLibre 6 carga su worker como módulo aparte y webpack no lo empaqueta: se sirve
      // desde public/lab/maplibre (copiado de node_modules/maplibre-gl/dist, misma versión).
      ml.setWorkerUrl("/lab/maplibre/maplibre-gl-worker.mjs");
      const tk = tokensRef.current;
      try {
        mapa = new ml.Map({
          container: contenedor.current,
          style: tk.oscuro ? ESTILO_OSCURO : ESTILO_CLARO,
          bounds: [
            [-76, -44],
            [-66, -18],
          ],
          fitBoundsOptions: { padding: 24 },
          cooperativeGestures: true,
          attributionControl: { compact: true },
          locale: TEXTOS_ES,
          fadeDuration: tk.animacion.duracion > 0 ? 300 : 0,
        });
      } catch {
        setEstado("sin-webgl");
        return;
      }
      mapaRef.current = mapa;
      const m = mapa;
      m.addControl(new ml.NavigationControl({ showCompass: false }), "top-right");

      m.on("error", () => {
        // Errores antes de cargar el estilo = no hay acceso al mapa base desde esta red.
        if (!cargado && vivo) setEstado("sin-red");
      });

      m.on("load", () => {
        cargado = true;
        if (!vivo) return;
        window.clearTimeout(plazo);
        aplicarCapas(m, tokensRef.current);
        setEstado("listo");
        const tt = tokensRef.current;
        m.fitBounds(
          [
            [Math.min(...OBRAS_MAPA.map((o) => o.lon)), Math.min(...OBRAS_MAPA.map((o) => o.lat))],
            [Math.max(...OBRAS_MAPA.map((o) => o.lon)), Math.max(...OBRAS_MAPA.map((o) => o.lat))],
          ],
          { padding: 40, duration: tt.animacion.duracion > 0 ? tt.animacion.duracion * 2 : 0 },
        );
      });

      let activa: number | string | undefined;
      const marcar = (id: number | string | undefined) => {
        if (activa !== undefined) m.setFeatureState({ source: FUENTE, id: activa }, { activa: false });
        activa = id;
        if (id !== undefined) m.setFeatureState({ source: FUENTE, id }, { activa: true });
      };
      m.on("mousemove", "obras-circulo", (e) => {
        m.getCanvas().style.cursor = "pointer";
        marcar(e.features?.[0]?.id);
      });
      m.on("mouseleave", "obras-circulo", () => {
        m.getCanvas().style.cursor = "";
        marcar(undefined);
      });
      m.on("click", "obras-circulo", (e) => {
        const f = e.features?.[0];
        if (!f || f.geometry.type !== "Point") return;
        popup?.remove();
        popup = new ml.Popup({ closeButton: true, offset: 14, className: clase, maxWidth: "240px" })
          .setLngLat(f.geometry.coordinates as [number, number])
          .setHTML(htmlPopup(f.properties as { nombre: string; ciudad: string; linea: string; monto: number }))
          .addTo(m);
      });
    })();

    return () => {
      vivo = false;
      window.clearTimeout(plazo);
      popup?.remove();
      mapa?.remove();
      mapaRef.current = null;
    };
    // Solo el modo claro/oscuro obliga a rehacer el mapa; el resto se aplica en caliente.
  }, [t.oscuro, clase]);

  // Cambios de paleta o superficie: se rehacen solo las capas de obras.
  useEffect(() => {
    const mapa = mapaRef.current;
    if (mapa && estado === "listo" && mapa.isStyleLoaded()) aplicarCapas(mapa, t);
  }, [t, estado]);

  // Estilo del popup y de los controles con los tokens (MapLibre trae su propio CSS).
  const css = useMemo(
    () => `
.${clase} .maplibregl-popup-content{background:${t.tooltip.fondo};color:${t.tooltip.texto};border:1px solid ${t.tooltip.borde};
border-radius:${Math.min(t.radio, 12)}px;box-shadow:${t.tooltip.sombra};padding:10px 28px 10px 12px;font-family:${t.fuente};font-size:12px;line-height:1.45}
.${clase}.maplibregl-popup-anchor-top .maplibregl-popup-tip,.${clase}.maplibregl-popup-anchor-top-left .maplibregl-popup-tip,.${clase}.maplibregl-popup-anchor-top-right .maplibregl-popup-tip{border-bottom-color:${t.tooltip.fondo}}
.${clase}.maplibregl-popup-anchor-bottom .maplibregl-popup-tip,.${clase}.maplibregl-popup-anchor-bottom-left .maplibregl-popup-tip,.${clase}.maplibregl-popup-anchor-bottom-right .maplibregl-popup-tip{border-top-color:${t.tooltip.fondo}}
.${clase}.maplibregl-popup-anchor-left .maplibregl-popup-tip{border-right-color:${t.tooltip.fondo}}
.${clase}.maplibregl-popup-anchor-right .maplibregl-popup-tip{border-left-color:${t.tooltip.fondo}}
.${clase} .maplibregl-popup-close-button{color:${t.tooltip.texto};font-size:16px;right:4px;top:2px}
.${clase} .lab-popup-titulo{font-weight:700;font-size:13px}
.${clase} .lab-popup-meta{opacity:.75}
.${clase} .lab-popup-monto{margin-top:4px}
.${clase}-cont .maplibregl-ctrl-group{background:${t.fondoTarjeta};border-radius:${Math.min(t.radio, 8)}px;box-shadow:0 1px 4px ${conAlfa("#000000", 0.2)}}
.${clase}-cont .maplibregl-ctrl-group button .maplibregl-ctrl-icon{filter:${t.oscuro ? "invert(1)" : "none"}}
.${clase}-cont .maplibregl-ctrl-attrib{font-family:${t.fuente};font-size:10px}
`,
    [clase, t],
  );

  if (estado === "sin-red")
    return (
      <AvisoMapa
        alto={alto}
        texto="No se pudieron cargar los mapas base desde esta red"
        detalle="El mapa usa teselas de OpenFreeMap (tiles.openfreemap.org). Si la red corporativa las bloquea, hay que pedir la excepción o servir las teselas desde un servidor interno."
      />
    );
  if (estado === "sin-webgl")
    return <AvisoMapa alto={alto} texto="Este navegador no pudo iniciar WebGL" detalle="MapLibre necesita WebGL para dibujar el mapa." />;

  return (
    <div style={{ position: "relative", height: alto, borderRadius: Math.min(t.radio, 12), overflow: "hidden" }}>
      <style>{css}</style>
      <div ref={contenedor} className={`${clase}-cont`} style={{ position: "absolute", inset: 0 }} />
      {estado === "cargando" && (
        <div
          aria-live="polite"
          style={{
            position: "absolute",
            left: 10,
            bottom: 10,
            padding: "4px 10px",
            borderRadius: 999,
            background: conAlfa(t.oscuro ? "#000000" : "#FFFFFF", 0.8),
            color: t.textoSuave,
            fontFamily: t.fuente,
            fontSize: t.tamano.eje,
          }}
        >
          Cargando mapa base…
        </div>
      )}
      {estado === "listo" && <Leyenda t={t} />}
    </div>
  );
}

function Leyenda({ t }: { t: TokensLab }) {
  const lineas = LINEAS.filter((l) => OBRAS_MAPA.some((o) => o.linea === l));
  return (
    <div
      style={{
        position: "absolute",
        left: 10,
        top: 10,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        padding: "8px 10px",
        borderRadius: Math.min(t.radio, 10),
        background: conAlfa(t.oscuro ? "#1A1A1A" : "#FFFFFF", 0.88),
        backdropFilter: "blur(6px)",
        boxShadow: `0 1px 4px ${conAlfa("#000000", 0.15)}`,
        fontFamily: t.fuente,
        fontSize: t.tamano.eje,
        color: t.texto,
        pointerEvents: "none",
      }}
    >
      {lineas.map((l) => (
        <span key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: 999, background: t.colores[LINEAS.indexOf(l) % t.colores.length] }} />
          {l}
        </span>
      ))}
      <span style={{ color: t.textoSuave, marginTop: 2 }}>Tamaño: monto · clic para detalle</span>
    </div>
  );
}
