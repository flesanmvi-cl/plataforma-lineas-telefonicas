import type { ReactNode } from "react";
import { CiaLogo } from "@/components/cia-logo";

/**
 * Marco de las pantallas fuera del dashboard (login y «Sin acceso»): fondo oscuro con el brillo de
 * marca y la tarjeta con el nombre de la plataforma. Lo propio de cada pantalla va en `children`,
 * centrado bajo el nombre. La tarjeta es oscura en ambos temas, así que sus textos no usan los
 * tokens del tema (con el tema claro, `text-text` quedaba casi negro sobre negro).
 */
export function MarcoAcceso({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0a0a] px-4">
      {/* Glow ambiental de marca */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1/3 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, #E30613 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-white/[0.08] bg-[#161616]/80 p-10 shadow-2xl backdrop-blur-xl">
          {/* Marca — TODO: reemplazar por el logo real de la plataforma (public/brand/) */}
          <div className="flex flex-col items-center text-center">
            <CiaLogo className="w-14 h-14 mb-5 text-white" />
            <h1 className="font-display text-3xl font-extrabold italic uppercase tracking-tight text-white leading-none">
              Líneas Telefónicas
            </h1>
            <p className="mt-2 font-label text-[11px] font-semibold uppercase tracking-[0.25em] text-flesan-warm">
              Grupo Flesan
            </p>
            <div className="my-6 h-px w-16 bg-white/10" />
            {children}
          </div>
        </div>

        <p className="mt-6 text-center font-label text-[11px] tracking-wider text-flesan-steel">
          Grupo Flesan
        </p>
      </div>
    </main>
  );
}
