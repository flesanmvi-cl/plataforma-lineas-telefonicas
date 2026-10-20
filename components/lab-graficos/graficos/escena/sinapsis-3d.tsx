"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { useMovimiento } from "../efectos/comun";

// Geometría canónica del símbolo Sinapsis (la misma de components/cia-logo.tsx), en el sistema
// del SVG: 0-100 con el centro en (50, 50) y la y hacia abajo.
const NODOS: [number, number, number][] = [
  [50, 9, 5.4],
  [76.046, 28.145, 4.4],
  [93.572, 56.124, 6.2],
  [66.634, 73.755, 4],
  [40.565, 87.842, 5.2],
  [23.153, 65.5, 4.6],
  [10.588, 38.699, 5.6],
  [33.377, 28.724, 3.8],
];
const INICIOS: [number, number][] = [
  [50, 41],
  [56.894, 44.215],
  [58.912, 51.253],
  [55.162, 57.372],
  [47.823, 58.733],
  [42.206, 54.5],
  [41.349, 47.519],
  [44.459, 42.908],
];
// Profundidad de cada nodo: el símbolo es plano, pero al girar se nota que es una red.
const PROF = [0.18, -0.12, 0.08, -0.2, 0.14, -0.06, 0.2, -0.16];
const ESC = 25;
const v3 = (x: number, y: number, z = 0) => new THREE.Vector3((x - 50) / ESC, -(y - 50) / ESC, z);

function Simbolo({ color, pulso, activo, velocidad }: { color: string; pulso: string; activo: boolean; velocidad: number }) {
  const giro = useRef<THREE.Group>(null);
  const plano = useRef<THREE.Group>(null);
  const pulsos = useRef<(THREE.Mesh | null)[]>([]);
  const nodos = useRef<(THREE.Mesh | null)[]>([]);

  // El skew de −9° es parte del símbolo: se aplica como cizalle a todo el grupo.
  useLayoutEffect(() => {
    const g = plano.current;
    if (!g) return;
    g.matrixAutoUpdate = false;
    g.matrix.copy(new THREE.Matrix4().makeShear(Math.tan((9 * Math.PI) / 180), 0, 0, 0, 0, 0));
  }, []);

  const espigas = useMemo(
    () =>
      NODOS.map(([x, y], i) => {
        const a = v3(INICIOS[i][0], INICIOS[i][1]);
        const b = v3(x, y, PROF[i]);
        const largo = a.distanceTo(b);
        const medio = a.clone().add(b).multiplyScalar(0.5);
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
        return { a, b, largo, medio, q };
      }),
    [],
  );

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime() * velocidad;
    if (giro.current) {
      const objY = activo ? Math.sin(t * 0.35) * 0.45 + pointer.x * 0.5 : 0;
      const objX = activo ? -pointer.y * 0.35 : 0;
      giro.current.rotation.y += (objY - giro.current.rotation.y) * 0.06;
      giro.current.rotation.x += (objX - giro.current.rotation.x) * 0.06;
    }
    espigas.forEach((e, i) => {
      const p = pulsos.current[i];
      const n = nodos.current[i];
      if (!p || !n) return;
      // Cada espiga dispara un impulso con su propio desfase; el nodo late cuando llega.
      const fase = (t * 0.55 + i * 0.37) % 1.6;
      const k = Math.min(1, fase);
      p.visible = activo && fase < 1;
      p.position.lerpVectors(e.a, e.b, k * k);
      const llegada = activo ? Math.max(0, 1 - Math.abs(fase - 1) * 5) : 0;
      n.scale.setScalar(1 + llegada * 0.45);
    });
  });

  return (
    <group ref={giro}>
      <group ref={plano}>
        {NODOS.map(([x, y, r], i) => (
          <mesh key={`n${i}`} ref={(m) => void (nodos.current[i] = m)} position={v3(x, y, PROF[i])}>
            <sphereGeometry args={[r / ESC, 32, 16]} />
            <meshStandardMaterial color={color} roughness={0.35} metalness={0.1} />
          </mesh>
        ))}
        {espigas.map((e, i) => (
          <mesh key={`e${i}`} position={e.medio} quaternion={e.q}>
            <cylinderGeometry args={[1.7 / ESC, 1.7 / ESC, e.largo, 12]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
        ))}
        <mesh>
          <torusGeometry args={[6.3 / ESC, 2.7 / ESC, 24, 64]} />
          <meshStandardMaterial color={color} roughness={0.35} metalness={0.1} />
        </mesh>
        {espigas.map((_, i) => (
          <mesh key={`p${i}`} ref={(m) => void (pulsos.current[i] = m)} visible={false}>
            <sphereGeometry args={[2.4 / ESC, 16, 12]} />
            <meshBasicMaterial color={pulso} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Símbolo Sinapsis en 3D: los impulsos viajan por las espigas y los nodos laten al recibirlos;
// gira suave y sigue al mouse. Rojo sobre claro y blanco sobre oscuro, como el logo plano.
export function Sinapsis3D({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const { activo, escala } = useMovimiento(t);
  const color = t.oscuro ? "#F4F4F4" : t.acento;
  const pulso = t.oscuro ? t.acento : t.texto;
  return (
    <div style={{ height: alto, position: "relative", fontFamily: t.fuente }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 6.2], fov: 35 }} frameloop={activo ? "always" : "demand"} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={t.oscuro ? 0.9 : 1.1} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        <directionalLight position={[-4, -2, 2]} intensity={0.4} />
        <Simbolo color={color} pulso={pulso} activo={activo} velocidad={escala ? 1 / escala : 1} />
      </Canvas>
      <span style={{ position: "absolute", left: 0, bottom: 0, fontSize: 11.5, color: t.textoSuave, pointerEvents: "none" }}>Mueve el mouse sobre el símbolo</span>
    </div>
  );
}
