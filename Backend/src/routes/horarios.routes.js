// src/routes/horarios.routes.js
const express = require('express');
const router = express.Router();
const horariosController = require('../controllers/horarios.controller');

router.get('/', horariosController.getHorarios);
router.get('/:dia', horariosController.getHorarioPorDia);
router.put('/', horariosController.saveHorario);
router.delete('/:dia', horariosController.deleteHorario);

module.exports = router;