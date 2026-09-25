import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oculta el ícono flotante de Next.js Dev Tools (indicador de build/ruta) en desarrollo.
  devIndicators: false,
  // Genera bundle autónomo en .next/standalone/ para Docker (imagen mínima).
  output: "standalone",
  // Las pestañas de componentes de /ui-kit se reemplazaron por el laboratorio de diseño.
  async redirects() {
    const lab = "/ui-kit/laboratorio";
    return [
      ...["graficos", "kpis", "tablas", "botones", "formularios"].map((s) => ({ source: `/ui-kit/${s}`, destination: `${lab}/${s}`, permanent: false })),
      { source: "/ui-kit/laboratorio-graficos", destination: `${lab}/graficos`, permanent: false },
      { source: "/ui-kit/laboratorio-graficos/comparador", destination: `${lab}/graficos/comparador`, permanent: false },
      { source: "/ui-kit/laboratorio-graficos/contexto", destination: `${lab}/contexto`, permanent: false },
    ];
  },
};

export default nextConfig;
