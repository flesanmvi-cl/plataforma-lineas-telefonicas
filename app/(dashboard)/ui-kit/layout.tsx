import { notFound } from "next/navigation";

// La Guía de estilo trae su propio encabezado e índice (components/guia-estilo.tsx). En esta
// plataforma es solo una referencia para desarrollar: en producción no se publica.
export default function UiKitLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound();
  return children;
}
