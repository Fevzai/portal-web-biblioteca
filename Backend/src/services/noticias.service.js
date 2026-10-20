// src/services/noticias.service.js
const { pool } = require('../config/db');

const obtenerNoticias = async ({ estado, limite = 10, pagina = 1, buscar }) => {
  const offset = (pagina - 1) * limite;
  const condiciones = [];
  const valores = [];

  if (estado) {
    valores.push(estado);
    condiciones.push(`estado = $${valores.length}`);
  }

  if (buscar) {
    valores.push(buscar);
    condiciones.push(`busqueda @@ plainto_tsquery('spanish', $${valores.length})`);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const query = `
    SELECT id, tipo, titulo, slug, resumen, imagen_path, imagen_alt, destacada, estado, publicado_at, vigente_hasta, created_at
    FROM public.noticias
    ${whereClause}
    ORDER BY publicado_at DESC NULLS LAST, created_at DESC
    LIMIT $${valores.length + 1} OFFSET $${valores.length + 2};
  `;

  const result = await pool.query(query, [...valores, limite, offset]);
  return result.rows;
};

const obtenerPorSlug = async (slug) => {
  const query = 'SELECT * FROM public.noticias WHERE slug = $1;';
  const result = await pool.query(query, [slug]);
  return result.rows[0];
};

const crear = async (datos) => {
  const {
    tipo = 'noticia',
    titulo,
    slug,
    resumen,
    contenido,
    imagen_path = null,
    imagen_alt = null,
    destacada = false,
    estado = 'borrador',
    publicado_at = null,
    vigente_hasta = null,
    autor_id = null
  } = datos;

  const query = `
    INSERT INTO public.noticias 
      (tipo, titulo, slug, resumen, contenido, imagen_path, imagen_alt, destacada, estado, publicado_at, vigente_hasta, autor_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `;

  const values = [
    tipo, titulo, slug, resumen, contenido,
    imagen_path, imagen_alt, destacada, estado,
    publicado_at, vigente_hasta, autor_id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const actualizar = async (id, datos) => {
  const {
    tipo, titulo, slug, resumen, contenido,
    imagen_path, imagen_alt, destacada, estado,
    publicado_at, vigente_hasta
  } = datos;

  const query = `
    UPDATE public.noticias
    SET tipo = COALESCE($1, tipo),
        titulo = COALESCE($2, titulo),
        slug = COALESCE($3, slug),
        resumen = COALESCE($4, resumen),
        contenido = COALESCE($5, contenido),
        imagen_path = $6,
        imagen_alt = $7,
        destacada = COALESCE($8, destacada),
        estado = COALESCE($9, estado),
        publicado_at = $10,
        vigente_hasta = $11
    WHERE id = $12
    RETURNING *;
  `;

  const values = [
    tipo, titulo, slug, resumen, contenido,
    imagen_path, imagen_alt, destacada, estado,
    publicado_at, vigente_hasta, id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const eliminar = async (id) => {
  const query = 'DELETE FROM public.noticias WHERE id = $1 RETURNING id;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  obtenerNoticias,
  obtenerPorSlug,
  crear,
  actualizar,
  eliminar
};