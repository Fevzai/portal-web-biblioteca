// src/routes/horariosEspeciales.routes.js
const express = require('express');
const router = express.Router();
const horariosController = require('../controllers/horariosEspeciales.controller');

router.get('/', horariosController.getHorarios);
router.get('/:fecha', horariosController.getHorarioPorFecha);
router.post('/', horariosController.createHorario);
router.delete('/:fecha', horariosController.deleteHorario);

module.exports = router;