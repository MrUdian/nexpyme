import { useRef } from 'react'
import { Link } from 'react-router'
import { CampoDinero } from '../components/Campos.jsx'
import GraficaEquilibrio from '../components/GraficaEquilibrio.jsx'
import InterpretacionEquilibrio, {
  MetaPorPeriodo,
} from '../components/InterpretacionEquilibrio.jsx'
import {
  AvisoCambios,
  BotonesFormulario,
  ComoSeCalcula,
  Encabezado,
  Esperando,
  Opciones,
  ResumenDatos,
} from '../components/Pagina.jsx'
import { AccionesResultado, AvisoError, TarjetaResultado } from '../components/Resultado.jsx'
import { BarraGiros, SoloConGiro } from '../components/SelectorGiros.jsx'
import { useGiros } from '../context/GiroContext.jsx'
import { puntoEquilibrio, puntoEquilibrioTotal } from '../lib/finanzas.js'
import { aNumero, aNumeroOCero, pesos } from '../lib/formato.js'
import { EJEMPLOS, textosDe } from '../lib/giros.js'
import { useRecordado } from '../lib/recordar.js'
import { useInventario } from '../lib/inventario.js'

const VACIO = {
  gastosFijos: '',
  precio: '',
  costo: '',
  ventas: '',
  costoVendido: '',
  otrosVariables: '',
}

const DEL_PERIODO = { mes: 'del mes', semana: 'de la semana' }
const EN_EL = { mes: 'en el mes', semana: 'en la semana' }

export default function PuntoEquilibrio() {
  const { giros } = useGiros()
  const t = textosDe(giros)
  const { totales: inventario } = useInventario()

  // Para un negocio solo comercial, lo normal es calcular con todos sus productos
  const metodoInicial = giros.length === 1 && giros[0] === 'comercial' ? 'total' : 'uno'
  // Todo se recuerda al cambiar de sección (ver lib/recordar.js)
  const [metodo, setMetodo] = useRecordado('pe-metodo', metodoInicial)
  const [periodo, setPeriodo] = useRecordado('pe-periodo', 'mes')
  const [datos, setDatos] = useRecordado('pe-datos', VACIO)
  const [aplicado, setAplicado] = useRecordado('pe-resultado', null)
  const [conInventario, setConInventario] = useRecordado('pe-con-inventario', false)
  const [inv, setInv] = useRecordado('pe-inventario', { inicial: '', compras: '', final: '' })
  const reporte = useRef(null)

  const poner = (campo) => (valor) => setDatos((d) => ({ ...d, [campo]: valor }))
  const paraCalcular = () => ({ ...datos, metodo, periodo })

  const resultado = aplicado
    ? aplicado.metodo === 'total'
      ? puntoEquilibrioTotal(aplicado)
      : puntoEquilibrio(aplicado)
    : null

  // Costo de lo vendido con el inventario: inicial + compras − final
  const ponerInv = (campo) => (valor) => {
    const nuevo = { ...inv, [campo]: valor }
    setInv(nuevo)
    const costo =
      aNumeroOCero(nuevo.inicial) + aNumeroOCero(nuevo.compras) - aNumeroOCero(nuevo.final)
    setDatos((d) => ({
      ...d,
      costoVendido: costo > 0 ? String(Math.round(costo * 100) / 100) : '',
    }))
  }

  const calcular = (d) => setAplicado({ ...d, unidad: t.unidad })

  const verEjemplo = (giro) => {
    const ej = { ...VACIO, ...(metodo === 'total' ? EJEMPLOS[giro].peTotal : EJEMPLOS[giro].peUno) }
    setDatos(ej)
    setPeriodo('mes')
    setConInventario(false)
    setAplicado({ ...ej, metodo, periodo: 'mes', unidad: textosDe([giro]).unidad })
  }

  const cambiado =
    aplicado &&
    JSON.stringify({ ...aplicado, unidad: undefined }) !==
      JSON.stringify({ ...paraCalcular(), unidad: undefined })

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col gap-8">
      <Encabezado nombre="Punto de equilibrio" pregunta="¿Cuánto tengo que vender para no perder?">
        Es lo que necesitas vender para pagar todos tus gastos. Si vendes menos, pierdes. Si vendes
        más, ganas.
      </Encabezado>

      <BarraGiros onEjemplo={verEjemplo} />

      <SoloConGiro>
        <section
          aria-label="Cómo calcular"
          className="bg-white border border-borde rounded-2xl p-6 flex flex-col gap-5"
        >
          <h2 className="m-0 text-2xl">Antes de empezar: elige cómo calcular</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <Opciones
                titulo="¿Cómo quieres calcularlo?"
                value={metodo}
                onChange={setMetodo}
                opciones={[
                  {
                    valor: 'uno',
                    texto: `Por ${t.unidad[0]}`,
                    detalle: 'La meta sale en cantidad (ej.: 175 cortes)',
                  },
                  {
                    valor: 'total',
                    texto: 'Todo mi negocio',
                    detalle: 'La meta sale en pesos (ej.: $27,586)',
                  },
                ]}
              />
              <ul className="m-0 pl-5 flex flex-col gap-1.5 text-[16px] text-suave">
                <li>
                  <strong className="text-tinta">Por {t.unidad[0]}:</strong> usas el precio y el
                  costo de una sola cosa. Sirve si vendes siempre lo mismo (como cortes de cabello o
                  un solo tipo de pan) y quieres saber <em>cuántos</em> tienes que vender.
                </li>
                <li>
                  <strong className="text-tinta">Todo mi negocio:</strong> usas el total de tus
                  ventas y de tus costos. Sirve si vendes muchas cosas con precios distintos (como
                  una tienda de abarrotes) y quieres saber <em>cuánto dinero</em> tienes que vender.
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <Opciones
                titulo="¿De qué periodo son tus datos?"
                value={periodo}
                onChange={setPeriodo}
                opciones={[
                  { valor: 'mes', texto: 'De un mes' },
                  { valor: 'semana', texto: 'De una semana' },
                ]}
              />
              <p className="m-0 text-[16px] text-suave">
                Escribe tus gastos y ventas como los tengas a la mano: de un mes o de una semana. No
                importa cuál elijas: te damos la meta <strong>al mes y a la semana</strong>, para
                que sepas cuánto vender en cada una.
              </p>
            </div>
          </div>
        </section>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            calcular(paraCalcular())
          }}
          className="bg-white border border-borde rounded-2xl p-6 flex flex-col gap-6"
        >
          <h2 className="m-0 text-2xl">Escribe tus números</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <CampoDinero
              id="pe-fijos"
              etiqueta={`1. Gastos fijos ${DEL_PERIODO[periodo]}`}
              ayuda={`Lo que pagas sí o sí, vendas o no. Ej.: ${t.fijosEj}.`}
              value={datos.gastosFijos}
              onChange={poner('gastosFijos')}
            />

            {metodo === 'uno' ? (
              <>
                <CampoDinero
                  id="pe-precio"
                  etiqueta={`2. ${t.precio}`}
                  ayuda={t.precioAyuda}
                  value={datos.precio}
                  onChange={poner('precio')}
                />
                <CampoDinero
                  id="pe-costo"
                  etiqueta={`3. ${t.costo}`}
                  ayuda={t.costoAyuda}
                  value={datos.costo}
                  onChange={poner('costo')}
                />
              </>
            ) : (
              <>
                <CampoDinero
                  id="pe-ventas"
                  etiqueta={`2. ¿Cuánto vendes en total ${EN_EL[periodo]}?`}
                  ayuda="Suma el dinero de todas tus ventas, sin restar lo que te costó."
                  value={datos.ventas}
                  onChange={poner('ventas')}
                />
                <div className="flex flex-col gap-2">
                  <CampoDinero
                    id="pe-costo-vendido"
                    etiqueta={`3. ${t.costoVendido}`}
                    ayuda={t.costoVendidoAyuda}
                    value={datos.costoVendido}
                    onChange={poner('costoVendido')}
                  />
                  <button
                    type="button"
                    aria-expanded={conInventario}
                    onClick={() => setConInventario((v) => !v)}
                    className="self-start text-marca-oscuro font-semibold underline bg-transparent cursor-pointer p-0"
                  >
                    {conInventario ? 'Ocultar' : '¿No sabes cuánto? Calcúlalo con tu inventario'}
                  </button>
                </div>
                <CampoDinero
                  id="pe-otros"
                  etiqueta="4. Otros costos que suben o bajan según lo que vendes"
                  ayuda={`Ej.: ${t.otrosVariablesEj}. Si no tienes, déjalo vacío.`}
                  value={datos.otrosVariables}
                  onChange={poner('otrosVariables')}
                />
              </>
            )}
          </div>

          {metodo === 'total' && conInventario && (
            <fieldset className="m-0 rounded-2xl border-2 border-dashed border-oro bg-oro-claro/50 p-5 flex flex-col gap-4">
              <legend className="px-1.5 font-bold text-lg">
                Costo de lo vendido con tu inventario
              </legend>
              <p className="m-0 text-[15px] text-suave">
                Inventario al empezar + lo que compraste − inventario al terminar = lo que te costó
                lo que vendiste. El resultado se pone solo en la casilla 3.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <CampoDinero
                  id="inv-inicial"
                  grande={false}
                  etiqueta="Inventario al empezar"
                  ayuda="Lo que valía tu mercancía el primer día."
                  value={inv.inicial}
                  onChange={ponerInv('inicial')}
                />
                <CampoDinero
                  id="inv-compras"
                  grande={false}
                  etiqueta="Lo que compraste"
                  ayuda="Todas tus compras de mercancía en el periodo."
                  value={inv.compras}
                  onChange={ponerInv('compras')}
                />
                <CampoDinero
                  id="inv-final"
                  grande={false}
                  etiqueta="Inventario al terminar"
                  ayuda="Lo que vale la mercancía que te quedó."
                  value={inv.final}
                  onChange={ponerInv('final')}
                />
              </div>
              {inventario.costo > 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    ponerInv('final')(String(Math.round(inventario.costo * 100) / 100))
                  }
                  className="self-start min-h-11 px-4 rounded-xl bg-white border-2 border-campo font-semibold cursor-pointer hover:bg-fondo"
                >
                  Usar mi inventario guardado como “al terminar” ({pesos(inventario.costo)})
                </button>
              ) : (
                <p className="m-0 text-[15px] text-tenue">
                  Tip: registra tus productos en <Link to="/inventario">Mi inventario</Link> y aquí
                  podrás usar su valor con un clic.
                </p>
              )}
            </fieldset>
          )}

          <BotonesFormulario
            textoCalcular="Calcular"
            onLimpiar={() => {
              setDatos(VACIO)
              setInv({ inicial: '', compras: '', final: '' })
              setAplicado(null)
            }}
          />
        </form>
      </SoloConGiro>

      <section aria-live="polite" aria-label="Resultado" className="flex flex-col gap-4">
        {!resultado && (
          <Esperando>
            Llena las casillas y presiona <strong>Calcular</strong>.
            <br />
            ¿No sabes qué poner? Arriba puedes ver un ejemplo de tu tipo de negocio.
          </Esperando>
        )}
        <AvisoCambios visible={cambiado} />
        {resultado && !resultado.ok && <AvisoError>{resultado.error}</AvisoError>}
        {resultado?.ok && (
          <>
            <div ref={reporte} className="flex flex-col gap-4 bg-fondo">
              <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4 items-start">
                <TarjetaResultado resultado={resultado}>
                  <MetaPorPeriodo resultado={resultado} />
                </TarjetaResultado>
                <ResumenDatos filas={filasResumen(aplicado, resultado)} />
              </div>
              <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-4 items-start">
                <GraficaEquilibrio resultado={resultado} />
                <InterpretacionEquilibrio resultado={resultado} />
              </div>
            </div>
            <AccionesResultado
              tipo="punto_equilibrio"
              datos={aplicado}
              resultado={resultado}
              reporteRef={reporte}
              tituloPdf="Punto de equilibrio"
            />
          </>
        )}
      </section>

      <ComoSeCalcula>
        <strong className="font-sans">Por {t.unidad[0]}:</strong>
        <span>En unidades = Gastos fijos ÷ (Precio de venta − Costo de venta)</span>
        <span>En dinero = Gastos fijos ÷ (1 − Costo de venta ÷ Precio de venta)</span>
        <strong className="font-sans pt-2">Todo mi negocio:</strong>
        <span>Costos variables totales (CVT) = Costo de lo vendido + Otros costos variables</span>
        <span>Margen de contribución (MC) = Ventas totales − CVT</span>
        <span>MC% = MC ÷ Ventas totales</span>
        <span>Punto de equilibrio en pesos = Gastos fijos ÷ MC%</span>
        <span className="font-sans text-tenue pt-2">
          Las unidades se redondean hacia arriba porque no se venden pedazos. Para pasar de mes a
          semana se divide entre 4.33 (52 semanas ÷ 12 meses).
        </span>
      </ComoSeCalcula>
    </div>
  )
}

function filasResumen(a, r) {
  const periodo = DEL_PERIODO[a.periodo]
  if (r.tipoCalculo === 'pesos') {
    return [
      [`Gastos fijos ${periodo}`, pesos(aNumero(a.gastosFijos))],
      [`Ventas totales ${periodo}`, pesos(r.ventas)],
      ['Costo de lo vendido', pesos(aNumero(a.costoVendido))],
      ['Otros costos variables', pesos(aNumeroOCero(a.otrosVariables))],
      ['Costos variables totales', pesos(r.cvt)],
      ['Margen de contribución', `${pesos(r.mc)} (${(r.mcPct * 100).toFixed(2)}%)`],
      ['GANANCIA (O PÉRDIDA) ESTIMADA', pesos(r.utilidad)],
    ]
  }
  return [
    [`Gastos fijos ${periodo}`, pesos(aNumero(a.gastosFijos))],
    [`Precio de cada ${r.unidad[0]}`, pesos(aNumero(a.precio))],
    [`Costo de cada ${r.unidad[0]}`, pesos(aNumero(a.costo))],
    [`Te queda por cada ${r.unidad[0]}`, pesos(r.margen)],
  ]
}
