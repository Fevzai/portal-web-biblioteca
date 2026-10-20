// src/services/galeriaFotos.service.js
const { pool } = require('../config/db');

const obtenerTodas = async ({ estado, evento_id, limite = 10, pagina = 1 }) => {
  const offset = (pagina - 1) * limite;
  const condiciones = [];
  const valores = [];

  if (estado) {
    valores.push(estado);
    condiciones.push(`estado = $${valores.length}`);
  }

  if (evento_id) {
    valores.push(evento_id);
    condiciones.push(`evento_id = $${valores.length}`);
  }

  const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const query = `
    SELECT id, evento_id, titulo, descripcion, archivo_path, texto_alternativo,
           fecha_toma, aparecen_menores, autorizacion_difusion, estado,
           publicado_at, subido_por, created_at, updated_at
    FROM public.galeria_fotos
    ${whereClause}
    ORDER BY fecha_toma DESC NULLS LAST, created_at DESC
    LIMIT $${valores.length + 1} OFFSET $${valores.length + 2};
  `;

  const result = await pool.query(query, [...valores, limite, offset]);
  return result.rows;
};

const obtenerPorId = async (id) => {
  const query = 'SELECT * FROM public.galeria_fotos WHERE id = $1;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

const crear = async (datos) => {
  const {
    evento_id = null,
    titulo,
    descripcion = null,
    archivo_path,
    texto_alternativo,
    fecha_toma = null,
    aparecen_menores = false,
    autorizacion_difusion = false,
    estado = 'borrador',
    publicado_at = null,
    subido_por = null
  } = datos;

  const query = `
    INSERT INTO public.galeria_fotos (
      evento_id, titulo, descripcion, archivo_path, texto_alternativo,
      fecha_toma, aparecen_menores, autorizacion_difusion, estado,
      publicado_at, subido_por
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `;

  const values = [
    evento_id, titulo, descripcion, archivo_path, texto_alternativo,
    fecha_toma, aparecen_menores, autorizacion_difusion, estado,
    publicado_at, subido_por
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const actualizar = async (id, datos) => {
  const {
    evento_id,
    titulo,
    descripcion,
    archivo_path,
    texto_alternativo,
    fecha_toma,
    aparecen_menores,
    autorizacion_difusion,
    estado,
    publicado_at
  } = datos;

  const query = `
    UPDATE public.galeria_fotos
    SET evento_id = COALESCE($1, evento_id),
        titulo = COALESCE($2, titulo),
        descripcion = COALESCE($3, descripcion),
        archivo_path = COALESCE($4, archivo_path),
        texto_alternativo = COALESCE($5, texto_alternativo),
        fecha_toma = COALESCE($6, fecha_toma),
        aparecen_menores = COALESCE($7, aparecen_menores),
        autorizacion_difusion = COALESCE($8, autorizacion_difusion),
        estado = COALESCE($9, estado),
        publicado_at = $10
    WHERE id = $11
    RETURNING *;
  `;

  const values = [
    evento_id, titulo, descripcion, archivo_path, texto_alternativo,
    fecha_toma, aparecen_menores, autorizacion_difusion, estado,
    publicado_at, id
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const eliminar = async (id) => {
  const query = 'DELETE FROM public.galeria_fotos WHERE id = $1 RETURNING id;';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  obtenerTodas,
  obtenerPorId,
  crear,
  actualizar,
  eliminar
};