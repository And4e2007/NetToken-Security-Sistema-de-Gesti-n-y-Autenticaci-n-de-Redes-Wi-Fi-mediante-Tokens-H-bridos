const db = require('../config/db');

const tokenDbService = {
    
obtenerListaDispositivos: async () => {
        const [rows] = await db.execute(`
            SELECT d.direccion_mac, t.codigo_hash_seguridad as token, 
                   t.fecha_hora_inicio, t.fecha_hora_expiracion, 
                   d.tiempo_extra_minutos, -- ¡ESTO FALTABA PARA EL CÁLCULO!
                   d.override_bajada_kbps, d.override_subida_kbps, 
                   d.estado_sesion_individual, p.limite_bajada_kbps, p.limite_subida_kbps
            FROM dispositivo d
            INNER JOIN token t ON d.id_token = t.id_token
            INNER JOIN politica_red p ON t.id_politica = p.id_politica
        `);
        return rows;
    },

    insertarToken: async (tokenHash, fechaInicio, fechaExpiracion, cupo_dispositivos, id_politica, id_nodo) => {
        const [result] = await db.execute(
            `INSERT INTO token (codigo_hash_seguridad, fecha_hora_inicio, fecha_hora_expiracion, cupo_maximo_dispositivos, estado_actual, id_politica, id_nodo) 
             VALUES (?, ?, ?, ?, 'ACTIVO', ?, ?)`,
            [tokenHash, fechaInicio, fechaExpiracion, cupo_dispositivos, id_politica, id_nodo]
        );
        return result.insertId;
    },

    actualizarEstadoDispositivo: async (mac, estado) => {
        await db.execute('UPDATE dispositivo SET estado_sesion_individual = ? WHERE direccion_mac = ?', [estado, mac]);
    },

    actualizarQoSDispositivo: async (mac, bajada, subida) => {
        await db.execute('UPDATE dispositivo SET override_bajada_kbps = ?, override_subida_kbps = ? WHERE direccion_mac = ?', [bajada, subida, mac]);
    },

    sumarTiempoDispositivo: async (mac, minutos) => {
        // Al añadir tiempo, forzamos el estado a AUTORIZADO para revivirlo
        await db.execute(
            'UPDATE dispositivo SET tiempo_extra_minutos = tiempo_extra_minutos + ?, estado_sesion_individual = "AUTORIZADO" WHERE direccion_mac = ?', 
            [minutos, mac]
        );
    }
};

module.exports = tokenDbService;