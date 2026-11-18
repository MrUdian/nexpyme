import { Link } from 'react-router'
import {
  IconoAlcancia,
  IconoBalanza,
  IconoCadena,
  IconoCaja,
  IconoMonedas,
} from '../components/Iconos.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { RUTAS } from '../lib/calculos.js'

const HERRAMIENTAS = [
  {
    tipo: 'punto_equilibrio',
    Icono: IconoBalanza,
    pregunta: '¿Cuánto tengo que vender para no perder?',
    nombre: 'Punto de equilibrio',
    necesitas: 'Tus gastos del mes, tu precio y tu costo',
  },
  {
    tipo: 'liquidez',
    Icono: IconoAlcancia,
    pregunta: '¿Me alcanza para pagar lo que debo?',
    nombre: 'Liquidez',
    necesitas: 'Lo que tienes y lo que debes este año',
  },
  {
    tipo: 'endeudamiento',
    Icono: IconoCadena,
    pregunta: '¿Cuánto de mi negocio es prestado?',
    nombre: 'Endeudamiento',
    necesitas: 'Cuánto vale tu negocio y cuánto debes',
  },
  {
    tipo: 'rentabilidad',
    Icono: IconoMonedas,
    pregunta: '¿Cuánto gano de verdad?',
    nombre: 'Rentabilidad sobre ventas',
    necesitas: 'Tus ventas y tus gastos',
  },
  {
    tipo: 'inventario',
    Icono: IconoCaja,
    pregunta: '¿Cuánto vale lo que tengo guardado?',
    nombre: 'Mi inventario',
    necesitas: 'Tus productos, cuántos tienes y cuánto te costaron',
    ruta: '/inventario',
  },
]

/**
 * Manual de uso, paso por paso.
 * Cada paso: título, qué hacer, detalles (lista) y un consejo.
 * En "detalles" se puede poner [texto, ruta] para que sea un enlace.
 */
const PASOS = [
  {
    titulo: 'Elige tu tipo de negocio',
    texto:
      'Arriba de cada calculadora hay tres botones. Marca el que se parece a tu negocio. Puedes marcar más de uno.',
    detalles: [
      [
        'Comercial',
        ': compras productos y los vuelves a vender. Ej.: tienda de abarrotes, papelería.',
      ],
      ['Servicios', ': cobras por tu trabajo o atención. Ej.: estética, taller, limpieza.'],
      ['Producción', ': haces lo que vendes. Ej.: panadería, costura, carpintería.'],
    ],
    consejo:
      'Lo que elijas se queda guardado: no tienes que volver a elegirlo cada vez que cambias de página. Si tienes cuenta, se usan los tipos de negocio de tu perfil.',
  },
  {
    titulo: 'Escoge qué quieres saber',
    texto: 'Cada herramienta responde una pregunta. Elige la que te interesa:',
    detalles: [
      [
        '¿Cuánto tengo que vender para no perder?',
        ' → Punto de equilibrio',
        '/punto-de-equilibrio',
      ],
      ['¿Me alcanza para pagar lo que debo?', ' → Liquidez', '/razones?razon=liquidez'],
      ['¿Qué tanto de mi negocio es prestado?', ' → Endeudamiento', '/razones?razon=endeudamiento'],
      ['¿Cuánto me queda de lo que vendo?', ' → Rentabilidad', '/razones?razon=rentabilidad'],
      ['¿Cuánto vale lo que tengo guardado?', ' → Mi inventario', '/inventario'],
    ],
    consejo: 'Si no sabes por dónde empezar, empieza por el punto de equilibrio.',
  },
  {
    titulo: 'Escribe tus números',
    texto: 'Llena las casillas con los datos de tu negocio. No necesitas saber de contabilidad.',
    detalles: [
      ['Debajo de cada casilla', ' te explicamos qué poner, con un ejemplo.'],
      [
        '¿No sabes qué poner?',
        ' Presiona “Ver ejemplo de…” y mira cómo se llena con un negocio parecido al tuyo.',
      ],
      ['Usa datos del mismo tiempo', ': todo de una semana o todo de un mes.'],
      ['¿Te falta algo en la lista?', ' Usa el botón “Agregar otro”.'],
    ],
    consejo: 'Si tienes tu inventario guardado, puedes usar su valor con un solo clic.',
  },
  {
    titulo: 'Presiona “Calcular” y lee tu resultado',
    texto: 'En un momento ves cómo está tu negocio. El resultado trae:',
    detalles: [
      [
        'Un número grande con color',
        ': verde es que vas bien, amarillo es cuidado y rojo es que hay que actuar.',
      ],
      ['Qué significa', ', explicado con palabras sencillas, y un consejo de qué puedes hacer.'],
      ['Un resumen de tus datos', ', para que revises que escribiste bien los números.'],
      [
        'Gráficas',
        ' que te ayudan a verlo. Por ejemplo, en el punto de equilibrio ves dónde pierdes y dónde ganas.',
      ],
      ['Botón “Escuchar resultado”', ', si prefieres oírlo en vez de leerlo.'],
    ],
    consejo: 'Si te vas a otra sección y regresas, tus datos y tu resultado siguen ahí.',
  },
  {
    titulo: 'Guárdalo o descárgalo',
    texto: 'Cuando tengas tu resultado puedes:',
    detalles: [
      ['Descargar en PDF', ': para imprimirlo o mandarlo por WhatsApp o correo.'],
      ['Guardar en mi panel', ' (con tu cuenta gratis): se guarda con la fecha.'],
      [
        'Ver cómo has cambiado',
        ': en tu panel aparece una gráfica con tus resultados de cada mes.',
      ],
    ],
    consejo: 'Haz tus cálculos cada mes y guárdalos. Así sabrás si tu negocio va mejorando.',
  },
]

export default function Inicio() {
  const { usuario } = useAuth() ?? {}
  return (
    <>
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-12 flex flex-col gap-6">
        <span className="self-start px-3 py-1.5 rounded-full bg-oro-claro text-[#6B4300] text-sm font-semibold">
          Gratis · Para emprendedores y pequeños negocios
        </span>
        <h1 className="m-0 font-display font-bold text-4xl sm:text-6xl leading-[1.05] max-w-4xl tracking-tight">
          Entiende los números de tu negocio, sin ser contador.
        </h1>
        <p className="m-0 text-xl text-suave max-w-2xl">
          Escribe unos cuantos números y te decimos, con palabras sencillas, si a tu negocio le está
          yendo bien y qué puedes hacer para mejorar.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/punto-de-equilibrio"
            className="min-h-14 px-7 rounded-xl bg-marca text-white text-lg font-bold no-underline flex items-center hover:brightness-95"
          >
            Empezar ahora
          </Link>
          <Link
            to={usuario ? '/panel' : '/registro'}
            className="min-h-14 px-6 rounded-xl bg-white border-2 border-campo text-tinta text-lg font-semibold no-underline flex items-center hover:bg-fondo"
          >
            {usuario ? 'Ir a mi panel' : 'Crear mi cuenta gratis'}
          </Link>
        </div>
      </section>

      <section className="bg-white border-y border-borde">
        <div className="max-w-6xl mx-auto px-5 py-14 flex flex-col gap-8">
          <h2 className="m-0 font-display text-3xl">¿Qué quieres saber de tu negocio?</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {HERRAMIENTAS.map(({ tipo, Icono, pregunta, nombre, necesitas, ruta }) => (
              <Link
                key={tipo}
                to={ruta ?? RUTAS[tipo]}
                className="group p-6 rounded-2xl border-2 border-borde bg-fondo/50 no-underline text-tinta flex gap-4 hover:border-marca"
              >
                <span className="h-14 w-14 shrink-0 rounded-xl bg-marca-claro text-marca-oscuro flex items-center justify-center">
                  <Icono width="30" height="30" />
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-display text-2xl font-bold leading-snug">{pregunta}</span>
                  <span className="text-tenue">{nombre}</span>
                  <span className="text-[15px] text-suave">Necesitas: {necesitas}</span>
                  <span className="font-semibold text-marca-oscuro group-hover:underline">
                    {ruta ? 'Abrir →' : 'Calcular →'}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-14 flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h2 className="m-0 font-display text-3xl">Cómo utilizarlo</h2>
          <p className="m-0 text-lg text-suave max-w-3xl">
            Una guía rápida, paso por paso. Sigue los pasos en orden y en pocos minutos sabrás cómo
            está tu negocio.
          </p>
        </div>
        <ol className="m-0 p-0 list-none relative flex flex-col gap-6">
          {/* Línea que une los pasos en orden */}
          <span
            aria-hidden="true"
            className="absolute bg-marca/30 rounded-full left-[25px] sm:left-[29px] top-10 bottom-10 w-1.5"
          />
          {PASOS.map(({ titulo, texto, detalles, consejo }, i) => (
            <li key={titulo} className="relative flex gap-4 sm:gap-6">
              <span className="relative z-10 h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-full bg-marca text-white font-display text-2xl sm:text-3xl font-bold flex items-center justify-center ring-8 ring-fondo">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0 bg-white border border-borde rounded-2xl p-5 sm:p-6 flex flex-col gap-3">
                <span className="text-sm font-semibold uppercase tracking-wide text-marca-oscuro">
                  Paso {i + 1}
                </span>
                <h3 className="m-0 text-2xl">{titulo}</h3>
                <p className="m-0 text-lg">{texto}</p>
                <ul className="m-0 pl-5 list-disc flex flex-col gap-1.5 text-[17px] text-suave marker:text-marca">
                  {detalles.map(([fuerte, resto, ruta]) => (
                    <li key={fuerte}>
                      {ruta ? (
                        <Link to={ruta} className="font-semibold">
                          {fuerte}
                          {resto}
                        </Link>
                      ) : (
                        <>
                          <strong className="text-tinta">{fuerte}</strong>
                          {resto}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                <p className="m-0 p-3 rounded-xl bg-oro-claro text-[16px]">
                  <strong>💡 Consejo:</strong> {consejo}
                </p>
              </div>
            </li>
          ))}
        </ol>
        <Link
          to="/punto-de-equilibrio"
          className="self-start min-h-14 px-7 rounded-xl bg-marca text-white text-lg font-bold no-underline flex items-center hover:brightness-95"
        >
          Empezar con el paso 1 →
        </Link>
      </section>
    </>
  )
}
