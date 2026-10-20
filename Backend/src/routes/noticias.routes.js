// src/routes/noticias.routes.js
const express = require('express');
const router = express.Router();
const noticiasController = require('../controllers/noticias.controller');

router.get('/', noticiasController.getNoticias);
router.get('/:slug', noticiasController.getNoticiaPorSlug);
router.post('/', noticiasController.createNoticia);
router.put('/:id', noticiasController.updateNoticia);
router.delete('/:id', noticiasController.deleteNoticia);

module.exports = router;