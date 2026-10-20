// src/routes/chatConsultas.routes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatConsultas.controller');

router.get('/sesion/:sesionId', chatController.getHistorialSesion);
router.get('/metricas', chatController.getMetricas);
router.post('/', chatController.createConsulta);
router.patch('/:id/calificar', chatController.rateConsulta);

module.exports = router;