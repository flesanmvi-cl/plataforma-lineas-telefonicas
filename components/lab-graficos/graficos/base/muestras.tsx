"use client";

import { useState } from "react";
import { Building2, FileSearch, FolderOpen, HardHat, MoreHorizontal, Mountain, RefreshCw, Route, Upload } from "lucide-react";
import { useTokens } from "@/components/lab-graficos/tema-context";
import type { PropsGraficoLab } from "@/components/lab-graficos/tipos";
import { BotonLab, Girador } from "../botones/boton-lab";
import { estiloEtiqueta } from "../botones/comun";
import { Aviso, BarraProgreso, Chip, Conteo, EstadoVacio, Esqueleto, Insignia, Tarjeta, estiloTarjeta } from "./componentes";

/** Rótulo chico sobre cada bloque de una muestra. */
function Rotulo({ children }: { children: string }) {
  const t = useTokens();
  return <div style={{ ...estiloEtiqueta(t), textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600, marginBottom: 8 }}>{children}</div>;
}

// Chips: filtro (se activan), entrada (con «x») y sugerencia (con «+», se suman a la entrada).
export function MuestraChips({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [sectores, setSectores] = useState<string[]>(["Construcción"]);
  const [filtros, setFiltros] = useState(["Región Metropolitana", "En riesgo"]);
  const sugerencias = ["Obra Norte", "Obra Costa", "Etapa 2"].filter((s) => !filtros.includes(s));
  const SECTORES = [
    { nombre: "Construcción", icono: HardHat, n: 24 },
    { nombre: "Minería", icono: Mountain, n: 9 },
    { nombre: "Vialidad", icono: Route, n: 13 },
  ];
  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, fontFamily: t.fuente }}>
      <div>
        <Rotulo>Filtro</Rotulo>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SECTORES.map((s) => (
            <Chip
              key={s.nombre}
              icono={s.icono}
              conteo={s.n}
              activo={sectores.includes(s.nombre)}
              onClick={() => setSectores((v) => (v.includes(s.nombre) ? v.filter((x) => x !== s.nombre) : [...v, s.nombre]))}
            >
              {s.nombre}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <Rotulo>Entrada</Rotulo>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
          {filtros.map((f) => (
            <Chip key={f} onQuitar={() => setFiltros((v) => v.filter((x) => x !== f))}>
              {f}
            </Chip>
          ))}
          {filtros.length === 0 && <span style={estiloEtiqueta(t)}>Sin filtros aplicados</span>}
          {filtros.length > 0 && (
            <BotonLab variante="texto" tamano="sm" onClick={() => setFiltros([])}>
              Limpiar
            </BotonLab>
          )}
        </div>
      </div>
      <div>
        <Rotulo>Sugerencia</Rotulo>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {sugerencias.map((s) => (
            <Chip key={s} sugerencia onClick={() => setFiltros((v) => [...v, s])}>
              {s}
            </Chip>
          ))}
          {sugerencias.length === 0 && <span style={estiloEtiqueta(t)}>Todas las sugerencias están aplicadas</span>}
        </div>
      </div>
    </div>
  );
}

// Insignias: estado (con punto), conteo y «nuevo», en variantes suave, sólida y contorno.
export function MuestraInsignias({ alto }: PropsGraficoLab) {
  const t = useTokens();
  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, fontFamily: t.fuente }}>
      <div>
        <Rotulo>Estado</Rotulo>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Insignia tono="bueno" punto>
            En plazo
          </Insignia>
          <Insignia tono="alerta" punto>
            En riesgo
          </Insignia>
          <Insignia tono="malo" punto>
            Atrasado
          </Insignia>
          <Insignia tono="neutro" punto>
            Borrador
          </Insignia>
        </div>
      </div>
      <div>
        <Rotulo>Sólida y contorno</Rotulo>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Insignia tono="bueno" variante="solida">
            Aprobado
          </Insignia>
          <Insignia tono="malo" variante="solida">
            Rechazado
          </Insignia>
          <Insignia tono="alerta" variante="contorno">
            Pendiente
          </Insignia>
          <Insignia tono="neutro" variante="contorno">
            Archivado
          </Insignia>
        </div>
      </div>
      <div>
        <Rotulo>Conteo y novedad</Rotulo>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, fontSize: t.tamano.etiqueta, color: t.texto }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Por aprobar <Conteo n={3} etiqueta="por aprobar" />
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Observaciones <Conteo n={12} tono="neutro" etiqueta="observaciones" />
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Avisos <Conteo n={140} etiqueta="avisos" />
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Reporte de avance <Insignia tono="acento">Nuevo</Insignia>
          </span>
        </div>
      </div>
    </div>
  );
}

// Tarjetas: contenedor simple, con encabezado y acciones, seleccionable y con ícono.
export function MuestraTarjetas({ alto }: PropsGraficoLab) {
  const [plan, setPlan] = useState("mensual");
  return (
    <div style={{ minHeight: alto, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", alignContent: "center", gap: 12 }}>
      <Tarjeta>Contenedor simple: agrupa contenido sin encabezado ni acciones. Hereda la superficie del tema.</Tarjeta>
      <Tarjeta
        titulo="Obra Norte"
        subtitulo="Edificio habitacional · Etapa 2"
        acciones={<BotonLab variante="fantasma" tamano="sm" soloIcono icono={MoreHorizontal} aria-label="Más acciones de Obra Norte" title="Más acciones" />}
        pie={
          <>
            <Insignia tono="bueno" punto>
              En plazo
            </Insignia>
            <span style={{ marginLeft: "auto" }}>
              <BotonLab variante="texto" tamano="sm">
                Ver detalle
              </BotonLab>
            </span>
          </>
        }
      >
        Avance físico 64 % · Próximo hito: losa piso 8.
      </Tarjeta>
      <div role="group" aria-label="Frecuencia del informe" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <Tarjeta titulo="Informe mensual" subtitulo="Cierre el día 25" seleccionada={plan === "mensual"} onSeleccionar={() => setPlan("mensual")} />
        <Tarjeta titulo="Informe semanal" subtitulo="Cierre los viernes" seleccionada={plan === "semanal"} onSeleccionar={() => setPlan("semanal")} />
      </div>
      <Tarjeta icono={Building2} titulo="Con ícono" subtitulo="Módulo de obras">
        El ícono en el acento ayuda a reconocer el módulo de un vistazo.
      </Tarjeta>
    </div>
  );
}

// Estados de carga: esqueletos de lista, tarjeta y tabla; spinner; barra de progreso.
export function MuestraCarga({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const [avance, setAvance] = useState(35);

  const tarjeta = { ...estiloTarjeta(t), padding: 12 };
  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, fontFamily: t.fuente }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }} aria-busy>
        <div style={tarjeta}>
          <Rotulo>Lista</Rotulo>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Esqueleto ancho={24} alto={24} redondo />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <Esqueleto ancho={`${80 - i * 15}%`} alto={9} />
                <Esqueleto ancho="45%" alto={7} />
              </div>
            </div>
          ))}
        </div>
        <div style={tarjeta}>
          <Rotulo>Tarjeta</Rotulo>
          <Esqueleto alto={50} style={{ marginBottom: 8 }} />
          <Esqueleto ancho="70%" alto={10} style={{ marginBottom: 6 }} />
          <Esqueleto ancho="40%" alto={8} />
        </div>
        <div style={tarjeta}>
          <Rotulo>Tabla</Rotulo>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, padding: "5px 0", borderBottom: `1px solid ${t.grilla}` }}>
              <Esqueleto alto={i === 0 ? 7 : 9} ancho={i === 0 ? "50%" : "85%"} />
              <Esqueleto alto={i === 0 ? 7 : 9} />
              <Esqueleto alto={i === 0 ? 7 : 9} />
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", gap: "10px 14px", fontSize: t.tamano.etiqueta, color: t.texto }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, color: t.textoSuave }} role="status">
          <span style={{ color: t.acento, display: "inline-flex" }}>
            <Girador tamano={18} />
          </span>
          Cargando datos…
        </span>
        <BarraProgreso etiqueta="Sincronización con ERP" />
        <span style={{ fontVariantNumeric: "tabular-nums", color: t.textoSuave }}>Subida {avance} %</span>
        <BarraProgreso etiqueta="Subida de planos" valor={avance} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <BotonLab variante="contorno" tamano="sm" icono={Upload} onClick={() => setAvance((a) => (a >= 100 ? 0 : Math.min(100, a + 20)))}>
          Avanzar subida
        </BotonLab>
      </div>
    </div>
  );
}

// Avisos en línea: info, éxito, advertencia y error (este con acción).
export function MuestraAvisos({ alto }: PropsGraficoLab) {
  const [visible, setVisible] = useState(true);
  return (
    <div style={{ minHeight: alto, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
      <Aviso tipo="info">El cierre mensual de estados de pago es el día 25.</Aviso>
      {visible ? (
        <Aviso tipo="exito" titulo="Solicitud enviada" onCerrar={() => setVisible(false)}>
          Quedó en revisión del jefe de obra. Te avisaremos por correo.
        </Aviso>
      ) : (
        <div>
          <BotonLab variante="texto" tamano="sm" onClick={() => setVisible(true)}>
            Mostrar de nuevo el aviso de éxito
          </BotonLab>
        </div>
      )}
      <Aviso tipo="advertencia">El presupuesto de la partida supera en 8 % lo aprobado.</Aviso>
      <Aviso
        tipo="error"
        titulo="No se pudo guardar"
        acciones={
          <BotonLab variante="contorno" tamano="sm" icono={RefreshCw}>
            Reintentar
          </BotonLab>
        }
      >
        Se perdió la conexión con el servidor. Tus cambios siguen en esta pantalla.
      </Aviso>
    </div>
  );
}

// Estado vacío: sin resultados por filtro (acción de limpiar) y sin datos aún (acción principal).
export function MuestraVacio({ alto }: PropsGraficoLab) {
  const t = useTokens();
  const caja = { ...estiloTarjeta(t) };
  return (
    <div style={{ minHeight: alto, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", alignContent: "center", gap: 12 }}>
      <div style={caja}>
        <EstadoVacio
          icono={FileSearch}
          titulo="Sin resultados"
          acciones={
            <BotonLab variante="contorno" tamano="sm">
              Limpiar filtros
            </BotonLab>
          }
        >
          Ninguna obra cumple con «Vialidad» y «Atrasado». Prueba quitando un filtro.
        </EstadoVacio>
      </div>
      <div style={caja}>
        <EstadoVacio
          icono={FolderOpen}
          titulo="Aún no hay documentos"
          acciones={
            <BotonLab tamano="sm" icono={Upload}>
              Subir documento
            </BotonLab>
          }
        >
          Sube el primer contrato o plano de la obra para empezar.
        </EstadoVacio>
      </div>
    </div>
  );
}
