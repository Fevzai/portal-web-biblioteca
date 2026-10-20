// src/controllers/perfiles.controller.js
const perfilesService = require('../services/perfiles.service');

const getPerfiles = async (req, res) => {
  try {
    const { rol, activo, limite, pagina } = req.query;
    const perfiles = await perfilesService.obtenerTodos({ rol, activo, limite, pagina });
    res.status(200).json(perfiles);
  } catch (error) {
    console.error('Error al obtener perfiles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getPerfilPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const perfil = await perfilesService.obtenerPorId(id);

    if (!perfil) {
      return res.status(404).json({ mensaje: 'Perfil no encontrado' });
    }

    res.status(200).json(perfil);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createPerfil = async (req, res) => {
  try {
    const nuevoPerfil = await perfilesService.crear(req.body);
    res.status(201).json(nuevoPerfil);
  } catch (error) {
    console.error('Error al crear perfil:', error.message);

    if (error.code === '23503') { // foreign_key_violation
      return res.status(400).json({ error: 'El ID proporcionado no coincide con un usuario registrado en auth.users.' });
    }
    if (error.code === '23505') { // unique_violation
      return res.status(409).json({ error: 'Ya existe un perfil asociado a este ID de usuario.' });
    }

    res.status(500).json({ error: 'Error al registrar el perfil' });
  }
};

const updatePerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const perfilActualizado = await perfilesService.actualizar(id, req.body);

    if (!perfilActualizado) {
      return res.status(404).json({ mensaje: 'Perfil no encontrado' });
    }

    res.status(200).json(perfilActualizado);
  } catch (error) {
    console.error('Error al actualizar perfil:', error.message);

    // Capturar excepción lanzada por el trigger tg_proteger_ultimo_admin
    if (error.code === 'P0001') { // raise_exception en PostgreSQL
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

const deletePerfil = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminado = await perfilesService.eliminar(id);

    if (!eliminado) {
      return res.status(404).json({ mensaje: 'Perfil no encontrado' });
    }

    res.status(200).json({ mensaje: 'Perfil eliminado correctamente', id });
  } catch (error) {
    console.error('Error al eliminar perfil:', error.message);

    // Capturar excepción del trigger tg_proteger_ultimo_admin al intentar borrar al último admin
    if (error.code === 'P0001') {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getPerfiles,
  getPerfilPorId,
  createPerfil,
  updatePerfil,
  deletePerfil
};