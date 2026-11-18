import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { BotonPrincipal, Campo, Mensaje, TarjetaFormulario } from '../components/Formulario.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { mensajeError } from '../lib/supabase.js'

export default function Entrar() {
  const { iniciarSesion, usuario } = useAuth()
  const destino = useLocation().state?.desde ?? '/panel'
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (usuario) return <Navigate to={destino} replace />

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    const { error: err } = await iniciarSesion({ correo, contrasena })
    setEnviando(false)
    if (err) setError(mensajeError(err))
  }

  return (
    <TarjetaFormulario titulo="Entra a tu cuenta">
      <form onSubmit={enviar} className="flex flex-col gap-5">
        <Campo
          etiqueta="Correo electrónico"
          type="email"
          required
          autoComplete="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <Campo
          etiqueta="Contraseña"
          type="password"
          required
          autoComplete="current-password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />
        <Mensaje>{error}</Mensaje>
        <BotonPrincipal disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</BotonPrincipal>
      </form>
      <p className="m-0">
        ¿No tienes cuenta? <Link to="/registro">Créala gratis</Link>
      </p>
    </TarjetaFormulario>
  )
}
