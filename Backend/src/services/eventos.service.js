// src/services/eventos.service.js
const { pool } = require('../config/db');

const obtenerEventos = async ({ estado, tipo, publico, area_id, buscar, limite = 10, pagina = 1 }) => {
  const offset = (pagina - 1) * limite;
  const condiciones = [];
  const valores = [];

  if (estado) {
    valores.push(estado);
    condiciones.push(`estado = $${valores.length}`);
  }

  if (tipo) {
    valores.push(tipo);
    condiciones.push(`tipo = $${valores.length}`);
  }

  if (publico) {
    valores.push(publico);
    condiciones.push(`publico = $${valores.length}`);
  }

  if (area_id) {
    valores.push(area_id);
    condiciones.push(`area_id = $${valores.length}`);
  }

  if (buscar) {
    valores.push(buscar);
    condiciones.push(`busqueda @@ plainto_tsquery('spanish', $${valores.length})`);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const query = `
    SELECT id, tipo, titulo, slug, descripcion, fecha_inicio, fecha_fin, 
           area_id, lugar_externo, publico, cupo, inscripcion_presencial, 
           requisitos, imagen_path, imagen_alt, estado, publicado_at, created_at
    FROM public.eventos
    ${whereClause}
    ORDER BY fecha_inicio ASC
    LIMIT $${valores.length + 1} OFFSET $${valores.length + 2};
  `;

  const result = await pool.query(query, [...valores, limite, offset]);
  return result.rows;
};

const obtenerPorSlug = async (slug) => {
  const query = 'SELECT * FROM public.eventos WHERE slug = $1;';
  const result = await pool.query(query, [slug]);
  return result.rows[0];
};

const crear = async (datos) => {
  const {
    tipo = 'evento',
    titulo,
    slug,
    descripcion,
    fecha_inicio,
    fecha_fin = null,
    area_id = null,
    lugar_externo = null,
    publico = 'todo_publico',
    cupo = null,
    inscripcion_presencial = true,
    requisitos = null,
    imagen_path = null,
    imagen_alt = null,
    estado = 'borrador',
    publicado_at = null,
    autor_id = null
  } = datos;

  const query = `
    INSERT INTO public.eventos (
      tipo, titulo, slug, descripcion, fecha_inicio, fecha_fin,
      area_id, lugar_externo, publico, cupo, inscripcion_presencial,
      requisitos, imagen_path, imagen_alt, estado, publicado_at, autor_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    RETURNING *;
  `;

  const values = [
    tipo, titulo, slug, descripcion, fecha_inicio, fecha_fin,
    area_id, lugar_externo, publico, cupo, inscripcion_presencial,
    requisitos, imagen_path, imagen_alt, estado, publicado_at, autor_id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const actualizar = async (id, datos) => {
  const {
    tipo, titulo, slug, descripcion, fecha_inicio, fecha_fin,
    area_id, lugar_externo, publico, cupo, inscripcion_presencial,
    requisitos, imagen_path, imagen_alt, estado, publicado_at
  } = datos;

  const query = `
    UPDATE public.eventos
    SET tipo = COALESCE($1, tipo),
        titulo = COALESCE($2, titulo),
        slug = COALESCE($3, slug),
        descripcion = COALESCE($4, descripcion),
        fecha_inicio = COALESCE($5, fecha_inicio),
        fecha_fin = $6,
        area_id = $7,
        lugar_externo = $8,
        publico = COALESCE($9, publico),
        cupo = $10,
        inscripcion_presencial = COALESCE($11, inscripcion_presencial),
        requisitos = $12,
        imagen_path = $13,
        imagen_alt = $14,
        estado = COALESCE($15, estado),
        publicado_at = $16
    WHERE id = $17
    RETURNING *;
  `;

  const values = [
    tipo, titulo, slug, descripcion, fecha_inicio, fecha_fin,
    area_id, lugar_externo, publico, cupo, inscripcion_presencial,
    requisitos, imagen_path, imagen_alt, estado, publicado_at, id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const eliminar = async (id) => {
  const query = 'DELETE FROM public.eventos WHERE id = $1 RETURNING id;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  obtenerEventos,
  obtenerPorSlug,
  crear,
  actualizar,
  eliminar
};