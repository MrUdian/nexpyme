import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const clave = import.meta.env.VITE_SUPABASE_ANON_KEY

/** true cuando ya pusieron las llaves en .env.local */
export const supabaseListo = Boolean(url && clave)

/** Cliente de Supabase, o null si todavía no está configurado (las calculadoras siguen funcionando) */
export const supabase = supabaseListo ? createClient(url, clave) : null

/** Traduce los errores más comunes de Supabase a palabras sencillas */
export function mensajeError(error) {
  // En la consola se ve el error completo, para que el equipo sepa qué pasó
  if (error) console.error('Supabase:', error)
  const m = (error?.message || '').toLowerCase()
  const codigo = error?.code ?? ''
  // La tabla o columna no existe: falta correr supabase/schema.sql en Supabase
  if (
    ['PGRST204', 'PGRST205', '42703', '42P01'].includes(codigo) ||
    m.includes('schema cache') ||
    m.includes('does not exist')
  )
    return 'No pudimos guardar porque la base de datos no está actualizada. Avísale al equipo de NEXPYME.'
  if (m.includes('invalid login')) return 'El correo o la contraseña no son correctos.'
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Ya existe una cuenta con ese correo. Mejor inicia sesión.'
  if (m.includes('password') && m.includes('6'))
    return 'La contraseña debe tener al menos 6 letras o números.'
  if (m.includes('email not confirmed'))
    return 'Primero confirma tu correo: te enviamos un mensaje con un enlace.'
  if (m.includes('rate limit')) return 'Hiciste muchos intentos. Espera unos minutos.'
  if (m.includes('fetch'))
    return 'No hay conexión a internet. Revisa tu conexión e intenta de nuevo.'
  return 'Algo salió mal. Intenta de nuevo en un momento.'
}
