import { useRef } from 'react'
import { useSearchParams } from 'react-router'
import { CampoDinero, ListaConceptos } from '../components/Campos.jsx'
import { IconoAlcancia, IconoCadena, IconoMonedas } from '../components/Iconos.jsx'
import {
  BotonesFormulario,
  AvisoCambios,
  ComoSeCalcula,
  Encabezado,
  Esperando,
  ResumenDatos,
} from '../components/Pagina.jsx'
import {
  AccionesResultado,
  AvisoError,
  Escala,
  TarjetaResultado,
} from '../components/Resultado.jsx'
import { BarraGiros, SoloConGiro } from '../components/SelectorGiros.jsx'
import { useGiros } from '../context/GiroContext.jsx'
import { endeudamiento, liquidez, rentabilidad, utilidadNeta } from '../lib/finanzas.js'
import { aNumero, aNumeroOCero, numero, pesos } from '../lib/formato.js'
import { EJEMPLOS, textosDe } from '../lib/giros.js'
import { useInventario } from '../lib/inventario.js'
import { useRecordado } from '../lib/recordar.js'

const RAZONES = [
  {
    clave: 'liquidez',
    nombre: 'Liquidez',
    pregunta: '¿Me alcanza para pagar lo que debo?',
    Icono: IconoAlcancia,
  },
  {
    clave: 'endeudamiento',
    nombre: 'Endeudamiento',
    pregunta: '¿Cuánto de mi negocio es prestado?',
    Icono: IconoCadena,
  },
  {
    clave: 'rentabilidad',
    nombre: 'Rentabilidad sobre ventas',
    pregunta: '¿Cuánto gano de verdad?',
    Icono: IconoMonedas,
  },
]

export default function Razones() {
  const [params, setParams] = useSearchParams()
  const actual = RAZONES.find((r) => r.clave === params.get('razon')) ?? RAZONES[0]

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col gap-8">
      <Encabezado nombre="Razones financieras" pregunta="¿Cómo va mi negocio?">
        Son comparaciones entre dos números de tu negocio para saber si va bien o mal. Elige una
        pregunta, escribe tus datos y te explicamos el resultado.
      </Encabezado>

      <div
        role="tablist"
        aria-label="Elige qué quieres saber"
        className="grid sm:grid-cols-3 gap-3"
      >
        {RAZONES.map((r) => {
          const activa = r.clave === actual.clave
          return (
            <button
              key={r.clave}
              role="tab"
              aria-selected={activa}
              onClick={() => setParams({ razon: r.clave }, { replace: true })}
              className={`text-left p-4 rounded-2xl border-2 flex gap-3 items-start cursor-pointer ${
                activa
                  ? 'bg-white border-marca shadow-md'
                  : 'bg-white/50 border-borde hover:border-campo'
              }`}
            >
              <span
                className={`p-2 rounded-xl ${activa ? 'bg-marca text-white' : 'bg-marca-claro text-marca-oscuro'}`}
              >
                <r.Icono />
              </span>
              <span className="flex flex-col">
                <span className="font-bold text-lg leading-snug">{r.pregunta}</span>
                <span className="text-sm text-tenue">{r.nombre}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div role="tabpanel" aria-label={actual.nombre}>
        {actual.clave === 'liquidez' && <Liquidez />}
        {actual.clave === 'endeudamiento' && <Endeudamiento />}
        {actual.clave === 'rentabilidad' && <Rentabilidad />}
      </div>
    </div>
  )
}

/* ================================ LIQUIDEZ ================================ */

const activosBase = (m = ['', '', '']) => [
  { clave: 'caja', fijo: true, monto: m[0] },
  { clave: 'inventario', fijo: true, monto: m[1] },
  { clave: 'cobrar', fijo: true, monto: m[2] },
]

/** Los nombres de los renglones fijos cambian según el giro */
const conTextos = (lista, t) =>
  lista.map((c) => {
    if (!c.fijo) return c
    const textos = {
      caja: { concepto: 'Dinero en caja o en el banco', ayuda: 'El efectivo que tienes hoy.' },
      inventario: { concepto: t.inventario, ayuda: t.inventarioAyuda },
      cobrar: { concepto: t.cobrar, ayuda: 'Ventas que hiciste y todavía no te pagan.' },
    }[c.clave]
    return textos ? { ...c, ...textos } : c
  })
const pasivosBase = (m = ['', '', '']) => [
  { clave: 'proveedores', fijo: true, concepto: 'Lo que les debes a tus proveedores', monto: m[0] },
  {
    clave: 'servicios',
    fijo: true,
    concepto: 'Luz, agua, renta o impuestos que aún no pagas',
    monto: m[1],
  },
  { clave: 'sueldos', fijo: true, concepto: 'Sueldos que todavía debes pagar', monto: m[2] },
]
const soloDatos = (lista) => lista.map(({ concepto, monto }) => ({ concepto, monto }))

function Liquidez() {
  const { giros } = useGiros()
  const t = textosDe(giros)
  const { totales: inventario } = useInventario()
  const [activosEstado, setActivos] = useRecordado('liquidez-activos', activosBase)
  const activos = conTextos(activosEstado, t)
  const [pasivos, setPasivos] = useRecordado('liquidez-pasivos', pasivosBase)
  const [aplicado, setAplicado] = useRecordado('liquidez-resultado', null)
  const verEjemplo = (giro) => {
    const a = activosBase(EJEMPLOS[giro].liquidez.activos)
    const p = pasivosBase(EJEMPLOS[giro].liquidez.pasivos)
    const tEj = textosDe([giro])
    setActivos(a)
    setPasivos(p)
    setAplicado({ activos: soloDatos(conTextos(a, tEj)), pasivos: soloDatos(p) })
  }
  const reporte = useRef(null)
  const resultado = aplicado ? liquidez(aplicado) : null
  const usarInventario = () =>
    setActivos((lista) =>
      lista.map((c) =>
        c.clave === 'inventario'
          ? { ...c, monto: String(Math.round(inventario.costo * 100) / 100) }
          : c,
      ),
    )

  const filasResumen = (lista) =>
    lista
      .filter((c) => aNumeroOCero(c.monto) !== 0)
      .map((c) => [c.concepto || 'Otro', pesos(aNumeroOCero(c.monto))])

  return (
    <div className="flex flex-col gap-6">
      <p className="m-0 text-lg max-w-3xl">
        <strong>Liquidez:</strong> te dice si tienes suficiente dinero (o cosas que pronto serán
        dinero) para pagar lo que debes en el próximo año. Si algo no está en la lista, usa{' '}
        <strong>Agregar otro</strong>.
      </p>
      <BarraGiros onEjemplo={verEjemplo} />
      <SoloConGiro>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setAplicado({ activos: soloDatos(activos), pasivos: soloDatos(pasivos) })
          }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-wrap gap-6">
            <ListaConceptos
              titulo="Lo que tienes"
              descripcion="Activo circulante: lo que tienes hoy o vas a cobrar o vender en los próximos 12 meses."
              conceptos={activos}
              onChange={setActivos}
              permitirOtros
              textoTotal="Total que tienes"
            />
            <ListaConceptos
              titulo="Lo que debes pagar"
              descripcion="Pasivo circulante: deudas que tienes que pagar antes de un año."
              conceptos={pasivos}
              onChange={setPasivos}
              permitirOtros
              textoTotal="Total que debes"
            />
          </div>
          {inventario.costo > 0 && (
            <button
              type="button"
              onClick={usarInventario}
              className="self-start min-h-11 px-4 rounded-xl bg-oro-claro border-2 border-oro font-semibold cursor-pointer hover:brightness-95"
            >
              Usar el valor de mi inventario guardado ({pesos(inventario.costo)}) en “{t.inventario}
              ”
            </button>
          )}
          <BotonesFormulario
            textoCalcular="Calcular liquidez"
            onLimpiar={() => {
              setActivos(activosBase())
              setPasivos(pasivosBase())
              setAplicado(null)
            }}
          />
        </form>
      </SoloConGiro>

      <section aria-live="polite" aria-label="Resultado" className="flex flex-col gap-4">
        {!resultado && (
          <Esperando>
            Escribe tus datos y presiona <strong>Calcular liquidez</strong>.
          </Esperando>
        )}
        <AvisoCambios
          visible={
            aplicado &&
            JSON.stringify(aplicado) !==
              JSON.stringify({ activos: soloDatos(activos), pasivos: soloDatos(pasivos) })
          }
        />
        {resultado && !resultado.ok && <AvisoError>{resultado.error}</AvisoError>}
        {resultado?.ok && (
          <>
            <div ref={reporte} className="flex flex-col gap-4 bg-fondo">
              <TarjetaResultado resultado={resultado}>
                <div className="pt-8">
                  <Escala
                    valor={resultado.valor}
                    maximo={3}
                    marcas={[0, 1, 1.5, 2, 3]}
                    formato={(n) => numero(n)}
                    zonas={[
                      { hasta: 1, color: '#F7B9AC', texto: 'Peligro' },
                      { hasta: 1.5, color: '#F6D28E', texto: 'Poco' },
                      { hasta: 2, color: '#9ED9C6', texto: 'Ideal' },
                      { hasta: 3, color: '#B9D3F5', texto: 'Dinero parado' },
                    ]}
                  />
                </div>
              </TarjetaResultado>
              <ResumenDatos
                filas={[
                  ...filasResumen(aplicado.activos),
                  ['TOTAL QUE TIENES', pesos(resultado.tienes)],
                  ...filasResumen(aplicado.pasivos),
                  ['TOTAL QUE DEBES', pesos(resultado.debes)],
                ]}
              />
            </div>
            <AccionesResultado
              tipo="liquidez"
              datos={aplicado}
              resultado={resultado}
              reporteRef={reporte}
              tituloPdf="Liquidez"
            />
          </>
        )}
      </section>

      <ComoSeCalcula>
        <span>Liquidez = Lo que tienes ÷ Lo que debes</span>
        <span>(Activo circulante ÷ Pasivo circulante)</span>
      </ComoSeCalcula>
    </div>
  )
}

/* ============================== ENDEUDAMIENTO ============================== */

function Endeudamiento() {
  const { giros } = useGiros()
  const t = textosDe(giros)
  const vacio = { activoTotal: '', pasivoTotal: '' }
  const [datos, setDatos] = useRecordado('endeudamiento-datos', vacio)
  const [aplicado, setAplicado] = useRecordado('endeudamiento-resultado', null)
  const reporte = useRef(null)
  const resultado = aplicado ? endeudamiento(aplicado) : null
  const verEjemplo = (giro) => {
    setDatos(EJEMPLOS[giro].endeudamiento)
    setAplicado(EJEMPLOS[giro].endeudamiento)
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="m-0 text-lg max-w-3xl">
        <strong>Endeudamiento:</strong> te dice qué parte de tu negocio pagaste con tu dinero y qué
        parte con dinero prestado (préstamos, créditos, fiado).
      </p>
      <BarraGiros onEjemplo={verEjemplo} />
      <SoloConGiro>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setAplicado(datos)
          }}
          className="flex flex-col gap-6"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-borde rounded-2xl p-6">
              <CampoDinero
                id="rf-activo"
                etiqueta="¿Cuánto vale todo tu negocio?"
                ayuda={`Activo total. ${t.activoAyuda}`}
                value={datos.activoTotal}
                onChange={(v) => setDatos((d) => ({ ...d, activoTotal: v }))}
              />
            </div>
            <div className="bg-white border border-borde rounded-2xl p-6">
              <CampoDinero
                id="rf-pasivo"
                etiqueta="¿Cuánto debes en total?"
                ayuda={`Pasivo total. ${t.pasivoAyuda}`}
                value={datos.pasivoTotal}
                onChange={(v) => setDatos((d) => ({ ...d, pasivoTotal: v }))}
              />
            </div>
          </div>
          <BotonesFormulario
            textoCalcular="Calcular endeudamiento"
            onLimpiar={() => {
              setDatos(vacio)
              setAplicado(null)
            }}
          />
        </form>
      </SoloConGiro>

      <section aria-live="polite" aria-label="Resultado" className="flex flex-col gap-4">
        {!resultado && (
          <Esperando>
            Escribe tus datos y presiona <strong>Calcular endeudamiento</strong>.
          </Esperando>
        )}
        <AvisoCambios visible={aplicado && JSON.stringify(aplicado) !== JSON.stringify(datos)} />
        {resultado && !resultado.ok && <AvisoError>{resultado.error}</AvisoError>}
        {resultado?.ok && (
          <>
            <div ref={reporte} className="flex flex-col gap-4 bg-fondo">
              <TarjetaResultado resultado={resultado}>
                <div className="pt-8">
                  <Escala
                    valor={resultado.porcentaje}
                    maximo={120}
                    marcas={[0, 40, 60, 100, 120]}
                    formato={(n) => `${n}%`}
                    zonas={[
                      { hasta: 40, color: '#B9D3F5', texto: 'Debes poco' },
                      { hasta: 60, color: '#9ED9C6', texto: 'Bien' },
                      { hasta: 100, color: '#F6D28E', texto: 'Debes mucho' },
                      { hasta: 120, color: '#F7B9AC', texto: 'Crítico' },
                    ]}
                  />
                </div>
              </TarjetaResultado>
              <ResumenDatos
                filas={[
                  ['Lo que vale tu negocio (activo total)', pesos(aNumero(aplicado.activoTotal))],
                  ['Lo que debes (pasivo total)', pesos(aNumero(aplicado.pasivoTotal))],
                ]}
              />
            </div>
            <AccionesResultado
              tipo="endeudamiento"
              datos={aplicado}
              resultado={resultado}
              reporteRef={reporte}
              tituloPdf="Endeudamiento"
            />
          </>
        )}
      </section>

      <ComoSeCalcula>
        <span>Endeudamiento = (Pasivo total ÷ Activo total) × 100</span>
      </ComoSeCalcula>
    </div>
  )
}

/* =============================== RENTABILIDAD =============================== */

const restasBase = (m = ['', '', '', ''], t = textosDe([])) => [
  {
    clave: 'cv',
    fijo: true,
    concepto: t.costoVenta,
    monto: m[0],
    ayuda: t.costoVentaAyuda,
  },
  {
    clave: 'gf',
    fijo: true,
    concepto: 'Gastos fijos',
    monto: m[1],
    ayuda: `Ej.: ${t.fijosEj}.`,
  },
  {
    clave: 'int',
    fijo: true,
    concepto: 'Intereses de préstamos',
    monto: m[2],
    ayuda: 'Si no tienes préstamos, déjalo vacío.',
  },
  { clave: 'imp', fijo: true, concepto: 'Impuestos', monto: m[3] },
]

function Rentabilidad() {
  const { giros } = useGiros()
  const t = textosDe(giros)
  const [ventas, setVentas] = useRecordado('rentabilidad-ventas', '')
  const [restasEstado, setRestas] = useRecordado('rentabilidad-restas', () => restasBase())
  // Los textos de los renglones fijos siguen al giro elegido
  const base = restasBase(['', '', '', ''], t)
  const restas = restasEstado.map((c) => {
    const b = base.find((x) => x.clave === c.clave)
    return b ? { ...c, concepto: b.concepto, ayuda: b.ayuda } : c
  })
  const [aplicado, setAplicado] = useRecordado('rentabilidad-resultado', null)
  const reporte = useRef(null)
  const resultado = aplicado ? rentabilidad(aplicado) : null
  const verEjemplo = (giro) => {
    const { ventas: v, restas: m } = EJEMPLOS[giro].rentabilidad
    const r = restasBase(m, textosDe([giro]))
    setVentas(v)
    setRestas(r)
    setAplicado({ ventas: v, restas: soloDatos(r) })
  }
  const gananciaEnVivo = utilidadNeta({ ventas, restas })

  return (
    <div className="flex flex-col gap-6">
      <p className="m-0 text-lg max-w-3xl">
        <strong>Rentabilidad sobre ventas:</strong> te dice cuánto dinero limpio te queda de cada
        peso que vendes, después de pagar todo.
      </p>
      <BarraGiros onEjemplo={verEjemplo} />
      <SoloConGiro>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setAplicado({ ventas, restas: soloDatos(restas) })
          }}
          className="flex flex-col gap-6"
        >
          <div className="flex flex-wrap gap-6 items-start">
            <div className="flex-1 basis-80 min-w-0 bg-white border border-borde rounded-2xl p-6 flex flex-col gap-4">
              <CampoDinero
                id="rf-ventas"
                etiqueta="¿Cuánto vendiste en total?"
                ayuda={`Ventas totales de un mes o un año. ${t.ventasAyuda}`}
                value={ventas}
                onChange={setVentas}
              />
              <div className="p-4 rounded-xl bg-marca-claro flex justify-between items-baseline gap-3 text-lg">
                <span>
                  <strong>Ganancia limpia</strong>
                  <br />
                  <span className="text-sm text-tenue">(utilidad neta = ventas − gastos)</span>
                </span>
                <strong
                  className={`font-display text-2xl ${gananciaEnVivo < 0 ? 'text-rojo' : ''}`}
                >
                  {pesos(gananciaEnVivo)}
                </strong>
              </div>
            </div>
            <ListaConceptos
              titulo="Lo que se resta"
              descripcion="Usa el mismo periodo que en las ventas (un mes o un año)."
              conceptos={restas}
              onChange={setRestas}
              signo="−$"
              textoTotal="Total que se resta"
            />
          </div>
          <BotonesFormulario
            textoCalcular="Calcular rentabilidad"
            onLimpiar={() => {
              setVentas('')
              setRestas(restasBase())
              setAplicado(null)
            }}
          />
        </form>
      </SoloConGiro>

      <section aria-live="polite" aria-label="Resultado" className="flex flex-col gap-4">
        {!resultado && (
          <Esperando>
            Escribe tus datos y presiona <strong>Calcular rentabilidad</strong>.
          </Esperando>
        )}
        <AvisoCambios
          visible={
            aplicado &&
            JSON.stringify(aplicado) !== JSON.stringify({ ventas, restas: soloDatos(restas) })
          }
        />
        {resultado && !resultado.ok && <AvisoError>{resultado.error}</AvisoError>}
        {resultado?.ok && (
          <>
            <div ref={reporte} className="flex flex-col gap-4 bg-fondo">
              <TarjetaResultado resultado={resultado}>
                <BarraGanancia resultado={resultado} />
              </TarjetaResultado>
              <ResumenDatos
                filas={[
                  ['Ventas totales', pesos(resultado.ventas)],
                  ...aplicado.restas
                    .filter((c) => aNumeroOCero(c.monto) !== 0)
                    .map((c) => [`− ${c.concepto}`, pesos(aNumeroOCero(c.monto))]),
                  ['GANANCIA LIMPIA (utilidad neta)', pesos(resultado.utilidad)],
                ]}
              />
            </div>
            <AccionesResultado
              tipo="rentabilidad"
              datos={aplicado}
              resultado={resultado}
              reporteRef={reporte}
              tituloPdf="Rentabilidad sobre ventas"
            />
          </>
        )}
      </section>

      <ComoSeCalcula>
        <span>Utilidad neta = Ventas − Costo de venta − Gastos fijos − Intereses − Impuestos</span>
        <span>Rentabilidad = (Utilidad neta ÷ Ventas totales) × 100</span>
      </ComoSeCalcula>
    </div>
  )
}

/**
 * Una sola barra: la parte verde es lo que te queda y la gris lo que se va en gastos.
 * Si hay pérdida no se dibuja (el texto ya lo explica).
 */
function BarraGanancia({ resultado }) {
  const { porcentaje, utilidad, ventas } = resultado
  if (utilidad <= 0) return null
  const verde = Math.min(100, porcentaje)
  return (
    <div className="flex flex-col gap-2">
      <span className="font-semibold">Así se reparte lo que vendiste ({pesos(ventas)}):</span>
      <div
        className="flex h-14 rounded-xl overflow-hidden border-2 border-white"
        aria-hidden="true"
      >
        <div
          className="bg-marca text-white font-bold flex items-center justify-center px-2 whitespace-nowrap"
          style={{ width: `${Math.max(verde, 12)}%` }}
        >
          {numero(porcentaje, 1)}%
        </div>
        <div className="flex-1 bg-[#C9D2C8] text-tinta font-semibold flex items-center justify-center px-2 whitespace-nowrap overflow-hidden">
          {numero(100 - porcentaje, 1)}%
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-2 text-[17px]">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 shrink-0 rounded-sm bg-marca" />
          <span>
            <strong>Te queda: {pesos(utilidad)}</strong> (tu ganancia)
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 shrink-0 rounded-sm bg-[#C9D2C8]" />
          <span>
            Se va en costos y gastos: <strong>{pesos(ventas - utilidad)}</strong>
          </span>
        </span>
      </div>
    </div>
  )
}
