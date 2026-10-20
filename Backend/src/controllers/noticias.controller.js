// src/controllers/noticias.controller.js
const noticiasService = require('../services/noticias.service');

const getNoticias = async (req, res) => {
  try {
    const { estado, limite, pagina, buscar } = req.query;
    const noticias = await noticiasService.obtenerNoticias({ estado, limite, pagina, buscar });
    res.status(200).json(noticias);
  } catch (error) {
    console.error('Error al listar noticias:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getNoticiaPorSlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const noticia = await noticiasService.obtenerPorSlug(slug);

    if (!noticia) {
      return res.status(404).json({ mensaje: 'Noticia no encontrada' });
    }

    res.status(200).json(noticia);
  } catch (error) {
    console.error('Error al obtener noticia por slug:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createNoticia = async (req, res) => {
  try {
    const nuevaNoticia = await noticiasService.crear(req.body);
    res.status(201).json(nuevaNoticia);
  } catch (error) {
    console.error('Error al crear noticia:', error.message);

    // Captura de violaciones de restricciones PostgreSQL
    if (error.code === '23505') {
      return res.status(409).json({ error: 'El slug ya existe. Debe ser único.' });
    }
    if (error.code === '23514') {
      if (error.constraint === 'noticia_alt_obligatorio') {
        return res.status(400).json({ error: 'Si incluyes imagen_path, el campo imagen_alt es obligatorio.' });
      }
      if (error.constraint === 'noticias_slug_check') {
        return res.status(400).json({ error: 'El slug solo puede contener letras minúsculas, números y guiones (ej. "mi-noticia-1").' });
      }
      if (error.constraint === 'noticia_vigencia') {
        return res.status(400).json({ error: 'La fecha vigente_hasta debe ser posterior a publicado_at.' });
      }
    }

    res.status(500).json({ error: 'Error al registrar la noticia' });
  }
};

const updateNoticia = async (req, res) => {
  try {
    const { id } = req.params;
    const noticiaActualizada = await noticiasService.actualizar(id, req.body);

    if (!noticiaActualizada) {
      return res.status(404).json({ mensaje: 'Noticia no encontrada' });
    }

    res.status(200).json(noticiaActualizada);
  } catch (error) {
    console.error('Error al actualizar noticia:', error.message);

    if (error.code === '23505') {
      return res.status(409).json({ error: 'El slug ya existe.' });
    }
    if (error.code === '23514') {
      return res.status(400).json({ error: 'Violación de restricciones de validación (imagen, slug o vigencia).' });
    }

    res.status(500).json({ error: 'Error al actualizar la noticia' });
  }
};

const deleteNoticia = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminada = await noticiasService.eliminar(id);

    if (!eliminada) {
      return res.status(404).json({ mensaje: 'Noticia no encontrada' });
    }

    res.status(200).json({ mensaje: 'Noticia eliminada correctamente', id });
  } catch (error) {
    console.error('Error al eliminar noticia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getNoticias,
  getNoticiaPorSlug,
  createNoticia,
  updateNoticia,
  deleteNoticia
};