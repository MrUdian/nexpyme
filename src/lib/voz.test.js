import { describe, expect, it } from 'vitest'
import { frases, puntajeVoz, textoParaVoz } from './voz.js'

describe('Voz', () => {
  it('dice los pesos y porcentajes como se dicen en voz alta', () => {
    expect(textoParaVoz('Eso es un total de $15,750.00 en ventas.')).toBe(
      'Eso es un total de 15 mil 750 pesos en ventas.',
    )
    expect(textoParaVoz('Tienes $1.5 para pagarlo')).toBe(
      'Tienes 1 peso con 50 centavos para pagarlo',
    )
    expect(textoParaVoz('Debes 12.5%')).toBe('Debes 12.5 por ciento')
    expect(textoParaVoz('$1,000')).toBe('mil pesos')
  })

  it('prefiere voces naturales en español de México', () => {
    const basica = {
      name: 'Microsoft Sabina - Spanish (Mexico)',
      lang: 'es-MX',
      localService: true,
    }
    const natural = {
      name: 'Microsoft Dalia Online (Natural) - Spanish (Mexico)',
      lang: 'es-MX',
      localService: false,
    }
    const ingles = { name: 'Google US English', lang: 'en-US', localService: false }
    expect(puntajeVoz(natural)).toBeGreaterThan(puntajeVoz(basica))
    expect(puntajeVoz(ingles)).toBeLessThan(0)
  })

  it('lee frase por frase', () => {
    expect(frases('Hola. ¿Cómo estás? Bien')).toEqual(['Hola.', '¿Cómo estás?', 'Bien'])
  })
})
