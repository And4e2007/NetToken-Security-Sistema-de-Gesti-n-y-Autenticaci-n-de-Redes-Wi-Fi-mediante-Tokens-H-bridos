import React from 'react';

const EditQoSModal = ({ editMode, setEditMode, onSave }) => {
    if (!editMode.isOpen) return null;

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header bg-light border-0">
                        <h5 className="modal-title fw-bold">Modificar QoS: <span className="font-monospace text-primary">{editMode.mac}</span></h5>
                        <button type="button" className="btn-close" onClick={() => setEditMode({ ...editMode, isOpen: false })}></button>
                    </div>
                    <div className="modal-body p-4">
                        <form onSubmit={onSave}>
                            <div className="mb-3">
                                <label className="form-label">Bajada (Kbps)</label>
                                <input type="number" className="form-control" value={editMode.bajada} onChange={(e) => setEditMode({...editMode, bajada: e.target.value})} required />
                            </div>
                            <div className="mb-4">
                                <label className="form-label">Subida (Kbps)</label>
                                <input type="number" className="form-control" value={editMode.subida} onChange={(e) => setEditMode({...editMode, subida: e.target.value})} required />
                            </div>
                            <div className="d-flex justify-content-end">
                                <button type="button" className="btn btn-light me-2" onClick={() => setEditMode({ ...editMode, isOpen: false })}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Aplicar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditQoSModal;