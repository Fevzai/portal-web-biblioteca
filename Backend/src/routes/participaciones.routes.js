// src/routes/participaciones.routes.js
const express = require('express');
const router = express.Router();
const participacionesController = require('../controllers/participaciones.controller');

router.get('/', participacionesController.getParticipaciones);
router.get('/:id', participacionesController.getParticipacionPorId);
router.post('/', participacionesController.createParticipacion);
router.put('/:id/atender', participacionesController.atenderParticipacion);
router.delete('/:id', participacionesController.deleteParticipacion);

module.exports = router;