const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/tokenController');
const { verificarToken } = require('../middlewares/authMiddleware');

// 1. RUTAS PÚBLICAS Y DE AGENTES (Sin JWT)
router.post('/validar', tokenController.validarToken);
router.get('/sync', tokenController.obtenerDispositivosParaAgente);

// 2. RUTAS PROTEGIDAS (Requieren JWT de Administrador)
router.post('/', verificarToken, tokenController.crearToken);
router.get('/dispositivos', verificarToken, tokenController.obtenerDispositivos);
router.put('/dispositivos/:mac/estado', verificarToken, tokenController.cambiarEstadoDispositivo);
router.put('/dispositivos/:mac/qos', verificarToken, tokenController.actualizarQoS);
router.put('/dispositivos/:mac/tiempo', verificarToken, tokenController.anadirTiempoExtra);

module.exports = router;