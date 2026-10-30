-- Esquema de base de datos del Portal Web Biblioteca.
-- Reconstruido a partir de las consultas de Backend/src/services y de las
-- restricciones que los controladores esperan (nombres de constraint).

CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS vector SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- pgvector vive en el esquema `extensions` (como en Supabase), así que sus
-- operadores (<=>, <->) deben estar en el search_path de la base de datos.
DO $$
BEGIN
  EXECUTE format('ALTER DATABASE %I SET search_path TO public, extensions', current_database());
END
$$;

-- ---------------------------------------------------------------------------
-- Función de mantenimiento de updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- perfiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.perfiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_completo text NOT NULL,
  rol text NOT NULL DEFAULT 'bibliotecario'
    CHECK (rol IN ('admin', 'bibliotecario', 'editor', 'colaborador')),
  activo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- areas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  slug text NOT NULL,
  descripcion text,
  es_inclusiva boolean NOT NULL DEFAULT false,
  imagen_path text,
  imagen_alt text,
  orden integer NOT NULL DEFAULT 0,
  activa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT areas_nombre_key UNIQUE (nombre),
  CONSTRAINT areas_slug_key UNIQUE (slug),
  CONSTRAINT areas_slug_check CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT area_alt_obligatorio CHECK (imagen_path IS NULL OR imagen_alt IS NOT NULL)
);

-- ---------------------------------------------------------------------------
-- noticias (blog + avisos)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.noticias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL DEFAULT 'noticia'
    CHECK (tipo IN ('noticia', 'aviso', 'blog')),
  titulo text NOT NULL,
  slug text NOT NULL,
  resumen text,
  contenido text,
  imagen_path text,
  imagen_alt text,
  destacada boolean NOT NULL DEFAULT false,
  estado text NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador', 'revision', 'publicado', 'archivado')),
  publicado_at timestamptz,
  vigente_hasta timestamptz,
  autor_id uuid REFERENCES public.perfiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  busqueda tsvector GENERATED ALWAYS AS (
    to_tsvector('spanish', coalesce(titulo, '') || ' ' || coalesce(resumen, '') || ' ' || coalesce(contenido, ''))
  ) STORED,
  CONSTRAINT noticias_slug_key UNIQUE (slug),
  CONSTRAINT noticias_slug_check CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT noticia_alt_obligatorio CHECK (imagen_path IS NULL OR imagen_alt IS NOT NULL),
  CONSTRAINT noticia_vigencia CHECK (vigente_hasta IS NULL OR publicado_at IS NULL OR vigente_hasta >= publicado_at)
);

-- ---------------------------------------------------------------------------
-- eventos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL DEFAULT 'evento'
    CHECK (tipo IN ('evento', 'taller', 'exposicion', 'club_lectura', 'capacitacion')),
  titulo text NOT NULL,
  slug text NOT NULL,
  descripcion text,
  fecha_inicio timestamptz NOT NULL,
  fecha_fin timestamptz,
  area_id uuid REFERENCES public.areas (id) ON DELETE SET NULL,
  lugar_externo text,
  publico text NOT NULL DEFAULT 'todo_publico'
    CHECK (publico IN ('todo_publico', 'infantil', 'juvenil', 'adultos', 'adultos_mayores', 'docentes')),
  cupo integer,
  inscripcion_presencial boolean NOT NULL DEFAULT true,
  requisitos text,
  imagen_path text,
  imagen_alt text,
  estado text NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador', 'revision', 'publicado', 'cancelado', 'finalizado')),
  publicado_at timestamptz,
  autor_id uuid REFERENCES public.perfiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  busqueda tsvector GENERATED ALWAYS AS (
    to_tsvector('spanish', coalesce(titulo, '') || ' ' || coalesce(descripcion, ''))
  ) STORED,
  CONSTRAINT eventos_slug_key UNIQUE (slug),
  CONSTRAINT eventos_slug_check CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT evento_un_lugar CHECK (NOT (area_id IS NOT NULL AND lugar_externo IS NOT NULL)),
  CONSTRAINT evento_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
  CONSTRAINT eventos_cupo_check CHECK (cupo IS NULL OR cupo > 0),
  CONSTRAINT evento_alt CHECK (imagen_path IS NULL OR imagen_alt IS NOT NULL)
);

-- ---------------------------------------------------------------------------
-- galeria_fotos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.galeria_fotos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id uuid REFERENCES public.eventos (id) ON DELETE SET NULL,
  titulo text NOT NULL,
  descripcion text,
  archivo_path text NOT NULL,
  texto_alternativo text NOT NULL,
  fecha_toma date,
  aparecen_menores boolean NOT NULL DEFAULT false,
  autorizacion_difusion boolean NOT NULL DEFAULT false,
  estado text NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador', 'publicado', 'archivado')),
  publicado_at timestamptz,
  subido_por uuid REFERENCES public.perfiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT foto_publicable CHECK (estado <> 'publicado' OR autorizacion_difusion)
);

-- ---------------------------------------------------------------------------
-- recursos (descargables)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recursos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text,
  tipo text NOT NULL DEFAULT 'pdf'
    CHECK (tipo IN ('pdf', 'imagen', 'audio', 'video', 'enlace', 'otro')),
  archivo_path text NOT NULL,
  tamano_bytes bigint,
  descargas integer NOT NULL DEFAULT 0,
  estado text NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador', 'publicado', 'archivado')),
  publicado_at timestamptz,
  subido_por uuid REFERENCES public.perfiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT recursos_tamano_bytes_check CHECK (tamano_bytes IS NULL OR tamano_bytes >= 0),
  CONSTRAINT recursos_descargas_check CHECK (descargas >= 0)
);

-- ---------------------------------------------------------------------------
-- sugerencias (quejas / sugerencias)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sugerencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('queja', 'sugerencia')),
  categoria text NOT NULL,
  area_id uuid REFERENCES public.areas (id) ON DELETE SET NULL,
  descripcion text NOT NULL,
  propuesta_mejora text,
  correo_contacto text,
  estado text NOT NULL DEFAULT 'nueva'
    CHECK (estado IN ('nueva', 'en_revision', 'en_proceso', 'resuelta', 'archivada')),
  nota_interna text,
  atendida_por uuid REFERENCES public.perfiles (id) ON DELETE SET NULL,
  resuelta_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT quejas_sugerencias_descripcion_check CHECK (char_length(descripcion) BETWEEN 10 AND 2000),
  CONSTRAINT quejas_sugerencias_propuesta_mejora_check
    CHECK (propuesta_mejora IS NULL OR char_length(propuesta_mejora) <= 2000),
  CONSTRAINT quejas_sugerencias_correo_contacto_check
    CHECK (correo_contacto IS NULL OR correo_contacto ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- ---------------------------------------------------------------------------
-- participaciones (preguntas y comentarios del público)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.participaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo IN ('pregunta', 'comentario')),
  nombre_visitante text,
  correo_contacto text,
  mensaje text NOT NULL,
  calificacion integer,
  respuesta text,
  estado text NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'publicada', 'respondida', 'archivada')),
  nota_interna text,
  atendida_por uuid REFERENCES public.perfiles (id) ON DELETE SET NULL,
  atendida_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT participaciones_mensaje_check CHECK (char_length(mensaje) BETWEEN 5 AND 2000),
  CONSTRAINT participaciones_correo_contacto_check
    CHECK (correo_contacto IS NULL OR correo_contacto ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT comentario_con_nombre CHECK (tipo <> 'comentario' OR nombre_visitante IS NOT NULL),
  CONSTRAINT calificacion_solo_comentario CHECK (calificacion IS NULL OR tipo = 'comentario'),
  CONSTRAINT participaciones_calificacion_check CHECK (calificacion IS NULL OR calificacion BETWEEN 1 AND 5),
  CONSTRAINT respuesta_solo_pregunta CHECK (respuesta IS NULL OR tipo = 'pregunta')
);

-- ---------------------------------------------------------------------------
-- horarios regulares y especiales
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.horarios (
  dia_semana smallint PRIMARY KEY,
  cerrado boolean NOT NULL DEFAULT false,
  abre time,
  cierra time,
  nota text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT horarios_dia_semana_check CHECK (dia_semana BETWEEN 1 AND 7),
  CONSTRAINT horario_coherente CHECK (
    (cerrado AND abre IS NULL AND cierra IS NULL)
    OR (NOT cerrado AND abre IS NOT NULL AND cierra IS NOT NULL AND cierra > abre)
  )
);

CREATE TABLE IF NOT EXISTS public.horarios_especiales (
  fecha date PRIMARY KEY,
  cerrado boolean NOT NULL DEFAULT true,
  abre time,
  cierra time,
  motivo text NOT NULL,
  created_by uuid REFERENCES public.perfiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT horario_especial_coherente CHECK (
    (cerrado AND abre IS NULL AND cierra IS NULL)
    OR (NOT cerrado AND abre IS NOT NULL AND cierra IS NOT NULL AND cierra > abre)
  )
);

-- ---------------------------------------------------------------------------
-- informacion_institucional (registro único, id = 1)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.informacion_institucional (
  id integer PRIMARY KEY,
  nombre_oficial text NOT NULL,
  numero_coleccion text NOT NULL,
  direccion text NOT NULL,
  telefono text NOT NULL,
  correo_institucional text NOT NULL,
  correo_operativo text NOT NULL,
  mision text,
  vision text,
  historia text,
  url_catalogo_koha text,
  latitud numeric(9, 6),
  longitud numeric(9, 6),
  updated_by uuid REFERENCES public.perfiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT informacion_institucional_unico CHECK (id = 1),
  CONSTRAINT informacion_institucional_latitud_check CHECK (latitud IS NULL OR latitud BETWEEN -90 AND 90),
  CONSTRAINT informacion_institucional_longitud_check CHECK (longitud IS NULL OR longitud BETWEEN -180 AND 180),
  CONSTRAINT informacion_institucional_url_catalogo_koha_check
    CHECK (url_catalogo_koha IS NULL OR url_catalogo_koha ~* '^https?://')
);

-- ---------------------------------------------------------------------------
-- base de conocimiento (documentos + fragmentos con embeddings)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.kb_documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  contenido text NOT NULL,
  fuente text,
  activo boolean NOT NULL DEFAULT true,
  actualizado_por uuid REFERENCES public.perfiles (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kb_fragmentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  documento_id uuid NOT NULL REFERENCES public.kb_documentos (id) ON DELETE CASCADE,
  orden integer NOT NULL,
  contenido text NOT NULL,
  tokens integer,
  embedding extensions.vector(1536),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT kb_fragmentos_documento_orden_key UNIQUE (documento_id, orden),
  CONSTRAINT kb_fragmentos_orden_check CHECK (orden >= 0),
  CONSTRAINT kb_fragmentos_tokens_check CHECK (tokens IS NULL OR tokens > 0)
);

-- ---------------------------------------------------------------------------
-- chat_consultas (registro del asistente virtual)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_consultas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id text NOT NULL,
  pregunta text NOT NULL,
  respuesta text,
  fragmentos_usados jsonb NOT NULL DEFAULT '[]'::jsonb,
  util boolean,
  modelo text,
  latencia_ms integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chat_consultas_pregunta_check CHECK (char_length(pregunta) BETWEEN 3 AND 2000),
  CONSTRAINT chat_consultas_latencia_ms_check CHECK (latencia_ms IS NULL OR latencia_ms >= 0)
);

CREATE INDEX IF NOT EXISTS chat_consultas_sesion_idx ON public.chat_consultas (sesion_id);

-- ---------------------------------------------------------------------------
-- bitacora_cambios (auditoría)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bitacora_cambios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla text NOT NULL,
  registro_id uuid,
  accion text NOT NULL CHECK (accion IN ('crear', 'actualizar', 'eliminar')),
  usuario_id uuid REFERENCES public.perfiles (id) ON DELETE SET NULL,
  datos_anteriores jsonb,
  datos_nuevos jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bitacora_cambios_tabla_idx ON public.bitacora_cambios (tabla, registro_id);

-- ---------------------------------------------------------------------------
-- Triggers de updated_at
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'perfiles', 'areas', 'noticias', 'eventos', 'galeria_fotos', 'recursos',
    'sugerencias', 'participaciones', 'horarios', 'horarios_especiales',
    'informacion_institucional', 'kb_documentos', 'chat_consultas'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', t || '_set_updated_at', t);
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      t || '_set_updated_at', t
    );
  END LOOP;
END
$$;
