// src/routes/sugerencias.routes.js
const express = require('express');
const router = express.Router();
const sugerenciasController = require('../controllers/sugerencias.controller');

router.get('/', sugerenciasController.getSugerencias);
router.get('/:id', sugerenciasController.getSugerenciaPorId);
router.post('/', sugerenciasController.createSugerencia);
router.put('/:id/atender', sugerenciasController.atenderSugerencia);
router.delete('/:id', sugerenciasController.deleteSugerencia);

module.exports = router;