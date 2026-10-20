// src/routes/areas.routes.js
const express = require('express');
const router = express.Router();
const areasController = require('../controllers/areas.controller');

router.get('/', areasController.getAreas);
router.get('/:slug', areasController.getAreaPorSlug);
router.post('/', areasController.createArea);
router.put('/:id', areasController.updateArea);
router.delete('/:id', areasController.deleteArea);

module.exports = router;