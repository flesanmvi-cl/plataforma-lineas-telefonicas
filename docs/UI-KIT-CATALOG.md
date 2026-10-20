# Guía de estilo y piezas del estándar

En esta plantilla solo vive **lo vigente**. Las opciones en prueba están en el **laboratorio de
diseño**, que es otro proyecto: `proyectos/_prototipos/laboratorio-diseno` (separado el
2026-10-20, con toda su historia de git).

## Qué hay aquí

- **Guía de estilo** (`/ui-kit`, `components/guia-estilo.tsx`): identidad y color,
  tipografía, escala y densidad, superficie y forma, formularios y las piezas del estándar
  dibujadas vivas. Cada tarjeta tiene «Ver tokens» copiables y «Copiar tokens CSS» entrega el
  tema completo.
- **Piezas del estándar** (`components/estandar/`, `lib/estandar/`): lo que usan las
  Plantillas (Reportes y Formularios Tipo) y el constructor de maquetas.
  - Tokens: `lib/estandar/tema.ts` (`TokensLab`) y el proveedor fijo `LabTemaFijo` de
    `components/estandar/tema-context.tsx`, con `ESTANDAR.tema` (`lib/estandar/estandar.ts`).
    Una pieza no hardcodea colores, letra ni radios: todo sale de `useTokens()`.
  - `echart.tsx` (envoltorio de ECharts) y `lib/estandar/estilos.ts` (ejes, grilla, leyenda).
  - `graficos/base/` (avisos, insignias, tarjetas, estado vacío), `graficos/botones/`,
    `graficos/campos/` (texto, monto, fecha, selección, archivo, casillas, grupos),
    `graficos/tablas/` (insignia de estado, encabezados), `graficos/tiempo/` (Curva S, Gantt,
    línea de hitos) y `graficos/mapas/` (mapa de obras; el GeoJSON está en
    `public/mapas/chile-regiones.json`).
  - Datos de ejemplo deterministas en `lib/estandar/datos.ts`.
- **Piezas de reportería** (`components/reporte/`): KPIs, barras, donas, rankings, pirámides,
  mapa de Chile y celdas de tabla, con la paleta `--color-serie-1…8`. Receta en `docs/REPORTES.md`.

**Estado: provisorio.** `ESTANDAR.provisorio` sigue en `true`: las piezas de `components/estandar`
no se eligieron formalmente en el laboratorio. Quedaron porque las Plantillas las usan, y se
reemplazan si en el laboratorio se elige otra cosa. Los nombres (`TokensLab`, `BotonLab`,
`PropsGraficoLab`) se mantienen iguales a los del laboratorio a propósito, para que promover
sea copiar.

## Cómo llega algo nuevo desde el laboratorio

Circuito de una sola vía: **el shell baja** del mockup al laboratorio y **lo elegido sube** del
laboratorio al mockup.

1. En el laboratorio se explora y se elige (su Inicio muestra el estado de cada sección).
2. La pieza elegida se copia a `components/estandar/` con la misma ruta relativa que tiene bajo
   `components/lab-graficos/`. Solo cambian los imports: `@/components/lab-graficos/` →
   `@/components/estandar/` y `@/lib/lab-graficos/` → `@/lib/estandar/`. Si trae una librería
   nueva, se instala aquí.
3. Se agrega a la Guía de estilo (`GRAFICOS` o una tarjeta en `components/guia-estilo.tsx`) y,
   si sirve para maquetar, a `ESTANDAR_PIEZAS` en `components/constructor/elementos.tsx`.
4. Si cambia el tema: el JSON de «Exportar tema» del laboratorio va a `ESTANDAR.tema`; al aprobarlo,
   `provisorio: false`, `vigenteDesde` y `version`.
5. En el laboratorio, la sección se marca «Promovido» y se borra lo que no se eligió.

Las rutas viejas del laboratorio (`/ui-kit/laboratorio/*`, `/ui-kit/escala`, `/ui-kit/graficos`…)
redirigen a `/ui-kit` (ver `next.config.ts`).

## Infraestructura compartida

- `components/page-header.tsx` — encabezado de toda vista: `<PageHeader title description actions />`.
  Título en una línea, la descripción detrás de un ícono (i) y las acciones a la derecha. No
  reintroducir eyebrow + título grande + párrafo: empuja el contenido hacia abajo.
- `components/section-tabs.tsx` — tabs de navegación secundaria (shell; toma la ruta que calza
  más largo, así las sub-rutas marcan su tab).
- `--color-chart-1..5` y `--color-chart-grid` en `app/globals.css` (`@theme` + override `.dark`).
