// src/routes/kbDocumentos.routes.js
const express = require('express');
const router = express.Router();
const kbDocumentosController = require('../controllers/kbDocumentos.controller');

router.get('/', kbDocumentosController.getDocumentos);
router.get('/:id', kbDocumentosController.getDocumentoPorId);
router.post('/', kbDocumentosController.createDocumento);
router.put('/:id', kbDocumentosController.updateDocumento);
router.delete('/:id', kbDocumentosController.deleteDocumento);

module.exports = router;