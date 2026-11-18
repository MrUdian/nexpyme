/**
 * Inventario: lista de productos (mercancía, materia prima o insumos).
 * - Con cuenta: se guarda en Supabase (tabla "inventarios", una fila por persona).
 * - Sin cuenta: se guarda en este navegador (localStorage).
 */
import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { aNumeroOCero } from './formato.js'
import { supabase } from './supabase.js'

const LLAVE = 'nexpyme-inventario'

export const productoVacio = () => ({
  id: `p-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
  nombre: '',
  cantidad: '',
  costo: '',
  precio: '',
})

/** Totales del inventario (todo con números ya convertidos) */
export function totalesInventario(productos = []) {
  return productos.reduce(
    (t, p) => {
      const cantidad = aNumeroOCero(p.cantidad)
      const costo = cantidad * aNumeroOCero(p.costo)
      const precio = cantidad * aNumeroOCero(p.precio)
      return {
        piezas: t.piezas + cantidad,
        costo: t.costo + costo,
        // La ganancia posible solo cuenta los productos que tienen precio de venta
        venta: t.venta + precio,
        costoConPrecio: t.costoConPrecio + (aNumeroOCero(p.precio) > 0 ? costo : 0),
      }
    },
    { piezas: 0, costo: 0, venta: 0, costoConPrecio: 0 },
  )
}

export const limpiar = (productos) =>
  productos
    .filter((p) => p.nombre.trim() || aNumeroOCero(p.cantidad) || aNumeroOCero(p.costo))
    .map(({ id, nombre, cantidad, costo, precio }) => ({
      id,
      nombre: nombre.trim(),
      cantidad,
      costo,
      precio,
    }))

function leerLocal() {
  try {
    const lista = JSON.parse(localStorage.getItem(LLAVE))
    return Array.isArray(lista) ? lista : []
  } catch {
    return []
  }
}

function guardarLocal(productos) {
  try {
    localStorage.setItem(LLAVE, JSON.stringify(productos))
  } catch {
    // sin localStorage: no pasa nada, solo no se recuerda
  }
}

/** Lee y guarda el inventario de la persona */
export function useInventario() {
  const { usuario } = useAuth() ?? {}
  const [productos, setProductos] = useState(leerLocal)
  const [cargando, setCargando] = useState(Boolean(usuario && supabase))
  const enLaNube = Boolean(usuario && supabase)

  useEffect(() => {
    if (!enLaNube) return
    let vigente = true
    supabase
      .from('inventarios')
      .select('productos')
      .eq('user_id', usuario.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!vigente) return
        if (data?.productos?.length) setProductos(data.productos)
        setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [enLaNube, usuario?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const guardar = useCallback(
    async (lista) => {
      const limpios = limpiar(lista)
      guardarLocal(limpios)
      setProductos(limpios)
      if (!enLaNube) return { error: null }
      return supabase.from('inventarios').upsert({
        user_id: usuario.id,
        productos: limpios,
        actualizado_en: new Date().toISOString(),
      })
    },
    [enLaNube, usuario],
  )

  return { productos, guardar, cargando, enLaNube, totales: totalesInventario(productos) }
}
