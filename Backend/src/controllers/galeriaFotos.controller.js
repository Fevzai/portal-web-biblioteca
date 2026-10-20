// src/controllers/galeriaFotos.controller.js
const galeriaService = require('../services/galeriaFotos.service');

const getFotos = async (req, res) => {
  try {
    const { estado, evento_id, limite, pagina } = req.query;
    const fotos = await galeriaService.obtenerTodas({ estado, evento_id, limite, pagina });
    res.status(200).json(fotos);
  } catch (error) {
    console.error('Error al obtener fotos de la galería:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getFotoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const foto = await galeriaService.obtenerPorId(id);

    if (!foto) {
      return res.status(404).json({ mensaje: 'Fotografía no encontrada' });
    }

    res.status(200).json(foto);
  } catch (error) {
    console.error('Error al consultar fotografía:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createFoto = async (req, res) => {
  try {
    const nuevaFoto = await galeriaService.crear(req.body);
    res.status(201).json(nuevaFoto);
  } catch (error) {
    console.error('Error al registrar fotografía:', error.message);

    if (error.code === '23514' && error.constraint === 'foto_publicable') {
      return res.status(400).json({
        error: 'No se puede publicar una fotografía sin contar con la autorización de difusión (autorizacion_difusion).'
      });
    }

    res.status(500).json({ error: 'Error al subir la fotografía a la galería' });
  }
};

const updateFoto = async (req, res) => {
  try {
    const { id } = req.params;
    const fotoActualizada = await galeriaService.actualizar(id, req.body);

    if (!fotoActualizada) {
      return res.status(404).json({ mensaje: 'Fotografía no encontrada' });
    }

    res.status(200).json(fotoActualizada);
  } catch (error) {
    console.error('Error al actualizar fotografía:', error.message);

    if (error.code === '23514' && error.constraint === 'foto_publicable') {
      return res.status(400).json({
        error: 'No se puede cambiar el estado a publicado sin contar con la autorización de difusión.'
      });
    }

    res.status(500).json({ error: 'Error al actualizar la fotografía' });
  }
};

const deleteFoto = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminada = await galeriaService.eliminar(id);

    if (!eliminada) {
      return res.status(404).json({ mensaje: 'Fotografía no encontrada' });
    }

    res.status(200).json({ mensaje: 'Fotografía eliminada correctamente', id });
  } catch (error) {
    console.error('Error al eliminar fotografía:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getFotos,
  getFotoPorId,
  createFoto,
  updateFoto,
  deleteFoto
};