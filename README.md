# NEXPYME

Calculadoras financieras sencillas para emprendedores (punto de equilibrio, liquidez,
endeudamiento y rentabilidad) e inventario, con cuentas de usuario, panel de resultados y PDF.
Los textos y ejemplos se adaptan al giro del negocio: comercial, servicios y/o producción
(se puede elegir más de uno).

**Stack:** React + Vite · Tailwind CSS 4 · Recharts · Supabase (PostgreSQL + Auth) ·
jsPDF + html2canvas-pro · Vitest + Testing Library + Playwright · oxlint + Prettier ·
GitHub Actions · Vercel + Vercel Analytics.

## 1. Correrlo en tu computadora

```bash
npm install
cp .env.example .env.local   # luego pon tus llaves de Supabase
npm run dev                  # abre http://localhost:5173
```

Las calculadoras funcionan aunque todavía no conectes Supabase. Lo único que necesita la
base de datos es el registro, el panel y el botón para guardar.

## 2. Conectar la base de datos (Supabase, gratis)

1. Crea un proyecto en https://supabase.com.
2. **SQL Editor → New query**: pega todo `supabase/schema.sql` y presiona **Run**.
3. **Project Settings → API**: copia la *Project URL* y la *anon public key* a `.env.local`.
4. **Authentication → Sign In / Providers → Email**:
   - Minimum password length: **8** (la página también lo pide).
   - "Confirm email": déjalo encendido para producción. Para hacer pruebas rápidas
     lo puedes apagar.
5. **Authentication → URL Configuration**: en *Site URL* pon tu dominio de Vercel y agrega
   `http://localhost:5173` en *Redirect URLs*.

### Tablas

| Tabla | Para qué | Seguridad |
|---|---|---|
| `auth.users` (de Supabase) | correo y contraseña **cifrada** | la maneja Supabase |
| `perfiles` | nombre del negocio o de usuario, correo, giros (uno o varios) | cada quien solo ve y edita lo suyo (RLS) |
| `inventarios` | lista de productos de cada persona (jsonb) | cada quien solo ve lo suyo (RLS) |
| `calculos` | historial: tipo, datos, resultado, nota | cada quien solo ve lo suyo (RLS) |

CRUD de la cuenta: **C** registro (`/registro`), **R** panel y perfil, **U** editar
nombre, giros, correo y contraseña (`/perfil`), **D** borrar cuenta (función
`eliminar_mi_cuenta`, que también borra los cálculos).

## 3. Publicar (Vercel)

1. Sube el repo a GitHub.
2. En vercel.com: **Add New → Project** e importa el repo. Vercel detecta Vite solo.
3. En **Environment Variables** agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. En la pestaña **Analytics** del proyecto presiona **Enable**.

Cada `git push` a `main` publica una versión nueva.

## 4. Pruebas y calidad

```bash
npm test            # fórmulas y pantallas (Vitest)
npm run test:e2e    # flujos completos en navegador de computadora y celular (Playwright)
npm run lint        # oxlint (el linter que trae ahora la plantilla de Vite; hace lo de ESLint)
npm run format      # Prettier
```

GitHub Actions (`.github/workflows/ci.yml`) corre todo esto en cada push.

## 5. Dónde cambiar cosas

| Quiero cambiar… | Archivo |
|---|---|
| Fórmulas, rangos del semáforo, textos de interpretación y consejos | `src/lib/finanzas.js` |
| Giros, textos por giro y ejemplos | `src/lib/giros.js` **y** el `check` de `supabase/schema.sql` |
| Textos y ejemplos de cada casilla | `src/pages/PuntoEquilibrio.jsx`, `src/pages/Razones.jsx` |
| Colores | `src/index.css` (`@theme`) |
| Aviso de privacidad | `src/pages/Privacidad.jsx` (completar los `[ ]`) |

**Si ya tenías la base de datos creada:** vuelve a correr `supabase/schema.sql` completo en
el SQL Editor. Pasa los perfiles de `tipo_empresa` a `giros`, crea la tabla `inventarios` y
no borra los cálculos guardados.

**Pendiente del equipo:** validar el texto de liquidez **entre 1 y 1.5**. El documento de
fórmulas no lo define; está marcado como `PROPUESTA` en `finanzas.js`.
