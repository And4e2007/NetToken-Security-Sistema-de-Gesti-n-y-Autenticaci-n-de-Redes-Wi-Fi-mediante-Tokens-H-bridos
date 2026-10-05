import React, { useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const CaptivePortal = () => {
    // Capturamos los parámetros que el Router físico inyecta en la URL
    const [searchParams] = useSearchParams();
    
    // Si estamos en desarrollo local y no hay router, usamos una MAC de prueba por defecto
    const macFromUrl = searchParams.get('mac') || '11:22:33:44:55:66'; 
    const idNodo = searchParams.get('nodo') || 1; 

    // Estados del componente
    const [token, setToken] = useState('');
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // Hacemos el POST al endpoint que creamos en el backend
            const response = await axios.post('http://localhost:3000/api/tokens/validar', {
                token_acceso: token,
                direccion_mac: macFromUrl,
                id_nodo: parseInt(idNodo)
            });

            setStatus({ 
                type: 'success', 
                message: `¡${response.data.mensaje}! Velocidad: ${response.data.qos.bajada_kbps} kbps.` 
            });
            
            // Simulación de liberación de red: Redirigimos al usuario a Google tras 3 segundos
            setTimeout(() => {
                window.location.href = 'https://www.google.com';
            }, 3000);

        } catch (error) {
            setStatus({ 
                type: 'error', 
                message: error.response?.data?.error || 'Error de conexión con el servidor' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card dashboard-card p-4 shadow-sm" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="text-center mb-4">
                    <h3 className="text-primary fw-bold">NetToken Wi-Fi</h3>
                    <p className="text-muted">Ingresa tu código de acceso para conectarte.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="tokenInput" className="form-label fw-semibold">Token de Acceso</label>
                        <input 
                            type="text" 
                            className="form-control form-control-lg text-center font-monospace" 
                            id="tokenInput"
                            placeholder="Ej. 8057789405b902a3"
                            value={token}
                            onChange={(e) => setToken(e.target.value.trim())}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary btn-lg w-100 mb-3"
                        disabled={loading}
                    >
                        {loading ? 'Validando credenciales...' : 'Conectar a Internet'}
                    </button>
                </form>

                {/* Mensajes de Alerta (Éxito o Error) */}
                {status.message && (
                    <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-danger'} text-center`} role="alert">
                        {status.message}
                    </div>
                )}
                
                {/* Mostramos la MAC de forma sutil por propósitos de auditoría/soporte */}
                <div className="text-center mt-3">
                    <small className="text-muted">Dispositivo MAC: {macFromUrl}</small>
                </div>
            </div>
        </div>
    );
};

export default CaptivePortal;