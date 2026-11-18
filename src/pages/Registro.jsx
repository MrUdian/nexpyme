import { useState } from 'react'
import { Link, Navigate } from 'react-router'
import { BotonPrincipal, Campo, Mensaje, TarjetaFormulario } from '../components/Formulario.jsx'
import { SelectorGiros } from '../components/SelectorGiros.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useGiros } from '../context/GiroContext.jsx'
import { mensajeError } from '../lib/supabase.js'

export default function Registro() {
  const { registrar, usuario } = useAuth()
  const { giros: girosElegidos, setGiros } = useGiros()
  const [f, setF] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmar: '',
    giros: girosElegidos,
  })
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [revisaCorreo, setRevisaCorreo] = useState(false)

  if (usuario) return <Navigate to="/panel" replace />

  const poner = (campo) => (e) => setF({ ...f, [campo]: e.target.value })

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    if (f.nombre.trim().length < 2)
      return setError('Escribe el nombre de tu negocio o un nombre de usuario (mínimo 2 letras).')
    if (f.giros.length === 0) return setError('Elige al menos un tipo de negocio.')
    if (f.contrasena.length < 8)
      return setError('La contraseña debe tener al menos 8 letras o números.')
    if (f.contrasena !== f.confirmar) return setError('Las dos contraseñas no son iguales.')

    setEnviando(true)
    const { data, error: err } = await registrar(f)
    setEnviando(false)
    if (err) return setError(mensajeError(err))
    setGiros(f.giros)
    // Si Supabase pide confirmar el correo, no hay sesión todavía
    if (!data.session) setRevisaCorreo(true)
  }

  if (revisaCorreo) {
    return (
      <TarjetaFormulario titulo="¡Ya casi!">
        <p className="m-0 text-lg">
          Te enviamos un correo a <strong>{f.correo}</strong>. Ábrelo y presiona el enlace para
          activar tu cuenta. Si no lo ves, revisa la carpeta de <em>spam</em> o correo no deseado.
        </p>
      </TarjetaFormulario>
    )
  }

  return (
    <TarjetaFormulario titulo="Crea tu cuenta gratis">
      <p className="m-0 text-suave">
        Con tu cuenta puedes guardar tus resultados y ver cómo cambia tu negocio cada mes.
      </p>
      <form onSubmit={enviar} className="flex flex-col gap-5">
        <Campo
          etiqueta="Nombre de tu negocio o nombre de usuario"
          required
          minLength={2}
          maxLength={80}
          autoComplete="organization"
          value={f.nombre}
          onChange={poner('nombre')}
          placeholder="Ej.: Abarrotes Lupita o lupita23"
          ayuda="No tiene que ser tu nombre completo. Es como te vamos a saludar en tu panel."
        />
        <Campo
          etiqueta="Correo electrónico"
          type="email"
          required
          autoComplete="email"
          value={f.correo}
          onChange={poner('correo')}
          placeholder="tucorreo@ejemplo.com"
        />
        <SelectorGiros value={f.giros} onChange={(giros) => setF({ ...f, giros })} />
        <Campo
          etiqueta="Contraseña"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={f.contrasena}
          onChange={poner('contrasena')}
          ayuda="Mínimo 8 letras o números. No la compartas con nadie."
        />
        <Campo
          etiqueta="Escribe otra vez tu contraseña"
          type="password"
          required
          autoComplete="new-password"
          value={f.confirmar}
          onChange={poner('confirmar')}
        />
        <p className="m-0 text-[15px] text-tenue">
          Al crear tu cuenta aceptas nuestro <Link to="/privacidad">aviso de privacidad</Link>.
        </p>
        <Mensaje>{error}</Mensaje>
        <BotonPrincipal disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Crear mi cuenta'}
        </BotonPrincipal>
      </form>
      <p className="m-0">
        ¿Ya tienes cuenta? <Link to="/entrar">Entra aquí</Link>
      </p>
    </TarjetaFormulario>
  )
}
