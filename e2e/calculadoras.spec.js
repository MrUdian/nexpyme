import { expect, test } from '@playwright/test'

test('punto de equilibrio: ejemplo de peluquería, mes y semana, y PDF', async ({ page }) => {
  await page.goto('/punto-de-equilibrio')
  await page.getByRole('button', { name: /servicios/i }).click() // elige el giro
  await page.getByRole('button', { name: 'Ver ejemplo de una peluquería' }).click()
  const resultado = page.getByRole('region', { name: 'Resultado' })
  await expect(resultado.getByText('175 servicios').first()).toBeVisible()
  await expect(resultado.getByText('A la semana (aproximado)')).toBeVisible()
  await expect(resultado.getByText(/empiezas a tener ganancias/)).toBeVisible()

  const descarga = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Descargar en PDF' }).click()
  expect((await descarga).suggestedFilename()).toMatch(/\.pdf$/)
})

test('punto de equilibrio de todo el negocio (abarrotes)', async ({ page }) => {
  await page.goto('/punto-de-equilibrio')
  await page.getByRole('button', { name: /comercial/i }).click()
  await page.locator('label', { hasText: 'Todo mi negocio' }).click()
  await page.getByRole('button', { name: 'Ver ejemplo de una tienda de abarrotes' }).click()
  await expect(page.getByText('$27,586.21').first()).toBeVisible()
})

test('se pueden elegir dos giros y aparecen los ejemplos de ambos', async ({ page }) => {
  await page.goto('/razones?razon=liquidez')
  await page.getByRole('button', { name: /comercial/i }).click()
  await page.getByRole('button', { name: /servicios/i }).click()
  await expect(
    page.getByRole('button', { name: 'Ver ejemplo de una tienda de abarrotes' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Ver ejemplo de una peluquería' }).click()
  await expect(page.getByText('¡Punto ideal!')).toBeVisible() // 11,000 / 5,500 = 2
})

test('inventario: el valor se puede usar en liquidez', async ({ page }) => {
  await page.goto('/inventario')
  await page.getByRole('button', { name: /comercial/i }).click()
  await page.getByRole('button', { name: 'Ver ejemplo de una tienda de abarrotes' }).click()
  await expect(page.getByText(/tienes cambios sin guardar/i)).toBeVisible()
  await page.getByRole('button', { name: 'Guardar mi inventario' }).click()
  await expect(page.getByText('¡Guardado en este navegador!')).toBeVisible()

  await page.getByRole('link', { name: /usarlo en liquidez/i }).click()
  await page.getByRole('button', { name: /usar el valor de mi inventario/i }).click()
  await expect(page.getByLabel('Mercancía que tienes para vender')).toHaveValue('2128')
})

test('rentabilidad muestra la ganancia en pesos', async ({ page }) => {
  await page.goto('/razones?razon=rentabilidad')
  await page.getByRole('button', { name: /servicios/i }).click()
  await page.getByRole('button', { name: 'Ver ejemplo de una peluquería' }).click()
  await expect(page.getByText('Ganancia sana')).toBeVisible()
  await expect(page.getByText('Te queda: $4,200.00')).toBeVisible()
})

test('el tipo de negocio y el resultado se recuerdan al cambiar de sección', async ({ page }) => {
  await page.goto('/punto-de-equilibrio')
  await page.getByRole('button', { name: /servicios/i }).click()
  await page.getByRole('button', { name: 'Ver ejemplo de una peluquería' }).click()
  await page.getByRole('link', { name: 'Razones financieras' }).first().click()
  await expect(page.getByRole('button', { name: /servicios/i })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
  await page.getByRole('link', { name: 'Punto de equilibrio' }).first().click()
  await expect(page.getByText('175 servicios').first()).toBeVisible()
})

test('se puede borrar todo el inventario', async ({ page }) => {
  await page.goto('/inventario')
  await page.getByRole('button', { name: /producción/i }).click()
  await page.getByRole('button', { name: 'Ver ejemplo de una panadería' }).click()
  await page.getByRole('button', { name: 'Guardar mi inventario' }).click()
  await page.getByRole('button', { name: 'Eliminar todo el inventario' }).click()
  await page.getByRole('button', { name: 'Sí, borrar todo' }).click()
  await expect(page.getByText('Listo, se borró todo tu inventario.')).toBeVisible()
  await expect(page.getByText('$0.00').first()).toBeVisible()
})
