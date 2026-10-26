import type { NextConfig } from "next";

// Encabezados de seguridad en todas las respuestas (docs/PLAN.md §3, S12). Sin Content-Security-Policy
// por ahora: el tema (next-themes) inyecta un script en línea; se evalúa en M9.
const ENCABEZADOS_SEGURIDAD = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // Oculta el ícono flotante de Next.js Dev Tools (indicador de build/ruta) en desarrollo.
  devIndicators: false,
  // Genera bundle autónomo en .next/standalone/ para Docker (imagen mínima).
  output: "standalone",
  // Sin el encabezado «X-Powered-By: Next.js».
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:ruta*", headers: ENCABEZADOS_SEGURIDAD }];
  },
  async redirects() {
    // «Líneas» abre un menú con Chile y Perú; quien llega a /lineas directo va a Chile.
    return [{ source: "/lineas", destination: "/lineas/chile", permanent: false }];
  },
};

export default nextConfig;
