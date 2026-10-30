-- Datos de ejemplo para poder explorar la API con contenido real.
-- Idempotente: se puede ejecutar varias veces sin duplicar registros.

INSERT INTO public.areas (id, nombre, slug, descripcion, es_inclusiva, orden, activa) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Sala infantil', 'sala-infantil',
   'Espacio de lectura y juego para niñas y niños de 0 a 12 años.', false, 1, true),
  ('22222222-2222-4222-8222-222222222222', 'Sala general', 'sala-general',
   'Colección general de consulta y préstamo a domicilio.', false, 2, true),
  ('33333333-3333-4333-8333-333333333333', 'Espacio inclusivo', 'espacio-inclusivo',
   'Materiales en braille, audiolibros y mobiliario accesible.', true, 3, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.informacion_institucional (
  id, nombre_oficial, numero_coleccion, direccion, telefono,
  correo_institucional, correo_operativo, mision, vision, historia,
  url_catalogo_koha, latitud, longitud
) VALUES (
  1, 'Biblioteca Pública Municipal', 'BP-0042',
  'Av. Central 123, Centro', '+52 55 1234 5678',
  'contacto@biblioteca.gob.mx', 'operaciones@biblioteca.gob.mx',
  'Facilitar el acceso libre a la información, la lectura y la cultura de toda la comunidad.',
  'Ser un espacio de encuentro que acompañe el aprendizaje durante toda la vida.',
  'La biblioteca abrió sus puertas en 1978 y desde entonces forma parte de la vida cultural del barrio.',
  'https://catalogo.biblioteca.gob.mx', 19.432608, -99.133209
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.horarios (dia_semana, cerrado, abre, cierra, nota) VALUES
  (1, false, '08:00', '18:00', NULL),
  (2, false, '08:00', '18:00', NULL),
  (3, false, '08:00', '18:00', NULL),
  (4, false, '08:00', '18:00', NULL),
  (5, false, '08:00', '20:00', 'Servicio extendido los viernes'),
  (6, false, '09:00', '13:00', NULL),
  (7, true, NULL, NULL, 'Domingo cerrado')
ON CONFLICT (dia_semana) DO NOTHING;

INSERT INTO public.horarios_especiales (fecha, cerrado, abre, cierra, motivo) VALUES
  ('2026-11-02', true, NULL, NULL, 'Mantenimiento del sistema de préstamos')
ON CONFLICT (fecha) DO NOTHING;

INSERT INTO public.noticias (id, tipo, titulo, slug, resumen, contenido, destacada, estado, publicado_at) VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'noticia',
   'Nuevo horario extendido de viernes', 'nuevo-horario-extendido-viernes',
   'A partir de noviembre la biblioteca abrirá hasta las 20:00 los viernes.',
   'Con el objetivo de facilitar el estudio y la consulta después del trabajo, la biblioteca amplía su horario los viernes hasta las 20:00 horas.',
   true, 'publicado', now() - interval '2 days'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'aviso',
   'Club de lectura para jóvenes', 'club-de-lectura-para-jovenes',
   'Inscripciones abiertas para el club de lectura de noviembre.',
   'El club de lectura juvenil se reúne cada miércoles a las 17:00 en la sala general. Las inscripciones son gratuitas en el mostrador de préstamo.',
   false, 'publicado', now() - interval '10 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.eventos (
  id, tipo, titulo, slug, descripcion, fecha_inicio, fecha_fin, area_id,
  publico, cupo, inscripcion_presencial, requisitos, estado, publicado_at
) VALUES
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'taller',
   'Taller de encuadernación artesanal', 'taller-de-encuadernacion-artesanal',
   'Aprende a coser un cuaderno con técnicas tradicionales de encuadernación.',
   now() + interval '5 days', now() + interval '5 days 2 hours',
   '22222222-2222-4222-8222-222222222222', 'adultos', 20, true,
   'Traer hojas de papel bond y un delantal.', 'publicado', now() - interval '1 day'),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'evento',
   'Cuentacuentos de sábado', 'cuentacuentos-de-sabado',
   'Sesión de cuentos y canciones para las familias.',
   now() + interval '9 days', now() + interval '9 days 1 hour',
   '11111111-1111-4111-8111-111111111111', 'infantil', 40, true, NULL,
   'publicado', now() - interval '3 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.galeria_fotos (
  id, evento_id, titulo, archivo_path, texto_alternativo, fecha_toma,
  aparecen_menores, autorizacion_difusion, estado, publicado_at
) VALUES
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
   'Cuentacuentos en la sala infantil', 'galeria/cuentacuentos-2026.jpg',
   'Niñas y niños sentados en cojines escuchando un cuento.', current_date - 7,
   false, true, 'publicado', now() - interval '6 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.recursos (id, titulo, descripcion, tipo, archivo_path, tamano_bytes, estado, publicado_at) VALUES
  ('ffffffff-ffff-4fff-8fff-ffffffffffff', 'Guía de uso del catálogo en línea',
   'Manual breve para buscar y reservar material desde el catálogo.',
   'pdf', 'recursos/guia-catalogo.pdf', 524288, 'publicado', now() - interval '30 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.participaciones (
  id, tipo, nombre_visitante, correo_contacto, mensaje, calificacion, respuesta, estado, atendida_at
) VALUES
  ('1a1a1a1a-1a1a-4a1a-8a1a-1a1a1a1a1a1a', 'pregunta', 'María López',
   'maria@example.com', '¿Puedo renovar el préstamo de un libro por teléfono?',
   NULL, 'Sí, llama al +52 55 1234 5678 dentro del horario de atención.',
   'respondida', now() - interval '2 days'),
  ('2b2b2b2b-2b2b-4b2b-8b2b-2b2b2b2b2b2b', 'comentario', 'Jorge Ramírez',
   NULL, 'Excelente atención del personal y muy buena selección de libros.', 5,
   NULL, 'publicada', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.sugerencias (id, tipo, categoria, area_id, descripcion, propuesta_mejora, correo_contacto, estado) VALUES
  ('3c3c3c3c-3c3c-4c3c-8c3c-3c3c3c3c3c3c', 'sugerencia', 'infraestructura',
   '33333333-3333-4333-8333-333333333333',
   'Faltan enchufes para conectar computadoras portátiles en la sala general.',
   'Instalar regletas en las mesas de trabajo del ala norte.', 'sugerencias@example.com', 'en_revision')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.kb_documentos (id, titulo, contenido, fuente, activo) VALUES
  ('4d4d4d4d-4d4d-4d4d-8d4d-4d4d4d4d4d4d', 'Reglamento de préstamo',
   'El préstamo a domicilio es de hasta tres libros por persona durante quince días naturales, con posibilidad de una renovación.',
   'Reglamento interno 2026', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.kb_fragmentos (documento_id, orden, contenido, tokens, embedding)
SELECT
  '4d4d4d4d-4d4d-4d4d-8d4d-4d4d4d4d4d4d',
  0,
  'El préstamo a domicilio es de hasta tres libros por persona durante quince días naturales, con posibilidad de una renovación.',
  24,
  ('[' || array_to_string(array_fill(0.01::float8, ARRAY[1536]), ',') || ']')::extensions.vector
WHERE NOT EXISTS (
  SELECT 1 FROM public.kb_fragmentos
  WHERE documento_id = '4d4d4d4d-4d4d-4d4d-8d4d-4d4d4d4d4d4d' AND orden = 0
);
