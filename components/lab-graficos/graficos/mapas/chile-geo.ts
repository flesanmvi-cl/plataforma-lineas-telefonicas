/**
 * Carga del GeoJSON de regiones de Chile para los mapas ECharts del laboratorio.
 *
 * Se pide una sola vez por sesión y se registran dos mapas:
 * - «chile»: orientación normal (norte arriba).
 * - «chile-horizontal»: girado 90° (norte a la izquierda, cordillera arriba) para tarjetas anchas.
 * Se quitan las islas oceánicas (Rapa Nui, Juan Fernández, Desventuradas) porque achican el
 * continente a un hilo; ninguna tiene datos en el laboratorio.
 */

type Posicion = number[];
type Anillo = Posicion[];
type Poligono = Anillo[];

interface Geometria {
  type: "Polygon" | "MultiPolygon";
  coordinates: Poligono | Poligono[];
}

interface Rasgo {
  type: "Feature";
  properties: { codigo: number; nombre: string; name?: string };
  geometry: Geometria;
}

interface Coleccion {
  type: "FeatureCollection";
  features: Rasgo[];
}

type ModuloEcharts = typeof import("echarts");

/** Longitud límite: todo polígono completamente al oeste de esto es insular. */
const LIMITE_OESTE = -77;

let pedido: Promise<Coleccion> | null = null;

function cargarGeojson(): Promise<Coleccion> {
  if (!pedido) {
    pedido = fetch("/lab/chile-regiones.json")
      .then((r) => {
        if (!r.ok) throw new Error(`No se pudo cargar el mapa de regiones (${r.status})`);
        return r.json() as Promise<Coleccion>;
      })
      .catch((e) => {
        // Si falla, se permite reintentar en el próximo montaje.
        pedido = null;
        throw e;
      });
  }
  return pedido;
}

function continental(poligono: Poligono) {
  return poligono[0].some(([lon]) => lon > LIMITE_OESTE);
}

function limpiar(col: Coleccion): Coleccion {
  return {
    type: "FeatureCollection",
    features: col.features.map((f) => {
      const g = f.geometry;
      const poligonos = g.type === "MultiPolygon" ? (g.coordinates as Poligono[]) : [g.coordinates as Poligono];
      return {
        ...f,
        properties: { ...f.properties, name: f.properties.nombre },
        geometry: { type: "MultiPolygon", coordinates: poligonos.filter(continental) },
      };
    }),
  };
}

/** Coordenada [lon, lat] → espacio del mapa horizontal (x = distancia al sur, y = longitud). */
export function aHorizontal(lon: number, lat: number): [number, number] {
  return [-lat, lon];
}

function girar(col: Coleccion): Coleccion {
  return {
    type: "FeatureCollection",
    features: col.features.map((f) => ({
      ...f,
      geometry: {
        type: "MultiPolygon",
        coordinates: (f.geometry.coordinates as Poligono[]).map((p) => p.map((anillo) => anillo.map(([lon, lat]) => aHorizontal(lon, lat)))),
      },
    })),
  };
}

let registrado = false;

/** Registra «chile» y «chile-horizontal» en ECharts (idempotente). Úsalo en `preparar`. */
export async function registrarChile(echarts: ModuloEcharts) {
  if (registrado && echarts.getMap("chile")) return;
  const limpio = limpiar(await cargarGeojson());
  // El tipo GeoJSON de ECharts es más estricto que el nuestro; la forma es compatible.
  echarts.registerMap("chile", limpio as unknown as Parameters<ModuloEcharts["registerMap"]>[1]);
  echarts.registerMap("chile-horizontal", girar(limpio) as unknown as Parameters<ModuloEcharts["registerMap"]>[1]);
  registrado = true;
}

/** Nombre corto de región para ejes angostos. */
export function nombreCorto(nombre: string) {
  const cortos: Record<string, string> = {
    "Arica y Parinacota": "Arica y Parin.",
    "La Araucanía": "Araucanía",
  };
  return cortos[nombre] ?? nombre;
}

/** Regiones de norte a sur (código → nombre), en el orden del GeoJSON y de valoresPorRegion. */
export const REGIONES: { codigo: number; nombre: string }[] = [
  { codigo: 15, nombre: "Arica y Parinacota" },
  { codigo: 1, nombre: "Tarapacá" },
  { codigo: 2, nombre: "Antofagasta" },
  { codigo: 3, nombre: "Atacama" },
  { codigo: 4, nombre: "Coquimbo" },
  { codigo: 5, nombre: "Valparaíso" },
  { codigo: 13, nombre: "Metropolitana" },
  { codigo: 6, nombre: "O'Higgins" },
  { codigo: 7, nombre: "Maule" },
  { codigo: 16, nombre: "Ñuble" },
  { codigo: 8, nombre: "Biobío" },
  { codigo: 9, nombre: "La Araucanía" },
  { codigo: 14, nombre: "Los Ríos" },
  { codigo: 10, nombre: "Los Lagos" },
  { codigo: 11, nombre: "Aysén" },
  { codigo: 12, nombre: "Magallanes" },
];
