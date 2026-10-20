"use client";

import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FileImage, FileSpreadsheet, FileText, UploadCloud, X } from "lucide-react";
import { useTokens } from "@/components/estandar/tema-context";
import { conAlfa } from "@/lib/estandar/tema";
import { estiloMensaje, tamanoArchivo, transicionCampo } from "./comun";
import { MarcoCampo, useIdsCampo } from "./marco";

/** Archivo ya aceptado (solo metadatos: la maqueta no sube nada). */
export interface ArchivoCargado {
  id: string;
  nombre: string;
  tamano: number;
  tipo: string;
}

interface PropsCampoArchivo {
  etiqueta: string;
  archivos: ArchivoCargado[];
  onCambio: (archivos: ArchivoCargado[]) => void;
  /** Extensiones aceptadas, ej. [".pdf", ".xlsx"]. */
  aceptar?: string[];
  /** Tope por archivo en MB. */
  maxMb?: number;
  multiple?: boolean;
  ayuda?: ReactNode;
  error?: string | null;
  requerido?: boolean;
  deshabilitado?: boolean;
  /** Zona baja (una línea) para paneles laterales. */
  compacto?: boolean;
  className?: string;
  id?: string;
}

function IconoArchivo({ nombre }: { nombre: string }) {
  const ext = nombre.split(".").pop()?.toLowerCase() ?? "";
  const Icono = ["xlsx", "xls", "csv"].includes(ext) ? FileSpreadsheet : ["png", "jpg", "jpeg", "webp"].includes(ext) ? FileImage : FileText;
  return <Icono size={16} aria-hidden />;
}

/**
 * Carga de archivos: zona de arrastrar y soltar (que también es el botón para elegir) y la
 * lista de lo cargado con opción de quitar. Rechaza por tipo y tamaño con mensaje claro.
 */
export function CampoArchivo({
  etiqueta,
  archivos,
  onCambio,
  aceptar,
  maxMb = 10,
  multiple = true,
  ayuda,
  error,
  requerido,
  deshabilitado,
  compacto,
  className,
  id,
}: PropsCampoArchivo) {
  const t = useTokens();
  const ids = useIdsCampo(id, { ayuda, error });
  const [arrastrando, setArrastrando] = useState(false);
  const [foco, setFoco] = useState(false);
  const [rechazos, setRechazos] = useState<string[]>([]);
  const contador = useRef(0);
  const input = useRef<HTMLInputElement>(null);

  function agregar(lista: FileList | null) {
    if (!lista || deshabilitado) return;
    const nuevos: ArchivoCargado[] = [];
    const malos: string[] = [];
    for (const f of Array.from(lista)) {
      const ext = `.${f.name.split(".").pop()?.toLowerCase()}`;
      if (aceptar && !aceptar.includes(ext)) malos.push(`${f.name}: formato no admitido`);
      else if (f.size > maxMb * 1024 * 1024) malos.push(`${f.name}: supera ${maxMb} MB`);
      else {
        contador.current += 1;
        nuevos.push({ id: `${f.name}-${contador.current}`, nombre: f.name, tamano: f.size, tipo: f.type });
      }
    }
    setRechazos(malos);
    if (nuevos.length) onCambio(multiple ? [...archivos, ...nuevos] : nuevos.slice(0, 1));
  }

  function alSoltar(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setArrastrando(false);
    agregar(e.dataTransfer.files);
  }

  const activo = arrastrando || foco;
  const colorError = error ? t.campo.error : null;
  const dur = t.animacion.duracion > 0 ? 0.18 : 0;

  return (
    <MarcoCampo etiqueta={etiqueta} ids={ids} ayuda={ayuda} error={error} requerido={requerido} className={className}>
      <label
        htmlFor={ids.id}
        onDragOver={(e) => {
          e.preventDefault();
          if (!deshabilitado) setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={alSoltar}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: compacto ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          gap: compacto ? 10 : 6,
          padding: compacto ? "10px 12px" : "18px 16px",
          textAlign: "center",
          fontFamily: t.fuente,
          fontSize: t.tamano.etiqueta,
          color: t.textoSuave,
          borderRadius: Math.max(t.campo.radio, 4),
          border: `1.5px dashed ${colorError ?? (activo ? t.campo.bordeFoco : t.campo.borde === "transparent" ? t.eje : t.campo.borde)}`,
          background: deshabilitado ? t.campo.deshabilitado : arrastrando ? t.campo.anilloFoco : t.campo.estilo === "relleno" ? t.campo.fondo : conAlfa(t.texto, 0.02),
          boxShadow: foco ? `0 0 0 3px ${t.campo.anilloFoco}` : "none",
          cursor: deshabilitado ? "not-allowed" : "pointer",
          transition: transicionCampo(t),
        }}
      >
        <UploadCloud size={compacto ? 18 : 24} aria-hidden style={{ color: activo ? t.campo.bordeFoco : t.textoSuave, flexShrink: 0 }} />
        <span>
          <span style={{ color: t.texto, fontWeight: 600 }}>{arrastrando ? "Suelta para cargar" : "Arrastra archivos aquí"}</span>
          {!arrastrando && (
            <>
              {" o "}
              <span style={{ color: t.acento, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>elige desde tu equipo</span>
            </>
          )}
        </span>
        {!compacto && (
          <span style={{ fontSize: t.tamano.eje }}>
            {aceptar ? aceptar.join(", ").toUpperCase().replace(/\./g, "") : "Cualquier formato"} · hasta {maxMb} MB
          </span>
        )}
        <input
          ref={input}
          id={ids.id}
          type="file"
          multiple={multiple}
          accept={aceptar?.join(",")}
          disabled={deshabilitado}
          aria-invalid={error ? true : undefined}
          aria-required={requerido || undefined}
          aria-describedby={ids.describedBy}
          onChange={(e) => {
            agregar(e.target.files);
            e.target.value = "";
          }}
          onFocus={(e) => setFoco(e.currentTarget.matches(":focus-visible"))}
          onBlur={() => setFoco(false)}
          style={{ position: "absolute", width: 1, height: 1, opacity: 0, overflow: "hidden", clip: "rect(0 0 0 0)" }}
        />
      </label>

      {rechazos.length > 0 && (
        <ul role="alert" style={{ margin: "6px 0 0", padding: 0, listStyle: "none" }}>
          {rechazos.map((r) => (
            <li key={r} style={estiloMensaje(t, true)}>
              {r}
            </li>
          ))}
        </ul>
      )}

      {archivos.length > 0 && (
        <ul aria-label={`Archivos en ${etiqueta}`} style={{ margin: "8px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 4 }}>
          <AnimatePresence initial={false}>
            {archivos.map((a) => (
              <motion.li
                key={a.id}
                layout={dur > 0}
                initial={dur ? { opacity: 0, y: -4 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={dur ? { opacity: 0, x: 8 } : undefined}
                transition={{ duration: dur }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: Math.max(t.campo.radio - 2, 2),
                  border: `1px solid ${t.grilla}`,
                  fontFamily: t.fuente,
                  fontSize: t.tamano.etiqueta,
                  color: t.texto,
                }}
              >
                <span style={{ color: t.textoSuave, display: "inline-flex" }}>
                  <IconoArchivo nombre={a.nombre} />
                </span>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.nombre}</span>
                <span style={{ color: t.textoSuave, fontSize: t.tamano.eje, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                  {tamanoArchivo(a.tamano)}
                </span>
                <button
                  type="button"
                  aria-label={`Quitar ${a.nombre}`}
                  title="Quitar"
                  disabled={deshabilitado}
                  onClick={() => onCambio(archivos.filter((x) => x.id !== a.id))}
                  style={{
                    display: "inline-flex",
                    padding: 3,
                    border: "none",
                    borderRadius: 4,
                    background: "transparent",
                    color: t.textoSuave,
                    cursor: "pointer",
                    outlineColor: t.acento,
                  }}
                >
                  <X size={14} aria-hidden />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </MarcoCampo>
  );
}
