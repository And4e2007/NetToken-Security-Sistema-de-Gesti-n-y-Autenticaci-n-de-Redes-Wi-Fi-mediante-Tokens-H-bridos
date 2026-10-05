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
        <div className="container d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#0f172a' }}>
            <div className="card border-0 shadow-lg p-4" style={{ width: '100%', maxWidth: '400px', borderRadius: '15px' }}>
                <div className="text-center mb-4">
                    <h3 className="fw-bold text-primary">NetToken Admin</h3>
                    <p className="text-muted small">Acceso exclusivo para administradores</p>
                </div>

                {error && <div className="alert alert-danger py-2 text-center">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label fw-bold text-muted small">USUARIO</label>
                        <input type="text" className="form-control form-control-lg" value={credenciales.usuario} onChange={(e) => setCredenciales({...credenciales, usuario: e.target.value})} required />
                    </div>
                    <div className="mb-4">
                        <label className="form-label fw-bold text-muted small">CONTRASEÑA</label>
                        <input type="password" className="form-control form-control-lg" value={credenciales.password} onChange={(e) => setCredenciales({...credenciales, password: e.target.value})} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg w-100 fw-bold" disabled={loading}>
                        {loading ? 'Validando...' : 'Iniciar Sesión'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;