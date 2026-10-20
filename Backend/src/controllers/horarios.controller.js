// src/controllers/horarios.controller.js
const horariosService = require('../services/horarios.service');

const getHorarios = async (req, res) => {
  try {
    const horarios = await horariosService.obtenerTodos();
    res.status(200).json(horarios);
  } catch (error) {
    console.error('Error al obtener horarios regulares:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getHorarioPorDia = async (req, res) => {
  try {
    const { dia } = req.params;
    const horario = await horariosService.obtenerPorDia(dia);

    if (!horario) {
      return res.status(404).json({ mensaje: 'No hay configuración registrada para este día de la semana' });
    }

    res.status(200).json(horario);
  } catch (error) {
    console.error('Error al consultar horario por día:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const saveHorario = async (req, res) => {
  try {
    const horarioActualizado = await horariosService.guardarOActualizar(req.body);
    res.status(200).json(horarioActualizado);
  } catch (error) {
    console.error('Error al guardar horario regular:', error.message);

    if (error.code === '23514') { // check_violation
      if (error.constraint === 'horarios_dia_semana_check') {
        return res.status(400).json({ error: 'El día de la semana debe ser un número entre 1 (Lunes) y 7 (Domingo).' });
      }
      if (error.constraint === 'horario_coherente') {
        return res.status(400).json({
          error: 'El horario no cumple la regla de coherencia (si está abierto, abre/cierra deben ser válidos y cierra > abre).'
        });
      }
    }

    res.status(500).json({ error: 'Error al registrar o actualizar el horario regular' });
  }
};

const deleteHorario = async (req, res) => {
  try {
    const { dia } = req.params;
    const eliminado = await horariosService.eliminar(dia);

    if (!eliminado) {
      return res.status(404).json({ mensaje: 'No se encontró el registro a eliminar' });
    }

    res.status(200).json({ mensaje: 'Horario regular eliminado correctamente', dia_semana: dia });
  } catch (error) {
    console.error('Error al eliminar horario regular:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getHorarios,
  getHorarioPorDia,
  saveHorario,
  deleteHorario
};