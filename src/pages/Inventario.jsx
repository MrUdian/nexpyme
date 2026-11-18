import { useState } from 'react'
import { Link } from 'react-router'
import { IconoBasura, IconoGuardar, IconoMas } from '../components/Iconos.jsx'
import { Encabezado } from '../components/Pagina.jsx'
import { BarraGiros, SoloConGiro } from '../components/SelectorGiros.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useGiros } from '../context/GiroContext.jsx'
import { aNumeroOCero, numero, pesos } from '../lib/formato.js'
import { ordenarGiros } from '../lib/giros.js'
import { limpiar, productoVacio, totalesInventario, useInventario } from '../lib/inventario.js'
import { mensajeError, supabaseListo } from '../lib/supabase.js'

/** Qué se guarda en el inventario según el giro */
const QUE_ES = {
  comercial: 'la mercancía que tienes para vender',
  servicios: 'los productos e insumos que usas o revendes (tintes, cremas, refacciones…)',
  produccion: 'tu materia prima y los productos que ya hiciste y no has vendido',
}

const EJEMPLOS = {
  comercial: [
    ['Refresco 600 ml', '48', '14', '20'],
    ['Leche 1 L', '24', '24', '29'],
    ['Galletas', '30', '12', '17'],
    ['Arroz 1 kg', '20', '26', '34'],
  ],
  servicios: [
    ['Tinte para cabello', '12', '85', ''],
    ['Shampoo profesional 1 L', '4', '160', ''],
    ['Crema para peinar (reventa)', '10', '70', '120'],
  ],
  produccion: [
    ['Harina (bulto 44 kg)', '3', '620', ''],
    ['Azúcar (kg)', '20', '28', ''],
    ['Conchas listas para vender', '60', '4.5', '8'],
  ],
}

const caja =
  'w-full min-h-11 px-3 border-2 border-campo rounded-lg bg-white outline-none focus:border-marca text-base'

export default function Inventario() {
  const { usuario } = useAuth() ?? {}
  const { giros } = useGiros()
  const { productos: guardados, guardar, cargando, enLaNube } = useInventario()
  const [lista, setLista] = useState(guardados.length ? guardados : [productoVacio()])
  const [estado, setEstado] = useState('')
  const [confirmarBorrar, setConfirmarBorrar] = useState(false)

  // Cuando llega el inventario de la nube, se muestra (una sola vez)
  const [yaCargo, setYaCargo] = useState(!cargando)
  if (!yaCargo && !cargando) {
    setYaCargo(true)
    if (guardados.length) setLista(guardados)
  }

  const elegidos = ordenarGiros(giros).length ? ordenarGiros(giros) : ['comercial']
  const t = totalesInventario(lista)
  const cambiar = (i, cambios) => {
    setEstado('')
    setLista((l) => l.map((p, j) => (j === i ? { ...p, ...cambios } : p)))
  }

  const onGuardar = async () => {
    setEstado('guardando')
    const { error } = await guardar(lista)
    setEstado(error ? mensajeError(error) : 'guardado')
  }

  const ponerEjemplo = (giro) => {
    setEstado('')
    setLista(
      EJEMPLOS[giro].map(([nombre, cantidad, costo, precio]) => ({
        ...productoVacio(),
        nombre,
        cantidad,
        costo,
        precio,
      })),
    )
  }

  const borrarTodo = async () => {
    setConfirmarBorrar(false)
    setEstado('guardando')
    const { error } = await guardar([])
    setLista([productoVacio()])
    setEstado(error ? mensajeError(error) : 'borrado')
  }

  // ¿Hay cambios que todavía no se guardan? (Liquidez y Punto de equilibrio usan lo guardado)
  const sinGuardar = JSON.stringify(limpiar(lista)) !== JSON.stringify(limpiar(guardados))

  return (
    <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col gap-8">
      <Encabezado nombre="Mi inventario" pregunta="¿Cuánto vale lo que tengo guardado?">
        Anota {elegidos.map((g) => QUE_ES[g]).join('; y también ')}. Te decimos cuánto dinero tienes
        ahí y lo puedes usar en las calculadoras.
      </Encabezado>

      <BarraGiros onEjemplo={ponerEjemplo} />

      <SoloConGiro>
        <section className="bg-white border border-borde rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
          <h2 className="m-0 text-xl">Tus productos</h2>
          <p className="m-0 text-[15px] text-tenue">
            El <strong>costo</strong> es lo que pagaste por cada uno. El{' '}
            <strong>precio de venta</strong> es opcional: déjalo vacío si es algo que usas y no
            vendes (por ejemplo, la harina o el tinte).
          </p>

          <div className="hidden md:grid grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.4fr)_auto] gap-3 text-sm font-semibold text-tenue px-1">
            <span>Producto</span>
            <span>Cantidad</span>
            <span>Costo de cada uno</span>
            <span>Precio de venta</span>
            <span>Vale</span>
            <span className="w-11" />
          </div>

          <ul className="m-0 p-0 list-none flex flex-col gap-3">
            {lista.map((p, i) => {
              const vale = aNumeroOCero(p.cantidad) * aNumeroOCero(p.costo)
              const deja = aNumeroOCero(p.precio) - aNumeroOCero(p.costo)
              return (
                <li
                  key={p.id}
                  className="grid grid-cols-2 md:grid-cols-[minmax(0,3fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.4fr)_auto] gap-3 items-center p-3 md:p-1 rounded-xl bg-fondo/60 md:bg-transparent"
                >
                  <label className="col-span-2 md:col-span-1 flex flex-col gap-1">
                    <span className="md:sr-only text-sm font-semibold">Producto</span>
                    <input
                      className={caja}
                      value={p.nombre}
                      placeholder="Ej.: Refresco 600 ml"
                      onChange={(e) => cambiar(i, { nombre: e.target.value })}
                    />
                  </label>
                  {[
                    ['cantidad', 'Cantidad', ''],
                    ['costo', 'Costo de cada uno', '$'],
                    ['precio', 'Precio de venta', '$'],
                  ].map(([campo, texto, signo]) => (
                    <label key={campo} className="flex flex-col gap-1">
                      <span className="md:sr-only text-sm font-semibold">{texto}</span>
                      <span className="flex items-center gap-1.5 min-h-11 px-3 border-2 border-campo rounded-lg bg-white focus-within:border-marca">
                        {signo && <span className="text-tenue font-semibold">{signo}</span>}
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="any"
                          placeholder="0"
                          aria-label={`${texto} de ${p.nombre || 'este producto'}`}
                          className="w-full min-w-0 bg-transparent outline-none text-base"
                          value={p[campo]}
                          onChange={(e) => cambiar(i, { [campo]: e.target.value })}
                        />
                      </span>
                    </label>
                  ))}
                  <span className="flex flex-col">
                    <strong>{pesos(vale)}</strong>
                    {aNumeroOCero(p.precio) > 0 && (
                      <span
                        className={`text-sm ${deja < 0 ? 'text-rojo font-semibold' : 'text-tenue'}`}
                      >
                        {deja < 0 ? `¡Pierdes ${pesos(-deja)} c/u!` : `Te deja ${pesos(deja)} c/u`}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLista((l) => l.filter((_, j) => j !== i))}
                    aria-label={`Quitar ${p.nombre || 'este producto'}`}
                    className="justify-self-end min-h-11 w-11 rounded-xl border-2 border-campo bg-white text-rojo flex items-center justify-center cursor-pointer hover:bg-rojo-claro"
                  >
                    <IconoBasura />
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setLista((l) => [...l, productoVacio()])}
              className="min-h-12 px-4 rounded-xl border-2 border-dashed border-marca text-marca-oscuro bg-marca-claro/50 font-semibold flex items-center gap-2 cursor-pointer hover:bg-marca-claro"
            >
              <IconoMas /> Agregar producto
            </button>
          </div>
        </section>

        <section aria-label="Totales" className="grid sm:grid-cols-3 gap-4">
          <Total
            titulo="Lo que vale tu inventario"
            valor={pesos(t.costo)}
            nota={`${numero(t.piezas, 0)} piezas en total, a lo que te costaron`}
          />
          <Total
            titulo="Si vendieras todo lo que tiene precio"
            valor={pesos(t.venta)}
            nota="Solo cuenta los productos con precio de venta"
          />
          <Total
            titulo="Ganancia posible"
            valor={pesos(t.venta - t.costoConPrecio)}
            nota="Lo que te quedaría al venderlos, antes de pagar gastos"
            destacado
          />
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onGuardar}
            disabled={estado === 'guardando'}
            className="min-h-14 px-7 rounded-xl bg-marca text-white text-lg font-bold flex items-center gap-2 cursor-pointer hover:brightness-95 disabled:opacity-60"
          >
            <IconoGuardar /> {estado === 'guardando' ? 'Guardando…' : 'Guardar mi inventario'}
          </button>
          <Link
            to="/razones?razon=liquidez"
            className="min-h-14 px-5 rounded-xl bg-white border-2 border-campo font-semibold no-underline text-tinta flex items-center hover:bg-fondo"
          >
            Usarlo en Liquidez →
          </Link>
          {estado === 'guardado' && (
            <span role="status" className="text-verde font-semibold">
              {enLaNube ? '¡Guardado en tu cuenta!' : '¡Guardado en este navegador!'}
            </span>
          )}
          {estado === 'borrado' && (
            <span role="status" className="text-verde font-semibold">
              Listo, se borró todo tu inventario.
            </span>
          )}
          {estado && !['guardando', 'guardado', 'borrado'].includes(estado) && (
            <span role="alert" className="text-rojo font-medium">
              {estado}
            </span>
          )}
        </div>
        <p
          className={`m-0 p-4 rounded-xl text-[17px] ${
            sinGuardar
              ? 'bg-oro-claro text-[#6B4300] font-semibold'
              : 'bg-white border border-borde text-suave'
          }`}
        >
          {sinGuardar
            ? '⚠️ Tienes cambios sin guardar. Primero presiona “Guardar mi inventario”: Liquidez y Punto de equilibrio solo usan tu inventario guardado.'
            : 'Para usar tu inventario en Liquidez o en Punto de equilibrio, primero guárdalo. Allá aparece un botón para usar su valor con un clic.'}
        </p>

        <div className="flex flex-col gap-3 pt-4 border-t border-borde">
          {!confirmarBorrar ? (
            <button
              type="button"
              onClick={() => setConfirmarBorrar(true)}
              className="self-start min-h-12 px-4 rounded-xl bg-white border-2 border-rojo/40 text-rojo font-semibold flex items-center gap-2 cursor-pointer hover:bg-rojo-claro"
            >
              <IconoBasura /> Eliminar todo el inventario
            </button>
          ) : (
            <div
              role="alertdialog"
              aria-label="Confirmar"
              className="p-4 rounded-xl bg-rojo-claro flex flex-col gap-3"
            >
              <p className="m-0 text-lg">
                <strong>¿Seguro que quieres borrar todo tu inventario?</strong> Se quitan todos los
                productos {enLaNube ? 'de tu cuenta' : 'de este navegador'} y no se pueden
                recuperar.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={borrarTodo}
                  className="min-h-12 px-5 rounded-xl bg-rojo text-white font-bold cursor-pointer hover:brightness-95"
                >
                  Sí, borrar todo
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmarBorrar(false)}
                  className="min-h-12 px-5 rounded-xl bg-white border-2 border-campo font-semibold cursor-pointer"
                >
                  No, cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </SoloConGiro>

      {!usuario && supabaseListo && (
        <p className="m-0 text-tenue">
          Sin cuenta, tu inventario solo se guarda en este navegador.{' '}
          <Link to="/registro">Crea tu cuenta gratis</Link> para tenerlo en cualquier celular o
          computadora.
        </p>
      )}
    </div>
  )
}

function Total({ titulo, valor, nota, destacado }) {
  return (
    <div
      className={`rounded-2xl border-2 p-5 flex flex-col gap-1 ${
        destacado ? 'bg-verde-claro border-verde/30' : 'bg-white border-borde'
      }`}
    >
      <span className="font-semibold text-suave">{titulo}</span>
      <span className="font-display text-3xl font-bold">{valor}</span>
      <span className="text-sm text-tenue">{nota}</span>
    </div>
  )
}
