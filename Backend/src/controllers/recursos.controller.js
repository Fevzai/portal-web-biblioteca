// src/controllers/recursos.controller.js
const recursosService = require('../services/recursos.service');

const getRecursos = async (req, res) => {
  try {
    const { estado, tipo, limite, pagina } = req.query;
    const recursos = await recursosService.obtenerRecursos({ estado, tipo, limite, pagina });
    res.status(200).json(recursos);
  } catch (error) {
    console.error('Error al listar recursos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getRecursoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const recurso = await recursosService.obtenerPorId(id);

    if (!recurso) {
      return res.status(404).json({ mensaje: 'Recurso no encontrado' });
    }

    res.status(200).json(recurso);
  } catch (error) {
    console.error('Error al obtener recurso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createRecurso = async (req, res) => {
  try {
    const nuevoRecurso = await recursosService.crear(req.body);
    res.status(201).json(nuevoRecurso);
  } catch (error) {
    console.error('Error al crear recurso:', error.message);

    if (error.code === '23514') { // check_violation
      if (error.constraint === 'recursos_tamano_bytes_check') {
        return res.status(400).json({ error: 'El tamaño del archivo debe ser mayor a 0 bytes y no superar los 10 MB (10,485,760 bytes).' });
      }
      if (error.constraint === 'recursos_descargas_check') {
        return res.status(400).json({ error: 'El número de descargas no puede ser negativo.' });
      }
    }

    res.status(500).json({ error: 'Error al registrar el recurso' });
  }
};

const updateRecurso = async (req, res) => {
  try {
    const { id } = req.params;
    const recursoActualizado = await recursosService.actualizar(id, req.body);

    if (!recursoActualizado) {
      return res.status(404).json({ mensaje: 'Recurso no encontrado' });
    }

    res.status(200).json(recursoActualizado);
  } catch (error) {
    console.error('Error al actualizar recurso:', error.message);

    if (error.code === '23514') {
      return res.status(400).json({ error: 'Violación de restricciones de validación (tamaño o descargas).' });
    }

    res.status(500).json({ error: 'Error al actualizar el recurso' });
  }
};

const descargarRecurso = async (req, res) => {
  try {
    const { id } = req.params;
    const recursoActualizado = await recursosService.incrementarDescargas(id);

    if (!recursoActualizado) {
      return res.status(404).json({ mensaje: 'Recurso no encontrado' });
    }

    res.status(200).json({
      mensaje: 'Descarga registrada',
      descargas: recursoActualizado.descargas,
      archivo_path: recursoActualizado.archivo_path
    });
  } catch (error) {
    console.error('Error al incrementar descargas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteRecurso = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await recursosService.eliminar(id);

    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Recurso no encontrado' });
    }

    res.status(200).json({ mensaje: 'Recurso eliminado correctamente', id });
  } catch (error) {
    console.error('Error al eliminar recurso:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getRecursos,
  getRecursoPorId,
  createRecurso,
  updateRecurso,
  descargarRecurso,
  deleteRecurso
};