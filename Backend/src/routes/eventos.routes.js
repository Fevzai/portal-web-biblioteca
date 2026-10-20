// src/routes/eventos.routes.js
const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventos.controller');

router.get('/', eventosController.getEventos);
router.get('/:slug', eventosController.getEventoPorSlug);
router.post('/', eventosController.createEvento);
router.put('/:id', eventosController.updateEvento);
router.delete('/:id', eventosController.deleteEvento);

module.exports = router;