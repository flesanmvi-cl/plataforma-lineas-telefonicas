"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, ClipboardList, Pencil, Plus, Send, Trash2, UserCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { useTokens } from "@/components/estandar/tema-context";
import { conAlfa } from "@/lib/estandar/tema";
import { BotonLab } from "@/components/estandar/graficos/botones/boton-lab";
import { colorSobre } from "@/components/estandar/graficos/botones/comun";
import { Aviso, Insignia, estiloTarjeta } from "@/components/estandar/graficos/base/componentes";
import {
  CampoArea,
  CampoBuscable,
  CampoCasilla,
  CampoFecha,
  CampoMonto,
  CampoSelect,
  CampoTexto,
  GrupoCampos,
  GrupoRadio,
  ResumenErrores,
  fechaLegible,
  formatoNumero,
  formatoPesos,
  type ErrorResumen,
} from "@/components/estandar/graficos/campos/componentes";
import { CENTROS_COSTO, OBRAS } from "@/components/estandar/graficos/campos/datos";
import { useTutorial } from "@/components/tutorial/tutorial";
import { PASOS_FORMULARIO_2 } from "@/components/plantillas/tutoriales";

/*
 * Formulario Tipo 2: formulario por pasos («Solicitud de compra»). Stepper arriba, avanzar y
 * retroceder validando cada paso, el avance queda guardado en esta pestaña (sessionStorage) y
 * la revisión final muestra todo en modo lectura con «Editar» por bloque.
 */

const PASOS = ["Datos", "Ítems", "Aprobadores", "Revisión"] as const;
const CLAVE = "cia-prueba-solicitud-compra";

const UNIDADES = ["un", "m³", "m²", "ml", "kg", "gl", "saco"].map((u) => ({ valor: u, etiqueta: u }));
const PRIORIDADES = [
  { valor: "normal", etiqueta: "Normal", descripcion: "Entrega en 10 días hábiles" },
  { valor: "alta", etiqueta: "Alta", descripcion: "Entrega en 5 días hábiles" },
  { valor: "urgente", etiqueta: "Urgente", descripcion: "Detiene faenas; exige justificación" },
];

/** Umbrales ficticios de aprobación por monto total. */
const UMBRAL_GERENTE = 5_000_000;
const UMBRAL_FINANZAS = 20_000_000;

interface Item {
  id: number;
  descripcion: string;
  unidad: string;
  cantidad: number | null;
  precio: number | null;
}

interface Solicitud {
  obra: string | null;
  centro: string;
  fecha: string;
  prioridad: string;
  motivo: string;
  items: Item[];
  adminContrato: boolean;
  comentario: string;
}

const INICIAL: Solicitud = {
  obra: null,
  centro: "",
  fecha: "",
  prioridad: "normal",
  motivo: "",
  items: [{ id: 1, descripcion: "", unidad: "un", cantidad: null, precio: null }],
  adminContrato: false,
  comentario: "",
};

const subtotal = (i: Item) => (i.cantidad ?? 0) * (i.precio ?? 0);

function erroresPaso(paso: number, s: Solicitud): ErrorResumen[] {
  const e: ErrorResumen[] = [];
  if (paso === 0) {
    if (!s.obra) e.push({ id: "sc-obra", etiqueta: "Obra", mensaje: "Elige la obra." });
    if (!s.centro) e.push({ id: "sc-centro", etiqueta: "Centro de costo", mensaje: "Elige un centro de costo." });
    if (!s.fecha) e.push({ id: "sc-fecha", etiqueta: "Fecha requerida", mensaje: "Indica cuándo se necesita." });
    if (s.motivo.trim().length < 10) e.push({ id: "sc-motivo", etiqueta: "Motivo", mensaje: "Escribe al menos 10 caracteres." });
  }
  if (paso === 1) {
    s.items.forEach((it, n) => {
      if (!it.descripcion.trim()) e.push({ id: `sc-item-${it.id}-desc`, etiqueta: `Ítem ${n + 1}`, mensaje: "Falta la descripción." });
      if (!it.cantidad || it.cantidad <= 0) e.push({ id: `sc-item-${it.id}-cant`, etiqueta: `Ítem ${n + 1}`, mensaje: "La cantidad debe ser mayor que cero." });
      if (!it.precio || it.precio <= 0) e.push({ id: `sc-item-${it.id}-precio`, etiqueta: `Ítem ${n + 1}`, mensaje: "Falta el precio estimado." });
    });
  }
  if (paso === 2 && s.prioridad === "urgente" && s.comentario.trim().length < 10) {
    e.push({ id: "sc-comentario", etiqueta: "Justificación", mensaje: "Las compras urgentes deben justificarse." });
  }
  return e;
}

/** Stepper: los pasos ya visitados son botones para volver; el actual lleva aria-current. */
function Pasos({ actual, maximo, onIr }: { actual: number; maximo: number; onIr: (i: number) => void }) {
  const t = useTokens();
  return (
    <nav aria-label="Pasos de la solicitud">
      <ol className="flex items-start" style={{ listStyle: "none", margin: 0, padding: 0, fontFamily: t.fuente }}>
        {PASOS.map((p, i) => {
          const esActual = i === actual;
          // Hecho: validado al avanzar (queda antes del paso más lejano alcanzado).
          const hecho = !esActual && i < maximo;
          const alcanzable = i <= maximo && !esActual;
          const color = esActual || hecho ? t.acento : t.eje;
          return (
            <li key={p} className="flex-1 flex flex-col items-center relative min-w-0">
              {i > 0 && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: 13,
                    right: "calc(50% + 18px)",
                    left: "calc(-50% + 18px)",
                    height: 2,
                    borderRadius: 2,
                    background: i <= maximo ? t.acento : t.eje,
                  }}
                />
              )}
              <button
                type="button"
                disabled={!alcanzable}
                aria-current={esActual ? "step" : undefined}
                onClick={() => onIr(i)}
                className="flex flex-col items-center gap-1.5 min-w-0"
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  cursor: alcanzable ? "pointer" : "default",
                  color: esActual ? t.texto : t.textoSuave,
                  outlineColor: t.acento,
                  outlineOffset: 3,
                  borderRadius: 4,
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 999,
                    fontSize: t.tamano.etiqueta,
                    fontWeight: 700,
                    border: `2px solid ${color}`,
                    background: hecho ? t.acento : esActual ? conAlfa(t.acento, 0.1) : t.fondoTarjeta,
                    color: hecho ? colorSobre(t.acento) : esActual ? t.acento : t.textoSuave,
                    transition: `all ${t.animacion.duracion > 0 ? 200 : 0}ms`,
                  }}
                >
                  {hecho ? <Check size={14} strokeWidth={3} aria-hidden /> : i + 1}
                </span>
                <span style={{ fontSize: t.tamano.etiqueta, fontWeight: esActual ? 700 : 500 }} className="truncate max-w-full">
                  {p}
                  {hecho && <span className="sr-only"> (completo)</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Bloque de la revisión: título, «Editar» que vuelve al paso y los datos en una lista de definición. */
function BloqueRevision({ titulo, onEditar, children }: { titulo: string; onEditar: () => void; children: ReactNode }) {
  const t = useTokens();
  return (
    <section aria-label={titulo} style={{ borderTop: `1px solid ${t.grilla}`, paddingTop: 14 }}>
      <div className="flex items-center gap-3 mb-3">
        <h2 style={{ margin: 0, fontFamily: t.fuente, fontSize: t.tamano.etiqueta + 2, fontWeight: 700, color: t.texto }} className="mr-auto">
          {titulo}
        </h2>
        <BotonLab variante="texto" tamano="sm" icono={Pencil} onClick={onEditar} aria-label={`Editar ${titulo.toLowerCase()}`}>
          Editar
        </BotonLab>
      </div>
      {children}
    </section>
  );
}

function Dato({ termino, children }: { termino: string; children: ReactNode }) {
  const t = useTokens();
  return (
    <div style={{ fontFamily: t.fuente, minWidth: 0 }}>
      <dt style={{ fontSize: t.tamano.eje, color: t.textoSuave, marginBottom: 2 }}>{termino}</dt>
      <dd style={{ margin: 0, fontSize: t.tamano.etiqueta + 1, color: t.texto, overflowWrap: "anywhere" }}>{children || "—"}</dd>
    </div>
  );
}

export default function FormularioTipo2() {
  useTutorial(PASOS_FORMULARIO_2);
  const t = useTokens();
  const [sol, setSol] = useState<Solicitud>(INICIAL);
  const [paso, setPaso] = useState(0);
  const [maximo, setMaximo] = useState(0);
  const [intentado, setIntentado] = useState(false);
  const [enviada, setEnviada] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [guardadoPaso, setGuardadoPaso] = useState<string | null>(null);
  const [direccion, setDireccion] = useState(1);
  const siguienteId = useRef(2);
  const resumen = useRef<HTMLDivElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  const cargado = useRef(false);

  // Retoma la solicitud guardada en esta pestaña (conveniencia: si falla, parte de cero).
  useEffect(() => {
    try {
      const g = JSON.parse(sessionStorage.getItem(CLAVE) ?? "null");
      if (g?.sol) {
        setSol(g.sol);
        setPaso(g.paso ?? 0);
        setMaximo(g.maximo ?? 0);
        siguienteId.current = Math.max(1, ...g.sol.items.map((i: Item) => i.id)) + 1;
        setGuardadoPaso("Se retomó la solicitud que dejaste a medias.");
      }
    } catch {}
    cargado.current = true;
  }, []);

  useEffect(() => {
    if (!cargado.current || enviada) return;
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify({ sol, paso, maximo }));
    } catch {}
  }, [sol, paso, maximo, enviada]);

  const total = useMemo(() => sol.items.reduce((s, i) => s + subtotal(i), 0), [sol.items]);
  const errores = intentado ? erroresPaso(paso, sol) : [];
  const conError = (idCampo: string) => errores.find((e) => e.id === idCampo)?.mensaje ?? null;
  const cambiar = <K extends keyof Solicitud>(k: K, v: Solicitud[K]) => setSol((s) => ({ ...s, [k]: v }));
  const cambiarItem = (id: number, cambio: Partial<Item>) => setSol((s) => ({ ...s, items: s.items.map((i) => (i.id === id ? { ...i, ...cambio } : i)) }));

  const obra = OBRAS.find((o) => o.valor === sol.obra);
  const centro = CENTROS_COSTO.find((c) => c.valor === sol.centro);
  const prioridad = PRIORIDADES.find((p) => p.valor === sol.prioridad);
  const aprobadores = [
    { rol: "Jefe de obra", nombre: "Nombre Apellido", motivo: "Siempre", obligatorio: true },
    { rol: "Gerente de proyecto", nombre: "Nombre Apellido", motivo: `Total sobre ${formatoPesos(UMBRAL_GERENTE)}`, obligatorio: total > UMBRAL_GERENTE },
    { rol: "Gerencia de Finanzas", nombre: "Nombre Apellido", motivo: `Total sobre ${formatoPesos(UMBRAL_FINANZAS)}`, obligatorio: total > UMBRAL_FINANZAS },
  ];
  const requeridos = aprobadores.filter((a) => a.obligatorio);

  function ir(destino: number) {
    setDireccion(destino > paso ? 1 : -1);
    setPaso(destino);
    setIntentado(false);
    requestAnimationFrame(() => titulo.current?.focus({ preventScroll: true }));
  }

  function siguiente() {
    const e = erroresPaso(paso, sol);
    if (e.length) {
      setIntentado(true);
      requestAnimationFrame(() => resumen.current?.focus());
      return;
    }
    const destino = paso + 1;
    setMaximo((m) => Math.max(m, destino));
    setGuardadoPaso(`Paso «${PASOS[paso]}» guardado.`);
    ir(destino);
  }

  function enviar() {
    setEnviando(true);
    setTimeout(() => {
      setEnviando(false);
      setEnviada(true);
      try {
        sessionStorage.removeItem(CLAVE);
      } catch {}
    }, 900);
  }

  function nueva() {
    setSol(INICIAL);
    siguienteId.current = 2;
    setPaso(0);
    setMaximo(0);
    setIntentado(false);
    setEnviada(false);
    setGuardadoPaso(null);
  }

  const desplazo = t.animacion.duracion > 0 ? 24 : 0;
  const dur = t.animacion.duracion > 0 ? 0.22 : 0;

  if (enviada) {
    return (
      <div className="animate-fade-in page-shell py-6 lg:py-8">
        <PageHeader title="Solicitud de compra" />
        <div className="max-w-3xl">
          <Aviso
            tipo="exito"
            titulo="Solicitud SC-0088 enviada"
            acciones={
              <BotonLab tamano="sm" icono={Plus} onClick={nueva}>
                Nueva solicitud
              </BotonLab>
            }
          >
            Quedó en la bandeja de {requeridos.map((a) => a.rol.toLowerCase()).join(", ")}. Total {formatoPesos(total)}. (Maqueta: no se envió nada.)
          </Aviso>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in page-shell py-6 lg:py-8">
      <PageHeader
        title="Solicitud de compra"
        description="Formulario Tipo 2: por pasos. Cada paso se valida al avanzar, lo avanzado queda guardado en esta pestaña y al final se revisa todo en modo lectura antes de enviar."
        actions={
          <BotonLab variante="fantasma" tamano="sm" onClick={nueva}>
            Descartar
          </BotonLab>
        }
      />

      <div className="max-w-3xl flex flex-col gap-4">
        <div className="card p-4 lg:p-5">
          <Pasos actual={paso} maximo={maximo} onIr={ir} />
        </div>

        <p aria-live="polite" style={{ margin: 0, minHeight: 16, fontFamily: t.fuente, fontSize: t.tamano.eje, color: t.textoSuave }}>
          {guardadoPaso}
        </p>

        {errores.length > 0 && <ResumenErrores ref={resumen} errores={errores} titulo={`Completa ${errores.length === 1 ? "1 dato" : `${errores.length} datos`} para seguir`} />}

        <div className="card p-5 lg:p-6 overflow-hidden">
          <h2
            ref={titulo}
            tabIndex={-1}
            style={{ margin: "0 0 16px", fontFamily: t.fuente, fontSize: t.tamano.etiqueta + 4, fontWeight: 700, color: t.texto, outline: "none" }}
          >
            Paso {paso + 1} de {PASOS.length}: {PASOS[paso]}
          </h2>

          <AnimatePresence mode="wait" initial={false} custom={direccion}>
            <motion.div
              key={paso}
              initial={{ opacity: 0, x: desplazo * direccion }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -desplazo * direccion }}
              transition={{ duration: dur, ease: [0.22, 1, 0.36, 1] }}
            >
              {paso === 0 && (
                <GrupoCampos leyenda="Datos de la solicitud" icono={ClipboardList} sinDivisor>
                  <CampoBuscable
                    id="sc-obra"
                    etiqueta="Obra"
                    requerido
                    opciones={OBRAS}
                    valor={sol.obra}
                    onCambio={(v) => cambiar("obra", v)}
                    placeholder="Busca por nombre o región"
                    error={conError("sc-obra")}
                  />
                  <CampoSelect
                    id="sc-centro"
                    etiqueta="Centro de costo"
                    requerido
                    placeholder="Selecciona"
                    opciones={CENTROS_COSTO}
                    value={sol.centro}
                    onChange={(v) => cambiar("centro", v)}
                    error={conError("sc-centro")}
                  />
                  <CampoFecha
                    id="sc-fecha"
                    etiqueta="Fecha requerida en obra"
                    requerido
                    value={sol.fecha}
                    onChange={(v) => cambiar("fecha", v)}
                    error={conError("sc-fecha")}
                  />
                  <GrupoRadio etiqueta="Prioridad" opciones={PRIORIDADES} valor={sol.prioridad} onCambio={(v) => cambiar("prioridad", v)} />
                  <CampoArea
                    id="sc-motivo"
                    className="sm:col-span-2"
                    etiqueta="Motivo de la compra"
                    requerido
                    rows={3}
                    maxLength={300}
                    contador
                    placeholder="Para qué partida o faena se necesita"
                    value={sol.motivo}
                    onChange={(e) => cambiar("motivo", e.target.value)}
                    error={conError("sc-motivo")}
                  />
                </GrupoCampos>
              )}

              {paso === 1 && (
                <div className="flex flex-col gap-3">
                  {sol.items.map((it, n) => (
                    <fieldset
                      key={it.id}
                      aria-label={`Ítem ${n + 1}`}
                      className="grid grid-cols-2 sm:grid-cols-12 gap-x-3 gap-y-3 items-start"
                      style={{ ...estiloTarjeta(t), margin: 0, padding: 14, minWidth: 0 }}
                    >
                      <div className="col-span-2 sm:col-span-12 flex items-center gap-2" style={{ fontFamily: t.fuente }}>
                        <span style={{ fontSize: t.tamano.etiqueta, fontWeight: 700, color: t.texto }}>Ítem {n + 1}</span>
                        <span className="ml-auto" style={{ fontSize: t.tamano.etiqueta, color: t.textoSuave, fontVariantNumeric: "tabular-nums" }}>
                          Subtotal <strong style={{ color: t.texto }}>{formatoPesos(subtotal(it))}</strong>
                        </span>
                        <BotonLab
                          variante="fantasma"
                          tamano="sm"
                          soloIcono
                          icono={Trash2}
                          aria-label={`Quitar ítem ${n + 1}`}
                          title="Quitar ítem"
                          disabled={sol.items.length === 1}
                          onClick={() => cambiar("items", sol.items.filter((x) => x.id !== it.id))}
                        />
                      </div>
                      <CampoTexto
                        id={`sc-item-${it.id}-desc`}
                        className="col-span-2 sm:col-span-12"
                        etiqueta="Descripción"
                        requerido
                        placeholder="Ej. Hormigón H30, cemento especial, casco de seguridad"
                        value={it.descripcion}
                        onChange={(e) => cambiarItem(it.id, { descripcion: e.target.value })}
                        error={conError(`sc-item-${it.id}-desc`)}
                      />
                      <CampoSelect
                        className="col-span-2 sm:col-span-3"
                        etiqueta="Unidad"
                        opciones={UNIDADES}
                        value={it.unidad}
                        onChange={(v) => cambiarItem(it.id, { unidad: v })}
                      />
                      <CampoMonto
                        id={`sc-item-${it.id}-cant`}
                        className="sm:col-span-4"
                        etiqueta="Cantidad"
                        requerido
                        decimales={2}
                        min={0}
                        valor={it.cantidad}
                        onCambio={(v) => cambiarItem(it.id, { cantidad: v })}
                        error={conError(`sc-item-${it.id}-cant`)}
                      />
                      <CampoMonto
                        id={`sc-item-${it.id}-precio`}
                        className="sm:col-span-5"
                        etiqueta="Precio unitario estimado"
                        requerido
                        unidad="$"
                        min={0}
                        valor={it.precio}
                        onCambio={(v) => cambiarItem(it.id, { precio: v })}
                        error={conError(`sc-item-${it.id}-precio`)}
                      />
                    </fieldset>
                  ))}
                  <div className="flex flex-wrap items-center gap-3">
                    <BotonLab
                      variante="contorno"
                      icono={Plus}
                      onClick={() => {
                        const idNuevo = siguienteId.current++;
                        cambiar("items", [...sol.items, { id: idNuevo, descripcion: "", unidad: "un", cantidad: null, precio: null }]);
                        requestAnimationFrame(() => document.getElementById(`sc-item-${idNuevo}-desc`)?.focus());
                      }}
                    >
                      Agregar ítem
                    </BotonLab>
                    <span className="ml-auto" style={{ fontFamily: t.fuente, fontSize: t.tamano.etiqueta + 1, color: t.texto, fontVariantNumeric: "tabular-nums" }}>
                      Total estimado <strong>{formatoPesos(total)}</strong>
                    </span>
                  </div>
                </div>
              )}

              {paso === 2 && (
                <GrupoCampos leyenda="Quién aprueba" icono={UserCheck} columnas={1} sinDivisor descripcion="Los aprobadores obligatorios dependen del total estimado de la solicitud.">
                  <ul className="flex flex-col gap-2" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {aprobadores.map((a) => (
                      <li
                        key={a.rol}
                        className="flex flex-wrap items-center gap-3"
                        style={{ ...estiloTarjeta(t), padding: "10px 14px", fontFamily: t.fuente, opacity: a.obligatorio ? 1 : 0.6 }}
                      >
                        <span className="min-w-0 mr-auto">
                          <span style={{ display: "block", fontSize: t.tamano.etiqueta + 1, fontWeight: 600, color: t.texto }}>{a.rol}</span>
                          <span style={{ fontSize: t.tamano.eje, color: t.textoSuave }}>
                            {a.nombre} · {a.motivo}
                          </span>
                        </span>
                        {a.obligatorio ? (
                          <Insignia tono="acento">Obligatorio</Insignia>
                        ) : (
                          <Insignia tono="neutro" variante="contorno">
                            No aplica
                          </Insignia>
                        )}
                      </li>
                    ))}
                  </ul>
                  <CampoCasilla
                    etiqueta="Pedir visto bueno al administrador de contrato"
                    descripcion="Opcional: suma un paso de revisión antes del jefe de obra."
                    marcada={sol.adminContrato}
                    onCambio={(v) => cambiar("adminContrato", v)}
                  />
                  <CampoArea
                    id="sc-comentario"
                    etiqueta={sol.prioridad === "urgente" ? "Justificación de la urgencia" : "Comentario para los aprobadores"}
                    requerido={sol.prioridad === "urgente"}
                    rows={3}
                    maxLength={300}
                    contador
                    value={sol.comentario}
                    onChange={(e) => cambiar("comentario", e.target.value)}
                    error={conError("sc-comentario")}
                  />
                </GrupoCampos>
              )}

              {paso === 3 && (
                <div className="flex flex-col gap-5">
                  <Aviso tipo="info">Revisa los datos antes de enviar. Puedes volver a cualquier bloque con «Editar».</Aviso>
                  <BloqueRevision titulo="Datos" onEditar={() => ir(0)}>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3" style={{ margin: 0 }}>
                      <Dato termino="Obra">{obra?.etiqueta}</Dato>
                      <Dato termino="Centro de costo">{centro?.etiqueta}</Dato>
                      <Dato termino="Fecha requerida">{fechaLegible(sol.fecha)}</Dato>
                      <Dato termino="Prioridad">{prioridad?.etiqueta}</Dato>
                      <div className="sm:col-span-2">
                        <Dato termino="Motivo">{sol.motivo}</Dato>
                      </div>
                    </dl>
                  </BloqueRevision>
                  <BloqueRevision titulo="Ítems" onEditar={() => ir(1)}>
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, fontFamily: t.fuente, fontSize: t.tamano.etiqueta + 1, color: t.texto }}>
                      {sol.items.map((it) => (
                        <li key={it.id} className="flex gap-3 py-1.5" style={{ borderBottom: `1px solid ${t.grilla}`, fontVariantNumeric: "tabular-nums" }}>
                          <span className="min-w-0 mr-auto">{it.descripcion}</span>
                          <span style={{ color: t.textoSuave, whiteSpace: "nowrap" }}>
                            {formatoNumero(it.cantidad ?? 0, 2)} {it.unidad} × {formatoPesos(it.precio ?? 0)}
                          </span>
                          <span style={{ minWidth: 110, textAlign: "right", whiteSpace: "nowrap" }}>{formatoPesos(subtotal(it))}</span>
                        </li>
                      ))}
                      <li className="flex gap-3 pt-2" style={{ fontWeight: 700 }}>
                        <span className="mr-auto">Total estimado</span>
                        <span style={{ fontVariantNumeric: "tabular-nums" }}>{formatoPesos(total)}</span>
                      </li>
                    </ul>
                  </BloqueRevision>
                  <BloqueRevision titulo="Aprobadores" onEditar={() => ir(2)}>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3" style={{ margin: 0 }}>
                      <Dato termino="Aprueban">
                        {[...(sol.adminContrato ? ["Administrador de contrato"] : []), ...requeridos.map((a) => a.rol)].join(" → ")}
                      </Dato>
                      <Dato termino={sol.prioridad === "urgente" ? "Justificación" : "Comentario"}>{sol.comentario}</Dato>
                    </dl>
                  </BloqueRevision>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div data-tutorial="navegacion" className="flex flex-wrap items-center gap-2 mt-6 pt-4" style={{ borderTop: `1px solid ${t.grilla}` }}>
            {paso > 0 && (
              <BotonLab variante="contorno" icono={ArrowLeft} onClick={() => ir(paso - 1)}>
                Anterior
              </BotonLab>
            )}
            <span className="ml-auto" />
            {paso < PASOS.length - 1 ? (
              <BotonLab iconoDerecha={ArrowRight} onClick={siguiente}>
                Siguiente: {PASOS[paso + 1]}
              </BotonLab>
            ) : (
              <BotonLab icono={Send} cargando={enviando} onClick={enviar}>
                Enviar solicitud
              </BotonLab>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
