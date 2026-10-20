// src/routes/informacionInstitucional.routes.js
const express = require('express');
const router = express.Router();
const infoController = require('../controllers/informacionInstitucional.controller');

router.get('/', infoController.getInformacion);
router.put('/', infoController.updateInformacion);

module.exports = router;