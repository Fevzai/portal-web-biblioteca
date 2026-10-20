// src/controllers/participaciones.controller.js
const participacionesService = require('../services/participaciones.service');

const getParticipaciones = async (req, res) => {
  try {
    const { tipo, estado, limite, pagina } = req.query;
    const lista = await participacionesService.obtenerParticipaciones({ tipo, estado, limite, pagina });
    res.status(200).json(lista);
  } catch (error) {
    console.error('Error al obtener participaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getParticipacionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const participacion = await participacionesService.obtenerPorId(id);

    if (!participacion) {
      return res.status(404).json({ mensaje: 'Participación no encontrada' });
    }

    res.status(200).json(participacion);
  } catch (error) {
    console.error('Error al obtener participación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createParticipacion = async (req, res) => {
  try {
    const nueva = await participacionesService.crear(req.body);
    res.status(201).json(nueva);
  } catch (error) {
    console.error('Error al enviar participación:', error.message);

    if (error.code === '23514') { // check_violation
      if (error.constraint === 'participaciones_mensaje_check') {
        return res.status(400).json({ error: 'El mensaje debe tener entre 5 y 1000 caracteres.' });
      }
      if (error.constraint === 'participaciones_correo_contacto_check') {
        return res.status(400).json({ error: 'El correo electrónico no tiene un formato válido.' });
      }
      if (error.constraint === 'comentario_con_nombre') {
        return res.status(400).json({ error: 'Los comentarios deben incluir el nombre del visitante.' });
      }
      if (error.constraint === 'calificacion_solo_comentario') {
        return res.status(400).json({ error: 'La calificación solo se permite en participaciones de tipo comentario.' });
      }
      if (error.constraint === 'participaciones_calificacion_check') {
        return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5 estrellas.' });
      }
    }

    res.status(500).json({ error: 'Error al enviar la participación' });
  }
};

const atenderParticipacion = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizada = await participacionesService.atenderOResponder(id, req.body);

    if (!actualizada) {
      return res.status(404).json({ mensaje: 'Participación no encontrada' });
    }

    res.status(200).json(actualizada);
  } catch (error) {
    console.error('Error al atender participación:', error.message);

    if (error.code === '23514') { // check_violation
      if (error.constraint === 'respuesta_solo_pregunta') {
        return res.status(400).json({ error: 'Solo se pueden agregar respuestas a participaciones de tipo pregunta.' });
      }
      if (error.constraint === 'pregunta_publicada_respondida') {
        return res.status(400).json({ error: 'No se puede publicar una pregunta si aún no tiene respuesta.' });
      }
      if (error.constraint === 'archivado_con_nota') {
        return res.status(400).json({ error: 'Para archivar una participación es obligatorio incluir una nota interna.' });
      }
    }

    res.status(500).json({ error: 'Error al actualizar la participación' });
  }
};

const deleteParticipacion = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminada = await participacionesService.eliminar(id);

    if (!eliminada) {
      return res.status(404).json({ mensaje: 'Participación no encontrada' });
    }

    res.status(200).json({ mensaje: 'Participación eliminada correctamente', id });
  } catch (error) {
    console.error('Error al eliminar participación:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getParticipaciones,
  getParticipacionPorId,
  createParticipacion,
  atenderParticipacion,
  deleteParticipacion
};