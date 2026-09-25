"use client";

import { useId, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import { cn } from "@/lib/cn";

interface PropsGrupo {
  leyenda: string;
  descripcion?: ReactNode;
  icono?: LucideIcon;
  /** Columnas desde tablet (en móvil siempre una). */
  columnas?: 1 | 2 | 3;
  /** Acciones del bloque a la derecha de la leyenda (ej. «Editar» en una revisión). */
  acciones?: ReactNode;
  /** Sin línea divisoria arriba (primer grupo de una tarjeta). */
  sinDivisor?: boolean;
  className?: string;
  children: ReactNode;
}

const COLUMNAS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
} as const;

/**
 * Grupo de campos: fieldset con leyenda (lo que el lector de pantalla anuncia al entrar) y
 * una grilla de una a tres columnas. Un campo puede ocupar dos con className="sm:col-span-2".
 */
export function GrupoCampos({ leyenda, descripcion, icono: Icono, columnas = 2, acciones, sinDivisor, className, children }: PropsGrupo) {
  const t = useTokens();
  const compacta = t.tema.densidad === "compacta";
  const id = useId();
  return (
    <fieldset
      aria-labelledby={`${id}-leyenda`}
      aria-describedby={descripcion ? `${id}-desc` : undefined}
      className={className}
      style={{
        border: "none",
        margin: 0,
        padding: sinDivisor ? 0 : `${compacta ? 16 : 20}px 0 0`,
        borderTop: sinDivisor ? "none" : `1px solid ${t.grilla}`,
        minWidth: 0,
        fontFamily: t.fuente,
      }}
    >
      {/* La leyenda se enlaza con aria-labelledby: así puede compartir fila con las acciones. */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: compacta ? 12 : 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span
            id={`${id}-leyenda`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: 0,
              fontSize: t.tamano.etiqueta + 2,
              fontWeight: 700,
              color: t.texto,
            }}
          >
            {Icono && <Icono size={16} aria-hidden style={{ color: t.acento }} />}
            {leyenda}
          </span>
          {descripcion && (
            <p id={`${id}-desc`} style={{ margin: 0, paddingTop: 2, fontSize: t.tamano.eje, color: t.textoSuave, lineHeight: 1.4 }}>
              {descripcion}
            </p>
          )}
        </div>
        {acciones && <div style={{ flexShrink: 0, display: "flex", gap: 6 }}>{acciones}</div>}
      </div>
      <div className={cn("grid", COLUMNAS[columnas])} style={{ columnGap: compacta ? 16 : 20, rowGap: compacta ? 14 : 18 }}>
        {children}
      </div>
    </fieldset>
  );
}
