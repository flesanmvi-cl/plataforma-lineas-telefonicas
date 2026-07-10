-- Roles persistidos en BBDD para /configuracion/usuarios — solo necesario si esta
-- plataforma requiere más granularidad que el bootstrap por env (CIA_ADMIN_EMAILS).
-- Aplicar a mano contra la BBDD de DATABASE_URL (no hay herramienta de migraciones en
-- este proyecto) — ver docs/ARQUITECTURA.md. Reemplaza "<slug>" por el nombre de esta
-- plataforma (mismo slug en lib/usuarios-db.ts y app/api/configuracion/usuarios/*).
--
-- Filas ausentes en cia_<slug>_usuarios = usuario no administrado desde este panel:
-- entra como "member" (ver lib/usuarios-db.ts). CIA_ADMIN_EMAILS sigue siendo el
-- bootstrap de administrador, fijo por env y nunca editable desde esta tabla.

CREATE TABLE IF NOT EXISTS flesan_procesos.cia_<slug>_usuarios (
  correo      VARCHAR(255) PRIMARY KEY,
  nombre      TEXT,
  rol         VARCHAR(20) NOT NULL DEFAULT 'member'
                CHECK (rol IN ('admin', 'member')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
