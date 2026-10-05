import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

// Este interceptor adjunta el JWT a los "Headers" antes de enviar cualquier petición al backend
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;