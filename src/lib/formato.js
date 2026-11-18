const dinero = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
})

/** $12,345.6 → "$12,345.60" */
export const pesos = (n) => dinero.format(n)

/** 1234.567 → "1,234.57" */
export const numero = (n, decimales = 2) =>
  n.toLocaleString('es-MX', { maximumFractionDigits: decimales })

/** Convierte lo que escribió la persona en número. Vacío o texto → NaN */
export const aNumero = (texto) => {
  if (texto === '' || texto === null || texto === undefined) return NaN
  return Number(String(texto).replace(/,/g, ''))
}

/** Igual que aNumero pero los vacíos cuentan como 0 (para sumar listas) */
export const aNumeroOCero = (texto) => {
  const n = aNumero(texto)
  return Number.isNaN(n) ? 0 : n
}

export const fechaCorta = (iso) =>
  new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
