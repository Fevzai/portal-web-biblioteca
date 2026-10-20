// src/routes/kbFragmentos.routes.js
const express = require('express');
const router = express.Router();
const kbFragmentosController = require('../controllers/kbFragmentos.controller');

router.get('/documento/:documentoId', kbFragmentosController.getFragmentosPorDocumento);
router.post('/buscar', kbFragmentosController.buscarSemantica);
router.post('/', kbFragmentosController.createFragmento);
router.delete('/documento/:documentoId', kbFragmentosController.deleteFragmentosPorDocumento);
router.delete('/:id', kbFragmentosController.deleteFragmento);

module.exports = router;