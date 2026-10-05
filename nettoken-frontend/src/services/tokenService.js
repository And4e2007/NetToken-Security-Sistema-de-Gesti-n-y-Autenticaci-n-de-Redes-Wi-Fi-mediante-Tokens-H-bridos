import api from './api';

export const tokenService = {
    obtenerDispositivos: () => api.get('/tokens/dispositivos'),
    generarToken: (datos) => api.post('/tokens', datos),
    validarToken: (datos) => api.post('/tokens/validar', datos),
    bloquearDispositivo: (mac) => api.put(`/tokens/dispositivos/${mac}/estado`, { estado: 'BLOQUEADO' }),
    suspenderDispositivo: (mac) => api.put(`/tokens/dispositivos/${mac}/estado`, { estado: 'PAUSADO' }),
    reanudarDispositivo: (mac) => api.put(`/tokens/dispositivos/${mac}/estado`, { estado: 'AUTORIZADO' }), // NUEVO
    actualizarQoS: (mac, bajada, subida) => api.put(`/tokens/dispositivos/${mac}/qos`, { bajada, subida }),
    anadirTiempo: (mac, minutos) => api.put(`/tokens/dispositivos/${mac}/tiempo`, { minutos })
};