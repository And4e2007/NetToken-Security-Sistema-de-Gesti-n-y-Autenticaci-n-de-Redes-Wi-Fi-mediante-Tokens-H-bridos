import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CaptivePortal from './pages/CaptivePortal';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login'; // Importamos el Login

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/portal" element={<CaptivePortal />} />
        <Route path="/login" element={<Login />} />
        
        {/* Envolvemos el admin en nuestra ruta protegida */}
        <Route path="/admin" element={
            <PrivateRoute>
                <AdminDashboard />
            </PrivateRoute>
        } />
        
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
