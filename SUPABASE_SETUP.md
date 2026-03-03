# Supabase Setup

## 1. Crear tabla
Ejecuta este SQL en Supabase SQL Editor:

```sql
create table if not exists public.site_content (
  id bigint primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);
```

## 2. Politicas RLS (sin password, abierto)
Esta configuracion permite leer/escribir desde el panel sin login.

```sql
alter table public.site_content enable row level security;

create policy "public read site_content"
on public.site_content
for select
to anon
using (true);

create policy "public upsert site_content"
on public.site_content
for insert
to anon
with check (true);

create policy "public update site_content"
on public.site_content
for update
to anon
using (true)
with check (true);
```

## 3. Semilla inicial

```sql
insert into public.site_content (id, content)
values (1, '{}'::jsonb)
on conflict (id) do nothing;
```

## 4. Configurar frontend
Edita `supabase-config.js` y pega tus datos:

```js
window.SUPABASE_CONFIG = {
  url: "https://TU-PROYECTO.supabase.co",
  anonKey: "TU_SUPABASE_ANON_KEY",
  table: "site_content",
  rowId: 1
};
```

## 5. Desplegar
Haz commit + push. Vercel desplegara automaticamente.

## Nota de seguridad
Esta version queda sin password (como pediste). Cualquiera que encuentre `admin.html` puede cambiar contenido.
