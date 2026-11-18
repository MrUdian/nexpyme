/**
 * Lee un texto en voz alta (ayuda a quien se le dificulta leer).
 *
 * Para que suene menos robótica:
 * 1. Se elige la voz más natural que tenga el navegador: primero las "naturales" o
 *    "neuronales" (Edge: "Microsoft Dalia Online (Natural)"; Chrome: "Google español"),
 *    y de preferencia en español de México.
 * 2. Se lee frase por frase, con una pausa corta entre cada una.
 * 3. Los números se dicen como se dicen en voz alta ("15 mil 750 pesos", "12.5 por ciento").
 */
export const vozDisponible = () => typeof window !== 'undefined' && 'speechSynthesis' in window

/** Calificación de cada voz: entre más alta, más natural suena */
export function puntajeVoz(voz) {
  const nombre = `${voz.name} ${voz.voiceURI ?? ''}`.toLowerCase()
  const idioma = (voz.lang ?? '').toLowerCase().replace('_', '-')
  if (!idioma.startsWith('es')) return -1
  let puntos = 0
  if (/natural|neural|online|premium|enhanced|mejorada/.test(nombre)) puntos += 50
  if (nombre.includes('google')) puntos += 30
  if (idioma === 'es-mx') puntos += 20
  else if (idioma === 'es-us' || idioma === 'es-419') puntos += 12
  if (/dalia|jorge|paulina|sabina|gerardo|renata|camila|elena/.test(nombre)) puntos += 8
  if (/espeak|compact/.test(nombre)) puntos -= 40
  if (!voz.localService) puntos += 5 // las voces en línea suelen sonar mejor
  return puntos
}

let vozElegida = null
function elegirVoz() {
  const voces = window.speechSynthesis.getVoices()
  vozElegida =
    voces
      .map((v) => ({ v, p: puntajeVoz(v) }))
      .filter((x) => x.p >= 0)
      .sort((a, b) => b.p - a.p)[0]?.v ?? null
  return vozElegida
}

if (vozDisponible()) {
  // En Chrome y Edge la lista de voces llega un momento después de abrir la página
  window.speechSynthesis.addEventListener?.('voiceschanged', elegirVoz)
}

/** "$15,750.00" → "15 mil 750 pesos"; "12.5%" → "12.5 por ciento" */
export function textoParaVoz(texto) {
  return texto
    .replace(/\$\s?([\d,]+)(?:\.(\d{1,2}))?/g, (_, enteros, centavos) => {
      const n = Number(enteros.replace(/,/g, ''))
      const pesos = `${numeroHablado(n)} ${n === 1 ? 'peso' : 'pesos'}`
      const c = centavos ? Number(centavos.padEnd(2, '0')) : 0
      return c ? `${pesos} con ${c} centavos` : pesos
    })
    .replace(/(\d+(?:\.\d+)?)\s?%/g, '$1 por ciento')
    .replace(/\b(\d{1,3}(?:,\d{3})+)\b/g, (m) => numeroHablado(Number(m.replace(/,/g, ''))))
    .replace(/💡/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** 15750 → "15 mil 750" (las voces lo leen mejor así que con comas) */
function numeroHablado(n) {
  if (n >= 1_000_000) {
    const millones = Math.floor(n / 1_000_000)
    const resto = n % 1_000_000
    return `${millones} ${millones === 1 ? 'millón' : 'millones'}${resto ? ` ${numeroHablado(resto)}` : ''}`
  }
  if (n >= 1000) {
    const miles = Math.floor(n / 1000)
    const resto = n % 1000
    return `${miles === 1 ? '' : `${miles} `}mil${resto ? ` ${resto}` : ''}`
  }
  return String(n)
}

/** Parte el texto en frases para leerlas con pausas naturales */
export const frases = (texto) =>
  texto
    .split(/(?<=[.!?:;])\s+/)
    .map((f) => f.trim())
    .filter(Boolean)

export function leerEnVoz(texto) {
  if (!vozDisponible()) return
  const sintetizador = window.speechSynthesis
  sintetizador.cancel()
  const voz = vozElegida ?? elegirVoz()

  frases(textoParaVoz(texto)).forEach((frase) => {
    const dicho = new SpeechSynthesisUtterance(frase)
    dicho.lang = voz?.lang ?? 'es-MX'
    if (voz) dicho.voice = voz
    // Las voces naturales ya tienen buen ritmo; a las básicas se les baja un poco la velocidad
    dicho.rate = voz && puntajeVoz(voz) >= 50 ? 1 : 0.92
    dicho.pitch = 1.05
    sintetizador.speak(dicho)
  })
}

export function callarVoz() {
  if (vozDisponible()) window.speechSynthesis.cancel()
}
