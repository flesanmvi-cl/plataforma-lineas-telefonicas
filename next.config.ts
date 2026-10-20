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
  async redirects() {
    return [
      // El laboratorio de diseño pasó a ser otro proyecto (_prototipos/laboratorio-diseno): sus
      // rutas viejas caen en la Guía de estilo.
      ...["/ui-kit/:seccion(graficos|kpis|tablas|botones|formularios|escala)", "/ui-kit/laboratorio/:ruta*", "/ui-kit/laboratorio-graficos/:ruta*"].map(
        (source) => ({ source, destination: "/ui-kit", permanent: false }),
      ),
      // Presentaciones pasó a Configuración (abierta a todos los usuarios).
      { source: "/presentaciones", destination: "/configuracion/presentaciones", permanent: false },
      // Costos y la ficha de obra pasaron a ser los Reportes Tipo 4 y 5.
      { source: "/pruebas/reportes/costos", destination: "/plantillas/reportes/tipo-4", permanent: false },
      { source: "/pruebas/reportes/obra", destination: "/plantillas/reportes/tipo-5", permanent: false },
      // «Pruebas» pasó a llamarse «Plantillas» (2026-10-20).
      { source: "/pruebas", destination: "/plantillas", permanent: false },
      { source: "/pruebas/:ruta*", destination: "/plantillas/:ruta*", permanent: false },
    ];
  },
};

export default nextConfig;
