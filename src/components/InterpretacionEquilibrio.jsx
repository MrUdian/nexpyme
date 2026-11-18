import { numero, pesos } from '../lib/formato.js'

const Flecha = ({ arriba }) => (
  <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true" className="shrink-0">
    <path
      d={arriba ? 'M12 20V5M5 11l7-7 7 7' : 'M12 4v15M5 13l7 7 7-7'}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const PERIODO = { mes: 'al mes', semana: 'a la semana' }

/** Cuadros grandes al lado de la gráfica: arriba ganas, justo ni ganas ni pierdes, abajo pierdes */
export default function InterpretacionEquilibrio({ resultado }) {
  const { tipoCalculo, unidades, valor, unidad, periodo } = resultado
  const meta =
    tipoCalculo === 'pesos'
      ? pesos(valor)
      : `${numero(unidades, 0)} ${unidades === 1 ? unidad[0] : unidad[1]}`
  const enDinero = tipoCalculo === 'pesos' ? '' : ` (${pesos(valor)})`
  const cuando = PERIODO[periodo]

  return (
    <div className="flex flex-col gap-3" aria-label="Qué significa la gráfica">
      <h3 className="m-0 text-xl font-display">¿Qué significa?</h3>
      <div className="rounded-2xl border-2 border-verde/40 bg-verde-claro p-5 flex gap-3 items-start text-verde">
        <Flecha arriba />
        <p className="m-0 text-xl leading-snug text-tinta">
          Si vendes <strong>más de {meta}</strong>
          {enDinero} {cuando}, <strong className="text-verde">empiezas a tener ganancias.</strong>
        </p>
      </div>
      <div className="rounded-2xl border-2 border-campo bg-white p-5 flex gap-3 items-start">
        <span className="h-[34px] w-[34px] shrink-0 rounded-full border-4 border-tinta bg-white" />
        <p className="m-0 text-xl leading-snug">
          Si vendes <strong>exactamente {meta}</strong>
          {enDinero}, tus gastos son iguales a tus ventas: <strong>no ganas ni pierdes.</strong>
        </p>
      </div>
      <div className="rounded-2xl border-2 border-rojo/30 bg-rojo-claro p-5 flex gap-3 items-start text-rojo">
        <Flecha />
        <p className="m-0 text-xl leading-snug text-tinta">
          Si vendes <strong>menos de {meta}</strong>
          {enDinero} {cuando}, <strong className="text-rojo">empiezas a tener pérdidas.</strong>
        </p>
      </div>
    </div>
  )
}

/** Dos cuadritos: la meta al mes y a la semana */
export function MetaPorPeriodo({ resultado }) {
  const { porPeriodo, tipoCalculo, unidad, periodo } = resultado
  const orden = periodo === 'mes' ? ['mes', 'semana'] : ['semana', 'mes']
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {orden.map((p) => {
        const d = porPeriodo[p]
        return (
          <div
            key={p}
            className={`rounded-xl p-4 bg-white/80 border ${p === periodo ? 'border-tinta/30' : 'border-white'}`}
          >
            <span className="block text-sm font-semibold uppercase tracking-wide text-tenue">
              {p === 'mes' ? 'Al mes' : 'A la semana'}
              {p !== periodo && ' (aproximado)'}
            </span>
            <span className="block font-display text-2xl font-bold">
              {tipoCalculo === 'pesos'
                ? pesos(d.valor)
                : `${numero(d.unidades, 0)} ${d.unidades === 1 ? unidad[0] : unidad[1]}`}
            </span>
            {tipoCalculo !== 'pesos' && (
              <span className="text-suave">{pesos(d.valor)} en ventas</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
