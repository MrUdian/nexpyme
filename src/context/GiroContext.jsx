import { createContext, useContext, useMemo, useState } from 'react'
import { VALORES_GIRO, ordenarGiros } from '../lib/giros.js'
import { useAuth } from './AuthContext.jsx'

/**
 * Giros (categorías) que se están usando en las calculadoras.
 * - Se recuerdan en este navegador, así no hay que elegirlos en cada página.
 * - Con sesión iniciada solo se pueden usar los giros del negocio (los de "Mi perfil").
 * - Una vez elegido uno, siempre queda al menos uno elegido.
 */
const GiroContext = createContext({
  giros: [],
  disponibles: VALORES_GIRO,
  conPerfil: false,
  setGiros: () => {},
})
const LLAVE = 'nexpyme-giros'

function leerGuardados() {
  try {
    return ordenarGiros(JSON.parse(localStorage.getItem(LLAVE)) ?? [])
  } catch {
    return []
  }
}

function recordar(giros) {
  try {
    localStorage.setItem(LLAVE, JSON.stringify(giros))
  } catch {
    // Sin localStorage (modo privado): solo se recuerda mientras la página esté abierta
  }
}

export function GiroProvider({ children }) {
  const { usuario, perfil } = useAuth() ?? {}
  const [elegidos, setElegidos] = useState(leerGuardados)

  const girosPerfil = usuario && perfil?.giros?.length ? ordenarGiros(perfil.giros) : null
  const disponibles = girosPerfil ?? VALORES_GIRO

  // La primera vez que carga el perfil (o si cambia en "Mi perfil") se usan sus giros
  const clavePerfil = girosPerfil?.join(',') ?? null
  const [perfilVisto, setPerfilVisto] = useState(null)
  if (clavePerfil && clavePerfil !== perfilVisto) {
    setPerfilVisto(clavePerfil)
    setElegidos(girosPerfil)
    recordar(girosPerfil)
  }

  // Solo cuentan los que están disponibles
  const giros = elegidos.filter((g) => disponibles.includes(g))

  const claveGiros = giros.join(',')
  const claveDisponibles = disponibles.join(',')
  const conPerfil = Boolean(girosPerfil)
  const valor = useMemo(() => {
    const permitidos = claveDisponibles.split(',')
    return {
      giros: claveGiros ? claveGiros.split(',') : [],
      disponibles: permitidos,
      conPerfil,
      setGiros: (nuevos) => {
        const limpios = ordenarGiros(nuevos).filter((g) => permitidos.includes(g))
        if (limpios.length === 0) return // siempre debe quedar al menos uno
        setElegidos(limpios)
        recordar(limpios)
      },
    }
  }, [claveGiros, claveDisponibles, conPerfil])

  return <GiroContext.Provider value={valor}>{children}</GiroContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export const useGiros = () => useContext(GiroContext)
