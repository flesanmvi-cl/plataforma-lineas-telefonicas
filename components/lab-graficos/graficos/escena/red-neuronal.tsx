"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { useMovimiento } from "../efectos/comun";

const N = 90;
const CAJA = { x: 7, y: 3.2, z: 2 };
const DIST = 1.15;

function Red({ base, acento, activo, velocidad }: { base: string; acento: string; activo: boolean; velocidad: number }) {
  const puntos = useRef<THREE.Points>(null);
  const lineas = useRef<THREE.LineSegments>(null);

  const { pos, vel, colores, lineaPos, lineaCol } = useMemo(() => {
    const pos = new Float32Array(N * 3);
    const vel = new Float32Array(N * 3);
    const colores = new Float32Array(N * 3);
    const cb = new THREE.Color(base);
    const ca = new THREE.Color(acento);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * CAJA.x * 2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * CAJA.y * 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * CAJA.z * 2;
      for (let k = 0; k < 3; k++) vel[i * 3 + k] = (Math.random() - 0.5) * 0.006;
      // Uno de cada siete nodos va en el acento: la red es gris y el rojo marca lo que importa.
      const c = i % 7 === 0 ? ca : cb;
      colores.set([c.r, c.g, c.b], i * 3);
    }
    const max = N * 12;
    return { pos, vel, colores, lineaPos: new Float32Array(max * 6), lineaCol: new Float32Array(max * 6) };
  }, [base, acento]);

  useFrame(({ pointer }) => {
    const mx = pointer.x * CAJA.x;
    const my = pointer.y * CAJA.y;
    if (activo) {
      for (let i = 0; i < N; i++) {
        const j = i * 3;
        // Atracción leve hacia el mouse y rebote en los bordes de la caja.
        const dx = mx - pos[j];
        const dy = my - pos[j + 1];
        const d2 = dx * dx + dy * dy;
        if (d2 < 4) {
          vel[j] += dx * 0.00012;
          vel[j + 1] += dy * 0.00012;
        }
        for (let k = 0; k < 3; k++) {
          vel[j + k] = Math.max(-0.012, Math.min(0.012, vel[j + k]));
          pos[j + k] += vel[j + k] * velocidad;
          const lim = k === 0 ? CAJA.x : k === 1 ? CAJA.y : CAJA.z;
          if (Math.abs(pos[j + k]) > lim) vel[j + k] *= -1;
        }
      }
    }
    let s = 0;
    const cb = new THREE.Color(base);
    for (let i = 0; i < N; i++) {
      for (let k = i + 1; k < N; k++) {
        const dx = pos[i * 3] - pos[k * 3];
        const dy = pos[i * 3 + 1] - pos[k * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[k * 3 + 2];
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (d > DIST || s >= lineaPos.length / 6) continue;
        const a = 1 - d / DIST;
        lineaPos.set([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], pos[k * 3], pos[k * 3 + 1], pos[k * 3 + 2]], s * 6);
        lineaCol.set([cb.r * a, cb.g * a, cb.b * a, cb.r * a, cb.g * a, cb.b * a], s * 6);
        s++;
      }
    }
    if (puntos.current) puntos.current.geometry.attributes.position.needsUpdate = true;
    if (lineas.current) {
      const g = lineas.current.geometry;
      g.setDrawRange(0, s * 2);
      g.attributes.position.needsUpdate = true;
      g.attributes.color.needsUpdate = true;
    }
  });

  return (
    <group>
      <points ref={puntos}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[colores, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.13} vertexColors sizeAttenuation />
      </points>
      <lineSegments ref={lineas}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lineaPos, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineaCol, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.55} />
      </lineSegments>
    </group>
  );
}

// Red neuronal de fondo para portada o login: nodos que derivan y se conectan cuando están
// cerca, con una atracción leve hacia el mouse. El texto va encima, en HTML.
export function RedNeuronal({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const { activo, escala } = useMovimiento(t);
  return (
    <div style={{ height: alto, position: "relative", overflow: "hidden", borderRadius: t.radio, fontFamily: t.fuente }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 7], fov: 50 }}
        frameloop={activo ? "always" : "demand"}
        gl={{ antialias: true, alpha: true }}
        style={{ position: "absolute", inset: 0 }}
      >
        <Red key={`${t.oscuro}-${t.acento}`} base={t.textoSuave} acento={t.acento} activo={activo} velocidad={escala ? 1 / escala : 1} />
      </Canvas>
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 6,
          padding: "0 8%",
          pointerEvents: "none",
          background: `linear-gradient(90deg, ${t.fondoTarjeta} 0%, ${t.fondoTarjeta}CC 35%, transparent 70%)`,
        }}
      >
        <span className="label-eyebrow brand-bullet">Portal CIA</span>
        <span style={{ fontSize: 30, fontWeight: 800, color: t.texto, lineHeight: 1.1, maxWidth: 420 }}>Centro de Inteligencia Analítica</span>
        <span style={{ fontSize: 14, color: t.textoSuave }}>Confianza que construye</span>
      </div>
    </div>
  );
}
