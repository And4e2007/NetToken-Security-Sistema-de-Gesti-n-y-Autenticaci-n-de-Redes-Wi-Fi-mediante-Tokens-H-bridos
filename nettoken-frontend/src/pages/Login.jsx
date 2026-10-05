import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', credenciales);
            // Guardamos el token en el almacenamiento local del navegador
            localStorage.setItem('token', response.data.token);
            // Redirigimos al Dashboard
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.error || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="d-flex align-items-center justify-content-center" 
            style={{ 
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                zIndex: 9999
            }}
        >
            <div className="card shadow-lg border-0 rounded-4" style={{ maxWidth: '420px', width: '90%' }}>
                <div className="card-body p-5">
                    
                    {/* LOGO CORPORATIVO NETTOKEN (Escudo de Red) */}
                    <div className="text-center mb-4">
                        <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3 shadow" style={{ width: '70px', height: '70px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm0 5a1.5 1.5 0 0 1 .5 2.915l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99A1.5 1.5 0 0 1 8 5z"/>
                            </svg>
                        </div>
                        <h3 className="fw-bolder text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
                            NetToken <span className="text-primary">Admin</span>
                        </h3>
                        <p className="text-muted small mb-0">Gestión de Acceso y Calidad de Servicio</p>
                    </div>

                    {/* ALERTA DE ERROR ESTILIZADA */}
                    {error && (
                        <div className="alert alert-danger text-center border-0 py-2 fw-semibold rounded-3 mb-4" role="alert" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="form-floating mb-3">
                            <input 
                                type="text" 
                                className="form-control bg-light border-0 shadow-none" 
                                id="usuario" 
                                name="usuario"
                                placeholder="Usuario"
                                value={credenciales.usuario}
                                onChange={handleChange}
                                required 
                            />
                            <label htmlFor="usuario" className="text-muted">👤 Usuario Maestro</label>
                        </div>

                        <div className="form-floating mb-4">
                            <input 
                                type="password" 
                                className="form-control bg-light border-0 shadow-none" 
                                id="password" 
                                name="password"
                                placeholder="Contraseña"
                                value={credenciales.password}
                                onChange={handleChange}
                                required 
                            />
                            <label htmlFor="password" className="text-muted">🔒 Contraseña de Red</label>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow">
                            Ingresar al Sistema
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;