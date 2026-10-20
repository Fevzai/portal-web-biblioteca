// src/services/perfiles.service.js
const { pool } = require('../config/db');

const obtenerTodos = async ({ rol, activo, limite = 10, pagina = 1 }) => {
  const offset = (pagina - 1) * limite;
  const condiciones = [];
  const valores = [];

  if (rol) {
    valores.push(rol);
    condiciones.push(`rol = $${valores.length}`);
  }

  if (activo !== undefined) {
    valores.push(activo === 'true');
    condiciones.push(`activo = $${valores.length}`);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const query = `
    SELECT id, nombre_completo, rol, activo, created_at, updated_at
    FROM public.perfiles
    ${whereClause}
    ORDER BY nombre_completo ASC
    LIMIT $${valores.length + 1} OFFSET $${valores.length + 2};
  `;

  const result = await pool.query(query, [...valores, limite, offset]);
  return result.rows;
};

const obtenerPorId = async (id) => {
  const query = 'SELECT * FROM public.perfiles WHERE id = $1;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const crear = async ({ id, nombre_completo, rol = 'bibliotecario', activo = false }) => {
  const query = `
    INSERT INTO public.perfiles (id, nombre_completo, rol, activo)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [id, nombre_completo, rol, activo];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const actualizar = async (id, { nombre_completo, rol, activo }) => {
  const query = `
    UPDATE public.perfiles
    SET nombre_completo = COALESCE($1, nombre_completo),
        rol = COALESCE($2, rol),
        activo = COALESCE($3, activo)
    WHERE id = $4
    RETURNING *;
  `;
  const values = [nombre_completo, rol, activo, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const eliminar = async (id) => {
  const query = 'DELETE FROM public.perfiles WHERE id = $1 RETURNING id;';
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