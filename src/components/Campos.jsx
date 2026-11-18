import { useId } from 'react'
import { pesos, aNumeroOCero } from '../lib/formato.js'
import { IconoBasura, IconoMas } from './Iconos.jsx'

/** Caja de dinero con el signo $ y una explicación sencilla debajo */
export function CampoDinero({ id, etiqueta, ayuda, value, onChange, signo = '$', grande = true }) {
  const idAyuda = `${id}-ayuda`
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={`font-semibold ${grande ? 'text-lg' : ''}`}>
        {etiqueta}
      </label>
      <div className="flex items-center gap-2 min-h-12 px-3.5 border-2 border-campo rounded-xl bg-white focus-within:border-marca focus-within:ring-4 focus-within:ring-marca/20">
        <span className="text-tenue font-semibold whitespace-nowrap">{signo}</span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-describedby={ayuda ? idAyuda : undefined}
          className="w-full min-w-0 bg-transparent outline-none text-lg py-2"
        />
      </div>
      {ayuda && (
        <p id={idAyuda} className="m-0 text-[15px] text-tenue">
          {ayuda}
        </p>
      )}
    </div>
  )
}

/**
 * Lista de conceptos que se suman (por ejemplo, "Lo que tienes").
 * Los primeros renglones son fijos; si permitirOtros = true aparece el botón
 * "Agregar otro" para que la persona escriba el nombre y la cantidad que quiera.
 *
 * conceptos: [{ clave, concepto, monto, fijo, ayuda }]
 */
export function ListaConceptos({
  titulo,
  descripcion,
  conceptos,
  onChange,
  permitirOtros = false,
  signo = '$',
  textoTotal = 'Total',
}) {
  const base = useId()
  const total = conceptos.reduce((s, c) => s + aNumeroOCero(c.monto), 0)

  const cambiar = (i, cambios) =>
    onChange(conceptos.map((c, j) => (j === i ? { ...c, ...cambios } : c)))
  const quitar = (i) => onChange(conceptos.filter((_, j) => j !== i))
  const agregar = () =>
    onChange([...conceptos, { clave: `otro-${Date.now()}`, concepto: '', monto: '', fijo: false }])

  return (
    <fieldset className="m-0 min-w-0 flex-1 basis-80 bg-white border border-borde rounded-2xl p-6 flex flex-col gap-4">
      <legend className="px-1.5 font-bold text-xl font-display">{titulo}</legend>
      {descripcion && <p className="m-0 text-[15px] text-tenue -mt-2">{descripcion}</p>}

      {conceptos.map((c, i) =>
        c.fijo ? (
          <CampoDinero
            key={c.clave}
            id={`${base}-${c.clave}`}
            etiqueta={c.concepto}
            ayuda={c.ayuda}
            value={c.monto}
            signo={signo}
            grande={false}
            onChange={(monto) => cambiar(i, { monto })}
          />
        ) : (
          <div
            key={c.clave}
            className="flex flex-col gap-2 p-3 rounded-xl bg-oro-claro/60 border border-dashed border-oro"
          >
            <label htmlFor={`${base}-${c.clave}-nombre`} className="font-semibold">
              Otro: ¿qué es?
            </label>
            <input
              id={`${base}-${c.clave}-nombre`}
              type="text"
              placeholder="Escribe el nombre. Ej.: Préstamo de un familiar"
              value={c.concepto}
              onChange={(e) => cambiar(i, { concepto: e.target.value })}
              className="min-h-11 px-3 border-2 border-campo rounded-lg bg-white outline-none focus:border-marca"
            />
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <CampoDinero
                  id={`${base}-${c.clave}`}
                  etiqueta="¿Cuánto es?"
                  value={c.monto}
                  signo={signo}
                  grande={false}
                  onChange={(monto) => cambiar(i, { monto })}
                />
              </div>
              <button
                type="button"
                onClick={() => quitar(i)}
                className="min-h-12 px-3 rounded-xl border-2 border-campo bg-white text-rojo font-semibold flex items-center gap-1 cursor-pointer hover:bg-rojo-claro"
                aria-label={`Quitar ${c.concepto || 'este renglón'}`}
              >
                <IconoBasura /> <span className="hidden sm:inline">Quitar</span>
              </button>
            </div>
          </div>
        ),
      )}

      {permitirOtros && (
        <button
          type="button"
          onClick={agregar}
          className="self-start min-h-11 px-4 rounded-xl border-2 border-dashed border-marca text-marca-oscuro bg-marca-claro/50 font-semibold flex items-center gap-2 cursor-pointer hover:bg-marca-claro"
        >
          <IconoMas /> Agregar otro
        </button>
      )}

      <div className="flex justify-between items-baseline pt-3 border-t border-borde font-bold text-lg">
        <span>{textoTotal}</span>
        <span className="font-display">{pesos(total)}</span>
      </div>
    </fieldset>
  )
}
