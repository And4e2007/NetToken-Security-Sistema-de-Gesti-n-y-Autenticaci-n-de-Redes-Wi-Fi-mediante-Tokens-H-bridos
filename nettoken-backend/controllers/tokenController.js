const db = require('../config/db');
const cryptoService = require('../services/cryptoService');
const tokenDbService = require('../services/tokenDbService');
const QRCode = require('qrcode');

const registrarAuditoria = async (id_nodo, mac, resultado, motivo) => {
    try {
        await db.execute(
            `INSERT INTO registro_auditoria (id_nodo, mac_involucrada, tipo_resultado, motivo_detalle) 
             VALUES (?, ?, ?, ?)`,
            [id_nodo, mac, resultado, motivo]
        );
    } catch (err) {
        console.error('Error guardando auditoría:', err);
    }
};

const crearToken = async (req, res) => {
    try {
        const { id_politica, id_nodo, cupo_dispositivos, horas_duracion } = req.body;
        const tokenRaw = cryptoService.generarTokenRaw();
        const tokenHash = cryptoService.hashearToken(tokenRaw);
        
        const fechaInicio = new Date();
        const fechaExpiracion = new Date(fechaInicio.getTime() + (horas_duracion * 60 * 60 * 1000));

        const [result] = await db.execute(
            `INSERT INTO token (codigo_hash_seguridad, fecha_hora_inicio, fecha_hora_expiracion, cupo_maximo_dispositivos, estado_actual, id_politica, id_nodo) 
             VALUES (?, ?, ?, ?, 'ACTIVO', ?, ?)`,
            [tokenHash, fechaInicio, fechaExpiracion, cupo_dispositivos, id_politica, id_nodo]
        );

        const qrDataURL = await QRCode.toDataURL(tokenRaw);

        res.status(201).json({
            mensaje: 'Token generado exitosamente',
            id_insertado: result.insertId,
            token_acceso: tokenRaw, 
            qr_code: qrDataURL,
            expira_en: fechaExpiracion
        });
    } catch (error) {
        console.error('Error creando token:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const validarToken = async (req, res) => {
    try {
        const { token_acceso, direccion_mac, id_nodo } = req.body;
        const tokenHash = cryptoService.hashearToken(token_acceso);

        const [tokens] = await db.execute(
            `SELECT t.*, p.limite_bajada_kbps, p.limite_subida_kbps 
             FROM token t 
             INNER JOIN politica_red p ON t.id_politica = p.id_politica 
             WHERE t.codigo_hash_seguridad = ?`,
            [tokenHash]
        );

        if (tokens.length === 0) {
            await registrarAuditoria(id_nodo, direccion_mac, 'ACCESO_DENEGADO', 'Token no existe');
            return res.status(401).json({ error: 'Token inválido o no reconocido' });
        }

        const tokenDB = tokens[0];

        if (tokenDB.estado_actual !== 'ACTIVO') {
            await registrarAuditoria(id_nodo, direccion_mac, 'ACCESO_DENEGADO', `Intento de uso de token ${tokenDB.estado_actual}`);
            return res.status(401).json({ error: `El token está ${tokenDB.estado_actual.toLowerCase()}` });
        }

        if (new Date() > new Date(tokenDB.fecha_hora_expiracion)) {
            await db.execute('UPDATE token SET estado_actual = ? WHERE id_token = ?', ['EXPIRADO', tokenDB.id_token]);
            await registrarAuditoria(id_nodo, direccion_mac, 'ACCESO_DENEGADO', 'Token expirado por tiempo');
            return res.status(401).json({ error: 'El tiempo del token ha expirado' });
        }

        const [dispositivos] = await db.execute('SELECT * FROM dispositivo WHERE id_token = ?', [tokenDB.id_token]);
        const macExistente = dispositivos.find(d => d.direccion_mac === direccion_mac);

        if (macExistente) {
            if (macExistente.estado_sesion_individual !== 'AUTORIZADO') {
                await registrarAuditoria(id_nodo, direccion_mac, 'ACCESO_DENEGADO', 'Dispositivo pausado/bloqueado individualmente');
                return res.status(403).json({ error: 'Dispositivo bloqueado temporalmente por el administrador' });
            }
            return res.status(200).json({
                mensaje: 'Acceso concedido (Dispositivo ya vinculado)',
                qos: {
                    bajada_kbps: macExistente.override_bajada_kbps || tokenDB.limite_bajada_kbps,
                    subida_kbps: macExistente.override_subida_kbps || tokenDB.limite_subida_kbps
                }
            });
        }

        if (dispositivos.length >= tokenDB.cupo_maximo_dispositivos) {
            await registrarAuditoria(id_nodo, direccion_mac, 'ACCESO_DENEGADO', 'Límite de dispositivos alcanzado');
            return res.status(403).json({ error: 'Este token ya alcanzó su límite máximo de dispositivos permitidos' });
        }

        await db.execute(
            `INSERT INTO dispositivo (direccion_mac, id_token, estado_sesion_individual) 
             VALUES (?, ?, 'AUTORIZADO')`,
            [direccion_mac, tokenDB.id_token]
        );
        await registrarAuditoria(id_nodo, direccion_mac, 'ACCESO_CONCEDIDO', 'Nueva vinculación exitosa');

        return res.status(200).json({
            mensaje: 'Acceso concedido y dispositivo vinculado permanentemente al token',
            qos: {
                bajada_kbps: tokenDB.limite_bajada_kbps,
                subida_kbps: tokenDB.limite_subida_kbps
            }
        });

    } catch (error) {
        console.error('Error validando token:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const obtenerDispositivos = async (req, res) => {
    try {
        const rows = await tokenDbService.obtenerListaDispositivos();
        const dispositivosListos = rows.map(row => {
            // 1. Tomamos la fecha de expiración original del token
            const fechaAjustada = new Date(row.fecha_hora_expiracion);
            
            // 2. Le sumamos los minutos extra específicos de este dispositivo (si tiene)
            if (row.tiempo_extra_minutos) {
                fechaAjustada.setMinutes(fechaAjustada.getMinutes() + row.tiempo_extra_minutos);
            }

            return {
                direccion_mac: row.direccion_mac,
                token: row.token,
                fecha_hora_inicio: row.fecha_hora_inicio,
                fecha_hora_expiracion: fechaAjustada, // <- Enviamos la fecha real calculada
                override_bajada_kbps: row.override_bajada_kbps || row.limite_bajada_kbps,
                override_subida_kbps: row.override_subida_kbps || row.limite_subida_kbps,
                estado_sesion_individual: row.estado_sesion_individual
            };
        });
        res.status(200).json(dispositivosListos);
    } catch (error) {
        console.error('Error obteniendo dispositivos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const cambiarEstadoDispositivo = async (req, res) => {
    try {
        const { mac } = req.params;
        const { estado } = req.body;
        await tokenDbService.actualizarEstadoDispositivo(mac, estado);
        res.status(200).json({ mensaje: `El dispositivo ${mac} ahora está ${estado}` });
    } catch (error) {
        res.status(500).json({ error: 'Error al cambiar estado' });
    }
};

const actualizarQoS = async (req, res) => {
    try {
        const { mac } = req.params;
        const { bajada, subida } = req.body;
        await tokenDbService.actualizarQoSDispositivo(mac, bajada, subida);
        res.status(200).json({ mensaje: 'QoS actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar QoS' });
    }
};

const anadirTiempoExtra = async (req, res) => {
    try {
        const { mac } = req.params;
        const { minutos } = req.body;
        await tokenDbService.sumarTiempoDispositivo(mac, minutos);
        res.status(200).json({ mensaje: `Se añadieron ${minutos} minutos extra` });
    } catch (error) {
        res.status(500).json({ error: 'Error al añadir tiempo' });
    }
};

const obtenerDispositivosParaAgente = async (req, res) => {
    try {
        const apiKey = req.headers['x-api-key'];
        if (!apiKey) return res.status(403).json({ error: 'Falta API Key' });

        const [nodos] = await db.execute('SELECT * FROM nodo_local WHERE api_key_autenticacion = ?', [apiKey]);
        if (nodos.length === 0) return res.status(403).json({ error: 'Nodo no autorizado' });

        const rows = await tokenDbService.obtenerListaDispositivos();
        
        // Mapeamos los datos asegurándonos de que las velocidades nunca sean nulas para el Router
        const dispositivosListos = rows.map(row => ({
            direccion_mac: row.direccion_mac,
            override_bajada_kbps: row.override_bajada_kbps || row.limite_bajada_kbps,
            override_subida_kbps: row.override_subida_kbps || row.limite_subida_kbps,
            estado_sesion_individual: row.estado_sesion_individual
        }));

        res.status(200).json(dispositivosListos);
    } catch (error) {
        console.error('Error en sync de agente:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = { 
    crearToken, validarToken, obtenerDispositivos, obtenerDispositivosParaAgente,
    cambiarEstadoDispositivo, actualizarQoS, anadirTiempoExtra 
};