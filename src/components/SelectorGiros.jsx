import { Link } from 'react-router'
import { useGiros } from '../context/GiroContext.jsx'
import { GIROS, ejemplosDe } from '../lib/giros.js'

const Palomita = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path
      d="M5 12.5l4.5 4.5L19 7.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

/**
 * Botones para elegir uno o varios giros (comercial, servicios, producción).
 * value: ['comercial', ...]
 * opciones: qué giros mostrar (por defecto los tres)
 * minimoUno: no deja quitar el último que queda elegido
 */
export function SelectorGiros({
  value,
  onChange,
  titulo = '¿Qué tipo de negocio tienes?',
  ayuda = 'Puedes elegir más de uno si, por ejemplo, das servicios y también vendes productos.',
  opciones,
  minimoUno,
  compacto,
}) {
  const lista = opciones ? GIROS.filter((g) => opciones.includes(g.valor)) : GIROS
  const cambiar = (giro) => {
    if (value.includes(giro)) {
      if (minimoUno && value.length === 1) return
      onChange(value.filter((g) => g !== giro))
    } else onChange([...value, giro])
  }

  return (
    <fieldset className="m-0 p-0 border-0 min-w-0 flex flex-col gap-2">
      <legend className={`p-0 font-semibold ${compacto ? 'text-lg' : 'text-lg'}`}>{titulo}</legend>
      {ayuda && <p className="m-0 text-[15px] text-tenue">{ayuda}</p>}
      <div className={`grid gap-2 ${compacto ? 'sm:grid-cols-3' : ''}`}>
        {lista.map((g) => {
          const activo = value.includes(g.valor)
          const fijo = activo && minimoUno && value.length === 1
          return (
            <button
              key={g.valor}
              type="button"
              aria-pressed={activo}
              onClick={() => cambiar(g.valor)}
              title={fijo ? 'Debe quedar al menos un tipo de negocio elegido' : undefined}
              className={`text-left rounded-xl border-2 px-3.5 py-2.5 flex items-center gap-3 ${
                fijo ? 'cursor-default' : 'cursor-pointer'
              } ${activo ? 'border-marca bg-marca-claro' : 'border-campo bg-white hover:border-marca/60'}`}
            >
              <span
                className={`h-7 w-7 shrink-0 rounded-lg border-2 flex items-center justify-center ${
                  activo ? 'bg-marca border-marca text-white' : 'border-campo bg-white'
                }`}
              >
                {activo && <Palomita />}
              </span>
              <span className="flex flex-col leading-snug">
                <span className="font-bold">{g.nombre}</span>
                <span className="text-sm text-tenue">
                  {g.descripcion}
                  {!compacto && `. Ej.: ${g.ejemplos}.`}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

/**
 * Barra arriba de las calculadoras.
 * - Hay que elegir al menos un tipo de negocio (se recuerda al cambiar de página).
 * - Con sesión iniciada solo aparecen los tipos de negocio de tu perfil.
 * - Abajo aparecen los botones de ejemplo, solo de los tipos elegidos.
 * onEjemplo(giro): qué hacer al presionar "Ver ejemplo de una peluquería", etc.
 */
export function BarraGiros({ onEjemplo }) {
  const { giros, setGiros, disponibles, conPerfil } = useGiros()
  const unoSolo = conPerfil && disponibles.length === 1

  return (
    <section
      aria-label="Tipo de negocio"
      className="bg-white border border-borde rounded-2xl p-5 flex flex-col gap-4"
    >
      <SelectorGiros
        compacto
        minimoUno
        value={giros}
        onChange={setGiros}
        opciones={disponibles}
        titulo={
          unoSolo
            ? 'Tu tipo de negocio'
            : conPerfil
              ? 'Tu negocio es… (elige para cuál quieres ver ejemplos y explicaciones)'
              : 'Tu negocio es… (los ejemplos y explicaciones se adaptan a lo que elijas)'
        }
        ayuda={
          conPerfil
            ? null
            : 'Elige al menos uno. Puedes elegir más de uno si, por ejemplo, das servicios y también vendes productos.'
        }
      />

      {conPerfil && (
        <p className="m-0 text-[15px] text-tenue">
          Son los tipos de negocio de tu cuenta. Para cambiarlos ve a{' '}
          <Link to="/perfil">Mi perfil</Link>.
        </p>
      )}

      {giros.length === 0 ? (
        <p className="m-0 font-semibold text-[#6B4300]" role="status">
          👆 Elige una opción para continuar.
        </p>
      ) : (
        onEjemplo && (
          <div className="flex flex-col gap-2 pt-3 border-t border-borde">
            <span className="text-[15px] text-suave">
              ¿No sabes qué poner? Mira cómo se llena con un ejemplo:
            </span>
            <div className="flex flex-wrap gap-2">
              {ejemplosDe(giros).map((e) => (
                <button
                  key={e.giro}
                  type="button"
                  onClick={() => onEjemplo(e.giro)}
                  className="min-h-12 px-4 rounded-xl bg-oro-claro border-2 border-oro font-semibold cursor-pointer hover:brightness-95"
                >
                  Ver ejemplo de {e.conArticulo}
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </section>
  )
}

/** Muestra la calculadora solo cuando ya se eligió un tipo de negocio */
export function SoloConGiro({ children }) {
  const { giros } = useGiros()
  if (giros.length) return children
  return (
    <div className="rounded-2xl border-2 border-dashed border-campo bg-white/60 p-8 text-center text-lg text-suave">
      Primero elige arriba <strong>qué tipo de negocio tienes</strong>. Así te mostramos las
      preguntas y los ejemplos que van con tu negocio.
    </div>
  )
}
