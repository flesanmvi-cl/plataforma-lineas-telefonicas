"use client";

import { useFiltrosUrl } from "@/components/presentaciones/use-filtros-url";
import { usePublicarVista } from "@/components/presentaciones/vista-actual";
import { PageHeader } from "@/components/page-header";
import { Pildoras } from "@/components/reporte/tarjeta";
import { BarraFiltros, type FiltroActivo } from "@/components/reporte/filtros";
import { AvisoEjemplo } from "../piezas";
import { CATEGORIAS, MESES_LARGOS, ULTIMO_MES } from "./datos";
import { textoPeriodo, type Filtros, type Periodo } from "./calculos";
import { VistaMatriz, VistaTablero, VistaTerritorio } from "./vistas";
import { Desplegable } from "@/components/desplegable";

// Reporte Tipo 2 · ventas. Tres vistas sobre las mismas filas y los mismos filtros:
// «Tablero» (la principal, en la línea del Tipo 1), «Territorio» (mapa protagonista) y
// «Matriz» (vendedor × mes). Vista, período y filtros viven en la URL (presentaciones).

type Vista = "tablero" | "territorio" | "matriz";

const VISTAS: { id: Vista; texto: string }[] = [
  { id: "tablero", texto: "Tablero" },
  { id: "territorio", texto: "Territorio" },
  { id: "matriz", texto: "Vendedor × mes" },
];
const PERIODOS: { id: Periodo; texto: string }[] = [
  { id: "mes", texto: "Mes" },
  { id: "acum", texto: "Acumulado" },
];

export interface PropsVista {
  f: Filtros;
  /** Elige o suelta un valor de una dimensión (clic en un gráfico). */
  alternar: (campo: "categoria" | "ciudad" | "vendedor", valor: string) => void;
  /** Elige un mes: si ya estaba elegido en «Mes», vuelve al acumulado. */
  elegirMes: (mes: number) => void;
}

export function ReporteVentas() {
  const [crudo, setFiltros] = useFiltrosUrl({
    vista: "tablero",
    periodo: "acum",
    mes: String(ULTIMO_MES),
    categoria: "",
    ciudad: "",
    vendedor: "",
  });
  const vista = crudo.vista as Vista;
  const f: Filtros = {
    periodo: crudo.periodo as Periodo,
    mes: Math.min(Math.max(Number(crudo.mes) || 0, 0), ULTIMO_MES),
    categoria: crudo.categoria,
    ciudad: crudo.ciudad,
    vendedor: crudo.vendedor,
  };

  const alternar: PropsVista["alternar"] = (campo, valor) => setFiltros((p) => ({ [campo]: p[campo] === valor ? "" : valor }));
  const elegirMes: PropsVista["elegirMes"] = (mes) =>
    setFiltros((p) => (p.periodo === "mes" && Number(p.mes) === mes ? { periodo: "acum", mes: String(ULTIMO_MES) } : { periodo: "mes", mes: String(mes) }));

  const activos: FiltroActivo[] = [];
  if (f.periodo === "mes") activos.push({ clave: "mes", texto: textoPeriodo(f), color: "var(--color-serie-1)", quitar: () => setFiltros({ periodo: "acum", mes: String(ULTIMO_MES) }) });
  if (f.categoria) {
    const c = CATEGORIAS.find((x) => x.clave === f.categoria)!;
    activos.push({ clave: "categoria", texto: c.nombre, color: c.color, quitar: () => setFiltros({ categoria: "" }) });
  }
  if (f.ciudad) activos.push({ clave: "ciudad", texto: f.ciudad, color: "var(--color-serie-1)", quitar: () => setFiltros({ ciudad: "" }) });
  if (f.vendedor) activos.push({ clave: "vendedor", texto: f.vendedor, color: "var(--color-serie-1)", quitar: () => setFiltros({ vendedor: "" }) });

  usePublicarVista(`Ventas · ${VISTAS.find((v) => v.id === vista)!.texto}`, [textoPeriodo(f), ...activos.filter((a) => a.clave !== "mes").map((a) => a.texto)]);

  const props: PropsVista = { f, alternar, elegirMes };

  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8" data-estilo="reporte">
      <PageHeader
        title="Ventas"
        description="Venta inmobiliaria en UF contra la meta y el año anterior: por mes, categoría, ciudad, vendedor y proyecto. Tres vistas sobre los mismos filtros; clic en un gráfico para filtrar el resto. Las cifras son de ejemplo."
        actions={
          <>
            <AvisoEjemplo />
            <Desplegable
              conRotulo
              etiqueta={f.periodo === "mes" ? "Mes" : "Hasta"}
              valor={String(f.mes)}
              onCambio={(v) => setFiltros({ mes: v })}
              alinear="derecha"
              opciones={MESES_LARGOS.slice(0, ULTIMO_MES + 1).map((m, i) => ({ valor: String(i), texto: `${m[0].toUpperCase() + m.slice(1)} 2026` }))}
            />
            <Pildoras etiqueta="Período" opciones={PERIODOS} valor={f.periodo} onCambio={(v) => setFiltros({ periodo: v })} />
          </>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Pildoras etiqueta="Vista del reporte" opciones={VISTAS} valor={vista} onCambio={(v) => setFiltros({ vista: v })} />
          <div className="flex-1 min-w-72">
            <BarraFiltros filtros={activos} onLimpiar={() => setFiltros({ periodo: "acum", mes: String(ULTIMO_MES), categoria: "", ciudad: "", vendedor: "" })} />
          </div>
        </div>

        {vista === "tablero" && <VistaTablero {...props} />}
        {vista === "territorio" && <VistaTerritorio {...props} />}
        {vista === "matriz" && <VistaMatriz {...props} />}
      </div>
    </div>
  );
}
