/** Piezas para los formularios de cuenta (registro, entrar, perfil) */
import { useId, useState } from 'react'

const claseCaja =
  'w-full min-h-12 px-3.5 border-2 border-campo rounded-xl bg-white text-lg outline-none focus:border-marca focus:ring-4 focus:ring-marca/20'

const Ojo = ({ tachado }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
    {tachado && <path d="M4 4l16 16" />}
  </svg>
)

/** Casilla con su etiqueta. Si es contraseña, trae un botón para verla u ocultarla. */
export function Campo({ etiqueta, ayuda, type, ...props }) {
  const id = useId()
  const [verla, setVerla] = useState(false)
  const esContrasena = type === 'password'
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-semibold text-lg">
        {etiqueta}
      </label>
      {esContrasena ? (
        <div className="relative">
          <input
            id={id}
            type={verla ? 'text' : 'password'}
            className={`${claseCaja} pr-28`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVerla((v) => !v)}
            aria-pressed={verla}
            aria-controls={id}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 min-h-10 px-2.5 rounded-lg bg-transparent text-marca-oscuro font-semibold flex items-center gap-1.5 cursor-pointer hover:bg-marca-claro"
          >
            <Ojo tachado={verla} />
            {verla ? 'Ocultar' : 'Ver'}
          </button>
        </div>
      ) : (
        <input id={id} type={type} className={claseCaja} {...props} />
      )}
      {ayuda && <p className="m-0 text-[15px] text-tenue">{ayuda}</p>}
    </div>
  )
}

export function BotonPrincipal({ children, ...props }) {
  return (
    <button
      type="submit"
      className="min-h-14 px-7 rounded-xl bg-marca text-white text-lg font-bold cursor-pointer hover:brightness-95 disabled:opacity-60"
      {...props}
    >
      {children}
    </button>
  )
}

export function Mensaje({ tipo = 'error', children }) {
  if (!children) return null
  const clase = tipo === 'error' ? 'bg-rojo-claro text-rojo' : 'bg-verde-claro text-verde'
  return (
    <div
      role={tipo === 'error' ? 'alert' : 'status'}
      className={`p-4 rounded-xl font-medium ${clase}`}
    >
      {children}
    </div>
  )
}

export function TarjetaFormulario({ titulo, children }) {
  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <div className="bg-white border border-borde rounded-2xl p-7 flex flex-col gap-5">
        <h1 className="m-0 font-display text-3xl">{titulo}</h1>
        {children}
      </div>
    </div>
  )
}
