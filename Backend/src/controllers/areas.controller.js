// src/controllers/areas.controller.js
const areasService = require('../services/areas.service');

const getAreas = async (req, res) => {
  try {
    const { activa, es_inclusiva, limite, pagina } = req.query;
    const areas = await areasService.obtenerTodas({ activa, es_inclusiva, limite, pagina });
    res.status(200).json(areas);
  } catch (error) {
    console.error('Error al obtener áreas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getAreaPorSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const area = await areasService.obtenerPorSlug(slug);

    if (!area) {
      return res.status(404).json({ mensaje: 'Área no encontrada' });
    }

    res.status(200).json(area);
  } catch (error) {
    console.error('Error al consultar área por slug:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createArea = async (req, res) => {
  try {
    const nuevaArea = await areasService.crear(req.body);
    res.status(201).json(nuevaArea);
  } catch (error) {
    console.error('Error al crear área:', error.message);

    if (error.code === '23505') {
      if (error.constraint === 'areas_nombre_key') {
        return res.status(409).json({ error: 'Ya existe un área con este nombre.' });
      }
      if (error.constraint === 'areas_slug_key') {
        return res.status(409).json({ error: 'Ya existe un área con este slug.' });
      }
    }

    if (error.code === '23514') {
      if (error.constraint === 'area_alt_obligatorio') {
        return res.status(400).json({ error: 'Si se asigna una imagen (imagen_path), el texto alternativo (imagen_alt) es obligatorio.' });
      }
      if (error.constraint === 'areas_slug_check') {
        return res.status(400).json({ error: 'El slug solo puede contener letras minúsculas, números y guiones.' });
      }
    }

    res.status(500).json({ error: 'Error al registrar el área' });
  }
};

const updateArea = async (req, res) => {
  try {
    const { id } = req.params;
    const areaActualizada = await areasService.actualizar(id, req.body);

    if (!areaActualizada) {
      return res.status(404).json({ mensaje: 'Área no encontrada' });
    }

    res.status(200).json(areaActualizada);
  } catch (error) {
    console.error('Error al actualizar área:', error.message);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'El nombre o el slug ya se encuentran en uso por otra área.' });
    }

    if (error.code === '23514') {
      return res.status(400).json({ error: 'Violación de restricciones de validación (texto alternativo obligatorio o formato de slug).' });
    }

    res.status(500).json({ error: 'Error al actualizar el área' });
  }
};

const deleteArea = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminada = await areasService.eliminar(id);

    if (!eliminada) {
      return res.status(404).json({ mensaje: 'Área no encontrada' });
    }

    res.status(200).json({ mensaje: 'Área eliminada correctamente', id });
  } catch (error) {
    console.error('Error al eliminar área:', error.message);

    if (error.code === '23503') { // foreign_key_violation
      return res.status(409).json({
        error: 'No se puede eliminar esta área porque existen eventos, sugerencias o fotografías asociadas a ella.'
      });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAreas,
  getAreaPorSlug,
  createArea,
  updateArea,
  deleteArea
};