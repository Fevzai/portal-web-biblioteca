// src/services/horarios.service.js
const { pool } = require('../config/db');

const obtenerTodos = async () => {
  const query = 'SELECT * FROM public.horarios ORDER BY dia_semana ASC;';
  const result = await pool.query(query);
  return result.rows;
};

const obtenerPorDia = async (diaSemana) => {
  const query = 'SELECT * FROM public.horarios WHERE dia_semana = $1;';
  const result = await pool.query(query, [diaSemana]);
  return result.rows[0];
};

const guardarOActualizar = async ({ dia_semana, cerrado = false, abre = null, cierra = null, nota = null }) => {
  const query = `
    INSERT INTO public.horarios (dia_semana, cerrado, abre, cierra, nota)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (dia_semana) DO UPDATE SET
      cerrado = EXCLUDED.cerrado,
      abre = EXCLUDED.abre,
      cierra = EXCLUDED.cierra,
      nota = EXCLUDED.nota
    RETURNING *;
  `;
  const values = [dia_semana, cerrado, abre, cierra, nota];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const eliminar = async (diaSemana) => {
  const query = 'DELETE FROM public.horarios WHERE dia_semana = $1 RETURNING dia_semana;';
  const result = await pool.query(query, [diaSemana]);
  return result.rows[0];
};

module.exports = {
  obtenerTodos,
  obtenerPorDia,
  guardarOActualizar,
  eliminar
};