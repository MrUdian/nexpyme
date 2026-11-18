const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const Logo = ({ size = 34 }) => (
  <svg width={size} height={size} viewBox="0 0 34 34" aria-hidden="true">
    <rect width="34" height="34" rx="9" fill="#0E7C66" />
    <rect x="8" y="18" width="4" height="8" rx="1.5" fill="#fff" />
    <rect x="15" y="13" width="4" height="13" rx="1.5" fill="#fff" />
    <rect x="22" y="8" width="4" height="18" rx="1.5" fill="#F2B544" />
  </svg>
)

export const IconoBalanza = (p) => (
  <svg viewBox="0 0 24 24" width="28" height="28" {...base} {...p}>
    <path d="M3 20 L21 4" />
    <path d="M3 12 L21 8" />
    <circle cx="12" cy="10" r="2.2" />
  </svg>
)
export const IconoAlcancia = (p) => (
  <svg viewBox="0 0 24 24" width="28" height="28" {...base} {...p}>
    <path d="M5 11a7 6 0 0 1 13-2h2v4h-1.5a7 6 0 0 1-2.5 3v3h-3v-2h-3v2H7v-3.5A6 6 0 0 1 5 11z" />
    <circle cx="15" cy="10" r="0.6" fill="currentColor" />
    <path d="M10 6.5h3" />
  </svg>
)
export const IconoCadena = (p) => (
  <svg viewBox="0 0 24 24" width="28" height="28" {...base} {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </svg>
)
export const IconoMonedas = (p) => (
  <svg viewBox="0 0 24 24" width="28" height="28" {...base} {...p}>
    <ellipse cx="9" cy="7" rx="6" ry="3" />
    <path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7" />
    <path d="M9 15v2c0 1.7 2.7 3 6 3s6-1.3 6-3v-5c0-1.7-2.7-3-6-3" />
  </svg>
)
export const IconoCaja = (p) => (
  <svg viewBox="0 0 24 24" width="28" height="28" {...base} {...p}>
    <path d="M3 8l9-4 9 4-9 4-9-4z" />
    <path d="M3 8v8l9 4 9-4V8" />
    <path d="M12 12v8" />
  </svg>
)
export const IconoBocina = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...p}>
    <path d="M4 9v6h4l5 4V5L8 9H4z" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7" />
    <path d="M19 6a8.5 8.5 0 0 1 0 12" />
  </svg>
)
export const IconoDescarga = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...p}>
    <path d="M12 4v11" />
    <path d="M7 10l5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
)
export const IconoGuardar = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...p}>
    <path d="M5 4h11l3 3v13H5z" />
    <path d="M8 4v5h7V4" />
    <path d="M8 20v-6h8v6" />
  </svg>
)
export const IconoMas = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
export const IconoBasura = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} {...p}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </svg>
)

/** Círculo del semáforo con un símbolo fácil de reconocer */
export function Senal({ nivel, size = 64 }) {
  const colores = {
    peligro: ['#B42318', '#FDE2DD'],
    cuidado: ['#B7791F', '#FEF0C7'],
    bien: ['#0E7C66', '#D9F2EA'],
    sobra: ['#1E4E8C', '#DCE9FB'],
    meta: ['#0E7C66', '#D9F2EA'],
  }
  const [fuerte, claro] = colores[nivel] ?? colores.bien
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <circle cx="32" cy="32" r="30" fill={claro} stroke={fuerte} strokeWidth="4" />
      <g stroke={fuerte} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none">
        {nivel === 'peligro' && (
          <>
            <path d="M32 16v20" />
            <circle cx="32" cy="46" r="1.5" fill={fuerte} />
          </>
        )}
        {nivel === 'cuidado' && <path d="M20 32h24" />}
        {(nivel === 'bien' || !colores[nivel]) && <path d="M19 33l9 9 17-19" />}
        {nivel === 'sobra' && (
          <>
            <circle cx="32" cy="19" r="1.5" fill={fuerte} />
            <path d="M32 29v17" />
          </>
        )}
        {nivel === 'meta' && (
          <>
            <circle cx="32" cy="32" r="13" strokeWidth="5" />
            <circle cx="32" cy="32" r="2.5" fill={fuerte} />
          </>
        )}
      </g>
    </svg>
  )
}
