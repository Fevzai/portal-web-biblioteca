// src/services/informacionInstitucional.service.js
const { pool } = require('../config/db');

const obtener = async () => {
  const query = 'SELECT * FROM public.informacion_institucional WHERE id = 1;';
  const result = await pool.query(query);
  return result.rows[0];
};

const guardarOActualizar = async (datos) => {
  const {
    nombre_oficial,
    numero_coleccion,
    direccion,
    telefono,
    correo_institucional,
    correo_operativo,
    mision = null,
    vision = null,
    historia = null,
    url_catalogo_koha = null,
    latitud = null,
    longitud = null,
    updated_by = null
  } = datos;

  const query = `
    INSERT INTO public.informacion_institucional (
      id, nombre_oficial, numero_coleccion, direccion, telefono,
      correo_institucional, correo_operativo, mision, vision, historia,
      url_catalogo_koha, latitud, longitud, updated_by
    )
    VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    ON CONFLICT (id) DO UPDATE SET
      nombre_oficial = EXCLUDED.nombre_oficial,
      numero_coleccion = EXCLUDED.numero_coleccion,
      direccion = EXCLUDED.direccion,
      telefono = EXCLUDED.telefono,
      correo_institucional = EXCLUDED.correo_institucional,
      correo_operativo = EXCLUDED.correo_operativo,
      mision = EXCLUDED.mision,
      vision = EXCLUDED.vision,
      historia = EXCLUDED.historia,
      url_catalogo_koha = EXCLUDED.url_catalogo_koha,
      latitud = EXCLUDED.latitud,
      longitud = EXCLUDED.longitud,
      updated_by = EXCLUDED.updated_by
    RETURNING *;
  `;

  const values = [
    nombre_oficial, numero_coleccion, direccion, telefono,
    correo_institucional, correo_operativo, mision, vision, historia,
    url_catalogo_koha, latitud, longitud, updated_by
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

module.exports = {
  obtener,
  guardarOActualizar
};