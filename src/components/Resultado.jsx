import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import { guardarCalculo } from '../lib/calculos.js'
import { descargarPDF } from '../lib/pdf.js'
import { supabaseListo, mensajeError } from '../lib/supabase.js'
import { leerEnVoz, vozDisponible } from '../lib/voz.js'
import { IconoBocina, IconoDescarga, IconoGuardar, Senal } from './Iconos.jsx'

const fondos = {
  peligro: 'bg-rojo-claro border-rojo/30',
  cuidado: 'bg-amarillo-claro border-amarillo/30',
  bien: 'bg-verde-claro border-verde/30',
  sobra: 'bg-azul-claro border-azul/30',
  meta: 'bg-verde-claro border-verde/30',
}
const textos = {
  peligro: 'text-rojo',
  cuidado: 'text-amarillo',
  bien: 'text-verde',
  sobra: 'text-azul',
  meta: 'text-verde',
}

/** Mensaje rojo cuando faltan datos */
export function AvisoError({ children }) {
  return (
    <div role="alert" className="p-4 rounded-xl bg-rojo-claro text-rojo font-medium text-lg">
      {children}
    </div>
  )
}

/** Tarjeta grande con el semáforo, el número y lo que significa */
export function TarjetaResultado({ resultado, children }) {
  const r = resultado
  const textoVoz = [r.titulo, r.valorTexto, r.explicacion, r.mensaje, `Consejo: ${r.consejo}`]
    .filter(Boolean)
    .join('. ')

  return (
    <div className={`rounded-2xl border-2 p-6 flex flex-col gap-5 ${fondos[r.nivel]}`}>
      <div className="flex flex-wrap items-center gap-4">
        <Senal nivel={r.nivel} />
        <div className="flex flex-col">
          <span className={`text-2xl sm:text-3xl font-bold font-display ${textos[r.nivel]}`}>
            {r.titulo}
          </span>
          <span className="text-4xl sm:text-5xl font-bold font-display leading-tight">
            {r.valorTexto}
          </span>
        </div>
      </div>

      {r.explicacion && <p className="m-0 text-xl font-semibold">{r.explicacion}</p>}
      <p className="m-0 text-lg">{r.mensaje}</p>

      {children}

      {r.consejo && (
        <div className="p-4 rounded-xl bg-white/80 border border-white text-lg">
          <strong>💡 ¿Qué puedo hacer? </strong>
          {r.consejo}
        </div>
      )}

      {vozDisponible() && (
        <button
          type="button"
          data-html2canvas-ignore
          onClick={() => leerEnVoz(textoVoz)}
          className="self-start min-h-11 px-4 rounded-xl bg-white border-2 border-campo font-semibold flex items-center gap-2 cursor-pointer hover:bg-fondo"
        >
          <IconoBocina /> Escuchar resultado
        </button>
      )}
    </div>
  )
}

/**
 * Barra de colores con una flecha que marca dónde quedó el resultado.
 * zonas: [{ hasta, color, texto }] en orden; marcas: números que se escriben abajo
 */
export function Escala({ valor, maximo, zonas, marcas, formato = (n) => n }) {
  const pos = (n) => `${(Math.max(0, Math.min(n, maximo)) / maximo) * 100}%`
  const anchos = zonas.map((z, i) => {
    const desde = i === 0 ? 0 : zonas[i - 1].hasta
    return ((Math.min(z.hasta, maximo) - desde) / maximo) * 100
  })
  return (
    <div className="flex flex-col gap-1.5" aria-hidden="true">
      <div className="relative h-11 flex rounded-xl overflow-visible">
        {zonas.map((z, i) => {
          return (
            <div
              key={z.texto + i}
              style={{ width: `${anchos[i]}%`, background: z.color }}
              className={`flex items-center justify-center text-[13px] font-bold text-tinta overflow-hidden whitespace-nowrap ${
                i === 0 ? 'rounded-l-xl' : ''
              } ${i === zonas.length - 1 ? 'rounded-r-xl' : ''}`}
            >
              {z.texto}
            </div>
          )
        })}
        <div
          className="absolute -top-2 -bottom-2 w-1.5 -ml-[3px] bg-tinta rounded"
          style={{ left: pos(valor) }}
        >
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-sm font-bold whitespace-nowrap bg-tinta text-white px-2 rounded">
            Tú
          </span>
        </div>
      </div>
      <div className="relative h-5 text-[13px] text-tenue">
        {marcas.map((m) => (
          <span key={m} className="absolute -translate-x-1/2" style={{ left: pos(m) }}>
            {formato(m)}
            {m === maximo ? '+' : ''}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Botones de Guardar y Descargar PDF debajo del resultado */
export function AccionesResultado({ tipo, datos, resultado, reporteRef, tituloPdf }) {
  const { usuario, perfil } = useAuth()
  const [estado, setEstado] = useState('')
  const [creandoPdf, setCreandoPdf] = useState(false)

  const guardar = async () => {
    setEstado('guardando')
    const { error } = await guardarCalculo({ tipo, datos, resultado })
    setEstado(error ? mensajeError(error) : 'guardado')
  }

  const pdf = async () => {
    setCreandoPdf(true)
    try {
      await descargarPDF({
        elemento: reporteRef.current,
        titulo: tituloPdf,
        nombreArchivo: `NEXPYME-${tituloPdf.replace(/\s+/g, '-')}`,
        persona: perfil?.nombre_completo,
      })
    } finally {
      setCreandoPdf(false)
    }
  }

  const boton =
    'min-h-12 px-5 rounded-xl font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-60'

  return (
    <div className="flex flex-wrap items-center gap-3" data-html2canvas-ignore>
      <button
        type="button"
        onClick={pdf}
        disabled={creandoPdf}
        className={`${boton} bg-tinta text-white hover:brightness-110`}
      >
        <IconoDescarga /> {creandoPdf ? 'Creando PDF…' : 'Descargar en PDF'}
      </button>

      {supabaseListo &&
        (usuario ? (
          <button
            type="button"
            onClick={guardar}
            disabled={estado === 'guardando' || estado === 'guardado'}
            className={`${boton} bg-white border-2 border-campo hover:bg-fondo`}
          >
            <IconoGuardar />
            {estado === 'guardado' ? '¡Guardado en tu panel!' : 'Guardar en mi panel'}
          </button>
        ) : (
          <p className="m-0 text-tenue">
            <Link to="/registro">Crea tu cuenta gratis</Link> para guardar tus resultados y ver cómo
            cambian cada mes.
          </p>
        ))}
      {estado && !['guardando', 'guardado'].includes(estado) && (
        <span className="text-rojo font-medium">{estado}</span>
      )}
    </div>
  )
}
