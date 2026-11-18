/** Piezas comunes de las páginas de cálculo */

export function Encabezado({ pregunta, nombre, children }) {
  return (
    <div className="flex flex-col gap-2 max-w-3xl">
      <span className="self-start px-3 py-1 rounded-full bg-oro-claro text-[#6B4300] text-sm font-semibold">
        {nombre}
      </span>
      <h1 className="m-0 font-display text-4xl sm:text-5xl leading-tight">{pregunta}</h1>
      <p className="m-0 text-xl text-suave">{children}</p>
    </div>
  )
}

export function ComoSeCalcula({ children }) {
  return (
    <details className="bg-[#EEF1EC] rounded-xl p-4">
      <summary className="cursor-pointer font-semibold">
        ¿Cómo se calcula? (para los curiosos)
      </summary>
      <div className="mt-3 flex flex-col gap-2 font-mono text-[15px]">{children}</div>
    </details>
  )
}

/**
 * Botones de Calcular, ejemplos y Borrar todo.
 * ejemplos: [{ negocio: 'peluquería', onClick }] → un botón por ejemplo
 * (si solo hay uno dice "Ver un ejemplo").
 */
export function BotonesFormulario({ textoCalcular, onEjemplo, ejemplos, onLimpiar }) {
  const lista = ejemplos ?? (onEjemplo ? [{ negocio: '', onClick: onEjemplo }] : [])
  const claseEjemplo =
    'min-h-14 px-5 rounded-xl bg-white border-2 border-campo font-semibold cursor-pointer hover:bg-fondo'
  return (
    <div className="flex flex-wrap items-center gap-3 pt-1">
      <button
        type="submit"
        className="min-h-14 px-7 rounded-xl bg-marca text-white text-lg font-bold cursor-pointer hover:brightness-95"
      >
        {textoCalcular}
      </button>
      {lista.length === 1 && (
        <button type="button" onClick={lista[0].onClick} className={claseEjemplo}>
          Ver un ejemplo{lista[0].negocio && ` (${lista[0].negocio})`}
        </button>
      )}
      {lista.length > 1 && (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Ver un ejemplo">
          <span className="font-semibold text-suave">Ver ejemplo de:</span>
          {lista.map((e) => (
            <button
              key={e.negocio}
              type="button"
              onClick={e.onClick}
              className={claseEjemplo.replace('min-h-14 px-5', 'min-h-12 px-4')}
            >
              {e.negocio.charAt(0).toUpperCase() + e.negocio.slice(1)}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={onLimpiar}
        className="min-h-14 px-4 rounded-xl text-suave font-semibold underline cursor-pointer bg-transparent"
      >
        Borrar todo
      </button>
    </div>
  )
}

/** Botones tipo "pastilla" para elegir una sola opción (ej.: Mes / Semana) */
export function Opciones({ titulo, ayuda, opciones, value, onChange }) {
  return (
    <fieldset className="m-0 p-0 border-0 min-w-0 flex flex-col gap-2">
      <legend className="p-0 font-semibold text-lg">{titulo}</legend>
      {ayuda && <p className="m-0 text-[15px] text-tenue">{ayuda}</p>}
      <div className="flex flex-wrap gap-2">
        {opciones.map((o) => {
          const activa = o.valor === value
          return (
            <label
              key={o.valor}
              className={`min-h-12 px-4 rounded-xl border-2 flex items-center gap-2 cursor-pointer font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-oro ${
                activa ? 'border-marca bg-marca-claro text-marca-oscuro' : 'border-campo bg-white'
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                checked={activa}
                onChange={() => onChange(o.valor)}
                name={titulo}
              />
              <span className="flex flex-col leading-tight">
                {o.texto}
                {o.detalle && <span className="text-sm font-normal text-tenue">{o.detalle}</span>}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Lista de los datos que usó la persona (sale en el PDF) */
export function ResumenDatos({ filas }) {
  return (
    <div className="bg-white rounded-2xl border border-borde p-5">
      <h3 className="m-0 mb-2 text-lg">Los datos que usaste</h3>
      <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-6 gap-y-1">
        {filas.map(([nombre, valor], i) => (
          <div key={nombre + i} className="contents">
            <dt className={nombre === nombre.toUpperCase() ? 'font-bold pt-1' : 'text-suave'}>
              {nombre}
            </dt>
            <dd
              className={`m-0 text-right font-semibold ${nombre === nombre.toUpperCase() ? 'pt-1' : ''}`}
            >
              {valor}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/** Aviso cuando la persona cambió números y todavía no vuelve a calcular */
export function AvisoCambios({ visible }) {
  if (!visible) return null
  return (
    <div
      role="status"
      className="p-4 rounded-xl bg-amarillo-claro text-amarillo font-semibold text-lg"
    >
      Cambiaste algún número. Presiona el botón de calcular para ver el resultado nuevo.
    </div>
  )
}

export function Esperando({ children }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-campo p-8 text-center text-lg text-tenue bg-white/60">
      {children}
    </div>
  )
}
