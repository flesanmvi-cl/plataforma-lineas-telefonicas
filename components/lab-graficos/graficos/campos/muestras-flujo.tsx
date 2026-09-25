"use client";

import { useRef, useState } from "react";
import { Clock, Search } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonLab } from "../botones/boton-lab";
import { estiloEtiqueta } from "../botones/comun";
import { Aviso, Chip } from "../base/componentes";
import { CampoFecha } from "./campo-fecha";
import { CampoMonto } from "./campo-monto";
import { CampoBuscable, type OpcionCampo } from "./campo-select";
import { CampoTexto } from "./campo-texto";
import { OBRAS, PROVEEDORES } from "./datos";
import { ResumenErrores } from "./resumen-errores";

interface Valores {
  nombre: string;
  codigo: string;
  correo: string;
  presupuesto: number | null;
  inicio: string;
}
type Campo = keyof Valores;

const ETIQUETAS: Record<Campo, string> = {
  nombre: "Nombre de la obra",
  codigo: "Código",
  correo: "Correo del responsable",
  presupuesto: "Presupuesto",
  inicio: "Fecha de inicio",
};

function validar(v: Valores): Partial<Record<Campo, string>> {
  const e: Partial<Record<Campo, string>> = {};
  if (v.nombre.trim().length < 3) e.nombre = "Escribe al menos 3 caracteres.";
  if (!/^OBR-\d{4}$/.test(v.codigo)) e.codigo = "Usa el formato OBR-0000.";
  if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v.correo)) e.correo = "Ingresa un correo válido.";
  if (v.presupuesto == null || v.presupuesto <= 0) e.presupuesto = "Ingresa un monto mayor que cero.";
  if (!v.inicio) e.inicio = "Elige una fecha.";
  return e;
}

// Validación en vivo: cada campo se valida al salir de él (no mientras se escribe por primera
// vez); al enviar se validan todos y arriba aparece un resumen con enlaces a cada error.
export function MuestraValidacion({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [v, setV] = useState<Valores>({ nombre: "", codigo: "", correo: "", presupuesto: null, inicio: "" });
  const [tocados, setTocados] = useState<Partial<Record<Campo, boolean>>>({});
  const [enviado, setEnviado] = useState<"no" | "error" | "ok">("no");
  const resumen = useRef<HTMLDivElement>(null);

  const errores = validar(v);
  const visibles = (Object.keys(errores) as Campo[]).filter((c) => tocados[c]);
  const err = (c: Campo) => (tocados[c] ? (errores[c] ?? null) : null);
  const tocar = (c: Campo) => setTocados((x) => ({ ...x, [c]: true }));
  const cambiar = <K extends Campo>(c: K, valor: Valores[K]) => {
    setV((x) => ({ ...x, [c]: valor }));
    if (enviado === "ok") setEnviado("no");
  };

  function enviar() {
    setTocados({ nombre: true, codigo: true, correo: true, presupuesto: true, inicio: true });
    if (Object.keys(errores).length) {
      setEnviado("error");
      // El resumen recibe el foco para que el lector de pantalla lo lea de inmediato.
      requestAnimationFrame(() => resumen.current?.focus());
    } else setEnviado("ok");
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        enviar();
      }}
      style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}
    >
      {enviado === "error" && (
        <ResumenErrores
          ref={resumen}
          titulo={`Revisa ${visibles.length === 1 ? "1 campo" : `${visibles.length} campos`} antes de guardar`}
          errores={visibles.map((c) => ({ id: `val-${c}`, etiqueta: ETIQUETAS[c], mensaje: errores[c] ?? "" }))}
        />
      )}
      {enviado === "ok" && <Aviso tipo="exito">Obra guardada (maqueta: no se envió nada).</Aviso>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "14px 18px" }}>
        <CampoTexto
          id="val-nombre"
          etiqueta={ETIQUETAS.nombre}
          requerido
          value={v.nombre}
          onChange={(e) => cambiar("nombre", e.target.value)}
          onBlur={() => tocar("nombre")}
          error={err("nombre")}
        />
        <CampoTexto
          id="val-codigo"
          etiqueta={ETIQUETAS.codigo}
          requerido
          placeholder="OBR-0000"
          value={v.codigo}
          onChange={(e) => cambiar("codigo", e.target.value.toUpperCase())}
          onBlur={() => tocar("codigo")}
          error={err("codigo")}
        />
        <CampoTexto
          id="val-correo"
          etiqueta={ETIQUETAS.correo}
          requerido
          type="email"
          autoComplete="off"
          placeholder="nombre.apellido@empresa.cl"
          value={v.correo}
          onChange={(e) => cambiar("correo", e.target.value)}
          onBlur={() => tocar("correo")}
          error={err("correo")}
        />
        <CampoMonto
          id="val-presupuesto"
          etiqueta={ETIQUETAS.presupuesto}
          requerido
          unidad="M$"
          valor={v.presupuesto}
          onCambio={(n) => cambiar("presupuesto", n)}
          onBlur={() => tocar("presupuesto")}
          error={err("presupuesto")}
        />
        <CampoFecha
          id="val-inicio"
          etiqueta={ETIQUETAS.inicio}
          requerido
          value={v.inicio}
          onChange={(x) => cambiar("inicio", x)}
          onBlur={() => tocar("inicio")}
          error={err("inicio")}
        />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <BotonLab type="submit">Guardar</BotonLab>
        <BotonLab
          variante="fantasma"
          onClick={() => {
            setV({ nombre: "", codigo: "", correo: "", presupuesto: null, inicio: "" });
            setTocados({});
            setEnviado("no");
          }}
        >
          Limpiar
        </BotonLab>
        <span style={estiloEtiqueta(t)}>
          <span style={{ color: t.campo.error }}>*</span> Obligatorio
        </span>
      </div>
    </form>
  );
}

const DOCUMENTOS: OpcionCampo[] = [
  { valor: "ep-0012", etiqueta: "EP-0012 Estado de pago septiembre", detalle: "Obra Norte" },
  { valor: "oc-4411", etiqueta: "OC-4411 Orden de compra hormigón", detalle: "Obra Costa" },
  { valor: "sc-0087", etiqueta: "SC-0087 Solicitud de compra EPP", detalle: "Edificio Parque" },
  { valor: "ct-0203", etiqueta: "CT-0203 Contrato subcontrato eléctrico", detalle: "Planta Concentradora Sur" },
];

const RESULTADOS: OpcionCampo[] = [
  ...OBRAS.map((o) => ({ ...o, valor: `obra:${o.valor}`, grupo: "Obras" })),
  ...DOCUMENTOS.map((d) => ({ ...d, valor: `doc:${d.valor}`, grupo: "Documentos" })),
  ...PROVEEDORES.slice(0, 8).map((p) => ({ ...p, valor: `prov:${p.valor}`, grupo: "Proveedores" })),
];

const SINGULAR: Record<string, string> = { Obras: "obra", Documentos: "documento", Proveedores: "proveedor" };

// Búsqueda global: sugerencias agrupadas (obras, documentos, proveedores) con la coincidencia
// resaltada; al elegir «abre» el resultado y queda en recientes.
export function MuestraBusqueda({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [abierto, setAbierto] = useState<OpcionCampo | null>(null);
  const [recientes, setRecientes] = useState<string[]>(["Obra Norte", "OC-4411"]);
  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", gap: 14, paddingTop: 8 }}>
      <CampoBuscable
        etiqueta="Buscar en la plataforma"
        etiquetaOculta
        icono={Search}
        placeholder="Buscar obras, documentos o proveedores"
        opciones={RESULTADOS}
        valor={null}
        limpiarAlElegir
        limite={12}
        sinResultados="Nada coincide. Prueba con el código del documento."
        onCambio={(_, o) => {
          if (!o) return;
          setAbierto(o);
          const corto = o.grupo === "Documentos" ? o.etiqueta.split(" ")[0] : o.etiqueta;
          setRecientes((r) => [corto, ...r.filter((x) => x !== corto)].slice(0, 4));
        }}
      />
      <div>
        <div style={{ ...estiloEtiqueta(t), display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
          <Clock size={12} aria-hidden /> Búsquedas recientes
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {recientes.map((r) => (
            <Chip key={r} onQuitar={() => setRecientes((x) => x.filter((y) => y !== r))}>
              {r}
            </Chip>
          ))}
        </div>
      </div>
      <div aria-live="polite">
        {abierto && (
          <Aviso tipo="info" onCerrar={() => setAbierto(null)}>
            Abriendo {SINGULAR[abierto.grupo ?? ""] ?? "resultado"}: <strong>{abierto.etiqueta}</strong>
          </Aviso>
        )}
      </div>
    </div>
  );
}
