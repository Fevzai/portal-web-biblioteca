// src/services/participaciones.service.js
const { pool } = require('../config/db');

const obtenerParticipaciones = async ({ tipo, estado, limite = 10, pagina = 1 }) => {
  const offset = (pagina - 1) * limite;
  const condiciones = [];
  const valores = [];

  if (tipo) {
    valores.push(tipo);
    condiciones.push(`tipo = $${valores.length}`);
  }

  if (estado) {
    valores.push(estado);
    condiciones.push(`estado = $${valores.length}`);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const query = `
    SELECT id, tipo, nombre_visitante, correo_contacto, mensaje, calificacion, respuesta, estado, nota_interna, atendida_por, atendida_at, created_at, updated_at
    FROM public.participaciones
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${valores.length + 1} OFFSET $${valores.length + 2};
  `;

  const result = await pool.query(query, [...valores, limite, offset]);
  return result.rows;
};

const obtenerPorId = async (id) => {
  const query = 'SELECT * FROM public.participaciones WHERE id = $1;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const crear = async (datos) => {
  const {
    tipo,
    nombre_visitante = null,
    correo_contacto = null,
    mensaje,
    calificacion = null
  } = datos;

  const query = `
    INSERT INTO public.participaciones (
      tipo, nombre_visitante, correo_contacto, mensaje, calificacion
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [tipo, nombre_visitante, correo_contacto, mensaje, calificacion];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const atenderOResponder = async (id, datos) => {
  const {
    respuesta = null,
    estado,
    nota_interna = null,
    atendida_por = null
  } = datos;

  const query = `
    UPDATE public.participaciones
    SET respuesta = COALESCE($1, respuesta),
        estado = COALESCE($2, estado),
        nota_interna = COALESCE($3, nota_interna),
        atendida_por = COALESCE($4, atendida_por)
    WHERE id = $5
    RETURNING *;
  `;

  const values = [respuesta, estado, nota_interna, atendida_por, id];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const eliminar = async (id) => {
  const query = 'DELETE FROM public.participaciones WHERE id = $1 RETURNING id;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  obtenerParticipaciones,
  obtenerPorId,
  crear,
  atenderOResponder,
  eliminar
};