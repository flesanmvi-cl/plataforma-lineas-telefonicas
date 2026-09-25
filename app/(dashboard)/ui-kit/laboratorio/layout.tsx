import localFont from "next/font/local";
import { LabShell } from "@/components/lab-graficos/lab-shell";
import "./lab.css";

// Letras solo para comparar en el laboratorio de diseño (ver app/fonts/lab/LEEME.txt). Barlow e
// Inter Tight ya vienen del layout raíz.
const plex = localFont({ src: "../../../fonts/lab/IBMPlexSans.ttf", variable: "--font-lab-plex", weight: "100 700", display: "swap" });
const geist = localFont({ src: "../../../fonts/lab/Geist.ttf", variable: "--font-lab-geist", weight: "100 900", display: "swap" });
const manrope = localFont({ src: "../../../fonts/lab/Manrope.ttf", variable: "--font-lab-manrope", weight: "200 800", display: "swap" });
const dmSans = localFont({ src: "../../../fonts/lab/DMSans.ttf", variable: "--font-lab-dm", weight: "100 1000", display: "swap" });
const source = localFont({ src: "../../../fonts/lab/SourceSans3.ttf", variable: "--font-lab-source", weight: "200 900", display: "swap" });

export default function LaboratorioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-lab-raiz
      className={`${plex.variable} ${geist.variable} ${manrope.variable} ${dmSans.variable} ${source.variable}`}
    >
      <LabShell>{children}</LabShell>
    </div>
  );
}
