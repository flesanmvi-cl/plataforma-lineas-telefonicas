import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oculta el ícono flotante de Next.js Dev Tools (indicador de build/ruta) en desarrollo.
  devIndicators: false,
  // Genera bundle autónomo en .next/standalone/ para Docker (imagen mínima).
  output: "standalone",
};

export default nextConfig;
