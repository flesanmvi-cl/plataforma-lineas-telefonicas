// TB-101 · Tabla simple con filas alternas (zebra) y alineación numérica a la derecha.
const DATA = [
  { nombre: "Obra Vespucio", region: "Metropolitana", avance: 92 },
  { nombre: "Obra Aysén", region: "Aysén", avance: 78 },
  { nombre: "Obra Toro", region: "Metropolitana", avance: 65 },
  { nombre: "Obra Dolores", region: "Valparaíso", avance: 54 },
  { nombre: "Obra Colina", region: "Metropolitana", avance: 41 },
];

export function TB101Zebra() {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left font-label text-[10px] uppercase tracking-wider text-faint px-(--densidad-celda-x) py-(--densidad-celda-y)">Obra</th>
            <th className="text-left font-label text-[10px] uppercase tracking-wider text-faint px-(--densidad-celda-x) py-(--densidad-celda-y)">Región</th>
            <th className="text-right font-label text-[10px] uppercase tracking-wider text-faint px-(--densidad-celda-x) py-(--densidad-celda-y)">Avance</th>
          </tr>
        </thead>
        <tbody>
          {DATA.map((d, i) => (
            <tr key={d.nombre} className={i % 2 === 1 ? "bg-surface-2" : ""}>
              <td className="px-(--densidad-celda-x) py-(--densidad-celda-y) font-body text-text">{d.nombre}</td>
              <td className="px-(--densidad-celda-x) py-(--densidad-celda-y) font-body text-muted">{d.region}</td>
              <td className="px-(--densidad-celda-x) py-(--densidad-celda-y) font-body text-text text-right tabular">{d.avance}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
