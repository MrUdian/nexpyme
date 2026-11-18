import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { numero, pesos } from '../lib/formato.js'

const COLOR = {
  ventas: '#2456C7',
  costos: '#D23B3B',
  fijos: '#1F8F3A',
  perdida: '#F4A3A3',
  ganancia: '#9FDDB0',
}

const corto = (n) => {
  if (n >= 1_000_000) return `$${numero(n / 1_000_000, 1)} M`
  if (n >= 1_000) return `$${numero(n / 1_000, 0)} mil`
  return `$${numero(n, 0)}`
}

/** Etiqueta grande dentro de la gráfica ("Pérdidas", "Ganancias") */
const Rotulo = ({ viewBox, texto, color, fondo, alIzquierda }) => {
  if (!viewBox) return null
  const ancho = texto.length * 10 + 24
  // Si la zona es muy angosta, el rótulo empieza en el punto en vez de centrarse
  const centro = alIzquierda ? viewBox.x + ancho / 2 : viewBox.x
  return (
    <g>
      <rect
        x={centro - ancho / 2}
        y={viewBox.y - 15}
        width={ancho}
        height={30}
        rx={8}
        fill={fondo}
        stroke={color}
        strokeWidth={2}
      />
      <text
        x={centro}
        y={viewBox.y + 5}
        textAnchor="middle"
        fontWeight={800}
        fontSize={15}
        fill={color}
      >
        {texto}
      </text>
    </g>
  )
}

/**
 * Gráfica de punto de equilibrio:
 * línea de gastos fijos, línea de costos totales, línea de ventas,
 * el punto donde se cruzan y las zonas de pérdidas (rojo) y ganancias (verde).
 */
export default function GraficaEquilibrio({ resultado }) {
  const { grafica, valor, tipoCalculo, unidad, unidadesExactas } = resultado
  const enPesos = tipoCalculo === 'pesos'
  const xPE = enPesos ? valor : unidadesExactas
  const xMax = grafica.at(-1).x
  const fijos = grafica[0].fijos

  // Los rótulos van a la mitad entre la línea de ventas y la de costos
  const ultimo = grafica.at(-1)
  const pendienteVentas = ultimo.ingresos / ultimo.x
  const pendienteCosto = (ultimo.costos - fijos) / ultimo.x
  const enMedio = (x) => (x * pendienteVentas + fijos + x * pendienteCosto) / 2
  const angosta = xPE / xMax < 0.25
  const xPerdida = angosta ? xPE * 0.08 : xPE * 0.35
  const xGanancia = xPE + (xMax - xPE) * 0.7
  const yPerdida = enMedio(xPerdida)
  const yGanancia = enMedio(xGanancia)

  const textoX = (n) => (enPesos ? corto(n) : numero(n, 0))
  const nombreX = enPesos ? 'Ventas en pesos' : `${unidad?.[1] ?? 'Unidades'} vendidos`

  return (
    <figure className="m-0 bg-white rounded-2xl border border-borde p-5 flex flex-col gap-3">
      <figcaption className="flex flex-col gap-1">
        <strong className="text-xl font-display">¿Dónde está tu punto de equilibrio?</strong>
        <span className="text-tenue">
          Es donde se cruzan la línea <b style={{ color: COLOR.ventas }}>azul</b> (lo que vendes) y
          la <b style={{ color: COLOR.costos }}>roja</b> (lo que gastas). Antes del cruce está la
          zona de <b className="text-rojo">pérdidas</b>; después, la de{' '}
          <b className="text-verde">ganancias</b>.
        </span>
      </figcaption>
      <div className="w-full h-96" role="img" aria-label="Gráfica de punto de equilibrio">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={grafica} margin={{ top: 30, right: 24, bottom: 28, left: 8 }}>
            <CartesianGrid stroke="#E4E8E2" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[0, xMax]}
              tickFormatter={textoX}
              label={{
                value: nombreX.charAt(0).toUpperCase() + nombreX.slice(1),
                position: 'insideBottom',
                offset: -16,
                fontWeight: 600,
              }}
              tick={{ fontSize: 13 }}
            />
            <YAxis tickFormatter={corto} width={72} tick={{ fontSize: 13 }} />
            <Tooltip
              formatter={(v, nombre) => (Array.isArray(v) ? [null, null] : [pesos(v), nombre])}
              labelFormatter={(x) =>
                enPesos ? `Si vendes ${pesos(x)}` : `Si vendes ${numero(x, 0)} ${unidad?.[1] ?? ''}`
              }
            />
            <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: 30 }} />

            {/* Zonas de color */}
            <Area
              dataKey="perdida"
              name="Zona de pérdidas"
              fill={COLOR.perdida}
              fillOpacity={0.55}
              stroke="none"
              isAnimationActive={false}
              legendType="square"
              activeDot={false}
            />
            <Area
              dataKey="ganancia"
              name="Zona de ganancias"
              fill={COLOR.ganancia}
              fillOpacity={0.6}
              stroke="none"
              isAnimationActive={false}
              legendType="square"
              activeDot={false}
            />

            {/* Líneas */}
            <Line
              name="Gastos fijos"
              dataKey="fijos"
              stroke={COLOR.fijos}
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              name="Lo que gastas (costos totales)"
              dataKey="costos"
              stroke={COLOR.costos}
              strokeWidth={4}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              name="Lo que vendes (ventas)"
              dataKey="ingresos"
              stroke={COLOR.ventas}
              strokeWidth={4}
              dot={false}
              isAnimationActive={false}
            />

            <ReferenceLine x={xPE} stroke="#0F2A24" strokeDasharray="5 5" />
            {enPesos && resultado.ventas && (
              <ReferenceLine
                x={resultado.ventas}
                stroke="#6B4300"
                strokeWidth={2}
                label={{
                  value: 'Tus ventas hoy',
                  position: 'top',
                  fontWeight: 700,
                  fill: '#6B4300',
                }}
              />
            )}
            {xPE > 0 && (
              <ReferenceDot
                x={xPerdida}
                y={yPerdida}
                r={0}
                label={
                  <Rotulo texto="Pérdidas" color="#B42318" fondo="#FDE2DD" alIzquierda={angosta} />
                }
              />
            )}
            <ReferenceDot
              x={xGanancia}
              y={yGanancia}
              r={0}
              label={<Rotulo texto="Ganancias" color="#0B5E4D" fondo="#D9F2EA" />}
            />
            <ReferenceDot
              x={xPE}
              y={valor}
              r={10}
              fill="#fff"
              stroke="#0F2A24"
              strokeWidth={4}
              label={{
                value: 'Punto de equilibrio',
                position: 'top',
                offset: 16,
                fontWeight: 800,
                fill: '#0F2A24',
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}
