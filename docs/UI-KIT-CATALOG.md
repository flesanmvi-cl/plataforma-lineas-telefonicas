# Catálogo de la vitrina de /ui-kit

Índice de todos los objetos con código de catálogo disponibles en `/ui-kit`, para poder pedirlos
por código en una sesión futura — ej. **"usa el gráfico de línea GL-201"** o **"la tabla TB-102"**.
Cada fila apunta al archivo real: ábrelo, cópialo o impórtalo directo, no hay que regenerarlo.

Convención de códigos: `[familia]-[bloque][número]`. La familia son 2 letras (GL/GB/GT/GA/KP/TB/BT),
el bloque agrupa variantes del mismo "tipo" dentro de gráficos (100=barra, 200=línea, 300=torta/dona,
400=área) y en KPI/Tabla/Botón es un bloque único (1xx).

## Gráficos — `/ui-kit/graficos`

Sin librería externa (recharts/d3): SVG a mano sobre `lib/chart-geometry.ts`, coloreado con los
tokens `--color-chart-*` de `app/globals.css` (tema-aware).

| Código | Nombre | Archivo | Descripción |
|---|---|---|---|
| GL-201 | Línea simple | `components/charts/gl-201-linea-simple.tsx` | Una serie, sin relleno, con puntos y grid horizontal. |
| GL-202 | Línea con área | `components/charts/gl-202-linea-area.tsx` | Relleno en gradiente bajo la curva. |
| GL-203 | Línea multi-serie | `components/charts/gl-203-linea-multiserie.tsx` | 2-3 líneas comparativas con leyenda inline. |
| GL-204 | Línea con tooltip | `components/charts/gl-204-linea-tooltip.tsx` | Hover interactivo: línea guía + tooltip con valor. |
| GB-101 | Barras verticales | `components/charts/gb-101-barras-verticales.tsx` | Barras simples, una serie. |
| GB-102 | Barras horizontales | `components/charts/gb-102-barras-horizontales.tsx` | Ranking, etiquetas largas a la izquierda. |
| GB-103 | Barras agrupadas | `components/charts/gb-103-barras-agrupadas.tsx` | Comparativa de 2 series (ej. meta vs real) + leyenda. |
| GT-301 | Torta básica | `components/charts/gt-301-torta-basica.tsx` | Distribución simple con leyenda lateral. |
| GT-302 | Dona · valor central | `components/charts/gt-302-dona-valor-central.tsx` | Un solo indicador tipo "% de avance". |
| GT-303 | Dona · leyenda | `components/charts/gt-303-dona-leyenda.tsx` | Multi-categoría, colores de estado (ok/warn/down). |
| GA-401 | Área simple | `components/charts/ga-401-area-simple.tsx` | Relleno sólido semi-transparente, sin gradiente. |
| GA-402 | Área apilada | `components/charts/ga-402-area-apilada.tsx` | 2 series acumuladas. |

## KPIs — `/ui-kit/kpis`

Cada componente ya trae su propia `.card` — se inserta directo en un grid, sin envoltorio adicional.

| Código | Nombre | Archivo | Descripción |
|---|---|---|---|
| KP-101 | Simple | `components/kpis/kp-101-simple.tsx` | Valor grande + variación (↑/↓) vs período anterior. |
| KP-102 | Ícono + franja | `components/kpis/kp-102-icono-franja.tsx` | Franja de color superior + ícono, para categorizar. |
| KP-103 | Gauge | `components/kpis/kp-103-gauge.tsx` | Arco semicircular de progreso, color según umbral. |
| KP-104 | Comparativo | `components/kpis/kp-104-comparativo.tsx` | Actual vs meta con barra de progreso lineal. |
| KP-105 | Sparkline | `components/kpis/kp-105-sparkline.tsx` | Valor + mini gráfico de tendencia embebido. |

## Tablas — `/ui-kit/tablas`

| Código | Nombre | Archivo | Descripción |
|---|---|---|---|
| TB-101 | Zebra | `components/tables/tb-101-zebra.tsx` | Filas alternas, alineación numérica a la derecha. |
| TB-102 | Ordenable | `components/tables/tb-102-ordenable.tsx` | Click en el encabezado alterna asc/desc, con ícono. |
| TB-103 | Estados + paginación | `components/tables/tb-103-estados-paginacion.tsx` | Badges de estado (color inline) + paginación al pie. |

## Botones — `/ui-kit/botones`

Todo vive como clases utilitarias en `app/globals.css` (sección BUTTONS) — la vitrina en
`app/(dashboard)/ui-kit/botones/page.tsx` solo combina esas clases, no hay componentes separados.

| Código | Nombre | Clases | Descripción |
|---|---|---|---|
| BT-101 | Primario | `.btn-flesan .btn-flesan-primary` | CTA principal, único uso de fondo rojo de marca. |
| BT-102 | Ghost | `.btn-flesan .btn-flesan-ghost` | Acción secundaria. |
| BT-103 | Dark | `.btn-flesan .btn-flesan-dark` | Invertido, jerarquía alta sin ser el CTA rojo. |
| BT-104 | Outline danger | `.btn-flesan .btn-flesan-outline-danger` | Confirmar acción destructiva. |
| BT-105 | Outline success | `.btn-flesan .btn-flesan-outline-success` | Confirmar acción positiva. |
| BT-106 | Solo ícono | `.btn-flesan .btn-flesan-icon` | Cuadrado, sin texto — siempre con `aria-label`. |
| BT-107 | Ícono + texto | `.btn-flesan .btn-flesan-ghost` (+ ícono) | Ícono como refuerzo, no reemplaza el label. |
| BT-108 | Pill | `.btn-flesan .btn-flesan-pill` | Esquinas redondeadas, uso puntual. |
| BT-109 | Segmented / toggle | patrón inline (igual a `ThemeToggle`) | Selección exclusiva entre 2-3 opciones. |
| BT-110 | Tamaños | `.btn-flesan-lg` / `.btn-flesan-sm` | Mismas variantes en otro tamaño. |
| BT-111 | Deshabilitado | atributo `disabled` | Opacidad reducida, cursor not-allowed. |

## Infraestructura compartida

- `lib/chart-geometry.ts` — helpers puros (`scaleLinear`, `buildLinePath`, `buildSmoothPath`,
  `buildAreaPath`, `arcSlicePath`, `toSlices`, `polarToCartesian`, `CHART_COLORS`). Cualquier
  gráfico nuevo debería apoyarse en esto antes de reinventar la geometría.
- `components/ui-kit/gallery-item.tsx` — envoltorio título + código + card usado en las 4 vistas.
- `components/section-tabs.tsx` — tabs de navegación secundaria (usado por el layout de `/ui-kit`,
  reutilizable en cualquier sección con sub-vistas).
- `--color-chart-1..5` y `--color-chart-grid` en `app/globals.css` (`@theme` + override `.dark`).

## Agregar un objeto nuevo a la vitrina

1. Componente en `components/charts|kpis|tables/<código-en-minúscula>-<slug>.tsx`.
2. Súmalo a la página correspondiente en `app/(dashboard)/ui-kit/<vista>/page.tsx` envuelto en
   `<GalleryItem code="..." title="..." description="...">`.
3. Agrega la fila a la tabla correspondiente en este archivo.
