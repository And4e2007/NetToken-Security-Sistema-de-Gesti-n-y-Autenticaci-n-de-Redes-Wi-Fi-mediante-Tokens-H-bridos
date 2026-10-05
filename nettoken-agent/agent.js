const axios = require('axios');
const { exec } = require('child_process');
const os = require('os');

// URL de tu API Central (Si el agente está en otra red, esto apuntaría a una IP pública)
const API_URL = 'http://localhost:3000/api/tokens/sync';
const API_KEY_NODO = 'API_KEY_TEST_123'; // Este valor lo insertaste manualmente al inicio

// Detectamos el sistema operativo para no romper el script si lo pruebas en Windows
const isLinux = os.platform() === 'linux';
const interfazRed = 'eth0'; // La interfaz de red de tu gateway (en Docker suele ser eth0)

// Función genérica para ejecutar comandos del sistema
const ejecutarComando = (comando) => {
    if (!isLinux) {
        console.log(`[SIMULACIÓN WINDOWS] Comando que se ejecutaría en Linux: ${comando}`);
        return;
    }
    
    exec(comando, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error ejecutando comando [${comando}]:`, error.message);
            return;
        }
        if (stderr) console.warn(`Advertencia en [${comando}]:`, stderr);
    });
};

// Función para aplicar bloqueo o permiso mediante Iptables (Firewall de Linux)
const configurarFirewall = (mac, estado) => {
    if (estado === 'BLOQUEADO' || estado === 'PAUSADO') {
        // Regla: Bloquear (DROP) todo el tráfico proveniente de esta MAC
        ejecutarComando(`iptables -A FORWARD -m mac --mac-source ${mac} -j DROP`);
        console.log(`Dispositivo ${mac} bloqueado a nivel de red.`);
    } else if (estado === 'AUTORIZADO') {
        // Eliminamos el bloqueo si existía (permitir tráfico)
        ejecutarComando(`iptables -D FORWARD -m mac --mac-source ${mac} -j DROP > /dev/null 2>&1 || true`);
        console.log(`Dispositivo ${mac} autorizado en el firewall.`);
    }
};

// Función para aplicar QoS mediante Traffic Control (tc)
const configurarQoS = (mac, bajadaKbps, subidaKbps) => {
    // Nota Técnica para tu informe: En un entorno real, 'tc' usa un sistema de clases y colas (HTB/CBQ).
    // Aquí simulamos la inyección del comando que crearía una regla limitadora para una MAC específica.
    
    const comandoQoS = `tc class add dev ${interfazRed} parent 1: classid 1:1 htb rate ${bajadaKbps}kbit ceil ${bajadaKbps}kbit`;
    ejecutarComando(comandoQoS);
    console.log(`QoS Aplicado a ${mac}: Bajada ${bajadaKbps}Kbps / Subida ${subidaKbps}Kbps`);
};

// Bucle principal del Agente (Polling)
const sincronizarConServidor = async () => {
    console.log('\nSincronizando con Servidor Central...');
    try {
        // AQUÍ ESTABA EL ERROR: Faltaba enviar el API_KEY en los headers
        const response = await axios.get(API_URL, {
            headers: {
                'x-api-key': API_KEY_NODO
            }
        });
        
        const dispositivos = response.data;

        dispositivos.forEach(dispositivo => {
            const { direccion_mac, estado_sesion_individual, override_bajada_kbps, override_subida_kbps } = dispositivo;

            // 1. Aplicamos Reglas de Firewall (Bloqueo/Acceso)
            configurarFirewall(direccion_mac, estado_sesion_individual);

            // 2. Aplicamos Reglas de Velocidad (QoS) solo si está autorizado
            if (estado_sesion_individual === 'AUTORIZADO') {
                configurarQoS(direccion_mac, override_bajada_kbps, override_subida_kbps);
            }
        });

    } catch (error) {
        // Mejoramos el manejo de errores para que te diga exactamente por qué falla
        console.error('Error contactando al Servidor Central:', error.response ? error.response.data : error.message);
    }
};

// Iniciar el agente
console.log('Agente de Red NetToken iniciado...');
if (!isLinux) {
    console.warn('ejecutándose en Windows. Los comandos de red serán simulados.');
}

// Ejecutar inmediatamente y luego cada 10 segundos
sincronizarConServidor();
setInterval(sincronizarConServidor, 10000); // 10 segundos es ideal para no saturar la API