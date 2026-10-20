// src/controllers/chatConsultas.controller.js
const chatService = require('../services/chatConsultas.service');

const getHistorialSesion = async (req, res) => {
  try {
    const { sesionId } = req.params;
    const { limite } = req.query;
    const historial = await chatService.obtenerPorSesion(sesionId, limite);
    res.status(200).json(historial);
  } catch (error) {
    console.error('Error al obtener historial del chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createConsulta = async (req, res) => {
  try {
    const nuevaConsulta = await chatService.registrarConsulta(req.body);
    res.status(201).json(nuevaConsulta);
  } catch (error) {
    console.error('Error al registrar consulta de chat:', error.message);

    if (error.code === '23514') { // check_violation
      if (error.constraint === 'chat_consultas_pregunta_check') {
        return res.status(400).json({ error: 'La pregunta no puede exceder los 1000 caracteres.' });
      }
      if (error.constraint === 'chat_consultas_latencia_ms_check') {
        return res.status(400).json({ error: 'La latencia (latencia_ms) debe ser un numero mayor o igual a 0.' });
      }
    }

    res.status(500).json({ error: 'Error al registrar la consulta del chat' });
  }
};

const rateConsulta = async (req, res) => {
  try {
    const { id } = req.params;
    const { util } = req.body;

    if (typeof util !== 'boolean') {
      return res.status(400).json({ error: 'El campo util debe ser un valor booleano (true o false).' });
    }

    const consultaActualizada = await chatService.calificarRespuesta(id, util);

    if (!consultaActualizada) {
      return res.status(404).json({ mensaje: 'Consulta no encontrada' });
    }

    res.status(200).json(consultaActualizada);
  } catch (error) {
    console.error('Error al calificar respuesta del chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMetricas = async (req, res) => {
  try {
    const metricas = await chatService.obtenerEstadisticas();
    res.status(200).json(metricas);
  } catch (error) {
    console.error('Error al obtener metricas del chat:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getHistorialSesion,
  createConsulta,
  rateConsulta,
  getMetricas
};