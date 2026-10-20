// src/routes/recursos.routes.js
const express = require('express');
const router = express.Router();
const recursosController = require('../controllers/recursos.controller');

router.get('/', recursosController.getRecursos);
router.get('/:id', recursosController.getRecursoPorId);
router.post('/', recursosController.createRecurso);
router.post('/:id/descargar', recursosController.descargarRecurso); // Endpoint para contabilizar descargas
router.put('/:id', recursosController.updateRecurso);
router.delete('/:id', recursosController.deleteRecurso);

module.exports = router;