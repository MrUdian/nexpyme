import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { BotonPrincipal, Campo, Mensaje, TarjetaFormulario } from '../components/Formulario.jsx'
import { SelectorGiros } from '../components/SelectorGiros.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useGiros } from '../context/GiroContext.jsx'
import { mensajeError } from '../lib/supabase.js'

/** READ / UPDATE / DELETE de la cuenta */
export default function Perfil() {
  const { perfil, usuario, actualizarPerfil, cambiarCorreo, cambiarContrasena, eliminarCuenta } =
    useAuth()
  const navegar = useNavigate()
  const [nombre, setNombre] = useState(perfil?.nombre_completo ?? '')
  const { setGiros } = useGiros()
  const [giros, setGirosPerfil] = useState(perfil?.giros ?? [])
  const [correo, setCorreo] = useState(usuario?.email ?? '')
  const [contrasena, setContrasena] = useState('')
  const [aviso, setAviso] = useState({ tipo: '', texto: '' })

  const responder = (error, exito) =>
    setAviso(error ? { tipo: 'error', texto: mensajeError(error) } : { tipo: 'ok', texto: exito })

  const guardarDatos = async (e) => {
    e.preventDefault()
    if (nombre.trim().length < 2)
      return setAviso({ tipo: 'error', texto: 'El nombre debe tener al menos 2 letras.' })
    if (giros.length === 0)
      return setAviso({ tipo: 'error', texto: 'Elige al menos un tipo de negocio.' })
    const { error } = await actualizarPerfil({ nombre, giros })
    if (!error) setGiros(giros)
    responder(error, 'Listo, guardamos tus datos.')
  }
  const guardarCorreo = async (e) => {
    e.preventDefault()
    const { error } = await cambiarCorreo(correo)
    responder(error, 'Te enviamos un correo para confirmar el cambio. Ábrelo para terminar.')
  }
  const guardarContrasena = async (e) => {
    e.preventDefault()
    if (contrasena.length < 8)
      return setAviso({ tipo: 'error', texto: 'Mínimo 8 letras o números.' })
    const { error } = await cambiarContrasena(contrasena)
    if (!error) setContrasena('')
    responder(error, 'Listo, cambiamos tu contraseña.')
  }
  const borrarCuenta = async () => {
    const ok = window.confirm(
      'Se borrará tu cuenta y TODOS tus cálculos guardados. Esto no se puede deshacer. ¿Seguro?',
    )
    if (!ok) return
    const { error } = await eliminarCuenta()
    if (error) responder(error)
    else navegar('/', { replace: true })
  }

  return (
    <TarjetaFormulario titulo="Mi perfil">
      <Link to="/panel">← Volver a mi panel</Link>
      <Mensaje tipo={aviso.tipo === 'ok' ? 'ok' : 'error'}>{aviso.texto}</Mensaje>

      <form onSubmit={guardarDatos} className="flex flex-col gap-4">
        <Campo
          etiqueta="Nombre de tu negocio o nombre de usuario"
          required
          minLength={2}
          maxLength={80}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <SelectorGiros value={giros} onChange={setGirosPerfil} />
        <BotonPrincipal>Guardar cambios</BotonPrincipal>
      </form>

      <hr className="border-borde w-full" />
      <form onSubmit={guardarCorreo} className="flex flex-col gap-4">
        <Campo
          etiqueta="Correo electrónico"
          type="email"
          required
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
        />
        <BotonPrincipal>Cambiar correo</BotonPrincipal>
      </form>

      <hr className="border-borde w-full" />
      <form onSubmit={guardarContrasena} className="flex flex-col gap-4">
        <Campo
          etiqueta="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
          ayuda="Mínimo 8 letras o números."
        />
        <BotonPrincipal>Cambiar contraseña</BotonPrincipal>
      </form>

      <hr className="border-borde w-full" />
      <div className="flex flex-col gap-2">
        <h2 className="m-0 text-xl text-rojo">Borrar mi cuenta</h2>
        <p className="m-0 text-tenue">Se borran tus datos y todos tus cálculos para siempre.</p>
        <button
          type="button"
          onClick={borrarCuenta}
          className="self-start min-h-12 px-5 rounded-xl border-2 border-rojo text-rojo bg-white font-semibold cursor-pointer hover:bg-rojo-claro"
        >
          Borrar mi cuenta
        </button>
      </div>
    </TarjetaFormulario>
  )
}
