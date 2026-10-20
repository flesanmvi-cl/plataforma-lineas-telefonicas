"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

/** Si una pieza falla al dibujarse, muestra el error en su lugar sin botar la pantalla. */
export class LimiteError extends Component<{ nombre: string; children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };

  static getDerivedStateFromError(e: Error) {
    return { error: e.message };
  }

  componentDidCatch(e: Error, info: ErrorInfo) {
    console.error(`[estandar] ${this.props.nombre}`, e, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="w-full h-full flex items-center justify-center text-center text-xs text-muted border border-dashed border-border-strong rounded-flesan-sm p-4">
          No se pudo dibujar este gráfico: {this.state.error}
        </div>
      );
    }
    return this.props.children;
  }
}
