/**
 * Giros (categorías) de negocio y los textos y ejemplos de cada uno.
 * Un negocio puede tener más de un giro (ej.: una estética que también vende productos).
 *
 * Los ejemplos de cada giro son de UN MISMO negocio, para que los números cuadren entre sí
 * (por ejemplo, las ventas de rentabilidad están arriba del punto de equilibrio).
 */

export const GIROS = [
  {
    valor: 'comercial',
    nombre: 'Comercial',
    descripcion: 'Compras productos y los revendes',
    ejemplos: 'Abarrotes, papelería, ropa, farmacia',
    negocio: 'tienda de abarrotes',
    conArticulo: 'una tienda de abarrotes',
  },
  {
    valor: 'servicios',
    nombre: 'Servicios',
    descripcion: 'Cobras por tu trabajo o atención',
    ejemplos: 'Estética, taller, limpieza, consultorio',
    negocio: 'peluquería',
    conArticulo: 'una peluquería',
  },
  {
    valor: 'produccion',
    nombre: 'Producción',
    descripcion: 'Fabricas o preparas lo que vendes',
    ejemplos: 'Panadería, carpintería, costura, tortillería',
    negocio: 'panadería',
    conArticulo: 'una panadería',
  },
]

export const VALORES_GIRO = GIROS.map((g) => g.valor)

export const nombreGiro = (valor) => GIROS.find((g) => g.valor === valor)?.nombre ?? valor

/** ['comercial', 'servicios'] → "Comercial y Servicios" */
export function textoGiros(giros = []) {
  const nombres = ordenarGiros(giros).map(nombreGiro)
  if (nombres.length <= 1) return nombres[0] ?? ''
  return `${nombres.slice(0, -1).join(', ')} y ${nombres.at(-1)}`
}

/** Deja solo giros válidos, sin repetir y en el orden de GIROS */
export const ordenarGiros = (giros = []) => VALORES_GIRO.filter((v) => giros.includes(v))

/* ------------------------------------------------------------------ */
/* Textos por giro                                                      */
/* Si la persona eligió un solo giro se usan sus textos; si eligió      */
/* varios (o ninguno) se usan los textos "mixto" y los ejemplos de todos */
/* ------------------------------------------------------------------ */
const TEXTOS = {
  comercial: {
    unidad: ['producto', 'productos'],
    vendido: 'productos vendidos',
    precio: '¿En cuánto vendes cada producto?',
    precioAyuda: 'Lo que le cobras a tu cliente por uno solo. Ej.: un refresco a $20, escribe 20.',
    costo: '¿Cuánto te cuesta cada producto?',
    costoAyuda:
      'Lo que le pagas a tu proveedor por uno solo. Ej.: si el refresco te cuesta $14, escribe 14.',
    fijosEj: 'renta del local, sueldo de quien atiende, luz, internet',
    costoVendido: 'Costo de los productos que vendiste',
    costoVendidoAyuda:
      'Lo que te costaron (con el proveedor) los productos que sí vendiste. No cuentes la mercancía que todavía tienes en el anaquel.',
    otrosVariablesEj:
      'pasajes para surtir, bolsas o empaques extra, comisiones por cobrar con tarjeta',
    inventario: 'Mercancía que tienes para vender',
    inventarioAyuda: 'Lo que pagaste por la mercancía que tienes en la tienda y en bodega.',
    cobrar: 'Lo que te deben tus clientes (fiado)',
    activoAyuda:
      'Suma todo: dinero en caja y banco, mercancía, refrigeradores, anaqueles, básculas y el local si es tuyo.',
    pasivoAyuda:
      'Todas tus deudas: lo que debes al proveedor, servicios sin pagar y créditos (por ejemplo, el del refrigerador).',
    ventasAyuda: 'Todo lo que cobraste en el periodo, sin restar nada. Ej.: $80,000 en el mes.',
    costoVenta: 'Lo que te costó la mercancía que vendiste',
    costoVentaAyuda: 'Costo de venta: lo que le pagaste al proveedor por lo que sí vendiste.',
  },
  servicios: {
    unidad: ['servicio', 'servicios'],
    vendido: 'servicios realizados',
    precio: '¿Cuánto cobras por cada servicio?',
    precioAyuda:
      'Lo que le cobras a tu cliente por un servicio. Ej.: un corte de cabello a $90, escribe 90.',
    costo: '¿Cuánto te cuesta hacer cada servicio?',
    costoAyuda:
      'Los materiales que gastas en un servicio. Ej.: shampoo, tinte, navajas o la comisión del estilista: si suman $50, escribe 50.',
    fijosEj:
      'renta del local, sueldo fijo de la recepcionista, luz, agua, internet, seguro de tus empleados',
    costoVendido: 'Costo de los materiales que usaste en tus servicios',
    costoVendidoAyuda:
      'Lo que gastaste en materiales para atender a tus clientes (tintes, cremas, refacciones…).',
    otrosVariablesEj: 'comisiones a tus trabajadores por servicio, pasajes a domicilio',
    inventario: 'Productos e insumos que tienes guardados',
    inventarioAyuda:
      'Tintes, cremas, refacciones o productos de reventa que tienes en vitrina o bodega.',
    cobrar: 'Lo que te deben tus clientes',
    activoAyuda:
      'Suma todo: dinero en caja y banco, productos, sillones, secadoras, herramientas y el local si es tuyo.',
    pasivoAyuda:
      'Todas tus deudas: proveedores de tintes o refacciones, servicios sin pagar y créditos de equipo.',
    ventasAyuda:
      'Todo lo que cobraste por tus servicios en el periodo, sin restar nada. Ej.: 300 cortes a $90 = $27,000.',
    costoVenta: 'Lo que gastaste en materiales para tus servicios',
    costoVentaAyuda: 'Costo de venta: tintes, shampoo, refacciones o comisiones por servicio.',
  },
  produccion: {
    unidad: ['pieza', 'piezas'],
    vendido: 'piezas vendidas',
    precio: '¿En cuánto vendes cada pieza?',
    precioAyuda: 'Lo que le cobras a tu cliente por una pieza. Ej.: un pan a $8, escribe 8.',
    costo: '¿Cuánto te cuesta hacer cada pieza?',
    costoAyuda:
      'Materia prima y lo que se gasta por cada pieza. Ej.: harina, azúcar, huevo y gas de un pan: si suman $4.50, escribe 4.50.',
    fijosEj: 'renta del taller, sueldos fijos, luz, agua, mantenimiento del horno o las máquinas',
    costoVendido: 'Costo de producir lo que vendiste',
    costoVendidoAyuda: 'Materia prima y gastos de fabricación de las piezas que sí vendiste.',
    otrosVariablesEj: 'empaques, envíos, comisiones a revendedores',
    inventario: 'Materia prima y producto terminado',
    inventarioAyuda:
      'Lo que te costó la materia prima que tienes guardada y las piezas ya hechas que no has vendido.',
    cobrar: 'Lo que te deben tus clientes (pedidos a crédito)',
    activoAyuda:
      'Suma todo: dinero en caja y banco, materia prima, hornos, máquinas, herramientas y el taller si es tuyo.',
    pasivoAyuda:
      'Todas tus deudas: proveedores de materia prima, servicios sin pagar y créditos de maquinaria.',
    ventasAyuda:
      'Todo lo que cobraste por tus piezas en el periodo, sin restar nada. Ej.: 6,000 panes a $8 = $48,000.',
    costoVenta: 'Lo que te costó producir lo que vendiste',
    costoVentaAyuda: 'Costo de venta: materia prima y gastos de fabricación de lo que sí vendiste.',
  },
  mixto: {
    unidad: ['producto o servicio', 'productos o servicios'],
    vendido: 'productos o servicios vendidos',
    precio: '¿En cuánto vendes cada producto o servicio?',
    precioAyuda:
      'Lo que le cobras a tu cliente por uno solo. Si vendes muchas cosas, usa el método "Todo mi negocio".',
    costo: '¿Cuánto te cuesta cada uno?',
    costoAyuda: 'Lo que pagas por comprarlo, hacerlo o los materiales que gastas en él (solo uno).',
    fijosEj: 'renta, sueldos fijos, luz, agua, internet',
    costoVendido: 'Costo de lo que vendiste',
    costoVendidoAyuda:
      'Lo que te costaron los productos que vendiste y los materiales que usaste en tus servicios.',
    otrosVariablesEj: 'empaques, pasajes, comisiones por venta',
    inventario: 'Mercancía, materiales o insumos que tienes',
    inventarioAyuda:
      'Lo que pagaste por la mercancía, materia prima o productos que tienes guardados.',
    cobrar: 'Lo que te deben tus clientes',
    activoAyuda:
      'Suma todo: dinero, mercancía, materiales, máquinas, herramientas y el local si es tuyo.',
    pasivoAyuda: 'Todas tus deudas: proveedores, servicios sin pagar y créditos.',
    ventasAyuda: 'Todo lo que cobraste en el periodo (productos y servicios), sin restar nada.',
    costoVenta: 'Lo que te costó lo que vendiste',
    costoVentaAyuda: 'Costo de venta: mercancía, materia prima o materiales que usaste.',
  },
}

/** Textos que se deben usar según los giros elegidos */
export function textosDe(giros = []) {
  const elegidos = ordenarGiros(giros)
  return elegidos.length === 1 ? TEXTOS[elegidos[0]] : TEXTOS.mixto
}

/* ------------------------------------------------------------------ */
/* Ejemplos ("Ver un ejemplo")                                          */
/* ------------------------------------------------------------------ */
export const EJEMPLOS = {
  comercial: {
    // Punto de equilibrio por producto: un refresco
    peUno: { gastosFijos: '10000', precio: '20', costo: '14' },
    // Todo el negocio: datos del borrador del giro comercial (abarrotes)
    peTotal: {
      gastosFijos: '10000',
      ventas: '80000',
      costoVendido: '50000',
      otrosVariables: '1000',
    },
    liquidez: { activos: ['15000', '25000', '3000'], pasivos: ['18000', '2500', '2500'] },
    endeudamiento: { activoTotal: '120000', pasivoTotal: '30000' },
    rentabilidad: { ventas: '80000', restas: ['51000', '10000', '0', '1500'] },
  },
  servicios: {
    // Peluquería: datos del borrador del giro de servicios
    peUno: { gastosFijos: '7000', precio: '90', costo: '50' },
    peTotal: { gastosFijos: '7000', ventas: '27000', costoVendido: '15000', otrosVariables: '0' },
    liquidez: { activos: ['5000', '6000', '0'], pasivos: ['2000', '1500', '2000'] },
    endeudamiento: { activoTotal: '40000', pasivoTotal: '5000' },
    rentabilidad: { ventas: '27000', restas: ['15000', '7000', '0', '800'] },
  },
  produccion: {
    // Panadería
    peUno: { gastosFijos: '12000', precio: '8', costo: '4.5' },
    peTotal: {
      gastosFijos: '12000',
      ventas: '48000',
      costoVendido: '27000',
      otrosVariables: '1000',
    },
    liquidez: { activos: ['8000', '7000', '5000'], pasivos: ['6000', '3000', '3000'] },
    endeudamiento: { activoTotal: '150000', pasivoTotal: '60000' },
    rentabilidad: { ventas: '48000', restas: ['28000', '12000', '1000', '1500'] },
  },
}

/** Lista de ejemplos a mostrar: uno por giro elegido (o los tres si no eligió ninguno) */
export function ejemplosDe(giros = []) {
  const elegidos = ordenarGiros(giros)
  return (elegidos.length ? elegidos : VALORES_GIRO).map((g) => {
    const info = GIROS.find((x) => x.valor === g)
    return { giro: g, negocio: info.negocio, conArticulo: info.conArticulo, datos: EJEMPLOS[g] }
  })
}
