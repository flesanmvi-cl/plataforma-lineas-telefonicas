"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Inbox, MessageSquare } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import type { TokensLab } from "@/lib/lab-graficos/tema";
import { BotonLab } from "./boton-lab";
import { colorSobre, estiloEtiqueta, transicionMotion } from "./comun";

/** Insignia numérica en la esquina; con valor 0 desaparece. */
function Insignia({ t, valor, punto }: { t: TokensLab; valor: number; punto?: boolean }) {
  return (
    <AnimatePresence>
      {valor > 0 && (
        <motion.span
          key="insignia"
          aria-hidden
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={transicionMotion(t)}
          style={{
            position: "absolute",
            top: punto ? 6 : -6,
            right: punto ? 6 : -6,
            minWidth: punto ? 9 : 18,
            height: punto ? 9 : 18,
            padding: punto ? 0 : "0 5px",
            borderRadius: 999,
            background: t.acento,
            color: colorSobre(t.acento),
            border: `2px solid ${t.fondoTarjeta}`,
            fontFamily: t.fuente,
            fontSize: 10,
            fontWeight: 700,
            lineHeight: "14px",
            textAlign: "center",
            boxSizing: "content-box",
            fontVariantNumeric: "tabular-nums",
            pointerEvents: "none",
          }}
        >
          {punto ? null : valor > 99 ? "99+" : valor}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// Botones con contador: la insignia se limpia al abrir y «Simular aviso» suma uno.
export function BotonInsignia({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [avisos, setAvisos] = useState(4);
  const [mensajes, setMensajes] = useState(12);
  const [bandeja, setBandeja] = useState(1);

  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16, fontFamily: t.fuente }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <span style={{ position: "relative", display: "inline-flex" }}>
          <BotonLab
            variante="contorno"
            icono={Bell}
            onClick={() => setAvisos(0)}
            aria-label={`Notificaciones, ${avisos} sin leer`}
          >
            Notificaciones
          </BotonLab>
          <Insignia t={t} valor={avisos} />
        </span>
        <span style={{ position: "relative", display: "inline-flex" }}>
          <BotonLab
            variante="fantasma"
            soloIcono
            icono={Inbox}
            onClick={() => setBandeja(0)}
            aria-label={bandeja ? "Bandeja, hay novedades" : "Bandeja"}
            title="Bandeja"
          />
          <Insignia t={t} valor={bandeja} punto />
        </span>
        <BotonLab variante="fantasma" icono={MessageSquare} onClick={() => setMensajes(0)} aria-label={`Mensajes, ${mensajes} sin leer`}>
          Mensajes
          {mensajes > 0 && (
            <span
              aria-hidden
              style={{
                marginLeft: 2,
                padding: "2px 6px",
                borderRadius: 999,
                background: t.texto,
                color: colorSobre(t.texto),
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 0,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {mensajes}
            </span>
          )}
        </BotonLab>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <BotonLab
          variante="texto"
          tamano="sm"
          onClick={() => {
            setAvisos((n) => n + 1);
            setMensajes((n) => n + 3);
            setBandeja(1);
          }}
        >
          Simular aviso
        </BotonLab>
        <span style={estiloEtiqueta(t)}>Clic en un botón para marcar como leído.</span>
      </div>
    </div>
  );
}
