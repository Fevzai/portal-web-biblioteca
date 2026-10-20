// src/routes/perfiles.routes.js
const express = require('express');
const router = express.Router();
const perfilesController = require('../controllers/perfiles.controller');

router.get('/', perfilesController.getPerfiles);
router.get('/:id', perfilesController.getPerfilPorId);
router.post('/', perfilesController.createPerfil);
router.put('/:id', perfilesController.updatePerfil);
router.delete('/:id', perfilesController.deletePerfil);

module.exports = router;