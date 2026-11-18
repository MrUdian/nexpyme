/**
 * Recuerda lo que se escribió y calculó en cada calculadora mientras la pestaña esté abierta
 * (sessionStorage). Así, si te vas a otra sección y regresas, siguen ahí tus datos y tu
 * resultado. En la base de datos solo se guarda cuando presionas "Guardar" (con cuenta).
 */
import { useEffect, useState } from 'react'

const PREFIJO = 'nexpyme-calc:'

export function useRecordado(llave, inicial) {
  const [valor, setValor] = useState(() => {
    try {
      const texto = sessionStorage.getItem(PREFIJO + llave)
      if (texto !== null) return JSON.parse(texto)
    } catch {
      // sin sessionStorage: se usa el valor inicial
    }
    return typeof inicial === 'function' ? inicial() : inicial
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(PREFIJO + llave, JSON.stringify(valor))
    } catch {
      // no pasa nada si no se puede guardar
    }
  }, [llave, valor])

  return [valor, setValor]
}

/** Borra todo lo recordado (al cerrar sesión, para que otra persona no lo vea) */
export function olvidarCalculos() {
  try {
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith(PREFIJO))
      .forEach((k) => sessionStorage.removeItem(k))
  } catch {
    // nada que borrar
  }
}
