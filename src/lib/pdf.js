/**
 * Descarga en PDF una parte de la página (el "reporte").
 * Las librerías se cargan solo cuando se presiona el botón, para que la página abra rápido.
 * Usamos html2canvas-pro (misma forma de uso que html2canvas) porque entiende los
 * colores modernos que usa Tailwind 4; el html2canvas original falla con ellos.
 * Los elementos con el atributo data-html2canvas-ignore no salen en el PDF.
 */
export async function descargarPDF({ elemento, titulo, nombreArchivo, persona }) {
  const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas-pro'),
  ])

  const lienzo = await html2canvas(elemento, { scale: 2, backgroundColor: '#ffffff' })

  const pdf = new jsPDF({ unit: 'mm', format: 'letter' })
  const anchoPagina = pdf.internal.pageSize.getWidth()
  const altoPagina = pdf.internal.pageSize.getHeight()
  const margen = 14

  // Encabezado
  pdf.setFillColor(14, 124, 102)
  pdf.rect(0, 0, anchoPagina, 22, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(18)
  pdf.text('NEXPYME', margen, 14)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(11)
  pdf.text(titulo, anchoPagina - margen, 14, { align: 'right' })

  pdf.setTextColor(60, 80, 75)
  pdf.setFontSize(10)
  const fecha = new Date().toLocaleDateString('es-MX', { dateStyle: 'long' })
  pdf.text(`Fecha: ${fecha}${persona ? `   ·   Elaborado por: ${persona}` : ''}`, margen, 30)

  // Imagen del reporte, cortada en pedazos del tamaño de cada hoja
  const anchoImg = anchoPagina - margen * 2
  const pxPorMm = lienzo.width / anchoImg
  let y = 36
  let inicioPx = 0
  while (inicioPx < lienzo.height) {
    const altoDisponibleMm = altoPagina - y - margen - 4
    const altoPx = Math.min(lienzo.height - inicioPx, Math.floor(altoDisponibleMm * pxPorMm))
    const pedazo = document.createElement('canvas')
    pedazo.width = lienzo.width
    pedazo.height = altoPx
    pedazo
      .getContext('2d')
      .drawImage(lienzo, 0, inicioPx, lienzo.width, altoPx, 0, 0, lienzo.width, altoPx)
    pdf.addImage(pedazo.toDataURL('image/png'), 'PNG', margen, y, anchoImg, altoPx / pxPorMm)
    inicioPx += altoPx
    if (inicioPx < lienzo.height) {
      pdf.addPage()
      y = margen
    }
  }

  // Pie
  const paginas = pdf.getNumberOfPages()
  for (let i = 1; i <= paginas; i++) {
    pdf.setPage(i)
    pdf.setFontSize(9)
    pdf.setTextColor(120, 130, 125)
    pdf.text(
      'Este reporte es una guía. Para decisiones importantes consulta a un contador.',
      margen,
      altoPagina - 6,
    )
    pdf.text(`${i} / ${paginas}`, anchoPagina - margen, altoPagina - 6, { align: 'right' })
  }

  pdf.save(`${nombreArchivo}.pdf`)
}
