import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const getInitials = (name = '') =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '??';

const hashColor = (str = '') => {
    const palette = [
        { bg: 'rgba(59, 130, 246,0.1)', text: '#3b82f6' },
        { bg: 'rgba(16,185,129,0.1)', text: '#10b981' },
        { bg: 'rgba(29, 78, 216,0.1)', text: '#60a5fa' },
        { bg: 'rgba(249,115,22,0.1)', text: '#f97316' },
        { bg: 'rgba(236,72,153,0.1)', text: '#ec4899' },
        { bg: 'rgba(20,184,166,0.1)', text: '#14b8a6' },
    ];
    const i = str.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;
    return palette[i];
};

export default function AssignModal({ ticket, technicians, onClose, onSuccess }) {
    const [selectedTech, setSelectedTech] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [assignError, setAssignError] = useState('');

    const handleAssign = async (e) => {
        e.preventDefault();
        if (!selectedTech) { setAssignError('Sélectionnez un technicien.'); return; }
        setAssigning(true);
        setAssignError('');
        try {
            const { data } = await api.patch(`/tickets/${ticket.id}/assign`, { technician_id: Number(selectedTech) });
            const updated = data?.data ?? data;
            const tech = technicians.find((t) => String(t.id) === String(selectedTech));
            onSuccess(updated, tech);
        } catch (err) {
            setAssignError(err.response?.data?.message ?? "Erreur lors de l'assignation.");
        } finally {
            setAssigning(false);
        }
    };

    return (
        <div className="tk-modal-overlay" onClick={onClose}>
            <motion.div
                className="tk-modal tk-modal-sm"
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ duration: 0.25 }}
            >
                <div className="tk-modal-header">
                    <div>
                        <div className="tk-modal-title">Assigner un Technicien</div>
                        <div className="tk-modal-subtitle">Ticket #{ticket.id} — {ticket.title}</div>
                    </div>
                    <button onClick={onClose} className="tk-btn-close">
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                    </button>
                </div>

                <form onSubmit={handleAssign} className="tk-modal-body">
                    {assignError && <div className="ss-inline-error"><div className="ss-inline-error-accent" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} /><div className="ss-inline-error-icon"><span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ef4444' }}>error</span></div><span className="ss-inline-error-text">{assignError}</span></div>}

                    <div className="tk-form-group">
                        <label>Technicien disponible</label>
                        <select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)} className="tk-select-full">
                            <option value="">-- Sélectionner --</option>
                            {technicians.map((tech) => (
                                <option key={tech.id} value={tech.id}>{tech.name}</option>
                            ))}
                        </select>
                    </div>

                    {selectedTech && (() => {
                        const tech = technicians.find((t) => String(t.id) === String(selectedTech));
                        const col = hashColor(tech?.name ?? '');
                        return tech ? (
                            <div className="tk-tech-preview">
                                <div className="tk-tech-avatar" style={{ background: col.bg, color: col.text, width: 32, height: 32, fontSize: 10 }}>
                                    {getInitials(tech.name)}
                                </div>
                                <div>
                                    <div className="tk-tech-preview-name">{tech.name}</div>
                                    <div className="tk-tech-preview-role">Technicien</div>
                                </div>
                                <span className="tk-available-badge">Disponible</span>
                            </div>
                        ) : null;
                    })()}

                    <div className="tk-modal-actions">
                        <button type="button" onClick={onClose} className="tk-btn-cancel">Annuler</button>
                        <button type="submit" disabled={assigning || !selectedTech} className="tk-btn-submit">
                            {assigning ? (
                                <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>Assignation…</>
                            ) : (
                                <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>how_to_reg</span>Confirmer</>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
