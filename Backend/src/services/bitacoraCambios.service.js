// src/services/bitacoraCambios.service.js
const { pool } = require('../config/db');

const obtenerHistorial = async ({ tabla, registro_id, usuario_id, accion, limite = 20, pagina = 1 }) => {
  const offset = (pagina - 1) * limite;
  const condiciones = [];
  const valores = [];

  if (tabla) {
    valores.push(tabla);
    condiciones.push(`tabla = $${valores.length}`);
  }

  if (registro_id) {
    valores.push(registro_id);
    condiciones.push(`registro_id = $${valores.length}`);
  }

  if (usuario_id) {
    valores.push(usuario_id);
    condiciones.push(`usuario_id = $${valores.length}`);
  }

  if (accion) {
    valores.push(accion);
    condiciones.push(`accion = $${valores.length}`);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const query = `
    SELECT id, tabla, registro_id, accion, usuario_id, datos_anteriores, datos_nuevos, created_at
    FROM public.bitacora_cambios
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${valores.length + 1} OFFSET $${valores.length + 2};
  `;

  const result = await pool.query(query, [...valores, limite, offset]);
  return result.rows;
};

const obtenerPorId = async (id) => {
  const query = 'SELECT * FROM public.bitacora_cambios WHERE id = $1;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  obtenerHistorial,
  obtenerPorId
};