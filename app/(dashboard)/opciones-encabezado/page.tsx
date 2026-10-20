"use client";

import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Pildoras } from "@/components/reporte/tarjeta";
import { LabTemaFijo } from "@/components/estandar/tema-context";
import { BotonLab } from "@/components/estandar/graficos/botones/boton-lab";
import { EncabezadoA, EncabezadoB, EncabezadoC, type DatosEncabezado } from "@/components/encabezado-opciones";
import { ESTANDAR } from "@/lib/estandar/estandar";

// TEMPORAL · opciones de encabezado (2026-10-20). Se borra al elegir.

const REPORTE: DatosEncabezado = {
  seccion: "Contratación",
  titulo: "Resumen de contratación",
  codigo: "R-01",
  meta: [
    { rotulo: "Período", valor: "2016 – 2026" },
    { rotulo: "Fuente", valor: "SAP · Contratos" },
    { rotulo: "Actualizado", valor: "Hoy 06:00" },
  ],
};

const FORMULARIO: DatosEncabezado = {
  seccion: "Obras",
  titulo: "Nueva obra",
  codigo: "F-01",
  meta: [
    { rotulo: "Paso", valor: "1 de 1" },
    { rotulo: "Guarda en", valor: "Maestro de obras" },
    { rotulo: "Responsable", valor: "Control de Gestión" },
  ],
};

const OPCIONES = [
  { id: "A", nombre: "Paralelogramo", nota: "La sección en un paralelogramo rojo como el logo Flesan, título en Barlow Condensed itálica y una regla con un tramo rojo inclinado.", Componente: EncabezadoA },
  { id: "B", nombre: "Rótulo de plano", nota: "Forma distinta: el cajetín de un plano de obra, con código de vista, celdas rotuladas y bordes rectos.", Componente: EncabezadoB },
  { id: "C", nombre: "Franja", nota: "Banda oscura a todo el ancho con un corte rojo inclinado; el título en blanco y los datos dentro.", Componente: EncabezadoC },
];

function AccionesReporte() {
  return (
    <>
      <BotonLab variante="contorno" tamano="sm" icono={Download}>
        Exportar
      </BotonLab>
      <Pildoras
        etiqueta="Vista"
        opciones={[
          { id: "ej", texto: "En ejecución" },
          { id: "hi", texto: "Histórico" },
        ]}
        valor="hi"
        onCambio={() => {}}
      />
    </>
  );
}

function Contenido() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-4 mt-4" aria-hidden>
      <div className="card h-28 skeleton" />
      <div className="card h-28 skeleton" />
    </div>
  );
}

export default function OpcionesEncabezadoPage() {
  return (
    <LabTemaFijo tema={ESTANDAR.tema}>
      <div className="page-shell py-6 lg:py-8 flex flex-col gap-10">
        <section className="flex flex-col gap-3">
          <p className="label-meta text-faint">Hoy</p>
          <div data-estilo="reporte">
            <PageHeader title="Resumen de contratación" description="Encabezado actual." actions={<AccionesReporte />} className="mb-0!" />
          </div>
          <Contenido />
        </section>

        {OPCIONES.map(({ id, nombre, nota, Componente }) => (
          <section key={id} className="flex flex-col gap-3 border-t border-border pt-6">
            <p className="text-sm text-muted">
              <b className="font-label tracking-[0.1em] uppercase text-text">
                {id} · {nombre}
              </b>{" "}
              — {nota}
            </p>
            <Componente {...REPORTE} acciones={<AccionesReporte />} />
            <Contenido />
            <div className="mt-4">
              <Componente
                {...FORMULARIO}
                acciones={
                  <BotonLab variante="solido" tamano="sm" icono={Plus}>
                    Guardar obra
                  </BotonLab>
                }
              />
            </div>
          </section>
        ))}
      </div>
    </LabTemaFijo>
  );
}
