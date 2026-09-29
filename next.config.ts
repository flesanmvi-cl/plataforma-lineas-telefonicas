import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oculta el ícono flotante de Next.js Dev Tools (indicador de build/ruta) en desarrollo.
  devIndicators: false,
  // Genera bundle autónomo en .next/standalone/ para Docker (imagen mínima).
  output: "standalone",
  // pptxgenjs (PowerPoint de las presentaciones) trae import("node:fs") opcionales y webpack no
  // entiende el esquema «node:». Se le quita el prefijo; en el navegador, el campo «browser» de
  // pptxgenjs ya los deja vacíos.
  webpack(config, { webpack }) {
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/^node:/, (recurso: { request: string }) => {
        recurso.request = recurso.request.replace(/^node:/, "");
      }),
    );
    return config;
  },
  // Las pestañas de componentes de /ui-kit se reemplazaron por el laboratorio de diseño.
  async redirects() {
    const lab = "/ui-kit/laboratorio";
    return [
      ...["graficos", "kpis", "tablas", "botones", "formularios"].map((s) => ({ source: `/ui-kit/${s}`, destination: `${lab}/${s}`, permanent: false })),
      { source: "/ui-kit/laboratorio-graficos", destination: `${lab}/graficos`, permanent: false },
      // Presentaciones pasó a Configuración (abierta a todos los usuarios).
      { source: "/presentaciones", destination: "/configuracion/presentaciones", permanent: false },
      { source: "/ui-kit/laboratorio-graficos/comparador", destination: `${lab}/graficos/comparador`, permanent: false },
      { source: "/ui-kit/laboratorio-graficos/contexto", destination: `${lab}/contexto`, permanent: false },
    ];
  },
};

export default nextConfig;
