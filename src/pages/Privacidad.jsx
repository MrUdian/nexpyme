/** Borrador de aviso de privacidad simplificado. El equipo debe revisarlo y poner la fecha. */
export default function Privacidad() {
  return (
    <article className="max-w-3xl mx-auto px-5 py-12 flex flex-col gap-4 text-lg">
      <h1 className="m-0 font-display text-4xl">Aviso de privacidad</h1>
      <p className="m-0 text-tenue text-base">Versión simplificada · [fecha]</p>
      <p>
        <strong>¿Qué es NEXPYME?</strong> Una herramienta gratuita para que emprendedores y pequeños
        negocios entiendan sus números con palabras sencillas.
      </p>
      <p>
        <strong>¿Qué datos pedimos?</strong> El nombre de tu negocio o un nombre de usuario, tu
        correo, el tipo de negocio que tienes, tu inventario si lo registras y los números que
        escribes en las calculadoras cuando decides guardarlos.
      </p>
      <p>
        <strong>¿Para qué?</strong> Solo para que puedas entrar a tu cuenta, ver tus resultados y
        compararlos con el tiempo. También contamos visitas de forma anónima para mejorar la página.
        No vendemos ni compartimos tus datos.
      </p>
      <p>
        <strong>¿Cómo los cuidamos?</strong> Tu contraseña se guarda cifrada (nadie, ni nosotros,
        puede verla). La conexión es segura (https) y cada persona solo puede ver sus propios
        cálculos.
      </p>
      <p>
        <strong>Tus derechos.</strong> Puedes ver, corregir o borrar tus datos cuando quieras desde
        “Mi perfil”. Ahí también puedes eliminar tu cuenta y todos tus datos.
      </p>
      <p className="text-base text-tenue">
        Las calculadoras pueden usarse sin crear una cuenta. Los resultados son una guía; para
        decisiones importantes consulta a un contador.
      </p>
    </article>
  )
}
