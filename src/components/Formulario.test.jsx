import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Campo } from './Formulario.jsx'

describe('Campo de contraseña', () => {
  it('tiene un botón para ver u ocultar la contraseña', async () => {
    const u = userEvent.setup()
    render(<Campo etiqueta="Contraseña" type="password" defaultValue="secreta123" />)
    const caja = screen.getByLabelText('Contraseña')
    expect(caja).toHaveAttribute('type', 'password')
    await u.click(screen.getByRole('button', { name: 'Ver' }))
    expect(caja).toHaveAttribute('type', 'text')
    await u.click(screen.getByRole('button', { name: 'Ocultar' }))
    expect(caja).toHaveAttribute('type', 'password')
  })
})
