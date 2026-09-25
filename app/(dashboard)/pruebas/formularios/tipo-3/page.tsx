"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, FileText, Plus, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { BotonLab } from "@/components/lab-graficos/graficos/botones/boton-lab";
import { Aviso, BarraProgreso, EstadoVacio, Insignia, estiloTarjeta } from "@/components/lab-graficos/graficos/base/componentes";
import { estiloEncabezado } from "@/components/lab-graficos/graficos/tablas/comun";
import {
  CampoArchivo,
  CampoArea,
  CampoBuscable,
  CampoFecha,
  CampoMonto,
  CampoRangoFechas,
  CampoSelect,
  CampoTexto,
  GrupoCampos,
  ResumenErrores,
  formatoPesos,
  type ArchivoCargado,
  type ErrorResumen,
  type RangoFechas,
} from "@/components/lab-graficos/graficos/campos/componentes";
import { OBRAS, PROVEEDORES } from "@/components/lab-graficos/graficos/campos/datos";

/*
 * Formulario Tipo 3: maestro-detalle («Estado de pago»). Encabezado del documento con campos,
 * tabla editable de líneas (cantidad × precio = subtotal) con totales al pie (neto, IVA 19 % y
 * total en es-CL) y un panel lateral con el resumen y los adjuntos. Estado local, sin servidor.
 */

const IVA = 0.19;
/** Monto del subcontrato (ficticio), para mostrar cuánto se ha cobrado. */
const MONTO_CONTRATO = 185_000_000;
const COBRADO_ANTES = 96_400_000;

const UNIDADES = ["m³", "m²", "ml", "kg", "un", "gl"].map((u) => ({ valor: u, etiqueta: u }));

interface Linea {
  id: number;
  partida: string;
  unidad: string;
  cantidad: number | null;
  precio: number | null;
}

interface Encabezado {
  obra: string | null;
  subcontratista: string | null;
  periodo: RangoFechas;
  emision: string;
  retencion: number | null;
  glosa: string;
}

const LINEAS_INICIALES: Linea[] = [
  { id: 1, partida: "Hormigón H30 losa piso 8", unidad: "m³", cantidad: 86.5, precio: 128_000 },
  { id: 2, partida: "Enfierradura A630-420H", unidad: "kg", cantidad: 9_450, precio: 1_150 },
  { id: 3, partida: "Moldaje losa (arriendo mensual)", unidad: "m²", cantidad: 420, precio: 6_800 },
];

const subtotal = (l: Linea) => (l.cantidad ?? 0) * (l.precio ?? 0);

export default function FormularioTipo3() {
  const t = useTokens();
  const [enc, setEnc] = useState<Encabezado>({
    obra: "obra-norte",
    subcontratista: "hormigones-sur",
    periodo: { desde: "2026-09-01", hasta: "2026-09-30" },
    emision: "",
    retencion: 5,
    glosa: "",
  });
  const [lineas, setLineas] = useState<Linea[]>(LINEAS_INICIALES);
  const [adjuntos, setAdjuntos] = useState<ArchivoCargado[]>([
    { id: "a1", nombre: "Cubicación septiembre.xlsx", tamano: 214_000, tipo: "" },
  ]);
  const [intentado, setIntentado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const siguienteId = useRef(LINEAS_INICIALES.length + 1);
  const resumen = useRef<HTMLDivElement>(null);

  const neto = useMemo(() => lineas.reduce((s, l) => s + subtotal(l), 0), [lineas]);
  const retencion = Math.round(neto * ((enc.retencion ?? 0) / 100));
  const iva = Math.round(neto * IVA);
  const total = neto + iva;
  const aPagar = total - retencion;
  const avance = ((COBRADO_ANTES + neto) / MONTO_CONTRATO) * 100;

  const errores: ErrorResumen[] = useMemo(() => {
    const e: ErrorResumen[] = [];
    if (!enc.obra) e.push({ id: "ep-obra", etiqueta: "Obra", mensaje: "Elige la obra." });
    if (!enc.subcontratista) e.push({ id: "ep-sub", etiqueta: "Subcontratista", mensaje: "Elige el subcontratista." });
    if (!enc.emision) e.push({ id: "ep-emision", etiqueta: "Fecha de emisión", mensaje: "Indica la fecha de emisión." });
    if (lineas.length === 0) e.push({ id: "ep-agregar", etiqueta: "Líneas", mensaje: "Agrega al menos una línea." });
    lineas.forEach((l, n) => {
      if (!l.partida.trim()) e.push({ id: `ep-${l.id}-partida`, etiqueta: `Línea ${n + 1}`, mensaje: "Falta la partida." });
      if (!l.cantidad || l.cantidad <= 0) e.push({ id: `ep-${l.id}-cant`, etiqueta: `Línea ${n + 1}`, mensaje: "La cantidad debe ser mayor que cero." });
      if (!l.precio || l.precio <= 0) e.push({ id: `ep-${l.id}-precio`, etiqueta: `Línea ${n + 1}`, mensaje: "Falta el precio unitario." });
    });
    if (adjuntos.length === 0) e.push({ id: "ep-adjuntos", etiqueta: "Adjuntos", mensaje: "Adjunta la cubicación o la factura." });
    return e;
  }, [enc, lineas, adjuntos]);

  const visibles = intentado ? errores : [];
  const error = (id: string) => visibles.find((e) => e.id === id)?.mensaje ?? null;
  const invalido = (id: string) => visibles.some((e) => e.id === id);
  const cambiarLinea = (id: number, c: Partial<Linea>) => setLineas((ls) => ls.map((l) => (l.id === id ? { ...l, ...c } : l)));

  function agregar() {
    const id = siguienteId.current++;
    setLineas((ls) => [...ls, { id, partida: "", unidad: "m²", cantidad: null, precio: null }]);
    requestAnimationFrame(() => document.getElementById(`ep-${id}-partida`)?.focus());
  }

  function quitar(l: Linea, n: number) {
    setLineas((ls) => ls.filter((x) => x.id !== l.id));
    toast(`Línea ${n + 1} quitada`, {
      description: l.partida || "Sin partida",
      action: { label: "Deshacer", onClick: () => setLineas((ls) => [...ls.slice(0, n), l, ...ls.slice(n)]) },
    });
  }

  function enviar() {
    setIntentado(true);
    if (errores.length) {
      requestAnimationFrame(() => {
        resumen.current?.scrollIntoView({ block: "start", behavior: "smooth" });
        resumen.current?.focus({ preventScroll: true });
      });
      return;
    }
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setEnviado(true);
    }, 900);
  }

  const celda: CSSProperties = { padding: "6px 6px", verticalAlign: "top", borderBottom: `1px solid ${t.tabla.borde}` };
  const celdaNum: CSSProperties = { ...celda, textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };
  const th = (col: number, derecha = false): CSSProperties => ({ ...estiloEncabezado(t, { col }), position: "static", textAlign: derecha ? "right" : "left" });
  const filaTotal = (fuerte = false): CSSProperties => ({
    fontFamily: t.fuente,
    fontSize: fuerte ? t.tamano.etiqueta + 3 : t.tamano.etiqueta + 1,
    fontWeight: fuerte ? 700 : 400,
    color: fuerte ? t.texto : t.textoSuave,
    fontVariantNumeric: "tabular-nums",
  });
  const obra = OBRAS.find((o) => o.valor === enc.obra);
  const dur = t.animacion.duracion > 0 ? 0.18 : 0;

  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8">
      <PageHeader
        title="Estado de pago EP-0012"
        description="Formulario Tipo 3: maestro-detalle. Encabezado del documento, tabla editable de líneas con totales en vivo y panel lateral con resumen y adjuntos."
        actions={
          <Insignia tono={enviado ? "alerta" : "neutro"} punto>
            {enviado ? "En revisión" : "Borrador"}
          </Insignia>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_20rem] gap-4 items-start">
        <div className="flex flex-col gap-4 min-w-0">
          {visibles.length > 0 && <ResumenErrores ref={resumen} errores={visibles} titulo={`Faltan ${visibles.length} datos para enviar el estado de pago`} />}
          {enviado && (
            <Aviso tipo="exito" titulo="Enviado a revisión" onCerrar={() => setEnviado(false)}>
              El estado de pago quedó en la bandeja del administrador de contrato. (Maqueta: no se envió nada.)
            </Aviso>
          )}

          {/* Maestro: encabezado del documento */}
          <section className="card p-5 lg:p-6" aria-label="Encabezado del estado de pago">
            <GrupoCampos leyenda="Encabezado" icono={FileText} columnas={3} sinDivisor>
              <CampoBuscable
                id="ep-obra"
                etiqueta="Obra"
                requerido
                opciones={OBRAS}
                valor={enc.obra}
                onCambio={(v) => setEnc((e) => ({ ...e, obra: v }))}
                error={error("ep-obra")}
              />
              <CampoBuscable
                id="ep-sub"
                etiqueta="Subcontratista"
                requerido
                opciones={PROVEEDORES}
                valor={enc.subcontratista}
                onCambio={(v) => setEnc((e) => ({ ...e, subcontratista: v }))}
                error={error("ep-sub")}
              />
              <CampoTexto etiqueta="N° de estado de pago" value="EP-0012" readOnly disabled ayuda="Correlativo del contrato." />
              <CampoRangoFechas
                etiqueta="Periodo"
                requerido
                className="sm:col-span-2"
                valor={enc.periodo}
                onCambio={(periodo) => setEnc((e) => ({ ...e, periodo }))}
              />
              <CampoFecha
                id="ep-emision"
                etiqueta="Fecha de emisión"
                requerido
                value={enc.emision}
                onChange={(v) => setEnc((e) => ({ ...e, emision: v }))}
                error={error("ep-emision")}
              />
              <CampoMonto
                etiqueta="Retención"
                unidad="%"
                decimales={1}
                min={0}
                max={10}
                valor={enc.retencion}
                onCambio={(v) => setEnc((e) => ({ ...e, retencion: v }))}
                ayuda="Garantía de fiel cumplimiento, máx. 10 %."
              />
              <CampoArea
                className="sm:col-span-2"
                etiqueta="Glosa"
                rows={2}
                maxLength={200}
                contador
                placeholder="Detalle que irá en el documento"
                value={enc.glosa}
                onChange={(e) => setEnc((x) => ({ ...x, glosa: e.target.value }))}
              />
            </GrupoCampos>
          </section>

          {/* Detalle: tabla editable de líneas */}
          <section className="card p-0 overflow-hidden" aria-labelledby="ep-lineas-titulo">
            <div className="flex flex-wrap items-center gap-3 px-5 pt-4 pb-3">
              <h2 id="ep-lineas-titulo" style={{ margin: 0, fontFamily: t.fuente, fontSize: t.tamano.etiqueta + 2, fontWeight: 700, color: t.texto }}>
                Líneas del estado de pago
              </h2>
              <span style={{ fontFamily: t.fuente, fontSize: t.tamano.eje, color: t.textoSuave }}>{lineas.length} líneas</span>
              <span className="ml-auto" />
              <BotonLab id="ep-agregar" variante="contorno" tamano="sm" icono={Plus} onClick={agregar}>
                Agregar línea
              </BotonLab>
            </div>

            {lineas.length === 0 ? (
              <EstadoVacio
                compacto
                icono={FileText}
                titulo="Sin líneas"
                acciones={
                  <BotonLab tamano="sm" icono={Plus} onClick={agregar}>
                    Agregar la primera línea
                  </BotonLab>
                }
              >
                Agrega las partidas ejecutadas en el periodo.
              </EstadoVacio>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: "100%", minWidth: 760, borderCollapse: "separate", borderSpacing: 0, fontFamily: t.fuente, fontSize: t.tamano.etiqueta, color: t.texto }}>
                  <caption className="sr-only">Líneas del estado de pago: partida, unidad, cantidad, precio unitario y subtotal</caption>
                  <thead>
                    <tr>
                      <th scope="col" style={{ ...th(0), width: 36, paddingLeft: 20 }}>
                        #
                      </th>
                      <th scope="col" style={th(1)}>
                        Partida
                      </th>
                      <th scope="col" style={{ ...th(2), width: 96 }}>
                        Unidad
                      </th>
                      <th scope="col" style={{ ...th(3, true), width: 130 }}>
                        Cantidad
                      </th>
                      <th scope="col" style={{ ...th(4, true), width: 160 }}>
                        Precio unitario
                      </th>
                      <th scope="col" style={{ ...th(5, true), width: 150 }}>
                        Subtotal
                      </th>
                      <th scope="col" style={{ ...th(6), width: 52 }}>
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {lineas.map((l, n) => (
                        <motion.tr
                          key={l.id}
                          initial={dur ? { opacity: 0 } : false}
                          animate={{ opacity: 1 }}
                          exit={dur ? { opacity: 0 } : undefined}
                          transition={{ duration: dur }}
                          style={{ background: n % 2 === 1 && t.tabla.zebra ? t.tabla.zebra : "transparent" }}
                        >
                          <td style={{ ...celda, paddingLeft: 20, paddingTop: 6 + (t.campo.alto - 18) / 2, color: t.textoSuave, fontVariantNumeric: "tabular-nums" }}>
                            {n + 1}
                          </td>
                          <td style={celda}>
                            <CampoTexto
                              id={`ep-${l.id}-partida`}
                              etiqueta={`Partida de la línea ${n + 1}`}
                              etiquetaOculta
                              placeholder="Descripción de la partida"
                              value={l.partida}
                              onChange={(e) => cambiarLinea(l.id, { partida: e.target.value })}
                              invalido={invalido(`ep-${l.id}-partida`)}
                            />
                          </td>
                          <td style={celda}>
                            <CampoSelect
                              etiqueta={`Unidad de la línea ${n + 1}`}
                              etiquetaOculta
                              opciones={UNIDADES}
                              value={l.unidad}
                              onChange={(v) => cambiarLinea(l.id, { unidad: v })}
                            />
                          </td>
                          <td style={celda}>
                            <CampoMonto
                              id={`ep-${l.id}-cant`}
                              etiqueta={`Cantidad de la línea ${n + 1}`}
                              etiquetaOculta
                              decimales={2}
                              min={0}
                              valor={l.cantidad}
                              onCambio={(v) => cambiarLinea(l.id, { cantidad: v })}
                              invalido={invalido(`ep-${l.id}-cant`)}
                            />
                          </td>
                          <td style={celda}>
                            <CampoMonto
                              id={`ep-${l.id}-precio`}
                              etiqueta={`Precio unitario de la línea ${n + 1}`}
                              etiquetaOculta
                              unidad="$"
                              min={0}
                              valor={l.precio}
                              onCambio={(v) => cambiarLinea(l.id, { precio: v })}
                              invalido={invalido(`ep-${l.id}-precio`)}
                            />
                          </td>
                          <td style={{ ...celdaNum, paddingTop: 6 + (t.campo.alto - 18) / 2, fontWeight: 600 }}>{formatoPesos(subtotal(l))}</td>
                          <td style={{ ...celda, textAlign: "center" }}>
                            <BotonLab
                              variante="fantasma"
                              tamano="sm"
                              soloIcono
                              icono={Trash2}
                              aria-label={`Quitar línea ${n + 1}`}
                              title="Quitar línea"
                              onClick={() => quitar(l, n)}
                              style={{ marginTop: (t.campo.alto - t.boton.alto.sm) / 2 }}
                            />
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}

            {/* Totales al pie */}
            <div className="flex justify-end px-5 py-4" style={{ borderTop: `1.5px solid ${t.texto}` }}>
              <dl className="grid grid-cols-[auto_auto] gap-x-8 gap-y-1.5 m-0" aria-label="Totales">
                <dt style={filaTotal()}>Neto</dt>
                <dd className="m-0 text-right" style={filaTotal()}>
                  {formatoPesos(neto)}
                </dd>
                <dt style={filaTotal()}>IVA (19 %)</dt>
                <dd className="m-0 text-right" style={filaTotal()}>
                  {formatoPesos(iva)}
                </dd>
                <dt style={{ ...filaTotal(true), paddingTop: 6, borderTop: `1px solid ${t.grilla}` }}>Total</dt>
                <dd className="m-0 text-right" style={{ ...filaTotal(true), paddingTop: 6, borderTop: `1px solid ${t.grilla}` }}>
                  {formatoPesos(total)}
                </dd>
              </dl>
            </div>
          </section>
        </div>

        {/* Panel lateral: resumen, avance del contrato, adjuntos y acciones */}
        <aside className="flex flex-col gap-4 xl:sticky xl:top-4" aria-label="Resumen del estado de pago">
          <div style={{ ...estiloTarjeta(t), padding: 18 }}>
            <div style={{ fontFamily: t.fuente, fontSize: t.tamano.eje, color: t.textoSuave, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>
              Líquido a pagar
            </div>
            <div aria-live="polite" style={{ fontFamily: t.fuente, fontSize: t.kpi.cifra, fontWeight: 700, color: t.texto, fontVariantNumeric: "tabular-nums", lineHeight: 1.15, marginTop: 4 }}>
              {formatoPesos(aPagar)}
            </div>
            <dl className="grid grid-cols-[1fr_auto] gap-y-1 mt-3 mb-0" style={{ fontFamily: t.fuente, fontSize: t.tamano.etiqueta, color: t.textoSuave, fontVariantNumeric: "tabular-nums" }}>
              <dt>Total con IVA</dt>
              <dd className="m-0 text-right">{formatoPesos(total)}</dd>
              <dt>Retención ({String(enc.retencion ?? 0).replace(".", ",")} %)</dt>
              <dd className="m-0 text-right">− {formatoPesos(retencion)}</dd>
            </dl>
            <div style={{ borderTop: `1px solid ${t.grilla}`, marginTop: 14, paddingTop: 14, fontFamily: t.fuente }}>
              <div className="flex items-baseline gap-2 mb-2" style={{ fontSize: t.tamano.etiqueta, color: t.texto }}>
                <span className="mr-auto">Avance del contrato</span>
                <strong style={{ fontVariantNumeric: "tabular-nums" }}>{avance.toFixed(1).replace(".", ",")} %</strong>
              </div>
              <BarraProgreso etiqueta="Avance cobrado del contrato" valor={avance} tono={avance > 100 ? "malo" : "acento"} />
              <p style={{ margin: "8px 0 0", fontSize: t.tamano.eje, color: avance > 100 ? t.estado.malo : t.textoSuave, lineHeight: 1.4 }}>
                {avance > 100
                  ? "Con este estado de pago se supera el monto del contrato."
                  : `${obra?.etiqueta ?? "Obra"} · contrato ${formatoPesos(MONTO_CONTRATO)}, cobrado antes ${formatoPesos(COBRADO_ANTES)}.`}
              </p>
            </div>
          </div>

          <div style={{ ...estiloTarjeta(t), padding: 18 }}>
            <CampoArchivo
              id="ep-adjuntos"
              etiqueta="Adjuntos"
              requerido
              compacto
              aceptar={[".pdf", ".xlsx", ".jpg", ".png"]}
              maxMb={20}
              archivos={adjuntos}
              onCambio={setAdjuntos}
              error={error("ep-adjuntos")}
              ayuda="Cubicación, factura y fotos del avance."
            />
          </div>

          <div className="flex flex-col gap-2">
            <BotonLab bloque icono={Send} cargando={enviando} onClick={enviar} disabled={enviado}>
              Enviar a revisión
            </BotonLab>
            <BotonLab bloque variante="contorno" onClick={() => toast.success("Borrador guardado")}>
              Guardar borrador
            </BotonLab>
            <BotonLab bloque variante="fantasma" icono={Download} onClick={() => toast("Descarga no disponible en la maqueta")}>
              Descargar PDF
            </BotonLab>
          </div>
        </aside>
      </div>
    </div>
  );
}
