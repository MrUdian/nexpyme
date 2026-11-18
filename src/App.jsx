import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import Layout from './components/Layout.jsx'
import { useAuth } from './context/AuthContext.jsx'
import { supabaseListo } from './lib/supabase.js'
import Inicio from './pages/Inicio.jsx'

const Entrar = lazy(() => import('./pages/Entrar.jsx'))
const Inventario = lazy(() => import('./pages/Inventario.jsx'))
const Panel = lazy(() => import('./pages/Panel.jsx'))
const Perfil = lazy(() => import('./pages/Perfil.jsx'))
const Privacidad = lazy(() => import('./pages/Privacidad.jsx'))
const PuntoEquilibrio = lazy(() => import('./pages/PuntoEquilibrio.jsx'))
const Razones = lazy(() => import('./pages/Razones.jsx'))
const Registro = lazy(() => import('./pages/Registro.jsx'))

/** Solo deja pasar si la persona ya entró a su cuenta */
function SoloConCuenta({ children }) {
  const { usuario, cargando } = useAuth()
  const ubicacion = useLocation()
  if (!supabaseListo) return <SinConfigurar />
  if (cargando) return <p className="p-10 text-center text-lg">Cargando…</p>
  if (!usuario) return <Navigate to="/entrar" replace state={{ desde: ubicacion.pathname }} />
  return children
}

function SinConfigurar() {
  return (
    <div className="max-w-xl mx-auto p-10 text-lg">
      <h1 className="font-display">Falta conectar la base de datos</h1>
      <p>
        Crea el archivo <code>.env.local</code> con los datos de Supabase (mira{' '}
        <code>.env.example</code> y el README). Las calculadoras sí funcionan sin esto.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-lg">Cargando…</p>}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="punto-de-equilibrio" element={<PuntoEquilibrio />} />
          <Route path="razones" element={<Razones />} />
          <Route path="inventario" element={<Inventario />} />
          <Route path="privacidad" element={<Privacidad />} />
          <Route path="entrar" element={supabaseListo ? <Entrar /> : <SinConfigurar />} />
          <Route path="registro" element={supabaseListo ? <Registro /> : <SinConfigurar />} />
          <Route
            path="panel"
            element={
              <SoloConCuenta>
                <Panel />
              </SoloConCuenta>
            }
          />
          <Route
            path="perfil"
            element={
              <SoloConCuenta>
                <Perfil />
              </SoloConCuenta>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
