// src/controllers/eventos.controller.js
const eventosService = require('../services/eventos.service');

const getEventos = async (req, res) => {
  try {
    const { estado, tipo, publico, area_id, buscar, limite, pagina } = req.query;
    const eventos = await eventosService.obtenerEventos({ estado, tipo, publico, area_id, buscar, limite, pagina });
    res.status(200).json(eventos);
  } catch (error) {
    console.error('Error al obtener eventos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getEventoPorSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const evento = await eventosService.obtenerPorSlug(slug);

    if (!evento) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }

    res.status(200).json(evento);
  } catch (error) {
    console.error('Error al consultar evento por slug:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createEvento = async (req, res) => {
  try {
    const nuevoEvento = await eventosService.crear(req.body);
    res.status(201).json(nuevoEvento);
  } catch (error) {
    console.error('Error al crear evento:', error.message);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'El slug ya existe. Debe ser único.' });
    }

    if (error.code === '23514') { // check_violation
      if (error.constraint === 'evento_un_lugar') {
        return res.status(400).json({ error: 'Un evento no puede definir un área interna (area_id) y un lugar externo simultáneamente.' });
      }
      if (error.constraint === 'evento_fechas') {
        return res.status(400).json({ error: 'La fecha de fin debe ser igual o posterior a la fecha de inicio.' });
      }
      if (error.constraint === 'eventos_cupo_check') {
        return res.status(400).json({ error: 'El cupo debe ser un valor entero mayor a 0.' });
      }
      if (error.constraint === 'evento_alt') {
        return res.status(400).json({ error: 'Si se incluye imagen_path, el texto alternativo (imagen_alt) es obligatorio.' });
      }
      if (error.constraint === 'eventos_slug_check') {
        return res.status(400).json({ error: 'El slug solo puede contener letras minúsculas, números y guiones.' });
      }
    }

    res.status(500).json({ error: 'Error al registrar el evento' });
  }
};

const updateEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const eventoActualizado = await eventosService.actualizar(id, req.body);

    if (!eventoActualizado) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }

    res.status(200).json(eventoActualizado);
  } catch (error) {
    console.error('Error al actualizar evento:', error.message);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'El slug ya existe.' });
    }

    if (error.code === '23514') {
      return res.status(400).json({ error: 'Violación de restricciones de validación (lugar único, fechas, cupo o texto alt).' });
    }

    res.status(500).json({ error: 'Error al actualizar el evento' });
  }
};

const deleteEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await eventosService.eliminar(id);

    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Evento no encontrado' });
    }

    res.status(200).json({ mensaje: 'Evento eliminado correctamente', id });
  } catch (error) {
    console.error('Error al eliminar evento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getEventos,
  getEventoPorSlug,
  createEvento,
  updateEvento,
  deleteEvento
};