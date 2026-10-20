// src/services/sugerencias.service.js
const { pool } = require('../config/db');

const obtenerTodas = async ({ estado, tipo, categoria, area_id, limite = 10, pagina = 1 }) => {
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

  if (categoria) {
    valores.push(categoria);
    condiciones.push(`categoria = $${valores.length}`);
  }

  if (area_id) {
    valores.push(area_id);
    condiciones.push(`area_id = $${valores.length}`);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const query = `
    SELECT id, tipo, categoria, area_id, descripcion, propuesta_mejora, correo_contacto, 
           estado, nota_interna, atendida_por, resuelta_at, created_at, updated_at
    FROM public.sugerencias
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${valores.length + 1} OFFSET $${valores.length + 2};
  `;

  const result = await pool.query(query, [...valores, limite, offset]);
  return result.rows;
};

const obtenerPorId = async (id) => {
  const query = 'SELECT * FROM public.sugerencias WHERE id = $1;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const crear = async (datos) => {
  const {
    tipo,
    categoria,
    area_id = null,
    descripcion,
    propuesta_mejora = null,
    correo_contacto = null
  } = datos;

  const query = `
    INSERT INTO public.sugerencias (
      tipo, categoria, area_id, descripcion, propuesta_mejora, correo_contacto
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [tipo, categoria, area_id, descripcion, propuesta_mejora, correo_contacto];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const atenderOResolver = async (id, datos) => {
  const {
    estado,
    nota_interna = null,
    atendida_por = null
  } = datos;

  const query = `
    UPDATE public.sugerencias
    SET estado = COALESCE($1, estado),
        nota_interna = COALESCE($2, nota_interna),
        atendida_por = COALESCE($3, atendida_por)
    WHERE id = $4
    RETURNING *;
  `;

  const values = [estado, nota_interna, atendida_por, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const eliminar = async (id) => {
  const query = 'DELETE FROM public.sugerencias WHERE id = $1 RETURNING id;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
  atenderOResolver,
  eliminar
};