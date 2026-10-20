// src/controllers/sugerencias.controller.js
const sugerenciasService = require('../services/sugerencias.service');

const getSugerencias = async (req, res) => {
  try {
    const { estado, tipo, categoria, area_id, limite, pagina } = req.query;
    const lista = await sugerenciasService.obtenerTodas({ estado, tipo, categoria, area_id, limite, pagina });
    res.status(200).json(lista);
  } catch (error) {
    console.error('Javy oiko ojeguerekóvo sugerencias:', error);
    res.status(500).json({ error: 'Javy interno servidor-pe' });
  }
};

const getSugerenciaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const sugerencia = await sugerenciasService.obtenerPorId(id);

    if (!sugerencia) {
      return res.status(404).json({ mensaje: 'Sugerencia ndojotapái' });
    }

    res.status(200).json(sugerencia);
  } catch (error) {
    console.error('Javy oiko ojehekávo sugerencia:', error);
    res.status(500).json({ error: 'Javy interno servidor-pe' });
  }
};

const createSugerencia = async (req, res) => {
  try {
    const nueva = await sugerenciasService.crear(req.body);
    res.status(201).json(nueva);
  } catch (error) {
    console.error('Javy oiko oñemboukuévo sugerencia:', error.message);

    if (error.code === '23514') { // check_violation
      if (error.constraint === 'quejas_sugerencias_descripcion_check') {
        return res.status(400).json({ error: 'Mba\'e oñemombe\'uva (descripción) oguereko va\'erã 10 guive 2000 ha\'e peve (caracteres).' });
      }
      if (error.constraint === 'quejas_sugerencias_propuesta_mejora_check') {
        return res.status(400).json({ error: 'Pe propuesta de mejora ndaikatúi ohasa 1000 ha\'e (caracteres).' });
      }
      if (error.constraint === 'quejas_sugerencias_correo_contacto_check') {
        return res.status(400).json({ error: 'Correo electrónico ndoikói oĩ va\'erã hekópete.' });
      }
    }

    res.status(500).json({ error: 'Javy oiko oñemboguejakuévo sugerencia' });
  }
};

const atenderSugerencia = async (req, res) => {
  try {
    const { id } = req.params;
    const actualizada = await sugerenciasService.atenderOResolver(id, req.body);

    if (!actualizada) {
      return res.status(404).json({ mensaje: 'Sugerencia ndojotapái' });
    }

    res.status(200).json(actualizada);
  } catch (error) {
    console.error('Javy oiko oñeñangarekovo sugerencia-re:', error.message);
    res.status(500).json({ error: 'Javy oiko oñembopyahúvo sugerencia' });
  }
};

const deleteSugerencia = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminada = await sugerenciasService.eliminar(id);

    if (!eliminada) {
      return res.status(404).json({ mensaje: 'Sugerencia ndojotapái' });
    }

    res.status(200).json({ mensaje: 'Sugerencia oñembogue hekópete', id });
  } catch (error) {
    console.error('Javy oiko oñemboguévo sugerencia:', error);
    res.status(500).json({ error: 'Javy interno servidor-pe' });
  }
};

module.exports = {
  getSugerencias,
  getSugerenciaPorId,
  createSugerencia,
  atenderSugerencia,
  deleteSugerencia
};