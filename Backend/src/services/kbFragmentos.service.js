// src/services/kbFragmentos.service.js
const { pool } = require('../config/db');

const obtenerPorDocumento = async (documentoId) => {
  const query = `
    SELECT id, documento_id, orden, contenido, tokens, created_at
    FROM public.kb_fragmentos
    WHERE documento_id = $1
    ORDER BY orden ASC;
  `;
  const result = await pool.query(query, [documentoId]);
  return result.rows;
};

const buscarSimilares = async (embeddingVector, limite = 5) => {
  // Convierte el array JS a formato de vector PG: '[0.123, 0.456, ...]'
  const vectorStr = JSON.stringify(embeddingVector);
  
  const query = `
    SELECT id, documento_id, orden, contenido, tokens,
           (embedding <=> $1::extensions.vector) AS distancia
    FROM public.kb_fragmentos
    ORDER BY embedding <=> $1::extensions.vector ASC
    LIMIT $2;
  `;
  const result = await pool.query(query, [vectorStr, limite]);
  return result.rows;
};

const crear = async ({ documento_id, orden, contenido, tokens = null, embedding }) => {
  const vectorStr = JSON.stringify(embedding);

  const query = `
    INSERT INTO public.kb_fragmentos (documento_id, orden, contenido, tokens, embedding)
    VALUES ($1, $2, $3, $4, $5::extensions.vector)
    RETURNING id, documento_id, orden, contenido, tokens, created_at;
  `;

  const values = [documento_id, orden, contenido, tokens, vectorStr];
  const result = await pool.query(query, values);
  return result.rows[0];
};

const eliminarPorDocumento = async (documentoId) => {
  const query = 'DELETE FROM public.kb_fragmentos WHERE documento_id = $1 RETURNING documento_id;';
  const result = await pool.query(query, [documentoId]);
  return result.rows;
};

const eliminar = async (id) => {
  const query = 'DELETE FROM public.kb_fragmentos WHERE id = $1 RETURNING id;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  obtenerPorDocumento,
  buscarSimilares,
  crear,
  eliminarPorDocumento,
  eliminar
};