import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext.jsx'
import { GiroProvider } from '../context/GiroContext.jsx'
import PuntoEquilibrio from './PuntoEquilibrio.jsx'
import Razones from './Razones.jsx'

// Recharts necesita medir la pantalla; en las pruebas no hay pantalla real
vi.mock('../components/GraficaEquilibrio.jsx', () => ({ default: () => <div>gráfica</div> }))

const montar = (ui, ruta = '/') =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <AuthProvider>
        <GiroProvider>{ui}</GiroProvider>
      </AuthProvider>
    </MemoryRouter>,
  )

// Cada prueba empieza con el giro "servicios" ya elegido y sin cálculos recordados
beforeEach(() => {
  sessionStorage.clear()
  localStorage.setItem('nexpyme-giros', JSON.stringify(['servicios']))
})

describe('Tipo de negocio', () => {
  it('pide elegir un tipo de negocio antes de mostrar la calculadora', async () => {
    localStorage.removeItem('nexpyme-giros')
    const u = userEvent.setup()
    montar(<PuntoEquilibrio />)
    expect(screen.queryByLabelText(/gastos fijos/i)).not.toBeInTheDocument()
    expect(screen.getByText(/elige una opción para continuar/i)).toBeInTheDocument()
    await u.click(screen.getByRole('button', { name: /producción/i }))
    expect(screen.getByLabelText(/gastos fijos/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver ejemplo de una panadería' })).toBeInTheDocument()
    // No se puede quitar el último elegido
    await u.click(screen.getByRole('button', { name: /producción/i }))
    expect(screen.getByLabelText(/gastos fijos/i)).toBeInTheDocument()
  })

  it('recuerda el cálculo al salir y volver a la página', async () => {
    const u = userEvent.setup()
    const { unmount } = montar(<PuntoEquilibrio />)
    await u.click(screen.getByRole('button', { name: 'Ver ejemplo de una peluquería' }))
    unmount()
    montar(<PuntoEquilibrio />)
    const resultado = screen.getByRole('region', { name: 'Resultado' })
    expect(within(resultado).getAllByText('175 servicios').length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/gastos fijos/i).value.replace(/,/g, '')).toBe('7000')
  })
})

describe('Página de punto de equilibrio', () => {
  it('calcula con los datos que escribe la persona', async () => {
    const u = userEvent.setup()
    montar(<PuntoEquilibrio />)
    await u.type(screen.getByLabelText(/gastos fijos/i), '25000')
    await u.type(screen.getByLabelText(/cuánto cobras/i), '150')
    await u.type(screen.getByLabelText(/cuánto te cuesta/i), '90')
    await u.click(screen.getByRole('button', { name: 'Calcular' }))

    const resultado = screen.getByRole('region', { name: 'Resultado' })
    expect(within(resultado).getAllByText('417 servicios').length).toBeGreaterThan(0)
    expect(within(resultado).getAllByText(/62,500/).length).toBeGreaterThan(0)
  })

  it('explica el error si el precio es menor que el costo', async () => {
    const u = userEvent.setup()
    montar(<PuntoEquilibrio />)
    await u.type(screen.getByLabelText(/gastos fijos/i), '1000')
    await u.type(screen.getByLabelText(/cuánto cobras/i), '10')
    await u.type(screen.getByLabelText(/cuánto te cuesta/i), '15')
    await u.click(screen.getByRole('button', { name: 'Calcular' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/perder dinero/i)
  })
})

describe('Liquidez con renglones "Otro"', () => {
  it('suma lo que la persona agrega con "Agregar otro"', async () => {
    const u = userEvent.setup()
    montar(<Razones />, '/razones?razon=liquidez')

    const tienes = screen.getByRole('group', { name: 'Lo que tienes' })
    await u.type(within(tienes).getByLabelText(/dinero en caja/i), '1000')
    await u.click(within(tienes).getByRole('button', { name: /agregar otro/i }))
    await u.type(within(tienes).getByLabelText(/otro: ¿qué es\?/i), 'Tanda que me toca')
    await u.type(within(tienes).getByLabelText(/¿cuánto es\?/i), '500')
    expect(within(tienes).getByText('$1,500.00')).toBeInTheDocument()

    const debes = screen.getByRole('group', { name: 'Lo que debes pagar' })
    await u.type(within(debes).getByLabelText(/proveedores/i), '1000')
    await u.click(screen.getByRole('button', { name: 'Calcular liquidez' }))

    expect(screen.getByText('¡Punto ideal!')).toBeInTheDocument()
    expect(screen.getByText(/por cada \$1 que debes, tienes \$1.5/i)).toBeInTheDocument()
    expect(screen.getByText('Tanda que me toca')).toBeInTheDocument() // aparece en el resumen
  })
})
