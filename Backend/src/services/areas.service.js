// src/services/areas.service.js
const { pool } = require('../config/db');

const obtenerTodas = async ({ activa, es_inclusiva, limite = 20, pagina = 1 }) => {
  const offset = (pagina - 1) * limite;
  const condiciones = [];
  const valores = [];

  if (activa !== undefined) {
    valores.push(activa === 'true');
    condiciones.push(`activa = $${valores.length}`);
  }

  if (es_inclusiva !== undefined) {
    valores.push(es_inclusiva === 'true');
    condiciones.push(`es_inclusiva = $${valores.length}`);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const query = `
    SELECT id, nombre, slug, descripcion, es_inclusiva, imagen_path, imagen_alt, orden, activa, created_at, updated_at
    FROM public.areas
    ${whereClause}
    ORDER BY orden ASC, nombre ASC
    LIMIT $${valores.length + 1} OFFSET $${valores.length + 2};
  `;

  const result = await pool.query(query, [...valores, limite, offset]);
  return result.rows;
};

const obtenerPorSlug = async (slug) => {
  const query = 'SELECT * FROM public.areas WHERE slug = $1;';
  const result = await pool.query(query, [slug]);
  return result.rows[0];
};

const obtenerPorId = async (id) => {
  const query = 'SELECT * FROM public.areas WHERE id = $1;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const crear = async (datos) => {
  const {
    nombre,
    slug,
    descripcion = null,
    es_inclusiva = false,
    imagen_path = null,
    imagen_alt = null,
    orden = 0,
    activa = true
  } = datos;

  const query = `
    INSERT INTO public.areas (
      nombre, slug, descripcion, es_inclusiva, imagen_path, imagen_alt, orden, activa
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [nombre, slug, descripcion, es_inclusiva, imagen_path, imagen_alt, orden, activa];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const actualizar = async (id, datos) => {
  const {
    nombre,
    slug,
    descripcion,
    es_inclusiva,
    imagen_path,
    imagen_alt,
    orden,
    activa
  } = datos;

  const query = `
    UPDATE public.areas
    SET nombre = COALESCE($1, nombre),
        slug = COALESCE($2, slug),
        descripcion = COALESCE($3, descripcion),
        es_inclusiva = COALESCE($4, es_inclusiva),
        imagen_path = $5,
        imagen_alt = $6,
        orden = COALESCE($7, orden),
        activa = COALESCE($8, activa)
    WHERE id = $9
    RETURNING *;
  `;

  const values = [nombre, slug, descripcion, es_inclusiva, imagen_path, imagen_alt, orden, activa, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const eliminar = async (id) => {
  const query = 'DELETE FROM public.areas WHERE id = $1 RETURNING id;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  obtenerTodas,
  obtenerPorSlug,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};