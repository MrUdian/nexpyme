-- =====================================================================
-- NEXPYME · Base de datos (Supabase / PostgreSQL)
-- Cómo usarlo: Supabase → SQL Editor → New query → pega todo → Run
-- Se puede correr varias veces sin romper nada.
-- =====================================================================

-- Las contraseñas NO se guardan aquí: Supabase Auth las guarda cifradas (bcrypt)
-- en la tabla interna auth.users. Nosotros guardamos el resto del perfil.

-- ---------------------------------------------------------------------
-- 1. PERFILES (nombre del negocio o de usuario, correo y giros)
-- ---------------------------------------------------------------------
-- nombre_completo: se conserva el nombre de la columna, pero ahora guarda el nombre del
-- negocio o un nombre de usuario (no tiene que ser el nombre completo de la persona).
-- giros: uno o varios de 'comercial', 'servicios', 'produccion'.
create table if not exists public.perfiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  nombre_completo  text not null,
  correo           text not null,
  giros            text[] not null default array['comercial'],
  creado_en        timestamptz not null default now(),
  actualizado_en   timestamptz not null default now()
);

-- Cambios para bases que ya existían (de tipo_empresa a giros, nombre más flexible)
alter table public.perfiles add column if not exists giros text[] not null default array['comercial'];

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'perfiles' and column_name = 'tipo_empresa'
  ) then
    update public.perfiles set giros = case
      when tipo_empresa in ('servicios', 'turismo') then array['servicios']
      when tipo_empresa in ('produccion', 'alimentos', 'artesanias', 'agropecuario') then array['produccion']
      else array['comercial']
    end;
    alter table public.perfiles drop column tipo_empresa;
  end if;
end;
$$;

alter table public.perfiles drop constraint if exists perfiles_nombre_completo_check;
alter table public.perfiles drop constraint if exists perfiles_nombre_valido;
alter table public.perfiles add constraint perfiles_nombre_valido
  check (char_length(btrim(nombre_completo)) between 2 and 120);

alter table public.perfiles drop constraint if exists perfiles_giros_validos;
alter table public.perfiles add constraint perfiles_giros_validos
  check (cardinality(giros) between 1 and 3
         and giros <@ array['comercial', 'servicios', 'produccion']::text[]);

-- ---------------------------------------------------------------------
-- 2. CÁLCULOS GUARDADOS (historial del panel)
-- ---------------------------------------------------------------------
create table if not exists public.calculos (
  id          bigint generated always as identity primary key,
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tipo        text not null check (tipo in ('punto_equilibrio', 'liquidez', 'endeudamiento', 'rentabilidad')),
  datos       jsonb not null,   -- lo que escribió la persona (incluye los renglones "Otro")
  resultado   jsonb not null,   -- valor, nivel (semáforo), título y explicación
  nota        text check (char_length(nota) <= 200),
  created_at  timestamptz not null default now()
);

create index if not exists calculos_user_fecha on public.calculos (user_id, created_at desc);

-- ---------------------------------------------------------------------
-- 2b. INVENTARIO (una lista de productos por persona)
-- productos: [{ "id": "...", "nombre": "Refresco 600 ml", "cantidad": 24,
--               "costo": 14, "precio": 20 }]
-- ---------------------------------------------------------------------
create table if not exists public.inventarios (
  user_id         uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  productos       jsonb not null default '[]'::jsonb check (jsonb_typeof(productos) = 'array'),
  actualizado_en  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 3. SEGURIDAD: cada persona solo ve y cambia lo suyo (Row Level Security)
-- ---------------------------------------------------------------------
alter table public.perfiles enable row level security;
alter table public.calculos enable row level security;
alter table public.inventarios enable row level security;

drop policy if exists "ver mi perfil" on public.perfiles;
create policy "ver mi perfil" on public.perfiles
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists "editar mi perfil" on public.perfiles;
create policy "editar mi perfil" on public.perfiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "mis calculos" on public.calculos;
create policy "mis calculos" on public.calculos
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, insert, update, delete on public.inventarios to authenticated;

drop policy if exists "mi inventario" on public.inventarios;
create policy "mi inventario" on public.inventarios
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- El correo del perfil solo lo cambia el sistema (ver trigger de abajo), no la persona
revoke update on public.perfiles from authenticated;
grant update (nombre_completo, giros) on public.perfiles to authenticated;

-- ---------------------------------------------------------------------
-- 4. AUTOMÁTICOS
-- ---------------------------------------------------------------------

-- Crea el perfil en cuanto alguien se registra (con los datos del formulario de registro)
create or replace function public.crear_perfil()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  elegidos text[];
begin
  select coalesce(array_agg(distinct g), '{}') into elegidos
  from jsonb_array_elements_text(
    case when jsonb_typeof(new.raw_user_meta_data -> 'giros') = 'array'
         then new.raw_user_meta_data -> 'giros' else '[]'::jsonb end
  ) as g
  where g in ('comercial', 'servicios', 'produccion');

  if cardinality(elegidos) = 0 then
    elegidos := array['comercial'];
  end if;

  insert into public.perfiles (id, nombre_completo, correo, giros)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'nombre_completo'), ''), 'Mi negocio'),
    new.email,
    elegidos
  );
  return new;
end;
$$;

drop trigger if exists al_registrarse on auth.users;
create trigger al_registrarse
  after insert on auth.users
  for each row execute function public.crear_perfil();

-- Si la persona cambia (y confirma) su correo, se actualiza también en el perfil
create or replace function public.sincronizar_correo()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.perfiles set correo = new.email, actualizado_en = now() where id = new.id;
  return new;
end;
$$;

drop trigger if exists al_cambiar_correo on auth.users;
create trigger al_cambiar_correo
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.sincronizar_correo();

-- Fecha de última modificación
create or replace function public.marcar_actualizado()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists perfiles_actualizado on public.perfiles;
create trigger perfiles_actualizado
  before update on public.perfiles
  for each row execute function public.marcar_actualizado();

-- ---------------------------------------------------------------------
-- 5. BORRAR MI CUENTA (la "D" del CRUD)
-- Borra al usuario; perfil y cálculos se borran solos por "on delete cascade".
-- ---------------------------------------------------------------------
create or replace function public.eliminar_mi_cuenta()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'No hay sesión';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.eliminar_mi_cuenta() from public, anon;
grant execute on function public.eliminar_mi_cuenta() to authenticated;
