import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { IconoBasura, Senal } from '../components/Iconos.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  NOMBRES,
  PREGUNTAS,
  RUTAS,
  borrarCalculo,
  listarCalculos,
  renombrarCalculo,
} from '../lib/calculos.js'
import { fechaCorta, numero } from '../lib/formato.js'
import { textoGiros } from '../lib/giros.js'
import { mensajeError } from '../lib/supabase.js'

const TIPOS = Object.keys(NOMBRES)

/** Cómo mostrar el número guardado en la gráfica de "cómo has cambiado" */
const EN_GRAFICA = {
  liquidez: { y: (v) => v, texto: (v) => numero(v) },
  endeudamiento: { y: (v) => v * 100, texto: (v) => `${numero(v, 1)}%` },
  rentabilidad: { y: (v) => v * 100, texto: (v) => `${numero(v, 1)}%` },
}

export default function Panel() {
  const { perfil, usuario, cerrarSesion } = useAuth()
  const [calculos, setCalculos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [tipoGrafica, setTipoGrafica] = useState('liquidez')

  useEffect(() => {
    let vigente = true
    listarCalculos().then(({ data, error: err }) => {
      if (!vigente) return
      if (err) setError(mensajeError(err))
      else setCalculos(data)
      setCargando(false)
    })
    return () => {
      vigente = false
    }
  }, [])

  const ultimos = useMemo(
    () => Object.fromEntries(TIPOS.map((t) => [t, calculos.find((c) => c.tipo === t)])),
    [calculos],
  )

  const serie = useMemo(
    () =>
      calculos
        .filter((c) => c.tipo === tipoGrafica && typeof c.resultado?.valor === 'number')
        .reverse()
        .map((c) => ({
          fecha: fechaCorta(c.created_at),
          valor: EN_GRAFICA[tipoGrafica].y(c.resultado.valor),
        })),
    [calculos, tipoGrafica],
  )

  const borrar = async (c) => {
    if (
      !window.confirm(`¿Borrar el cálculo de ${NOMBRES[c.tipo]} del ${fechaCorta(c.created_at)}?`)
    )
      return
    const { error: err } = await borrarCalculo(c.id)
    if (err) setError(mensajeError(err))
    else setCalculos((lista) => lista.filter((x) => x.id !== c.id))
  }

  const guardarNota = async (c, nota) => {
    if (nota === (c.nota ?? '')) return
    const { error: err } = await renombrarCalculo(c.id, nota)
    if (err) setError(mensajeError(err))
    else setCalculos((lista) => lista.map((x) => (x.id === c.id ? { ...x, nota } : x)))
  }

  const nombre = perfil?.nombre_completo?.trim() ?? ''

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col gap-8">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="m-0 font-display text-4xl">Hola{nombre && `, ${nombre}`} 👋</h1>
          <p className="m-0 text-lg text-suave">
            {perfil?.giros?.length ? `Giro: ${textoGiros(perfil.giros)}` : usuario?.email}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/perfil"
            className="min-h-12 px-5 rounded-xl bg-white border-2 border-campo font-semibold no-underline text-tinta flex items-center"
          >
            Mi perfil
          </Link>
          <button
            type="button"
            onClick={cerrarSesion}
            className="min-h-12 px-4 rounded-xl text-suave font-semibold underline bg-transparent cursor-pointer"
          >
            Salir
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-xl bg-rojo-claro text-rojo">
          {error}
        </div>
      )}

      {/* Resumen: el último resultado de cada herramienta */}
      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-2xl">Cómo va tu negocio</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIPOS.map((t) => {
            const c = ultimos[t]
            return (
              <div
                key={t}
                className="bg-white border border-borde rounded-2xl p-5 flex flex-col gap-3"
              >
                <span className="text-sm font-semibold text-tenue uppercase tracking-wide">
                  {NOMBRES[t]}
                </span>
                {cargando ? (
                  <span className="text-tenue">Cargando…</span>
                ) : c ? (
                  <>
                    <div className="flex items-center gap-3">
                      <Senal nivel={c.resultado.nivel} size={44} />
                      <span className="font-display text-2xl font-bold leading-tight">
                        {c.resultado.valorTexto}
                      </span>
                    </div>
                    <span className="font-semibold">{c.resultado.titulo}</span>
                    <span className="text-sm text-tenue">{fechaCorta(c.created_at)}</span>
                  </>
                ) : (
                  <span className="text-suave">{PREGUNTAS[t]} Aún no lo calculas.</span>
                )}
                <Link to={RUTAS[t]} className="mt-auto font-semibold">
                  {c ? 'Calcular de nuevo →' : 'Calcular ahora →'}
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      {/* Gráfica de cómo ha cambiado */}
      <section className="bg-white border border-borde rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <h2 className="m-0 text-2xl">¿Cómo has cambiado?</h2>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Elige qué ver">
            {Object.keys(EN_GRAFICA).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={t === tipoGrafica}
                onClick={() => setTipoGrafica(t)}
                className={`min-h-10 px-4 rounded-lg font-semibold cursor-pointer border-2 ${
                  t === tipoGrafica ? 'bg-marca text-white border-marca' : 'bg-white border-campo'
                }`}
              >
                {NOMBRES[t]}
              </button>
            ))}
          </div>
        </div>
        {serie.length < 2 ? (
          <p className="m-0 text-suave">
            Guarda al menos 2 cálculos de {NOMBRES[tipoGrafica].toLowerCase()} (por ejemplo, uno
            cada mes) para ver aquí si vas mejorando.
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={serie} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid stroke="#EEF1EC" vertical={false} />
                <XAxis dataKey="fecha" tick={{ fontSize: 13 }} />
                <YAxis
                  tickFormatter={EN_GRAFICA[tipoGrafica].texto}
                  tick={{ fontSize: 13 }}
                  width={64}
                />
                <Tooltip
                  formatter={(v) => [EN_GRAFICA[tipoGrafica].texto(v), NOMBRES[tipoGrafica]]}
                />
                <Line
                  dataKey="valor"
                  stroke="#0E7C66"
                  strokeWidth={4}
                  dot={{ r: 5 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Historial */}
      <section className="flex flex-col gap-4">
        <h2 className="m-0 text-2xl">Tu historial</h2>
        {!cargando && calculos.length === 0 && (
          <p className="m-0 text-suave text-lg">
            Todavía no guardas ningún cálculo. Haz uno y presiona{' '}
            <strong>Guardar en mi panel</strong>.
          </p>
        )}
        <ul className="m-0 p-0 list-none flex flex-col gap-3">
          {calculos.map((c) => (
            <li
              key={c.id}
              className="bg-white border border-borde rounded-2xl p-4 flex flex-wrap items-center gap-4"
            >
              <Senal nivel={c.resultado.nivel} size={40} />
              <div className="flex-1 min-w-48 flex flex-col">
                <span className="font-semibold">
                  {NOMBRES[c.tipo]}: {c.resultado.valorTexto} · {c.resultado.titulo}
                </span>
                <span className="text-sm text-tenue">{fechaCorta(c.created_at)}</span>
                <input
                  aria-label="Nota"
                  defaultValue={c.nota ?? ''}
                  placeholder="Escribe una nota (ej.: Noviembre, temporada alta)"
                  onBlur={(e) => guardarNota(c, e.target.value.trim())}
                  onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                  className="mt-1 text-[15px] px-2 py-1 rounded-md border border-transparent hover:border-campo focus:border-marca outline-none bg-fondo/60"
                />
              </div>
              <button
                type="button"
                onClick={() => borrar(c)}
                className="min-h-11 px-3 rounded-xl border-2 border-campo bg-white text-rojo font-semibold flex items-center gap-1 cursor-pointer hover:bg-rojo-claro"
              >
                <IconoBasura /> Borrar
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
