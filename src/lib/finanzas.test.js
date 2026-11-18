import { describe, expect, it } from 'vitest'
import {
  SEMANAS_POR_MES,
  endeudamiento,
  liquidez,
  puntoEquilibrio,
  puntoEquilibrioTotal,
  rentabilidad,
  utilidadNeta,
} from './finanzas.js'
import { EJEMPLOS } from './giros.js'

const lista = (...montos) => montos.map((monto, i) => ({ concepto: `c${i}`, monto: String(monto) }))

describe('Punto de equilibrio', () => {
  it('calcula unidades (redondeando hacia arriba) y valor con el ejemplo del documento', () => {
    const r = puntoEquilibrio({ gastosFijos: '25000', precio: '150', costo: '90' })
    expect(r.ok).toBe(true)
    expect(r.unidadesExactas).toBeCloseTo(416.67, 2)
    expect(r.unidades).toBe(417)
    expect(r.valor).toBeCloseTo(62500, 2)
    expect(r.margen).toBe(60)
  })

  it('no redondea de más cuando el resultado es exacto', () => {
    expect(puntoEquilibrio({ gastosFijos: '1000', precio: '20', costo: '10' }).unidades).toBe(100)
  })

  it('da datos para la gráfica donde ingresos = costos en el punto de equilibrio', () => {
    const r = puntoEquilibrio({ gastosFijos: '1000', precio: '20', costo: '10' })
    const punto = r.grafica.find((p) => p.x === 100)
    expect(punto.ingresos).toBe(punto.costos)
  })

  it.each([
    [{ gastosFijos: '', precio: '10', costo: '5' }, /falta/i],
    [{ gastosFijos: '-1', precio: '10', costo: '5' }, /negativos/i],
    [{ gastosFijos: '100', precio: '0', costo: '0' }, /mayor a \$0/i],
    [{ gastosFijos: '100', precio: '10', costo: '10' }, /perder/i],
    [{ gastosFijos: '100', precio: '10', costo: '12' }, /perder/i],
  ])('rechaza datos inválidos %#', (datos, msg) => {
    const r = puntoEquilibrio(datos)
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(msg)
  })
})

describe('Liquidez', () => {
  it.each([
    [lista(50), lista(100), 'peligro'],
    [lista(100), lista(100), 'cuidado'],
    [lista(120), lista(100), 'cuidado'],
    [lista(150), lista(100), 'bien'],
    [lista(200), lista(100), 'bien'],
    [lista(250), lista(100), 'sobra'],
  ])('clasifica %j / %j como %s', (activos, pasivos, nivel) => {
    expect(liquidez({ activos, pasivos }).nivel).toBe(nivel)
  })

  it('suma los renglones "Otro" y los vacíos cuentan como 0', () => {
    const activos = [
      { concepto: 'Caja', monto: '40000' },
      { concepto: 'Inventario', monto: '' },
      { concepto: 'Equipo por vender', monto: '5000' },
    ]
    const r = liquidez({ activos, pasivos: lista(15000) })
    expect(r.tienes).toBe(45000)
    expect(r.valor).toBe(3)
  })

  it('pide al menos una deuda', () => {
    expect(liquidez({ activos: lista(10), pasivos: lista('') }).ok).toBe(false)
  })

  it('rechaza negativos', () => {
    expect(liquidez({ activos: lista(-10), pasivos: lista(5) }).ok).toBe(false)
  })
})

describe('Endeudamiento', () => {
  it.each([
    ['100', '30', 'sobra'],
    ['100', '40', 'bien'],
    ['100', '60', 'bien'],
    ['100', '61', 'cuidado'],
    ['100', '100', 'cuidado'],
    ['100', '120', 'peligro'],
  ])('activo %s, pasivo %s → %s', (activoTotal, pasivoTotal, nivel) => {
    expect(endeudamiento({ activoTotal, pasivoTotal }).nivel).toBe(nivel)
  })

  it('muestra el resultado en porcentaje', () => {
    expect(endeudamiento({ activoTotal: '500000', pasivoTotal: '250000' }).porcentaje).toBe(50)
  })

  it('no divide entre cero', () => {
    expect(endeudamiento({ activoTotal: '0', pasivoTotal: '10' }).ok).toBe(false)
  })
})

describe('Rentabilidad sobre ventas', () => {
  const restas = lista(110000, 50000, 5000, 11000)

  it('calcula la utilidad neta restando todo a las ventas', () => {
    expect(utilidadNeta({ ventas: '200000', restas })).toBe(24000)
  })

  it('calcula el porcentaje (ejemplo: 12%)', () => {
    const r = rentabilidad({ ventas: '200000', restas })
    expect(r.porcentaje).toBeCloseTo(12)
    expect(r.nivel).toBe('bien')
  })

  it('detecta pérdida', () => {
    expect(rentabilidad({ ventas: '100', restas: lista(150) }).nivel).toBe('peligro')
  })

  it('no divide entre cero', () => {
    expect(rentabilidad({ ventas: '0', restas }).ok).toBe(false)
  })
})

describe('Punto de equilibrio por periodo', () => {
  it('da el resultado al mes y a la semana (peluquería del documento)', () => {
    const r = puntoEquilibrio({
      gastosFijos: '7000',
      precio: '90',
      costo: '50',
      unidad: ['corte', 'cortes'],
    })
    expect(r.unidades).toBe(175)
    expect(r.valor).toBeCloseTo(15750, 2)
    expect(r.valorTexto).toBe('175 cortes')
    expect(r.porPeriodo.semana.unidades).toBe(41) // 175 ÷ 4.33 = 40.4 → 41
    expect(r.porPeriodo.semana.valor).toBeCloseTo(15750 / SEMANAS_POR_MES, 2)
  })

  it('si los datos son de una semana, el mes se multiplica por 4.33', () => {
    const r = puntoEquilibrio({ gastosFijos: '1000', precio: '20', costo: '10', periodo: 'semana' })
    expect(r.porPeriodo.semana.unidades).toBe(100)
    expect(r.porPeriodo.mes.unidades).toBe(434) // 433.33 → 434
  })

  it('la gráfica tiene el punto exacto de equilibrio y las zonas de color se tocan ahí', () => {
    const r = puntoEquilibrio({ gastosFijos: '7000', precio: '90', costo: '50' })
    const punto = r.grafica.find((p) => Math.abs(p.x - r.unidadesExactas) < 1e-9)
    expect(punto.ingresos).toBeCloseTo(punto.costos, 6)
    expect(punto.perdida).not.toBeNull()
    expect(punto.ganancia).not.toBeNull()
    expect(r.grafica[0].perdida).toEqual([0, 7000])
    expect(r.grafica.at(-1).perdida).toBeNull()
    expect(r.grafica.every((p) => p.fijos === 7000)).toBe(true)
  })
})

describe('Punto de equilibrio de todo el negocio (borrador giro comercial)', () => {
  const datos = {
    gastosFijos: '10000',
    ventas: '80000',
    costoVendido: '50000',
    otrosVariables: '1000',
  }

  it('reproduce el ejemplo de abarrotes: $27,586.21', () => {
    const r = puntoEquilibrioTotal(datos)
    expect(r.cvt).toBe(51000)
    expect(r.mc).toBe(29000)
    expect(r.mcPct).toBeCloseTo(0.3625, 6)
    expect(r.valor).toBeCloseTo(27586.21, 2)
    expect(r.utilidad).toBe(19000)
    expect(r.nivel).toBe('bien')
    expect(r.porPeriodo.semana.valor).toBeCloseTo(27586.21 / SEMANAS_POR_MES, 2)
  })

  it('avisa cuando las ventas no alcanzan la meta', () => {
    const r = puntoEquilibrioTotal({ ...datos, gastosFijos: '40000' })
    expect(r.nivel).toBe('peligro')
    expect(r.mensaje).toMatch(/te faltan/i)
  })

  it('los otros costos variables pueden ir vacíos', () => {
    expect(puntoEquilibrioTotal({ ...datos, otrosVariables: '' }).cvt).toBe(50000)
  })

  it('rechaza costos iguales o mayores a las ventas', () => {
    const r = puntoEquilibrioTotal({ ...datos, costoVendido: '80000' })
    expect(r.ok).toBe(false)
  })
})

describe('Rentabilidad: interpretación por rangos', () => {
  it.each([
    ['100', 97, 'Ganas muy poco'],
    ['100', 93, 'Ganancia baja'],
    ['100', 85, 'Ganancia sana'],
    ['100', 70, 'Muy buena ganancia'],
  ])('ventas %s, gastos %s → %s', (ventas, gasto, titulo) => {
    expect(rentabilidad({ ventas, restas: lista(gasto) }).titulo).toBe(titulo)
  })

  it('el consejo reparte la ganancia en pesos (50% / 30% / 20%)', () => {
    const r = rentabilidad({ ventas: '27000', restas: lista(15000, 7000, 0, 800) })
    expect(r.utilidad).toBe(4200)
    expect(r.consejo).toMatch(/\$2,100\.00/)
    expect(r.consejo).toMatch(/\$1,260\.00/)
    expect(r.consejo).toMatch(/\$840\.00/)
  })
})

describe('Ejemplos de cada giro', () => {
  it.each(Object.entries(EJEMPLOS))(
    '%s: las ventas de rentabilidad pasan su punto de equilibrio',
    (_, ej) => {
      const pe = puntoEquilibrioTotal(ej.peTotal)
      const rent = rentabilidad({
        ventas: ej.rentabilidad.ventas,
        restas: lista(...ej.rentabilidad.restas),
      })
      expect(pe.ok).toBe(true)
      expect(pe.nivel).toBe('bien')
      expect(rent.utilidad).toBeGreaterThan(0)
      expect(puntoEquilibrio(ej.peUno).ok).toBe(true)
    },
  )
})
