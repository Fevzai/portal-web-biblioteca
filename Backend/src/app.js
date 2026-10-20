// src/app.js
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Importar rutas
const horariosRoutes = require('./routes/horarios.routes');
const horariosEspecialesRoutes = require('./routes/horariosEspeciales.routes');
const noticiasRoutes = require('./routes/noticias.routes');
const informacionInstitucionalRoutes = require('./routes/informacionInstitucional.routes');
const recursosRoutes = require('./routes/recursos.routes');
const perfilesRoutes = require('./routes/perfiles.routes');
const participacionesRoutes = require('./routes/participaciones.routes');
const bitacoraCambiosRoutes = require('./routes/bitacoraCambios.routes');
const sugerenciasRoutes = require('./routes/sugerencias.routes');
const galeriaFotosRoutes = require('./routes/galeriaFotos.routes');
const eventosRoutes = require('./routes/eventos.routes');
const areasRoutes = require('./routes/areas.routes');
const kbFragmentosRoutes = require('./routes/kbFragmentos.routes');
const kbDocumentosRoutes = require('./routes/kbDocumentos.routes');
const chatConsultasRoutes = require('./routes/chatConsultas.routes');

// Definir endpoints
app.use('/api/horarios', horariosRoutes);
app.use('/api/horarios-especiales', horariosEspecialesRoutes);
app.use('/api/noticias', noticiasRoutes);
app.use('/api/informacion-institucional', informacionInstitucionalRoutes);
app.use('/api/recursos', recursosRoutes);
app.use('/api/perfiles', perfilesRoutes);
app.use('/api/participaciones', participacionesRoutes);
app.use('/api/bitacora-cambios', bitacoraCambiosRoutes);
app.use('/api/sugerencias', sugerenciasRoutes);
app.use('/api/galeria-fotos', galeriaFotosRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/kb-fragmentos', kbFragmentosRoutes);
app.use('/api/kb-documentos', kbDocumentosRoutes);
app.use('/api/chat-consultas', chatConsultasRoutes);

app.get('/', (req, res) => {
  res.send('API del Portal Web Biblioteca funcionando 🚀');
});

module.exports = app;