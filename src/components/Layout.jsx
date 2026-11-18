import { Link, NavLink, Outlet } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import { supabaseListo } from '../lib/supabase.js'
import { Logo } from './Iconos.jsx'

const claseNav = ({ isActive }) =>
  `px-3.5 py-2.5 rounded-lg no-underline font-semibold whitespace-nowrap ${
    isActive ? 'bg-marca-claro text-marca-oscuro' : 'text-suave hover:bg-fondo'
  }`

export default function Layout() {
  const { usuario } = useAuth()

  return (
    <div className="min-h-screen flex flex-col">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:p-3 focus:bg-white focus:z-50"
      >
        Saltar al contenido
      </a>
      <header className="bg-white border-b border-borde">
        <div className="max-w-6xl mx-auto px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 no-underline text-tinta">
            <Logo />
            <span className="font-display font-bold text-[22px] tracking-wide">NEXPYME</span>
          </Link>
          <nav aria-label="Principal" className="flex flex-wrap items-center gap-1">
            <NavLink to="/" end className={claseNav}>
              Inicio
            </NavLink>
            <NavLink to="/punto-de-equilibrio" className={claseNav}>
              Punto de equilibrio
            </NavLink>
            <NavLink to="/razones" className={claseNav}>
              Razones financieras
            </NavLink>
            <NavLink to="/inventario" className={claseNav}>
              Inventario
            </NavLink>
            {supabaseListo &&
              (usuario ? (
                <NavLink to="/panel" className={claseNav}>
                  Mi panel
                </NavLink>
              ) : (
                <NavLink
                  to="/entrar"
                  className="ml-1 px-4 py-2.5 rounded-lg no-underline font-semibold bg-marca text-white hover:brightness-95"
                >
                  Entrar
                </NavLink>
              ))}
          </nav>
        </div>
      </header>

      <main id="contenido" className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-noche text-[#D7E3DD] text-sm">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-wrap justify-between gap-3">
          <span>
            <strong className="text-white font-display">NEXPYME</strong> · Finanzas sencillas para
            tu negocio
          </span>
          <Link to="/privacidad" className="text-[#D7E3DD]">
            Aviso de privacidad
          </Link>
        </div>
      </footer>
    </div>
  )
}
