import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setHosts, kickHost, updateHostQoS } from '../store/slices/activeHostsSlice';
import { tokenService } from '../services/tokenService';

import ActiveHostsTable from '../components/Dashboard/ActiveHostsTable';
import EditQoSModal from '../components/Modals/EditQoSModal';
import GenerateTokenModal from '../components/Modals/GenerateTokenModal';
import AddTimeModal from '../components/Modals/AddTimeModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const activeHosts = useSelector((state) => state.activeHosts.hosts);

    const [editMode, setEditMode] = useState({ isOpen: false, mac: '', bajada: '', subida: '' });
    const [generateMode, setGenerateMode] = useState({ isOpen: false, politica: 1, cupo: 1, horas: 1 });
    const [timeMode, setTimeMode] = useState({ isOpen: false, mac: '', minutos: 60 });
    const [isGenerating, setIsGenerating] = useState(false);
    const [newTokenResult, setNewTokenResult] = useState(null);

    useEffect(() => {
        const fetchDispositivos = async () => {
            try {
                const response = await tokenService.obtenerDispositivos();
                dispatch(setHosts(response.data));
            } catch (error) {
                console.error("Error cargando dispositivos:", error);
            }
        };
        fetchDispositivos();
        const intervalId = setInterval(fetchDispositivos, 3000);
        return () => clearInterval(intervalId);
    }, [dispatch]);

    // HANDLERS MEJORADOS (Actualización Local Optimizada)
    const handleKick = async (mac) => {
        if (window.confirm(`¿Estás seguro de BLOQUEAR el dispositivo ${mac}?`)) {
            try {
                await tokenService.bloquearDispositivo(mac);
                const actualizados = activeHosts.map(h => h.direccion_mac === mac ? { ...h, estado_sesion_individual: 'BLOQUEADO' } : h);
                dispatch(setHosts(actualizados));
            } catch (error) { alert('Error al bloquear.'); }
        }
    };

    const handleSuspend = async (mac) => {
        try {
            await tokenService.suspenderDispositivo(mac);
            const actualizados = activeHosts.map(h => h.direccion_mac === mac ? { ...h, estado_sesion_individual: 'PAUSADO' } : h);
            dispatch(setHosts(actualizados));
        } catch (error) { alert('Error al pausar.'); }
    };

    const handleResume = async (mac) => {
        try {
            await tokenService.reanudarDispositivo(mac);
            const actualizados = activeHosts.map(h => h.direccion_mac === mac ? { ...h, estado_sesion_individual: 'AUTORIZADO' } : h);
            dispatch(setHosts(actualizados));
        } catch (error) { alert('Error al reanudar.'); }
    };

    const handleSaveQoS = async (e) => {
        e.preventDefault();
        try {
            await tokenService.actualizarQoS(editMode.mac, parseInt(editMode.bajada), parseInt(editMode.subida));
            dispatch(updateHostQoS({ mac: editMode.mac, nuevaBajada: parseInt(editMode.bajada), nuevaSubida: parseInt(editMode.subida) }));
            setEditMode({ isOpen: false, mac: '', bajada: '', subida: '' });
        } catch (error) { alert('Error al guardar QoS.'); }
    };

    const handleSaveTime = async (e) => {
        e.preventDefault();
        try {
            await tokenService.anadirTiempo(timeMode.mac, parseInt(timeMode.minutos));
            setTimeMode({ isOpen: false, mac: '', minutos: 60 });
            // El polling de 3 seg refrescará la fecha calculada desde el backend
        } catch (error) { alert('Error al añadir tiempo.'); }
    };

    const handleGenerateToken = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        try {
            const response = await tokenService.generarToken({
                id_politica: parseInt(generateMode.politica), id_nodo: 1, cupo_dispositivos: parseInt(generateMode.cupo), horas_duracion: parseInt(generateMode.horas)
            });
            setGenerateMode({ ...generateMode, isOpen: false });
            setNewTokenResult(response.data);
        } catch (error) { alert('Error conectando con el servidor.'); } finally { setIsGenerating(false); }
    };

    // DATOS ESTADÍSTICOS
    const statsData = [
        { name: 'En Línea', value: activeHosts.filter(h => h.estado_sesion_individual === 'AUTORIZADO').length, color: '#10b981' },
        { name: 'Pausados', value: activeHosts.filter(h => h.estado_sesion_individual === 'PAUSADO').length, color: '#f59e0b' },
        { name: 'Bloqueados', value: activeHosts.filter(h => h.estado_sesion_individual === 'BLOQUEADO').length, color: '#ef4444' }
    ];

    const totalBandwidthBajada = activeHosts.reduce((acc, h) => h.estado_sesion_individual === 'AUTORIZADO' ? acc + h.override_bajada_kbps : acc, 0) / 1000;

    // Simulación de historial de tráfico para el gráfico de líneas
    const trafficData = [
        { time: '10:00', Mbps: totalBandwidthBajada * 0.4 },
        { time: '10:10', Mbps: totalBandwidthBajada * 0.6 },
        { time: '10:20', Mbps: totalBandwidthBajada * 0.5 },
        { time: '10:30', Mbps: totalBandwidthBajada * 0.9 },
        { time: 'Ahora', Mbps: totalBandwidthBajada }
    ];

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold text-primary mb-0">NetToken Dashboard</h2>
                        <p className="text-muted">Monitoreo Analítico en Tiempo Real</p>
                    </div>
                    <button className="btn btn-primary shadow-sm fw-bold" onClick={() => setGenerateMode({ ...generateMode, isOpen: true })}>+ Nuevo Token</button>
                </div>

                {/* FILA DE GRÁFICOS */}
                <div className="row mb-4">
                    {/* Tarjeta de Números */}
                    <div className="col-md-3">
                        <div className="card dashboard-card bg-white p-4 border-0 shadow-sm h-100 d-flex flex-column justify-content-center">
                            <h6 className="text-muted fw-bold mb-1">TOTAL CONECTADOS</h6>
                            <h1 className="fw-bold text-primary mb-3">{activeHosts.length}</h1>
                            <h6 className="text-muted fw-bold mb-1 mt-2">ANCHO DE BANDA</h6>
                            <h3 className="fw-bold text-success mb-0">{totalBandwidthBajada} Mbps ↓</h3>
                        </div>
                    </div>
                    
                    {/* Gráfico de Dona */}
                    <div className="col-md-4">
                        <div className="card dashboard-card bg-white p-3 border-0 shadow-sm" style={{ height: '240px' }}>
                            <h6 className="text-muted fw-bold mb-0 ms-2">ESTADO DE LA RED</h6>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={statsData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                        {statsData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Gráfico de Líneas (Tráfico) */}
                    <div className="col-md-5">
                        <div className="card dashboard-card bg-white p-3 border-0 shadow-sm" style={{ height: '240px' }}>
                            <h6 className="text-muted fw-bold mb-2 ms-2">TRÁFICO EN VIVO (Mbps)</h6>
                            <ResponsiveContainer width="100%" height="90%">
                                <LineChart data={trafficData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="Mbps" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* TABLA PRINCIPAL */}
                <ActiveHostsTable 
                    hosts={activeHosts} 
                    onEditQoS={(host) => setEditMode({ isOpen: true, mac: host.direccion_mac, bajada: host.override_bajada_kbps, subida: host.override_subida_kbps })} 
                    onKick={handleKick} 
                    onSuspend={handleSuspend}
                    onResume={handleResume} 
                    onAddTime={(mac) => setTimeMode({ isOpen: true, mac: mac, minutos: 60 })} 
                />
            </div>

            <EditQoSModal editMode={editMode} setEditMode={setEditMode} onSave={handleSaveQoS} />
            <AddTimeModal timeMode={timeMode} setTimeMode={setTimeMode} onSave={handleSaveTime} />
            <GenerateTokenModal generateMode={generateMode} setGenerateMode={setGenerateMode} isGenerating={isGenerating} onGenerate={handleGenerateToken} newTokenResult={newTokenResult} onCloseResult={() => setNewTokenResult(null)} />
        </div>
    );
};

export default AdminDashboard;