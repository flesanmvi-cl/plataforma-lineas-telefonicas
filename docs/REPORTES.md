# Reportes tipo

Pantallas de referencia en el menú «Pruebas» del sidebar. Para armar un reporte en una
plataforma, se copia el tipo que corresponde y se cambian sus datos de ejemplo por la consulta
real: los bloques no cambian.

| Tipo | Para qué | Pantalla | Piezas |
|---|---|---|---|
| 1 | Resumen ejecutivo del período, con filtros cruzados | `components/pruebas/reporte-ejecutivo.tsx` | `components/reporte/` |
| 2 | Ventas con meta: mensual, acumulado, categoría, ciudad, vendedor y proyecto, en tres vistas (Tablero, Territorio, Vendedor × mes) | `components/pruebas/ventas/` | `components/reporte/` |
| 3 | Ficha de una entidad (una obra, un contrato) | `components/pruebas/reporte-obra.tsx` | laboratorio |
| — | Costos por obra con drilldown (antes Tipo 2), en `/pruebas/reportes/costos` | `components/pruebas/reporte-costos.tsx` | laboratorio + ECharts |

## Reporte Tipo 1

El look & feel se tomó del panel de Conflicto de Interés de debida-diligencia (opción A,
aprobada el 29-09-2026). Tiene tarjetas redondeadas, cifras grandes en Inter Tight
(`data-estilo="reporte"`), la paleta de series `--color-serie-1…8` de `app/shell.css` y el brillo
rojo solo en la tarjeta principal.

### Piezas (`components/reporte/`)

| Pieza | Archivo | Recibe |
|---|---|---|
| `KpiPrincipal` | `kpi-principal.tsx` | cifra, contraste (ej. facturado) con avance, chips de conteo, serie de tendencia |
| `PanelCifras` | `kpi-principal.tsx` | cifras de contexto fijas (no responden a filtros) |
| `TarjetaReporte`, `Rotulo`, `Pildoras` | `tarjeta.tsx` | bloque numerado con título y detalle; selector de vista |
| `BarraFiltros` | `filtros.tsx` | los filtros activos (texto, color y cómo quitarlo) |
| `DonaLeyenda` | `dona-leyenda.tsx` | `{ clave, nombre, valor, detalle, color }[]`, selección y `onSeleccion` |
| `Piramide` | `piramide.tsx` | `{ numero, nombre, cantidad, valor }[]` por nivel, selección |
| `BarrasApiladas` | `barras-apiladas.tsx` | categorías (años) y series con un valor por categoría |
| `KpiTarjeta` | `kpi-tarjeta.tsx` | KPI chico para una franja; barra con marca de meta opcional |
| `BarrasComparadas` | `barras-comparadas.tsx` | por mes: actual, año anterior y meta (línea punteada); clic elige el mes |
| `LineaAcumulada` | `linea-acumulada.tsx` | valores por mes del año, la meta y el año anterior (los acumula) |
| `BarraParticipacion` | `participacion.tsx` | igual que la dona, en una barra al 100 % con fichas |
| `RankingMeta` | `ranking-meta.tsx` | `{ clave, nombre, detalle, valor, meta }[]`: barra, marca de meta y semáforo |
| `MapaChile`, `MapaLatitud` | `mapa-chile.tsx` | puntos `{ clave, nombre, lat, lon, valor, color, detalle }` sobre el contorno real (GeoJSON `/lab/chile-regiones.json`) |
| `MatrizCalor` | `matriz-calor.tsx` | filas × columnas (vendedor × mes), columnas activas del período |
| `BarrasVariacion` | `variacion.tsx` | variación % por ítem alrededor de cero |
| Celdas de tabla | `celdas.tsx` | `CeldaNombre` (iniciales), `InsigniaSerie`, `ValorConMas`, `NumeroCaja`, `CeldaMonto` |

La tabla usa `<table className="rep-tabla">`, y los formatos de cifra (es-CL, MM) están en
`formato.ts`.

### Receta

1. Copia `reporte-ejecutivo.tsx` a la plataforma y crea su ruta. La página se envuelve en
   `data-estilo="reporte"`.
2. Cambia `CONTRATOS` por tus filas, **una fila por hecho** (contrato, venta, orden…). Si los datos
   vienen de la transaccional, se leen con `lib/db.ts` (solo lectura). Pueden entrar por un
   server component o por una API.
3. Cada bloque se calcula desde esas filas. Para los filtros cruzados, cada gráfico se calcula con
   todos los filtros menos el suyo (`pasa(c, "tipo")`). Así lo elegido queda resaltado y el resto
   atenuado en vez de desaparecer.
4. Los filtros van en `useFiltrosUrl`, para que «Agregar a presentación» guarde la vista, y el
   título y los filtros en `usePublicarVista`.
5. Los colores salen de `SERIES` (`formato.ts`) o de los tokens `var(--color-serie-N)`, escritos
   completos: Tailwind v4 no emite una variable que no encuentra escrita en el código.
6. Cada bloque puede cambiar de gráfico según la pregunta (una dona por barras, por ejemplo) sin
   cambiar el look.

## Reporte Tipo 2 (ventas)

Las tres vistas se calculan desde las mismas filas y comparten los filtros: `components/pruebas/ventas/calculos.ts`. Se usa **una fila por unidad vendida** más la **meta mensual por vendedor**.

- **Período:** «Acumulado» suma de enero al mes elegido y «Mes» muestra solo ese mes. Un clic en un mes de cualquier gráfico cambia a «Mes».
- **Meta:** existe por vendedor. La de una ciudad reparte la de cada vendedor según dónde vendió. No hay meta por categoría: con una categoría elegida se muestra «sin meta».
- **Semáforo** (`colorCumplimiento` en `formato.ts`): sobre 100 % verde, 90-99 % ámbar, bajo 90 % rojo.

### Color

La paleta de series es solo para **datos**: categorías en gráficos, insignias y avatares. En
botones, enlaces de acción y selección, el rojo Flesan sigue siendo el único acento (el punto rojo
de la opción activa, la lupa del buscador).
