import React from 'react';

const AddTimeModal = ({ timeMode, setTimeMode, onSave }) => {
    if (!timeMode.isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-sm">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header bg-light border-0">
                        <h5 className="modal-title fw-bold">Añadir Tiempo</h5>
                        <button type="button" className="btn-close" onClick={() => setTimeMode({ ...timeMode, isOpen: false })}></button>
                    </div>
                    <div className="modal-body p-4 text-center">
                        <p className="text-muted small mb-3">Host: <span className="font-monospace fw-bold text-dark">{timeMode.mac}</span></p>
                        <form onSubmit={onSave}>
                            <div className="mb-4 text-start">
                                <label className="form-label fw-bold small text-muted">MINUTOS EXTRA</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    className="form-control form-control-lg text-center fw-bold" 
                                    value={timeMode.minutos} 
                                    onChange={(e) => setTimeMode({...timeMode, minutos: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="d-flex justify-content-between">
                                <button type="button" className="btn btn-light w-100 me-2" onClick={() => setTimeMode({ ...timeMode, isOpen: false })}>Cancelar</button>
                                <button type="submit" className="btn btn-success w-100 fw-bold">Añadir</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTimeModal;