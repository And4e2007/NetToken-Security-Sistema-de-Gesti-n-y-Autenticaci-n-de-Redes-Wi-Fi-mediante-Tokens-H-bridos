import React, { useEffect, useState } from 'react';

const TiempoRestante = ({ fechaExpiracion, estado }) => {
    const [tiempo, setTiempo] = useState({ hrs: 0, mins: 0, secs: 0, expirado: false });

    useEffect(() => {
        // Si está pausado, detenemos el cálculo visual para dar la sensación de congelamiento
        if (estado === 'PAUSADO') return;

        const calcular = () => {
            const diff = new Date(fechaExpiracion) - new Date();
            if (diff <= 0) {
                setTiempo({ hrs: 0, mins: 0, secs: 0, expirado: true });
            } else {
                setTiempo({
                    hrs: Math.floor(diff / (1000 * 60 * 60)),
                    mins: Math.floor((diff / 1000 / 60) % 60),
                    secs: Math.floor((diff / 1000) % 60),
                    expirado: false
                });
            }
        };
        calcular();
        const interval = setInterval(calcular, 1000); 
        return () => clearInterval(interval);
    }, [fechaExpiracion, estado]);

    if (tiempo.expirado) return <span className="badge bg-danger">Expirado</span>;
    if (estado === 'PAUSADO') return <span className="badge bg-warning text-dark font-monospace">⏸️ Pausado</span>;

    const formato = `${String(tiempo.hrs).padStart(2, '0')}:${String(tiempo.mins).padStart(2, '0')}:${String(tiempo.secs).padStart(2, '0')}`;
    if (tiempo.hrs === 0 && tiempo.mins < 15) return <span className="badge bg-warning text-dark font-monospace">⏳ {formato}</span>;
    return <span className="text-muted fw-bold font-monospace">🕒 {formato}</span>;
};

const ActiveHostsTable = ({ hosts, onEditQoS, onKick, onSuspend, onResume, onAddTime }) => {
    return (
        <div className="card dashboard-card border-0 shadow-sm overflow-hidden mt-4">
            <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                        <tr>
                            <th className="px-4 py-3">Dirección MAC</th>
                            <th>Tiempo Restante</th>
                            <th>Velocidad (D/U)</th>
                            <th>Estado</th>
                            <th className="text-end px-4">Acciones Rápidas</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hosts.map((host) => (
                            <tr key={host.direccion_mac}>
                                <td className="px-4 fw-semibold font-monospace">{host.direccion_mac}</td>
                                <td>
                                    <TiempoRestante fechaExpiracion={host.fecha_hora_expiracion} estado={host.estado_sesion_individual} />
                                </td>
                                <td>
                                    <span className="text-success fw-bold">{host.override_bajada_kbps / 1000} Mbps</span> ↓ / &nbsp;
                                    <span className="text-info fw-bold">{host.override_subida_kbps / 1000} Mbps</span> ↑
                                </td>
                                <td>
                                    {host.estado_sesion_individual === 'AUTORIZADO' && <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">En Línea</span>}
                                    {host.estado_sesion_individual === 'PAUSADO' && <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-1">Suspendido</span>}
                                    {host.estado_sesion_individual === 'BLOQUEADO' && <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1">Bloqueado</span>}
                                </td>
                                <td className="text-end px-4">
                                    {/* Botones universales (Aparecen siempre excepto si está bloqueado permanentemente) */}
                                    {host.estado_sesion_individual !== 'BLOQUEADO' ? (
                                        <>
                                            <button className="btn btn-sm btn-light border me-2" onClick={() => onAddTime(host.direccion_mac)} title="Añadir Tiempo">⏱️ +</button>
                                            <button className="btn btn-sm btn-light border me-2" onClick={() => onEditQoS(host)} title="Ajustar QoS">🎛️️ QoS</button>
                                            
                                            {host.estado_sesion_individual === 'AUTORIZADO' ? (
                                                <button className="btn btn-sm btn-warning text-dark fw-bold me-2" onClick={() => onSuspend(host.direccion_mac)}>Pausar</button>
                                            ) : (
                                                <button className="btn btn-sm btn-success fw-bold me-2" onClick={() => onResume(host.direccion_mac)}>Reanudar</button>
                                            )}
                                            
                                            <button className="btn btn-sm btn-danger fw-bold" onClick={() => onKick(host.direccion_mac)}>Bloquear</button>
                                        </>
                                    ) : (
                                        // SI ESTÁ BLOQUEADO, SOLO MOSTRAMOS EL BOTÓN DE DESBLOQUEAR
                                        <button className="btn btn-sm btn-outline-success fw-bold" onClick={() => onResume(host.direccion_mac)}>
                                            🔓 Desbloquear
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {hosts.length === 0 && <div className="text-center py-5 text-muted">No hay dispositivos activos en la red.</div>}
            </div>
        </div>
    );
};

export default ActiveHostsTable;