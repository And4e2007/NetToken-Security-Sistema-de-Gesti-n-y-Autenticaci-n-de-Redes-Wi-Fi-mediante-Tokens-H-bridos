import React from 'react';

const GenerateTokenModal = ({ generateMode, setGenerateMode, isGenerating, onGenerate, newTokenResult, onCloseResult }) => {
    return (
        <>
            {/* Modal de Formulario */}
            {generateMode.isOpen && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header bg-light border-0">
                                <h5 className="modal-title fw-bold text-primary">Generar Token de Acceso</h5>
                                <button type="button" className="btn-close" onClick={() => setGenerateMode({ ...generateMode, isOpen: false })} disabled={isGenerating}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={onGenerate}>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold">POLÍTICA DE RED</label>
                                        <select className="form-select" value={generateMode.politica} onChange={(e) => setGenerateMode({...generateMode, politica: e.target.value})}>
                                            <option value="1">Política Estándar (5 Mbps)</option>
                                        </select>
                                    </div>
                                    <div className="row mb-4">
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold">DISPOSITIVOS (CUPO)</label>
                                            <input type="number" min="1" className="form-control" value={generateMode.cupo} onChange={(e) => setGenerateMode({...generateMode, cupo: e.target.value})} required />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label text-muted small fw-bold">DURACIÓN (HORAS)</label>
                                            <input type="number" min="1" className="form-control" value={generateMode.horas} onChange={(e) => setGenerateMode({...generateMode, horas: e.target.value})} required />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" disabled={isGenerating}>
                                        {isGenerating ? 'Generando...' : 'Crear y Mostrar QR'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Resultado con QR */}
            {newTokenResult && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content border-0 shadow text-center p-4">
                            <h5 className="fw-bold text-success mb-3">¡Acceso Generado!</h5>
                            <img src={newTokenResult.qr_code} alt="Código QR Wi-Fi" className="img-fluid border rounded mb-3 shadow-sm" style={{ width: '200px', height: '200px' }} />
                            <p className="text-muted small mb-1">CÓDIGO MANUAL</p>
                            <h4 className="font-monospace fw-bold text-primary mb-3 bg-light py-2 rounded">
                                {newTokenResult.token_acceso}
                            </h4>
                            <p className="small text-danger fw-bold">Expira: {new Date(newTokenResult.expira_en).toLocaleString()}</p>
                            <button className="btn btn-light mt-2 w-100" onClick={onCloseResult}>Cerrar Ventana</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default GenerateTokenModal;