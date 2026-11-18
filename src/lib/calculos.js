/** Guardar, leer y borrar cálculos del historial (tabla "calculos") */
import { supabase } from './supabase.js'

export const NOMBRES = {
  punto_equilibrio: 'Punto de equilibrio',
  liquidez: 'Liquidez',
  endeudamiento: 'Endeudamiento',
  rentabilidad: 'Rentabilidad',
}

export const PREGUNTAS = {
  punto_equilibrio: '¿Cuánto tengo que vender para no perder?',
  liquidez: '¿Me alcanza para pagar lo que debo?',
  endeudamiento: '¿Cuánto de mi negocio es prestado?',
  rentabilidad: '¿Cuánto gano de verdad?',
}

export const RUTAS = {
  punto_equilibrio: '/punto-de-equilibrio',
  liquidez: '/razones?razon=liquidez',
  endeudamiento: '/razones?razon=endeudamiento',
  rentabilidad: '/razones?razon=rentabilidad',
}

/** Solo se guarda lo necesario del resultado (no la gráfica completa) */
export function guardarCalculo({ tipo, datos, resultado }) {
  const { nivel, titulo, valorTexto, explicacion, mensaje } = resultado
  return supabase.from('calculos').insert({
    tipo,
    datos,
    resultado: {
      nivel,
      titulo,
      valorTexto: valorTexto ?? resultado.titulo,
      explicacion: explicacion ?? resultado.mensaje,
      mensaje,
      valor: resultado.valor ?? resultado.unidades,
    },
  })
}

export const listarCalculos = () =>
  supabase.from('calculos').select('*').order('created_at', { ascending: false }).limit(100)

export const borrarCalculo = (id) => supabase.from('calculos').delete().eq('id', id)

export const renombrarCalculo = (id, nota) =>
  supabase.from('calculos').update({ nota }).eq('id', id)
