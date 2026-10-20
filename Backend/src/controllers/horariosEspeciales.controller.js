// src/controllers/horariosEspeciales.controller.js
const horariosService = require('../services/horariosEspeciales.service');

const getHorarios = async (req, res) => {
  try {
    const horarios = await horariosService.obtenerTodos();
    res.status(200).json(horarios);
  } catch (error) {
    console.error('Error al obtener horarios especiales:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getHorarioPorFecha = async (req, res) => {
  try {
    const { fecha } = req.params;
    const horario = await horariosService.obtenerPorFecha(fecha);
    
    if (!horario) {
      return res.status(404).json({ mensaje: 'No hay horario especial registrado para esta fecha' });
    }

    res.status(200).json(horario);
  } catch (error) {
    console.error('Error al consultar horario por fecha:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createHorario = async (req, res) => {
  try {
    const nuevoHorario = await horariosService.crear(req.body);
    res.status(201).json(nuevoHorario);
  } catch (error) {
    console.error('Error al crear horario especial:', error.message);

    // Capturar error de restricción de CHECK o clave primaria duplicada
    if (error.code === '23514') { // Código PostgreSQL de check_violation
      return res.status(400).json({
        error: 'El horario no cumple la regla de coherencia (si está abierto, abre/cierra deben ser válidos y cierra > abre).'
      });
    }
    if (error.code === '23505') { // Código PostgreSQL de unique/primary key violation
      return res.status(409).json({ error: 'Ya existe un horario especial registrado para esta fecha.' });
    }

    res.status(500).json({ error: 'Error al registrar horario especial' });
  }
};

const deleteHorario = async (req, res) => {
  try {
    const { fecha } = req.params;
    const eliminado = await horariosService.eliminar(fecha);

    if (!eliminado) {
      return res.status(404).json({ mensaje: 'No se encontró el registro a eliminar' });
    }

    res.status(200).json({ mensaje: 'Horario especial eliminado con éxito', registro: eliminado });
  } catch (error) {
    console.error('Error al eliminar horario especial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getHorarios,
  getHorarioPorFecha,
  createHorario,
  deleteHorario
};