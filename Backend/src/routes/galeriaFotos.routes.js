// src/routes/galeriaFotos.routes.js
const express = require('express');
const router = express.Router();
const galeriaController = require('../controllers/galeriaFotos.controller');

router.get('/', galeriaController.getFotos);
router.get('/:id', galeriaController.getFotoPorId);
router.post('/', galeriaController.createFoto);
router.put('/:id', galeriaController.updateFoto);
router.delete('/:id', galeriaController.deleteFoto);

module.exports = router;