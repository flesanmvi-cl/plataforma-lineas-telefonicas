"use client";

import { useMemo, useRef, useState } from "react";
import { Banknote, Building2, MapPin, Save, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useTutorial, type PasoTutorial } from "@/components/tutorial/tutorial";
import { PageHeader } from "@/components/page-header";
import { useTokens } from "@/components/estandar/tema-context";
import { BotonLab } from "@/components/estandar/graficos/botones/boton-lab";
import { Aviso, Insignia } from "@/components/estandar/graficos/base/componentes";
import {
  CampoArchivo,
  CampoArea,
  CampoCasilla,
  CampoFecha,
  CampoInterruptor,
  CampoMonto,
  CampoSelect,
  CampoTexto,
  GrupoCampos,
  ResumenErrores,
  fechaLegible,
  formatoPesos,
  type ArchivoCargado,
  type ErrorResumen,
} from "@/components/estandar/graficos/campos/componentes";
import { REGIONES, UF_REFERENCIAL } from "@/components/estandar/graficos/campos/datos";

/*
 * Formulario Tipo 1: formulario simple para crear un registro («Nueva obra»). Grupos en una o
 * dos columnas, acciones fijas al pie y validación al enviar con resumen de errores arriba.
 * Todo es estado local: no se guarda nada.
 */

const TIPOS = [
  { valor: "edificacion", etiqueta: "Edificación" },
  { valor: "obras-civiles", etiqueta: "Obras civiles" },
  { valor: "vialidad", etiqueta: "Vialidad" },
  { valor: "mineria", etiqueta: "Minería" },
  { valor: "industrial", etiqueta: "Industrial" },
];

const GERENCIAS = [
  { valor: "g-edificacion", etiqueta: "Gerencia de Edificación" },
  { valor: "g-infraestructura", etiqueta: "Gerencia de Infraestructura" },
  { valor: "g-mineria", etiqueta: "Gerencia de Minería" },
];

interface Obra {
  nombre: string;
  codigo: string;
  tipo: string;
  gerencia: string;
  mandante: string;
  descripcion: string;
  region: string;
  comuna: string;
  direccion: string;
  presupuesto: number | null;
  contratoUf: number | null;
  anticipo: number | null;
  inicio: string;
  plazo: number | null;
  subcontratos: boolean;
  notificar: boolean;
}

const VACIA: Obra = {
  nombre: "",
  codigo: "",
  tipo: "",
  gerencia: "",
  mandante: "",
  descripcion: "",
  region: "",
  comuna: "",
  direccion: "",
  presupuesto: null,
  contratoUf: null,
  anticipo: 10,
  inicio: "",
  plazo: null,
  subcontratos: true,
  notificar: true,
};

type Clave = keyof Obra;

/** Id del control de cada campo (el resumen de errores enlaza a ellos). */
const id = (c: Clave) => `obra-${c}`;

const ETIQUETAS: Partial<Record<Clave, string>> = {
  nombre: "Nombre de la obra",
  codigo: "Código",
  tipo: "Tipo de obra",
  gerencia: "Gerencia responsable",
  region: "Región",
  comuna: "Comuna",
  presupuesto: "Presupuesto",
  inicio: "Fecha de inicio",
  plazo: "Plazo",
};

function validar(o: Obra): Partial<Record<Clave, string>> {
  const e: Partial<Record<Clave, string>> = {};
  if (o.nombre.trim().length < 3) e.nombre = "Escribe al menos 3 caracteres.";
  if (!/^OBR-\d{4}$/.test(o.codigo)) e.codigo = "Usa el formato OBR-0000.";
  if (!o.tipo) e.tipo = "Elige el tipo de obra.";
  if (!o.gerencia) e.gerencia = "Elige una gerencia.";
  if (!o.region) e.region = "Elige una región.";
  if (!o.comuna.trim()) e.comuna = "Indica la comuna.";
  if (o.presupuesto == null || o.presupuesto <= 0) e.presupuesto = "Ingresa un monto mayor que cero.";
  if (!o.inicio) e.inicio = "Elige la fecha de inicio.";
  if (o.plazo == null || o.plazo < 1) e.plazo = "Indica el plazo en días.";
  return e;
}

/** Suma días a una fecha ISO (sin zona horaria). */
function sumarDias(iso: string, dias: number) {
  const [a, m, d] = iso.split("-").map(Number);
  const f = new Date(Date.UTC(a, m - 1, d + dias));
  return f.toISOString().slice(0, 10);
}

// Recorrido guiado del Formulario Tipo 1: los grupos en orden y cómo guardar.
const PASOS_FORMULARIO: PasoTutorial[] = [
  {
    selector: '[data-grupo="Datos generales"]',
    titulo: "Parte por los datos generales",
    texto: "Los campos con asterisco rojo son obligatorios. El código lo entrega Control de Gestión; si no lo tienes, guarda un borrador y vuelve después.",
  },
  {
    selector: '[data-grupo="Ubicación"]',
    titulo: "Dónde está la obra",
    texto: "Elige la región y la comuna: con ellas la obra aparece en los mapas y reportes por territorio.",
  },
  {
    selector: '[data-grupo="Montos y plazos"]',
    titulo: "Montos y plazos",
    texto: "El presupuesto va en miles de pesos y el contrato en UF. El anticipo no puede pasar del 30 %; el formulario te avisa si algo no cuadra.",
  },
  {
    selector: '[data-tutorial="acciones"]',
    titulo: "Guarda cuando quieras",
    texto: "«Guardar borrador» conserva lo avanzado aunque falten datos. «Guardar obra» revisa todo y te lleva al primer campo con error.",
  },
];

export default function FormularioTipo1() {
  const t = useTokens();
  useTutorial(PASOS_FORMULARIO);
  const [obra, setObra] = useState<Obra>(VACIA);
  const [contrato, setContrato] = useState<ArchivoCargado[]>([]);
  const [intentado, setIntentado] = useState(false);
  const [tocados, setTocados] = useState<Partial<Record<Clave, boolean>>>({});
  const [guardando, setGuardando] = useState(false);
  const [creada, setCreada] = useState<string | null>(null);
  const [borrador, setBorrador] = useState<string | null>(null);
  const resumen = useRef<HTMLDivElement>(null);

  const errores = useMemo(() => validar(obra), [obra]);
  // Antes de enviar, solo se muestran errores de campos ya visitados; después, todos.
  const err = (c: Clave) => (intentado || tocados[c] ? (errores[c] ?? null) : null);
  const tocar = (c: Clave) => () => setTocados((x) => ({ ...x, [c]: true }));
  const cambiar = <K extends Clave>(c: K, v: Obra[K]) => setObra((x) => ({ ...x, [c]: v }));
  const lista: ErrorResumen[] = intentado
    ? (Object.keys(errores) as Clave[]).map((c) => ({ id: id(c), etiqueta: ETIQUETAS[c] ?? c, mensaje: errores[c] ?? "" }))
    : [];
  const termino = obra.inicio && obra.plazo ? sumarDias(obra.inicio, obra.plazo) : "";
  const sucio = JSON.stringify(obra) !== JSON.stringify(VACIA) || contrato.length > 0;

  function guardar() {
    setIntentado(true);
    if (Object.keys(errores).length) {
      requestAnimationFrame(() => {
        resumen.current?.scrollIntoView({ block: "start", behavior: "smooth" });
        resumen.current?.focus({ preventScroll: true });
      });
      return;
    }
    setGuardando(true);
    setTimeout(() => {
      setGuardando(false);
      setCreada(`${obra.codigo} ${obra.nombre}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 900);
  }

  function guardarBorrador() {
    const hora = new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
    setBorrador(hora);
    toast.success("Borrador guardado", { description: "Puedes retomarlo desde «Mis borradores»." });
  }

  function cancelar() {
    setObra(VACIA);
    setContrato([]);
    setIntentado(false);
    setTocados({});
    setBorrador(null);
    if (sucio) toast("Cambios descartados");
  }

  if (creada) {
    return (
      <div className="animate-fade-in page-shell py-6 lg:py-8">
        <PageHeader title="Nueva obra" />
        <div className="max-w-4xl">
          <Aviso
            tipo="exito"
            titulo="Obra creada"
            acciones={
              <>
                <BotonLab
                  tamano="sm"
                  onClick={() => {
                    setCreada(null);
                    cancelar();
                  }}
                >
                  Crear otra obra
                </BotonLab>
                <BotonLab variante="contorno" tamano="sm">
                  Ir a la ficha
                </BotonLab>
              </>
            }
          >
            {creada} quedó registrada en {REGIONES.find((r) => r.valor === obra.region)?.etiqueta}. (Maqueta: no se guardó nada.)
          </Aviso>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in page-shell pt-6 lg:pt-8">
      <PageHeader
        title="Nueva obra"
        description="Formulario Tipo 1: crear un registro en una sola pantalla. Grupos de campos, acciones fijas al pie y validación al guardar con resumen de errores."
        actions={
          borrador ? (
            <Insignia tono="neutro" punto>
              Borrador guardado {borrador}
            </Insignia>
          ) : undefined
        }
      />

      <form
        noValidate
        aria-label="Nueva obra"
        onSubmit={(e) => {
          e.preventDefault();
          guardar();
        }}
        className="max-w-4xl"
      >
        <div className="flex flex-col gap-4">
          {lista.length > 0 && <ResumenErrores ref={resumen} errores={lista} titulo={`Faltan ${lista.length} datos para guardar la obra`} />}

          <div className="card p-5 lg:p-6 flex flex-col gap-6">
            <GrupoCampos leyenda="Datos generales" icono={Building2} sinDivisor>
              <CampoTexto
                id={id("nombre")}
                className="sm:col-span-2"
                etiqueta="Nombre de la obra"
                requerido
                placeholder="Ej. Edificio Parque, Torre B"
                value={obra.nombre}
                onChange={(e) => cambiar("nombre", e.target.value)}
                onBlur={tocar("nombre")}
                error={err("nombre")}
              />
              <CampoTexto
                id={id("codigo")}
                etiqueta="Código"
                requerido
                placeholder="OBR-0000"
                ayuda="Lo entrega Control de Gestión."
                value={obra.codigo}
                onChange={(e) => cambiar("codigo", e.target.value.toUpperCase())}
                onBlur={tocar("codigo")}
                error={err("codigo")}
              />
              <CampoSelect
                id={id("tipo")}
                etiqueta="Tipo de obra"
                requerido
                placeholder="Selecciona"
                opciones={TIPOS}
                value={obra.tipo}
                onChange={(v) => cambiar("tipo", v)}
                onBlur={tocar("tipo")}
                error={err("tipo")}
              />
              <CampoSelect
                id={id("gerencia")}
                etiqueta="Gerencia responsable"
                requerido
                placeholder="Selecciona"
                opciones={GERENCIAS}
                value={obra.gerencia}
                onChange={(v) => cambiar("gerencia", v)}
                onBlur={tocar("gerencia")}
                error={err("gerencia")}
              />
              <CampoTexto
                id={id("mandante")}
                etiqueta="Mandante"
                placeholder="Empresa que encarga la obra"
                value={obra.mandante}
                onChange={(e) => cambiar("mandante", e.target.value)}
              />
              <CampoArea
                id={id("descripcion")}
                className="sm:col-span-2"
                etiqueta="Descripción"
                placeholder="Alcance, superficie y principales partidas"
                rows={3}
                maxLength={300}
                contador
                value={obra.descripcion}
                onChange={(e) => cambiar("descripcion", e.target.value)}
              />
            </GrupoCampos>

            <GrupoCampos leyenda="Ubicación" icono={MapPin}>
              <CampoSelect
                id={id("region")}
                etiqueta="Región"
                requerido
                placeholder="Selecciona una región"
                opciones={REGIONES}
                value={obra.region}
                onChange={(v) => cambiar("region", v)}
                onBlur={tocar("region")}
                error={err("region")}
              />
              <CampoTexto
                id={id("comuna")}
                etiqueta="Comuna"
                requerido
                value={obra.comuna}
                onChange={(e) => cambiar("comuna", e.target.value)}
                onBlur={tocar("comuna")}
                error={err("comuna")}
              />
              <CampoTexto
                id={id("direccion")}
                className="sm:col-span-2"
                etiqueta="Dirección"
                placeholder="Calle, número y referencia"
                value={obra.direccion}
                onChange={(e) => cambiar("direccion", e.target.value)}
              />
            </GrupoCampos>

            <GrupoCampos leyenda="Montos y plazos" icono={Banknote} columnas={3}>
              <CampoMonto
                id={id("presupuesto")}
                etiqueta="Presupuesto"
                requerido
                unidad="M$"
                valor={obra.presupuesto}
                onCambio={(n) => cambiar("presupuesto", n)}
                onBlur={tocar("presupuesto")}
                error={err("presupuesto")}
                ayuda="En miles de pesos."
              />
              <CampoMonto
                id={id("contratoUf")}
                etiqueta="Valor del contrato"
                unidad="UF"
                valor={obra.contratoUf}
                onCambio={(n) => cambiar("contratoUf", n)}
                ayuda={obra.contratoUf ? `≈ ${formatoPesos(obra.contratoUf * UF_REFERENCIAL)}` : "Opcional."}
              />
              <CampoMonto
                id={id("anticipo")}
                etiqueta="Anticipo"
                unidad="%"
                min={0}
                max={30}
                decimales={1}
                valor={obra.anticipo}
                onCambio={(n) => cambiar("anticipo", n)}
                ayuda="Máximo 30 %."
              />
              <CampoFecha
                id={id("inicio")}
                etiqueta="Fecha de inicio"
                requerido
                value={obra.inicio}
                onChange={(v) => cambiar("inicio", v)}
                onBlur={tocar("inicio")}
                error={err("inicio")}
              />
              <CampoMonto
                id={id("plazo")}
                etiqueta="Plazo"
                requerido
                unidad="días"
                min={1}
                valor={obra.plazo}
                onCambio={(n) => cambiar("plazo", n)}
                onBlur={tocar("plazo")}
                error={err("plazo")}
              />
              <CampoTexto
                id="obra-termino"
                etiqueta="Término estimado"
                value={termino ? fechaLegible(termino) : ""}
                placeholder="Se calcula solo"
                readOnly
                disabled
                ayuda="Inicio + plazo en días corridos."
              />
            </GrupoCampos>

            <GrupoCampos leyenda="Opciones" icono={Settings2} columnas={1}>
              <CampoInterruptor
                etiqueta="La obra tendrá subcontratos"
                descripcion="Habilita el módulo de estados de pago de subcontratistas."
                encendido={obra.subcontratos}
                onCambio={(v) => cambiar("subcontratos", v)}
              />
              <CampoCasilla
                etiqueta="Avisar a la gerencia responsable al crear la obra"
                marcada={obra.notificar}
                onCambio={(v) => cambiar("notificar", v)}
              />
              <CampoArchivo
                etiqueta="Contrato firmado"
                compacto
                multiple={false}
                aceptar={[".pdf"]}
                maxMb={15}
                archivos={contrato}
                onCambio={setContrato}
                ayuda="Opcional. Puedes subirlo después desde la ficha de la obra."
              />
            </GrupoCampos>
          </div>
        </div>

        {/* Acciones fijas al pie: siempre a la vista en formularios largos. */}
        <div
          data-tutorial="acciones"
          className="sticky bottom-0 z-10 -mx-4 lg:-mx-8 mt-6 px-4 lg:px-8 py-3 flex flex-wrap items-center gap-2"
          style={{ background: t.fondo, borderTop: `1px solid ${t.eje}` }}
        >
          <span style={{ fontFamily: t.fuente, fontSize: t.tamano.eje, color: t.textoSuave }} className="mr-auto">
            <span style={{ color: t.campo.error }}>*</span> Obligatorio
          </span>
          <BotonLab variante="fantasma" onClick={cancelar}>
            Cancelar
          </BotonLab>
          <BotonLab variante="contorno" icono={Save} onClick={guardarBorrador}>
            Guardar borrador
          </BotonLab>
          <BotonLab type="submit" cargando={guardando}>
            Guardar obra
          </BotonLab>
        </div>
      </form>
    </div>
  );
}
