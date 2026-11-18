import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { olvidarCalculos } from '../lib/recordar.js'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(Boolean(supabase))

  const cargarPerfil = useCallback(async (usuario) => {
    if (!supabase || !usuario) {
      setPerfil(null)
      return
    }
    const { data } = await supabase.from('perfiles').select('*').eq('id', usuario.id).maybeSingle()
    setPerfil(data)
  }, [])

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(async ({ data }) => {
      setSesion(data.session)
      await cargarPerfil(data.session?.user)
      setCargando(false)
    })
    const { data: escucha } = supabase.auth.onAuthStateChange((_evento, nueva) => {
      setSesion(nueva)
      // Se difiere para no bloquear el aviso de Supabase (recomendación de su documentación)
      setTimeout(() => cargarPerfil(nueva?.user), 0)
    })
    return () => escucha.subscription.unsubscribe()
  }, [cargarPerfil])

  const valor = useMemo(() => {
    const usuario = sesion?.user ?? null
    return {
      usuario,
      perfil,
      cargando,

      // CREATE: crea la cuenta. El perfil (nombre y giros) lo guarda un trigger en la BD.
      registrar: ({ nombre, correo, contrasena, giros }) =>
        supabase.auth.signUp({
          email: correo.trim(),
          password: contrasena,
          options: {
            data: { nombre_completo: nombre.trim(), giros },
            emailRedirectTo: `${window.location.origin}/panel`,
          },
        }),

      iniciarSesion: ({ correo, contrasena }) =>
        supabase.auth.signInWithPassword({ email: correo.trim(), password: contrasena }),

      cerrarSesion: () => {
        olvidarCalculos()
        return supabase.auth.signOut()
      },

      // UPDATE: nombre (del negocio o de usuario) y giros
      actualizarPerfil: async ({ nombre, giros }) => {
        const res = await supabase
          .from('perfiles')
          .update({ nombre_completo: nombre.trim(), giros })
          .eq('id', usuario.id)
          .select()
          .single()
        if (!res.error) setPerfil(res.data)
        return res
      },

      // UPDATE: correo (Supabase manda un enlace para confirmarlo) y contraseña
      cambiarCorreo: (correo) => supabase.auth.updateUser({ email: correo.trim() }),
      cambiarContrasena: (contrasena) => supabase.auth.updateUser({ password: contrasena }),

      // DELETE: borra la cuenta y todos sus cálculos (función eliminar_mi_cuenta en schema.sql)
      eliminarCuenta: async () => {
        const res = await supabase.rpc('eliminar_mi_cuenta')
        if (!res.error) {
          olvidarCalculos()
          await supabase.auth.signOut()
        }
        return res
      },
    }
  }, [sesion, perfil, cargando])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export const useAuth = () => useContext(AuthContext)
