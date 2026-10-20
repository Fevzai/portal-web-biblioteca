// src/controllers/kbFragmentos.controller.js
const kbFragmentosService = require('../services/kbFragmentos.service');

const getFragmentosPorDocumento = async (req, res) => {
  try {
    const { documentoId } = req.params;
    const fragmentos = await kbFragmentosService.obtenerPorDocumento(documentoId);
    res.status(200).json(fragmentos);
  } catch (error) {
    console.error('Error al consultar fragmentos del documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const buscarSemantica = async (req, res) => {
  try {
    const { embedding, limite = 5 } = req.body;

    if (!Array.isArray(embedding) || embedding.length === 0) {
      return res.status(400).json({ error: 'Se requiere un vector de embedding valido (arreglo numerico).' });
    }

    const resultados = await kbFragmentosService.buscarSimilares(embedding, limite);
    res.status(200).json(resultados);
  } catch (error) {
    console.error('Error en busqueda semantica de fragmentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createFragmento = async (req, res) => {
  try {
    const { embedding } = req.body;
    
    if (!Array.isArray(embedding) || embedding.length === 0) {
      return res.status(400).json({ error: 'El campo embedding debe ser un arreglo de numeros float.' });
    }

    const nuevoFragmento = await kbFragmentosService.crear(req.body);
    res.status(201).json(nuevoFragmento);
  } catch (error) {
    console.error('Error al registrar fragmento:', error.message);

    if (error.code === '23503') { // foreign_key_violation
      return res.status(400).json({ error: 'El documento_id proporcionado no existe en kb_documentos.' });
    }

    if (error.code === '23505') { // unique_violation
      return res.status(409).json({ error: 'Ya existe un fragmento con ese numero de orden para el mismo documento.' });
    }

    if (error.code === '23514') { // check_violation
      if (error.constraint === 'kb_fragmentos_orden_check') {
        return res.status(400).json({ error: 'El campo orden debe ser mayor o igual a 0.' });
      }
      if (error.constraint === 'kb_fragmentos_tokens_check') {
        return res.status(400).json({ error: 'El campo tokens debe ser un numero mayor a 0.' });
      }
    }

    res.status(500).json({ error: 'Error al registrar el fragmento en la Base de Conocimiento' });
  }
};

const deleteFragmentosPorDocumento = async (req, res) => {
  try {
    const { documentoId } = req.params;
    await kbFragmentosService.eliminarPorDocumento(documentoId);
    res.status(200).json({ mensaje: `Fragmentos del documento ${documentoId} eliminados correctamente` });
  } catch (error) {
    console.error('Error al eliminar fragmentos del documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteFragmento = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await kbFragmentosService.eliminar(id);

    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Fragmento no encontrado' });
    }

    res.status(200).json({ mensaje: 'Fragmento eliminado correctamente', id });
  } catch (error) {
    console.error('Error al eliminar fragmento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getFragmentosPorDocumento,
  buscarSemantica,
  createFragmento,
  deleteFragmentosPorDocumento,
  deleteFragmento
};