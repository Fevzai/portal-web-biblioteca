// src/services/kbDocumentos.service.js
const { pool } = require('../config/db');

const obtenerTodos = async ({ activo, limite = 10, pagina = 1 }) => {
  const offset = (pagina - 1) * limite;
  const condiciones = [];
  const valores = [];

  if (activo !== undefined) {
    valores.push(activo === 'true');
    condiciones.push(`activo = $${valores.length}`);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const query = `
    SELECT id, titulo, contenido, fuente, activo, actualizado_por, created_at, updated_at
    FROM public.kb_documentos
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${valores.length + 1} OFFSET $${valores.length + 2};
  `;

  const result = await pool.query(query, [...valores, limite, offset]);
  return result.rows;
};

const obtenerPorId = async (id) => {
  const query = 'SELECT * FROM public.kb_documentos WHERE id = $1;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const crear = async (datos) => {
  const {
    titulo,
    contenido,
    fuente = null,
    activo = true,
    actualizado_por = null
  } = datos;

  const query = `
    INSERT INTO public.kb_documentos (titulo, contenido, fuente, activo, actualizado_por)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [titulo, contenido, fuente, activo, actualizado_por];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const actualizar = async (id, datos) => {
  const {
    titulo,
    contenido,
    fuente,
    activo,
    actualizado_por = null
  } = datos;

  const query = `
    UPDATE public.kb_documentos
    SET titulo = COALESCE($1, titulo),
        contenido = COALESCE($2, contenido),
        fuente = COALESCE($3, fuente),
        activo = COALESCE($4, activo),
        actualizado_por = COALESCE($5, actualizado_por)
    WHERE id = $6
    RETURNING *;
  `;

  const values = [titulo, contenido, fuente, activo, actualizado_por, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const eliminar = async (id) => {
  const query = 'DELETE FROM public.kb_documentos WHERE id = $1 RETURNING id;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};