// src/routes/bitacoraCambios.routes.js
const express = require('express');
const router = express.Router();
const bitacoraController = require('../controllers/bitacoraCambios.controller');

// Dagiti pagseksionan/endpoints para iti panagbuya laeng (read-only)
router.get('/', bitacoraController.getBitacora);
router.get('/:id', bitacoraController.getBitacoraPorId);

module.exports = router;