// src/controllers/kbDocumentos.controller.js
const kbDocumentosService = require('../services/kbDocumentos.service');

const getDocumentos = async (req, res) => {
  try {
    const { activo, limite, pagina } = req.query;
    const documentos = await kbDocumentosService.obtenerTodos({ activo, limite, pagina });
    res.status(200).json(documentos);
  } catch (error) {
    console.error('Error al consultar documentos de la Base de Conocimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getDocumentoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const documento = await kbDocumentosService.obtenerPorId(id);

    if (!documento) {
      return res.status(404).json({ mensaje: 'Documento no encontrado en la Base de Conocimiento' });
    }

    res.status(200).json(documento);
  } catch (error) {
    console.error('Error al consultar documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createDocumento = async (req, res) => {
  try {
    const nuevoDocumento = await kbDocumentosService.crear(req.body);
    res.status(201).json(nuevoDocumento);
  } catch (error) {
    console.error('Error al registrar documento:', error.message);

    if (error.code === '23503') { // foreign_key_violation (actualizado_por)
      return res.status(400).json({ error: 'El usuario asignado en actualizado_por no existe en perfiles.' });
    }

    res.status(500).json({ error: 'Error al registrar el documento en la Base de Conocimiento' });
  }
};

const updateDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const documentoActualizado = await kbDocumentosService.actualizar(id, req.body);

    if (!documentoActualizado) {
      return res.status(404).json({ mensaje: 'Documento no encontrado' });
    }

    res.status(200).json(documentoActualizado);
  } catch (error) {
    console.error('Error al actualizar documento:', error.message);
    res.status(500).json({ error: 'Error al actualizar el documento' });
  }
};

const deleteDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await kbDocumentosService.eliminar(id);

    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Documento no encontrado' });
    }

    res.status(200).json({ mensaje: 'Documento y sus fragmentos asociados eliminados correctamente', id });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getDocumentos,
  getDocumentoPorId,
  createDocumento,
  updateDocumento,
  deleteDocumento
};