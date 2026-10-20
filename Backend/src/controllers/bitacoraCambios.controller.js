// src/controllers/bitacoraCambios.controller.js
const bitacoraService = require('../services/bitacoraCambios.service');

const getBitacora = async (req, res) => {
  try {
    const { tabla, registro_id, usuario_id, accion, limite, pagina } = req.query;
    const historial = await bitacoraService.obtenerHistorial({
      tabla,
      registro_id,
      usuario_id,
      accion,
      limite,
      pagina
    });

    res.status(200).json(historial);
  } catch (error) {
    console.error('Napasamak ti babbaket/error iti panagkita ti bitácora:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getBitacoraPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const registro = await bitacoraService.obtenerPorId(id);

    if (!registro) {
      return res.status(404).json({ mensaje: 'Saan a nasarakan ti registro iti bitácora' });
    }

    res.status(200).json(registro);
  } catch (error) {
    console.error('Error iti panagkita ti registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getBitacora,
  getBitacoraPorId
};