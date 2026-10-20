// src/controllers/informacionInstitucional.controller.js
const infoService = require('../services/informacionInstitucional.service');

const getInformacion = async (req, res) => {
  try {
    const info = await infoService.obtener();

    if (!info) {
      return res.status(404).json({ mensaje: 'No se ha registrado la información institucional.' });
    }

    res.status(200).json(info);
  } catch (error) {
    console.error('Error al obtener la información institucional:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateInformacion = async (req, res) => {
  try {
    const infoActualizada = await infoService.guardarOActualizar(req.body);
    res.status(200).json(infoActualizada);
  } catch (error) {
    console.error('Error al actualizar la información institucional:', error.message);

    if (error.code === '23514') { // check_violation
      if (error.constraint === 'informacion_institucional_latitud_check') {
        return res.status(400).json({ error: 'La latitud debe estar entre -90 y 90.' });
      }
      if (error.constraint === 'informacion_institucional_longitud_check') {
        return res.status(400).json({ error: 'La longitud debe estar entre -180 y 180.' });
      }
      if (error.constraint === 'informacion_institucional_url_catalogo_koha_check') {
        return res.status(400).json({ error: 'La URL del catálogo Koha debe iniciar con http:// o https://.' });
      }
    }

    res.status(500).json({ error: 'Error al guardar la información institucional' });
  }
};

module.exports = {
  getInformacion,
  updateInformacion
};