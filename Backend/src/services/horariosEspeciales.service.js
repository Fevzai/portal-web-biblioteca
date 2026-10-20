// src/services/horariosEspeciales.service.js
const { pool } = require('../config/db');

const obtenerTodos = async () => {
  const query = 'SELECT * FROM public.horarios_especiales ORDER BY fecha ASC';
  const result = await pool.query(query);
  return result.rows;
};

const obtenerPorFecha = async (fecha) => {
  const query = 'SELECT * FROM public.horarios_especiales WHERE fecha = $1';
  const result = await pool.query(query, [fecha]);
  return result.rows[0];
};

const crear = async ({ fecha, cerrado = true, abre = null, cierra = null, motivo, created_by = null }) => {
  const query = `
    INSERT INTO public.horarios_especiales (fecha, cerrado, abre, cierra, motivo, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [fecha, cerrado, abre, cierra, motivo, created_by];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const eliminar = async (fecha) => {
  const query = 'DELETE FROM public.horarios_especiales WHERE fecha = $1 RETURNING *';
  const result = await pool.query(query, [fecha]);
  return result.rows[0];
};

module.exports = {
  obtenerTodos,
  obtenerPorFecha,
  crear,
  eliminar
};