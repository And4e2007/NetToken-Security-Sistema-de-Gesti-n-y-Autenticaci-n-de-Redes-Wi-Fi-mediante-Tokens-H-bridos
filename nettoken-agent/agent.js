const axios = require('axios');
const { exec } = require('child_process');
const os = require('os');

// Configuración de la API
const API_URL = process.env.API_URL || 'http://localhost:3000/api/tokens/sync';
const API_KEY_NODO = process.env.API_KEY || 'API_KEY_TEST_123';
const INTERFAZ_RED = 'eth0'; 

// ============================================================================
// 🧠 MOTOR INTELIGENTE DE VARIANTES (Patrón de Diseño: Strategy)
// ============================================================================

const detectVariant = () => {
    const platform = os.platform();
    // En un futuro, aquí se podría hacer ping al gateway para ver si es Mikrotik o Cisco
    const isMikrotikEnv = process.env.ROUTER_TYPE === 'MIKROTIK'; 

    if (platform === 'win32' || platform === 'darwin') {
        return 'VARIANTE_3_SIMULACION';
    } else if (isMikrotikEnv) {
        return 'VARIANTE_2_API_EMPRESARIAL';
    } else {
        return 'VARIANTE_1_LINUX_GATEWAY';
    }
};

const VarianteActual = detectVariant();

// ============================================================================
// 🛡️ CONTROLADORES DE RED (DRIVERS)
// ============================================================================

const ejecutarComando = (comando) => {
    exec(comando, (error, stdout, stderr) => {
        if (error) console.error(`[Error de Sistema]:`, error.message);
    });
};

const driverRed = {
    // ---- VARIANTE 1: NATIVA PARA LINUX (DOCKER / RASPBERRY PI) ----
    VARIANTE_1_LINUX_GATEWAY: {
        configurarFirewall: (mac, estado) => {
            if (estado === 'BLOQUEADO' || estado === 'PAUSADO') {
                ejecutarComando(`iptables -A FORWARD -m mac --mac-source ${mac} -j DROP`);
            } else {
                ejecutarComando(`iptables -D FORWARD -m mac --mac-source ${mac} -j DROP > /dev/null 2>&1 || true`);
            }
        },
        configurarQoS: (mac, bajada, subida) => {
            ejecutarComando(`tc class add dev ${INTERFAZ_RED} parent 1: classid 1:1 htb rate ${bajada}kbit ceil ${bajada}kbit`);
        }
    },

    // ---- VARIANTE 2: PARA EQUIPOS PROFESIONALES (MIKROTIK / CISCO) ----
    VARIANTE_2_API_EMPRESARIAL: {
        configurarFirewall: (mac, estado) => {
            // Aquí iría el código que hace una petición HTTP/API al router Mikrotik
            console.log(`[API Mikrotik] Enviando orden de ${estado} para MAC: ${mac}`);
        },
        configurarQoS: (mac, bajada, subida) => {
            console.log(`[API Mikrotik] Configurando Queues para ${mac} a ${bajada}Kbps`);
        }
    },

    // ---- VARIANTE 3: SIMULACIÓN DE DESARROLLO (WINDOWS / MAC) ----
    VARIANTE_3_SIMULACION: {
        configurarFirewall: (mac, estado) => {
            console.log(`[Simulación FW] Estado de ${mac} cambiado a: ${estado}`);
        },
        configurarQoS: (mac, bajada, subida) => {
            console.log(`[Simulación QoS] Límites para ${mac} ajustados (D: ${bajada} | U: ${subida})`);
        }
    }
};

// ============================================================================
// 🔄 BUCLE PRINCIPAL (POLLING)
// ============================================================================

const sincronizarConServidor = async () => {
    try {
        const response = await axios.get(API_URL, { headers: { 'x-api-key': API_KEY_NODO } });
        const dispositivos = response.data;

        dispositivos.forEach(dispositivo => {
            const { direccion_mac, estado_sesion_individual, override_bajada_kbps, override_subida_kbps } = dispositivo;

            // El Agente inyecta las reglas usando el Driver de la Variante detectada
            driverRed[VarianteActual].configurarFirewall(direccion_mac, estado_sesion_individual);
            
            if (estado_sesion_individual === 'AUTORIZADO') {
                driverRed[VarianteActual].configurarQoS(direccion_mac, override_bajada_kbps, override_subida_kbps);
            }
        });

    } catch (error) {
        console.error('Error contactando al Servidor Central:', error.response ? error.response.data : error.message);
    }
};

console.log('===================================================');
console.log('🤖 Agente NetToken Iniciado');
console.log(`📡 Modo de Despliegue Detectado: ${VarianteActual}`);
console.log('===================================================\n');

sincronizarConServidor();
setInterval(sincronizarConServidor, 10000);