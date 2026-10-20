// src/services/chatConsultas.service.js
const { pool } = require('../config/db');

const obtenerPorSesion = async (sesionId, limite = 20) => {
  const query = `
    SELECT id, sesion_id, pregunta, respuesta, fragmentos_usados, util, modelo, latencia_ms, created_at
    FROM public.chat_consultas
    WHERE sesion_id = $1
    ORDER BY created_at ASC
    LIMIT $2;
  `;
  const result = await pool.query(query, [sesionId, limite]);
  return result.rows;
};

const registrarConsulta = async (datos) => {
  const {
    sesion_id,
    pregunta,
    respuesta = null,
    fragmentos_usados = [],
    modelo = null,
    latencia_ms = null
  } = datos;

  const query = `
    INSERT INTO public.chat_consultas (
      sesion_id, pregunta, respuesta, fragmentos_usados, modelo, latencia_ms
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  const values = [sesion_id, pregunta, respuesta, fragmentos_usados, modelo, latencia_ms];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const calificarRespuesta = async (id, util) => {
  const query = `
    UPDATE public.chat_consultas
    SET util = $1
    WHERE id = $2
    RETURNING id, sesion_id, util, updated_at;
  `;
  const result = await pool.query(query, [util, id]);
  return result.rows[0];
};

const obtenerEstadisticas = async () => {
  const query = `
    SELECT 
      COUNT(*) AS total_consultas,
      AVG(latencia_ms)::integer AS latencia_promedio_ms,
      COUNT(CASE WHEN util = true THEN 1 END) AS respuestas_utiles,
      COUNT(CASE WHEN util = false THEN 1 END) AS respuestas_no_utiles
    FROM public.chat_consultas;
  `;
  const result = await pool.query(query);
  return result.rows[0];
};

module.exports = {
  obtenerPorSesion,
  registrarConsulta,
  calificarRespuesta,
  obtenerEstadisticas
};