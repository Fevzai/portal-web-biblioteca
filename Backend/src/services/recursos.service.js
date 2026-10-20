// src/services/recursos.service.js
const { pool } = require('../config/db');

const obtenerRecursos = async ({ estado, tipo, limite = 10, pagina = 1 }) => {
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

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const query = `
    SELECT id, titulo, descripcion, tipo, archivo_path, tamano_bytes, descargas, estado, publicado_at, created_at
    FROM public.recursos
    ${whereClause}
    ORDER BY publicado_at DESC NULLS LAST, created_at DESC
    LIMIT $${valores.length + 1} OFFSET $${valores.length + 2};
  `;

  const result = await pool.query(query, [...valores, limite, offset]);
  return result.rows;
};

const obtenerPorId = async (id) => {
  const query = 'SELECT * FROM public.recursos WHERE id = $1;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const crear = async (datos) => {
  const {
    titulo,
    descripcion = null,
    tipo = 'pdf',
    archivo_path,
    tamano_bytes,
    estado = 'borrador',
    publicado_at = null,
    subido_por = null
  } = datos;

  const query = `
    INSERT INTO public.recursos (
      titulo, descripcion, tipo, archivo_path, tamano_bytes, estado, publicado_at, subido_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    titulo, descripcion, tipo, archivo_path, tamano_bytes, estado, publicado_at, subido_por
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const actualizar = async (id, datos) => {
  const {
    titulo, descripcion, tipo, archivo_path, tamano_bytes, estado, publicado_at
  } = datos;

  const query = `
    UPDATE public.recursos
    SET titulo = COALESCE($1, titulo),
        descripcion = COALESCE($2, descripcion),
        tipo = COALESCE($3, tipo),
        archivo_path = COALESCE($4, archivo_path),
        tamano_bytes = COALESCE($5, tamano_bytes),
        estado = COALESCE($6, estado),
        publicado_at = $7
    WHERE id = $8
    RETURNING *;
  `;

  const values = [titulo, descripcion, tipo, archivo_path, tamano_bytes, estado, publicado_at, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const incrementarDescargas = async (id) => {
  const query = `
    UPDATE public.recursos
    SET descargas = descargas + 1
    WHERE id = $1
    RETURNING id, descargas, archivo_path;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const eliminar = async (id) => {
  const query = 'DELETE FROM public.recursos WHERE id = $1 RETURNING id;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  obtenerRecursos,
  obtenerPorId,
  crear,
  actualizar,
  incrementarDescargas,
  eliminar
};