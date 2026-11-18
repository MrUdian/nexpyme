/**
 * Fórmulas e interpretaciones de NEXPYME.
 * Todo está aquí (sin nada de pantalla) para poder probarlo con Vitest.
 *
 * Cada función regresa:
 *   { ok: false, error: 'mensaje' }  cuando faltan datos o no se puede calcular
 *   { ok: true, nivel, titulo, mensaje, consejo, ... } cuando sí hay resultado
 *
 * nivel = 'peligro' | 'cuidado' | 'bien' | 'sobra'  (rojo, amarillo, verde, azul)
 */
import { aNumero, aNumeroOCero, numero, pesos } from './formato.js'

const sumar = (lista) => lista.reduce((total, c) => total + aNumeroOCero(c.monto), 0)

const hayNegativos = (lista) => lista.some((c) => aNumeroOCero(c.monto) < 0)

/* ------------------------------------------------------------------ */
/* PUNTO DE EQUILIBRIO                                                  */
/* ------------------------------------------------------------------ */

/** Un mes tiene 52 ÷ 12 = 4.33 semanas */
export const SEMANAS_POR_MES = 52 / 12

const PERIODOS = { mes: 'al mes', semana: 'a la semana' }

/** Pasa una cantidad de un periodo al otro */
const aOtroPeriodo = (n, de) => (de === 'mes' ? n / SEMANAS_POR_MES : n * SEMANAS_POR_MES)

const redondearArriba = (n) => Math.ceil(n - 1e-9)

/**
 * Puntos para la gráfica de equilibrio.
 * ingresos = x · pendienteIngreso   costos = fijos + x · pendienteCosto
 * perdida / ganancia son rangos [abajo, arriba] para pintar las zonas de color.
 */
export function datosGrafica({ fijos, pendienteIngreso, pendienteCosto, xEquilibrio, xMaximo }) {
  const pasos = 12
  const xs = Array.from({ length: pasos + 1 }, (_, i) => (xMaximo * i) / pasos)
  xs.push(xEquilibrio)
  xs.sort((a, b) => a - b)
  return xs.map((x) => {
    const ingresos = x * pendienteIngreso
    const costos = fijos + x * pendienteCosto
    return {
      x,
      ingresos,
      costos,
      fijos,
      perdida: x <= xEquilibrio + 1e-9 ? [ingresos, costos] : null,
      ganancia: x >= xEquilibrio - 1e-9 ? [costos, ingresos] : null,
    }
  })
}

/**
 * Punto de equilibrio de UN producto o servicio.
 * periodo: 'mes' | 'semana' (de qué periodo son los gastos fijos)
 * unidad: ['corte', 'cortes'] para escribir el resultado con palabras del negocio
 */
export function puntoEquilibrio({
  gastosFijos,
  precio,
  costo,
  periodo = 'mes',
  unidad = ['unidad', 'unidades'],
}) {
  const F = aNumero(gastosFijos)
  const P = aNumero(precio)
  const C = aNumero(costo)

  if ([F, P, C].some(Number.isNaN)) return { ok: false, error: 'Te falta llenar alguna casilla.' }
  if (F < 0 || P < 0 || C < 0) return { ok: false, error: 'Los números no pueden ser negativos.' }
  if (P === 0) return { ok: false, error: 'El precio de venta tiene que ser mayor a $0.' }
  if (P <= C) {
    return {
      ok: false,
      error:
        'Tu precio de venta es igual o menor a lo que te cuesta. Así, cada venta te hace perder dinero y nunca vas a llegar al punto de equilibrio. Sube tu precio o baja tu costo.',
    }
  }

  const margen = P - C
  const exactas = F / margen
  const unidades = redondearArriba(exactas)
  const valor = F / (1 - C / P)
  const otro = periodo === 'mes' ? 'semana' : 'mes'
  const exactasOtro = aOtroPeriodo(exactas, periodo)
  const porPeriodo = {
    [periodo]: { unidades, valor },
    [otro]: { unidades: redondearArriba(exactasOtro), valor: exactasOtro * P },
  }
  const nombre = (n) => `${numero(n, 0)} ${n === 1 ? unidad[0] : unidad[1]}`

  return {
    ok: true,
    tipoCalculo: 'unidades',
    nivel: 'meta',
    periodo,
    unidades,
    unidadesExactas: exactas,
    valor,
    margen,
    porPeriodo,
    unidad,
    grafica: datosGrafica({
      fijos: F,
      pendienteIngreso: P,
      pendienteCosto: C,
      xEquilibrio: exactas,
      xMaximo: Math.max(10, Math.ceil(exactas * 2)),
    }),
    titulo: `Tu meta para no perder (${PERIODOS[periodo]})`,
    valorTexto: nombre(unidades),
    explicacion: `Eso es un total de ${pesos(valor)} en ventas ${PERIODOS[periodo]}.`,
    mensaje: `Si vendes menos de ${nombre(unidades)}, pierdes dinero. Si vendes más, empiezas a ganar.`,
    consejo: `Cada ${unidad[0]} que vendes te deja ${pesos(margen)} libres para pagar tus gastos fijos.`,
  }
}

/**
 * Punto de equilibrio de TODO el negocio (varios productos), en pesos.
 * Fórmulas del borrador del giro comercial:
 *   CVT = costo de lo vendido + otros costos variables
 *   MC  = ventas − CVT        MC% = MC ÷ ventas        PE = gastos fijos ÷ MC%
 */
export function puntoEquilibrioTotal({
  gastosFijos,
  ventas,
  costoVendido,
  otrosVariables,
  periodo = 'mes',
}) {
  const F = aNumero(gastosFijos)
  const V = aNumero(ventas)
  const CV = aNumero(costoVendido)
  const OCV = aNumeroOCero(otrosVariables)

  if ([F, V, CV].some(Number.isNaN)) return { ok: false, error: 'Te falta llenar alguna casilla.' }
  if ([F, V, CV, OCV].some((n) => n < 0))
    return { ok: false, error: 'Los números no pueden ser negativos.' }
  if (V === 0) return { ok: false, error: 'Tus ventas tienen que ser mayores a $0.' }

  const cvt = CV + OCV
  if (cvt >= V) {
    return {
      ok: false,
      error:
        'Lo que te cuesta lo que vendes es igual o más que tus ventas. Así nunca vas a llegar al punto de equilibrio. Revisa tus precios o tus costos.',
    }
  }

  const mc = V - cvt
  const mcPct = mc / V
  const valor = F / mcPct
  const utilidad = mc - F
  const margenSeguridad = (V - valor) / V
  const otro = periodo === 'mes' ? 'semana' : 'mes'
  const porPeriodo = {
    [periodo]: { valor },
    [otro]: { valor: aOtroPeriodo(valor, periodo) },
  }
  const arriba = V >= valor

  return {
    ok: true,
    tipoCalculo: 'pesos',
    nivel: arriba ? 'bien' : 'peligro',
    periodo,
    valor,
    ventas: V,
    cvt,
    mc,
    mcPct,
    utilidad,
    margenSeguridad,
    porPeriodo,
    grafica: datosGrafica({
      fijos: F,
      pendienteIngreso: 1,
      pendienteCosto: cvt / V,
      xEquilibrio: valor,
      xMaximo: Math.max(valor * 2, V * 1.15),
    }),
    titulo: `Tu meta de ventas para no perder (${PERIODOS[periodo]})`,
    valorTexto: pesos(valor),
    explicacion: `De cada $100 que vendes, te quedan $${numero(mcPct * 100)} para pagar tus gastos fijos.`,
    mensaje: arriba
      ? `Hoy vendes ${pesos(V)}: estás ${pesos(V - valor)} arriba de tu meta, así que sí ganas (unos ${pesos(utilidad)} ${PERIODOS[periodo]}).`
      : `Hoy vendes ${pesos(V)}: te faltan ${pesos(valor - V)} para dejar de perder. Ahorita pierdes unos ${pesos(Math.abs(utilidad))} ${PERIODOS[periodo]}.`,
    consejo: arriba
      ? `Tus ventas podrían bajar hasta ${numero(margenSeguridad * 100, 1)}% y todavía no perderías. Ese es tu margen de seguridad.`
      : 'Busca vender más de los productos que más te dejan, revisa tus precios o baja algún gasto fijo.',
  }
}

/* ------------------------------------------------------------------ */
/* RAZÓN DE LIQUIDEZ                                                    */
/* activos y pasivos son listas: [{ concepto: 'Inventario', monto: '30000' }] */
/* (así se pueden agregar los renglones "Otro" que escribe la persona)  */
/* ------------------------------------------------------------------ */
export function liquidez({ activos, pasivos }) {
  if (hayNegativos(activos) || hayNegativos(pasivos)) {
    return { ok: false, error: 'Los números no pueden ser negativos.' }
  }
  const tienes = sumar(activos)
  const debes = sumar(pasivos)

  if (debes === 0) {
    return {
      ok: false,
      error:
        'Escribe al menos una deuda en "Lo que debes pagar". Si de verdad no debes nada a corto plazo, ¡no hay riesgo de que te falte dinero para pagar!',
    }
  }

  const r = tienes / debes
  const base = {
    ok: true,
    valor: r,
    tienes,
    debes,
    valorTexto: numero(r),
    explicacion: `Por cada $1 que debes, tienes $${numero(r)} para pagarlo.`,
  }

  if (Math.abs(r - 1) < 0.005) {
    return {
      ...base,
      nivel: 'cuidado',
      titulo: 'Estás justo',
      mensaje:
        'Tienes exactamente lo mismo que debes. Puedes pagar, pero te quedas en cero, sin ahorro para emergencias.',
      consejo: 'Intenta guardar un poco cada mes para tener un colchón.',
    }
  }
  if (r < 1) {
    return {
      ...base,
      nivel: 'peligro',
      titulo: 'Estás en peligro',
      mensaje:
        'No te alcanza para pagar lo que debes este año. Si todos a los que les debes te cobraran hoy, tendrías problemas.',
      consejo:
        'Cobra lo que te deben, vende inventario que tengas parado y platica con tus proveedores para tener más tiempo de pago.',
    }
  }
  if (r < 1.5) {
    // PROPUESTA: el documento del equipo no define este rango (entre 1 y 1.5). Validar con el equipo.
    return {
      ...base,
      nivel: 'cuidado',
      titulo: 'Alcanzas, pero con poco ahorro',
      mensaje:
        'Sí puedes pagar lo que debes, pero te sobra poco. Una emergencia o un mes de pocas ventas te puede poner en aprietos.',
      consejo: 'Trata de juntar un poco más de dinero o de bajar tus deudas de corto plazo.',
    }
  }
  if (r <= 2) {
    return {
      ...base,
      nivel: 'bien',
      titulo: '¡Punto ideal!',
      mensaje:
        'Puedes pagar tus deudas sin problema y todavía te sobra dinero por si pasa cualquier emergencia.',
      consejo: 'Sigue así. Revisa este número cada mes.',
    }
  }
  return {
    ...base,
    nivel: 'sobra',
    titulo: 'Tienes dinero parado',
    mensaje:
      'Tienes mucho más de lo que debes. Es seguro, pero ese dinero está "bajo el colchón" sin trabajar.',
    consejo:
      'Podrías usar una parte para comprar más mercancía, mejorar tu equipo o hacer crecer el negocio.',
  }
}

/* ------------------------------------------------------------------ */
/* RAZÓN DE ENDEUDAMIENTO = (Pasivo total / Activo total) × 100         */
/* ------------------------------------------------------------------ */
export function endeudamiento({ activoTotal, pasivoTotal }) {
  const A = aNumero(activoTotal)
  const D = aNumero(pasivoTotal)
  if ([A, D].some(Number.isNaN)) return { ok: false, error: 'Te falta llenar alguna casilla.' }
  if (A < 0 || D < 0) return { ok: false, error: 'Los números no pueden ser negativos.' }
  if (A === 0) {
    return { ok: false, error: 'Lo que vale tu negocio (activo total) tiene que ser mayor a $0.' }
  }

  const d = D / A
  const pct = d * 100
  const base = {
    ok: true,
    valor: d,
    porcentaje: pct,
    valorTexto: `${numero(pct, 1)}%`,
    explicacion: `De cada $100 que vale tu negocio, $${numero(pct, 1)} son prestados.`,
  }

  if (d > 1) {
    return {
      ...base,
      nivel: 'peligro',
      titulo: 'Situación crítica',
      mensaje:
        'Debes más de lo que vale todo tu negocio. Aunque vendieras todo, no alcanzaría para pagar.',
      consejo:
        'Busca asesoría cuanto antes y no pidas más préstamos. Prioriza pagar las deudas más caras.',
    }
  }
  if (d > 0.6) {
    return {
      ...base,
      nivel: 'cuidado',
      titulo: 'Debes mucho',
      mensaje:
        'La mayor parte de tu negocio es de quienes te prestaron, no tuya. Si bajan las ventas, te puede costar pagar.',
      consejo: 'Evita pedir más préstamos y usa las ganancias para ir bajando tus deudas.',
    }
  }
  if (d >= 0.4) {
    return {
      ...base,
      nivel: 'bien',
      titulo: 'Equilibrado',
      mensaje: 'Hay un buen balance entre tu propio dinero y el dinero prestado.',
      consejo: 'Sigue así. Si pides un préstamo, que sea para algo que te deje ganancia.',
    }
  }
  return {
    ...base,
    nivel: 'sobra',
    titulo: 'Debes poco',
    mensaje:
      'Casi todo tu negocio lo pagaste con tu propio dinero. Es muy seguro, aunque a veces un préstamo barato te ayudaría a crecer más rápido.',
    consejo: 'Si quieres crecer, compara opciones de crédito con intereses bajos.',
  }
}

/* ------------------------------------------------------------------ */
/* RENTABILIDAD SOBRE VENTAS = (Utilidad neta / Ventas totales) × 100   */
/* Utilidad neta = Ventas − costo de venta − gastos fijos − intereses − impuestos */
/* ------------------------------------------------------------------ */
export function utilidadNeta({ ventas, restas }) {
  return aNumeroOCero(ventas) - sumar(restas)
}

export function rentabilidad({ ventas, restas }) {
  const V = aNumero(ventas)
  if (Number.isNaN(V)) return { ok: false, error: 'Escribe cuánto vendiste en total.' }
  if (V < 0 || hayNegativos(restas))
    return { ok: false, error: 'Los números no pueden ser negativos.' }
  if (V === 0) return { ok: false, error: 'Tus ventas totales tienen que ser mayores a $0.' }

  const utilidad = utilidadNeta({ ventas, restas })
  const m = utilidad / V
  const pct = m * 100
  const base = {
    ok: true,
    valor: m,
    porcentaje: pct,
    utilidad,
    ventas: V,
    valorTexto: `${numero(pct, 1)}%`,
  }

  const partes = (u) => ({ guardar: u * 0.5, reinvertir: u * 0.3, paraTi: u * 0.2 })

  if (utilidad < 0) {
    return {
      ...base,
      nivel: 'peligro',
      titulo: 'Estás perdiendo',
      explicacion: `De cada $100 que vendes, pierdes $${numero(Math.abs(pct))}.`,
      mensaje: 'Lo que gastas (costos, gastos, intereses e impuestos) es más de lo que vendes.',
      consejo:
        'Revisa tu precio de venta, busca qué gastos puedes bajar y calcula tu punto de equilibrio para saber cuánto necesitas vender.',
    }
  }
  if (utilidad === 0) {
    return {
      ...base,
      nivel: 'cuidado',
      titulo: 'No ganas ni pierdes',
      explicacion: 'De cada $100 que vendes, no te queda nada de ganancia.',
      mensaje: 'Todo lo que vendes se va en pagar costos y gastos.',
      consejo: 'Revisa tu precio de venta y busca qué gastos puedes bajar.',
    }
  }

  const explicacion = `De cada $100 que vendes, te quedan $${numero(pct)} de ganancia limpia.`
  if (pct < 5) {
    return {
      ...base,
      nivel: 'cuidado',
      titulo: 'Ganas muy poco',
      explicacion,
      mensaje:
        'Tu negocio apenas cubre sus gastos. No deja dinero para crecer ni para una emergencia.',
      consejo:
        'Revisa si puedes subir un poco tus precios, comprar más barato o bajar algún gasto fijo.',
    }
  }
  if (pct < 10) {
    return {
      ...base,
      nivel: 'cuidado',
      titulo: 'Ganancia baja',
      explicacion,
      mensaje: 'Sí ganas, pero poco. Un mes malo se puede comer tu ganancia.',
      consejo: `Separa tu ganancia (${pesos(utilidad)}) en cuanto cierres el periodo para que no se gaste en el día a día, y busca qué gasto puedes bajar.`,
    }
  }
  const p = partes(utilidad)
  const reparto = `Cuando cierres el periodo, separa tu ganancia (${pesos(utilidad)}): guarda ${pesos(p.guardar)} hasta juntar 2 meses de gastos fijos, usa ${pesos(p.reinvertir)} para mejorar tu negocio y ${pesos(p.paraTi)} son un premio para ti.`
  if (pct <= 20) {
    return {
      ...base,
      nivel: 'bien',
      titulo: 'Ganancia sana',
      explicacion,
      mensaje:
        'Es lo ideal para un negocio pequeño: además de pagar tu trabajo, el negocio te deja una ganancia extra.',
      consejo: reparto,
    }
  }
  return {
    ...base,
    nivel: 'bien',
    titulo: 'Muy buena ganancia',
    explicacion,
    mensaje:
      'Tu negocio deja muy buen margen: tienes gastos bajos, muchas ventas o precios que te dejan bastante.',
    consejo: reparto,
  }
}
