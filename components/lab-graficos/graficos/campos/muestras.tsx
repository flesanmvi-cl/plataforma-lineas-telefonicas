"use client";

import { useState, type ReactNode } from "react";
import { Hash, Mail, Search } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { estiloEtiqueta } from "../botones/comun";
import { CampoArchivo, type ArchivoCargado } from "./campo-archivo";
import { CampoFecha, CampoRangoFechas } from "./campo-fecha";
import { CampoMonto } from "./campo-monto";
import { CampoBuscable, CampoSelect } from "./campo-select";
import { CampoArea, CampoTexto } from "./campo-texto";
import { formatoPesos } from "./comun";
import { PROVEEDORES, REGIONES, UF_REFERENCIAL } from "./datos";
import { CampoInterruptor, GrupoRadio } from "./opciones";

/** Grilla de la muestra: columnas que se acomodan al ancho de la tarjeta. */
function Grilla({ alto, min = 200, children }: { alto: number; min?: number; children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: alto,
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
        alignContent: "center",
        gap: "16px 18px",
        paddingTop: 6,
      }}
    >
      {children}
    </div>
  );
}

// Campos de texto en sus estados: normal, foco, con valor, error, deshabilitado, con ícono,
// prefijo/sufijo y con contador. Es la muestra que representa a Formularios en el estándar.
export function MuestraCamposTexto({ alto }: PropsGraficoLab) {
  const [codigo, setCodigo] = useState("OB-12");
  const [nombre, setNombre] = useState("Torre A, etapa 2");
  const errorCodigo = /^OBR-\d{4}$/.test(codigo) ? null : "Usa el formato OBR-0000.";
  return (
    <Grilla alto={alto}>
      <CampoTexto etiqueta="Normal" placeholder="Nombre de la obra" />
      <CampoTexto etiqueta="Foco" placeholder="Así se ve al escribir" forzarFoco />
      <CampoTexto etiqueta="Con valor" defaultValue="Obra Norte" />
      <CampoTexto
        etiqueta="Código de obra"
        requerido
        value={codigo}
        onChange={(e) => setCodigo(e.target.value.toUpperCase())}
        error={errorCodigo}
        icono={Hash}
      />
      <CampoTexto etiqueta="Deshabilitado" defaultValue="Grupo Flesan" disabled ayuda="Se completa desde el ERP." />
      <CampoTexto etiqueta="Con ícono" icono={Search} placeholder="Buscar partida" />
      <CampoTexto etiqueta="Correo" icono={Mail} placeholder="nombre.apellido" sufijo="@empresa.cl" />
      <CampoTexto
        etiqueta="Nombre corto"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        maxLength={30}
        contador
        ayuda="Aparece en reportes y listados."
      />
    </Grilla>
  );
}

// Selección: select nativo (lista corta), buscable (lista larga), radios en fila e interruptor.
export function MuestraSeleccion({ alto }: PropsGraficoLab) {
  const [region, setRegion] = useState("");
  const [proveedor, setProveedor] = useState<string | null>("aceros-andes");
  const [tipo, setTipo] = useState("edificacion");
  const [urgente, setUrgente] = useState(false);
  return (
    <Grilla alto={alto} min={220}>
      <CampoSelect
        etiqueta="Región"
        requerido
        placeholder="Selecciona una región"
        opciones={REGIONES}
        value={region}
        onChange={setRegion}
        ayuda="Select nativo: bueno en móvil para listas cortas."
      />
      <CampoBuscable
        etiqueta="Proveedor"
        opciones={PROVEEDORES}
        valor={proveedor}
        onCambio={setProveedor}
        placeholder="Busca por nombre o rubro"
        ayuda="Escribe para filtrar; flechas y Enter para elegir."
      />
      <CampoSelect etiqueta="Moneda" opciones={[{ valor: "clp", etiqueta: "Pesos (CLP)" }]} value="clp" onChange={() => {}} disabled />
      <GrupoRadio
        etiqueta="Tipo de obra"
        enFila
        valor={tipo}
        onCambio={setTipo}
        opciones={[
          { valor: "edificacion", etiqueta: "Edificación" },
          { valor: "vialidad", etiqueta: "Vialidad" },
          { valor: "mineria", etiqueta: "Minería" },
        ]}
      />
      <CampoInterruptor
        etiqueta="Compra urgente"
        descripcion="Salta la cotización y va directo a aprobación."
        encendido={urgente}
        onCambio={setUrgente}
      />
    </Grilla>
  );
}

// Fechas: simple, obligatoria, deshabilitada y rango desde–hasta que valida el orden.
export function MuestraFechas({ alto }: PropsGraficoLab) {
  const [inicio, setInicio] = useState("2026-10-01");
  const [entrega, setEntrega] = useState("");
  const [rango, setRango] = useState({ desde: "2026-09-01", hasta: "2026-08-15" });
  return (
    <Grilla alto={alto} min={220}>
      <CampoFecha etiqueta="Inicio de obra" requerido value={inicio} onChange={setInicio} />
      <CampoFecha
        etiqueta="Entrega comprometida"
        value={entrega}
        min={inicio}
        onChange={setEntrega}
        ayuda="No puede ser anterior al inicio."
      />
      <CampoFecha etiqueta="Recepción municipal" value="2027-03-30" onChange={() => {}} disabled />
      <CampoRangoFechas
        etiqueta="Periodo del informe"
        valor={rango}
        onCambio={setRango}
        ayuda="El rango incluye ambos días."
        className="sm:col-span-2"
      />
    </Grilla>
  );
}

// Montos y números: M$, UF (con equivalencia), porcentaje acotado y superficie.
export function MuestraMontos({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [presupuesto, setPresupuesto] = useState<number | null>(1250000);
  const [contrato, setContrato] = useState<number | null>(45320.5);
  const [avance, setAvance] = useState<number | null>(64.5);
  const [superficie, setSuperficie] = useState<number | null>(null);
  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
      <Grilla alto={0} min={200}>
        <CampoMonto etiqueta="Presupuesto" unidad="M$" valor={presupuesto} onCambio={setPresupuesto} requerido ayuda="En miles de pesos." />
        <CampoMonto
          etiqueta="Valor del contrato"
          unidad="UF"
          valor={contrato}
          onCambio={setContrato}
          ayuda={contrato != null ? `≈ ${formatoPesos(contrato * UF_REFERENCIAL)} (UF referencial)` : "Dos decimales."}
        />
        <CampoMonto
          etiqueta="Avance físico"
          unidad="%"
          decimales={1}
          min={0}
          max={100}
          valor={avance}
          onCambio={setAvance}
          ayuda="Entre 0 y 100; se acota al salir."
        />
        <CampoMonto etiqueta="Superficie" unidad="m²" valor={superficie} onCambio={setSuperficie} placeholder="0" />
      </Grilla>
      <p style={{ ...estiloEtiqueta(t), margin: 0 }}>
        Mientras escribes acepta «1234,5» o «1.234,5»; al salir se formatea con punto de miles y coma decimal.
      </p>
    </div>
  );
}

// Área de texto con contador (se pone ámbar cerca del tope y rojo al llegar) y en error.
export function MuestraArea({ alto }: PropsGraficoLab) {
  const [obs, setObs] = useState("Se requiere reforzar el moldaje del eje 4 antes del hormigonado de la losa.");
  const [motivo, setMotivo] = useState("");
  return (
    <Grilla alto={alto} min={240}>
      <CampoArea
        etiqueta="Observaciones"
        value={obs}
        onChange={(e) => setObs(e.target.value)}
        maxLength={120}
        contador
        rows={4}
        ayuda="Visible para el equipo de la obra."
      />
      <CampoArea
        etiqueta="Motivo del rechazo"
        requerido
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        maxLength={200}
        contador
        rows={4}
        placeholder="Explica qué falta para aprobar"
        error={motivo.trim().length < 10 ? "Escribe al menos 10 caracteres." : null}
      />
    </Grilla>
  );
}

// Carga de archivos: zona grande con lista y variante compacta para paneles laterales.
export function MuestraArchivos({ alto }: PropsGraficoLab) {
  const [planos, setPlanos] = useState<ArchivoCargado[]>([
    { id: "p1", nombre: "Plano estructural losa piso 8.pdf", tamano: 2_480_000, tipo: "application/pdf" },
    { id: "p2", nombre: "Cubicación hormigón.xlsx", tamano: 184_000, tipo: "" },
  ]);
  const [respaldo, setRespaldo] = useState<ArchivoCargado[]>([]);
  return (
    <Grilla alto={alto} min={240}>
      <CampoArchivo
        etiqueta="Planos y respaldos"
        archivos={planos}
        onCambio={setPlanos}
        aceptar={[".pdf", ".xlsx", ".dwg", ".jpg", ".png"]}
        maxMb={20}
      />
      <CampoArchivo
        etiqueta="Factura"
        requerido
        compacto
        multiple={false}
        archivos={respaldo}
        onCambio={setRespaldo}
        aceptar={[".pdf"]}
        maxMb={5}
        ayuda="Un PDF de hasta 5 MB."
      />
    </Grilla>
  );
}
