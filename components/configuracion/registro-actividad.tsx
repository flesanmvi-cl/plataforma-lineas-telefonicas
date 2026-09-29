"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BotonExcel } from "@/components/boton-excel";
import { descargarExcel } from "@/lib/exportar/excel";
import { AvisoMaqueta, fechaHora } from "@/components/configuracion/maqueta";

// MAQUETA · Configuración › Registro de actividad (solo administradores). Datos de ejemplo.
// En una plataforma: tabla registro_actividad; cada acción importante llama a
// registrarActividad(correo, accion, entidad, id, detalle).

interface Evento {
  id: number;
  fecha: Date;
  correo: string;
  accion: string;
  entidad: string;
  detalle: string;
}

const ACCIONES = ["Creó", "Editó", "Eliminó", "Cambió rol", "Exportó", "Cargó datos", "Publicó aviso"] as const;
const USUARIOS = ["administrador@flesan.cl", "analista.cia@flesan.cl", "jefe.obra@flesan.cl", "control.gestion@flesan.cl"];

function datosEjemplo(ahora: number): Evento[] {
  const plantillas: [string, string, string][] = [
    ["Creó", "Auditoría", "Auditoría #1042 · CG 2311"],
    ["Editó", "Auditoría", "Auditoría #1038: cambió el estado a «Cerrada»"],
    ["Exportó", "Reporte", "Reporte mensual a Excel (312 filas)"],
    ["Cambió rol", "Usuario", "analista.cia@flesan.cl: miembro → administrador"],
    ["Cargó datos", "Fuente", "Facturación: carga manual (22.310 filas)"],
    ["Eliminó", "Observación", "Observación «Falta firma» del ítem 4.2"],
    ["Publicó aviso", "Aviso", "«Mantención el viernes 18:00»"],
    ["Editó", "Ítem", "Ítem 3.1: ponderación 10 % → 12 %"],
  ];
  return Array.from({ length: 46 }, (_, i) => {
    const [accion, entidad, detalle] = plantillas[(i * 5) % plantillas.length];
    return {
      id: 1000 - i,
      fecha: new Date(ahora - (i * 3.7 + (i % 3)) * 3_600_000),
      correo: USUARIOS[(i * 3) % USUARIOS.length],
      accion,
      entidad,
      detalle,
    };
  });
}

const RANGOS = [
  { id: "1", texto: "Últimas 24 h", horas: 24 },
  { id: "7", texto: "Últimos 7 días", horas: 24 * 7 },
  { id: "30", texto: "Últimos 30 días", horas: 24 * 30 },
];
const POR_PAGINA = 15;

export function RegistroActividad() {
  const [datos, setDatos] = useState<Evento[] | null>(null);
  const [ahora, setAhora] = useState(0);
  const [rango, setRango] = useState("7");
  const [usuario, setUsuario] = useState("todos");
  const [accion, setAccion] = useState("todas");
  const [texto, setTexto] = useState("");
  const [pagina, setPagina] = useState(0);

  useEffect(() => {
    const t = Date.now();
    setAhora(t);
    setDatos(datosEjemplo(t));
  }, []);

  const filtrados = useMemo(() => {
    if (!datos) return [];
    const horas = RANGOS.find((r) => r.id === rango)?.horas ?? 168;
    const q = texto.trim().toLowerCase();
    return datos.filter(
      (e) =>
        ahora - e.fecha.getTime() <= horas * 3_600_000 &&
        (usuario === "todos" || e.correo === usuario) &&
        (accion === "todas" || e.accion === accion) &&
        (!q || `${e.detalle} ${e.entidad} ${e.correo}`.toLowerCase().includes(q)),
    );
  }, [datos, ahora, rango, usuario, accion, texto]);

  useEffect(() => setPagina(0), [rango, usuario, accion, texto]);

  if (!datos) return <div className="skeleton h-64 rounded-flesan" />;

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const visibles = filtrados.slice(pagina * POR_PAGINA, (pagina + 1) * POR_PAGINA);

  return (
    <div className="flex flex-col gap-4">
      <AvisoMaqueta tablas="registro_actividad" />

      <div className="flex flex-wrap items-center gap-2">
        <select aria-label="Rango de fechas" value={rango} onChange={(e) => setRango(e.target.value)} className="field-input w-44!">
          {RANGOS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.texto}
            </option>
          ))}
        </select>
        <select aria-label="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} className="field-input w-60!">
          <option value="todos">Todos los usuarios</option>
          {USUARIOS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
        <select aria-label="Acción" value={accion} onChange={(e) => setAccion(e.target.value)} className="field-input w-44!">
          <option value="todas">Todas las acciones</option>
          {ACCIONES.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <label className="relative flex-1 min-w-52">
          <span className="sr-only">Buscar en el detalle</span>
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-faint" aria-hidden />
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar en el detalle…" className="field-input pl-9! w-full!" />
        </label>
        <BotonExcel
          onDescargar={() =>
            descargarExcel(
              [
                {
                  nombre: "Actividad",
                  filas: filtrados,
                  columnas: [
                    { titulo: "Fecha", valor: (e) => e.fecha, tipo: "fecha" },
                    { titulo: "Usuario", valor: (e) => e.correo },
                    { titulo: "Acción", valor: (e) => e.accion },
                    { titulo: "Entidad", valor: (e) => e.entidad },
                    { titulo: "Detalle", valor: (e) => e.detalle, ancho: 60 },
                  ],
                },
              ],
              { archivo: "registro-actividad", filtros: { Rango: RANGOS.find((r) => r.id === rango)?.texto ?? "", Usuario: usuario, Acción: accion } },
            )
          }
        />
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-border bg-surface-2">
              {["Fecha", "Usuario", "Acción", "Entidad", "Detalle"].map((h) => (
                <th key={h} className="px-4 py-2.5 font-label text-[0.6875rem] tracking-[0.1em] uppercase text-muted font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibles.map((e) => (
              <tr key={e.id}>
                <td className="px-4 py-2.5 whitespace-nowrap text-muted">{fechaHora(e.fecha)}</td>
                <td className="px-4 py-2.5">{e.correo}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">{e.accion}</td>
                <td className="px-4 py-2.5 text-muted">{e.entidad}</td>
                <td className="px-4 py-2.5">{e.detalle}</td>
              </tr>
            ))}
            {!visibles.length && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted">
                  No hay actividad con esos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="flex items-center gap-3 px-4 py-2.5 border-t border-border text-xs text-muted">
          {filtrados.length} registros
          <span className="ml-auto flex items-center gap-2">
            <button type="button" disabled={pagina === 0} onClick={() => setPagina((p) => p - 1)} className="btn-flesan btn-flesan-ghost btn-flesan-sm disabled:opacity-40">
              Anterior
            </button>
            Página {pagina + 1} de {paginas}
            <button type="button" disabled={pagina >= paginas - 1} onClick={() => setPagina((p) => p + 1)} className="btn-flesan btn-flesan-ghost btn-flesan-sm disabled:opacity-40">
              Siguiente
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
