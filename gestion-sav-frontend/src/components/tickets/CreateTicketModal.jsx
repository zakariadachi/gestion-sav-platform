import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { PRIORITIES, PRIORITY_LABELS } from '../../constants/enums';

export default function CreateTicketModal({ onClose, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', priority: PRIORITIES.MEDIUM });
    const [formError, setFormError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.description.trim()) {
            setFormError('Le titre et la description sont obligatoires.');
            return;
        }
        setSubmitting(true);
        setFormError('');
        try {
            const { data } = await api.post('/tickets', form);
            const newTicket = data?.data ?? data;
            onSuccess(newTicket);
        } catch (err) {
            setFormError(err.response?.data?.message ?? 'Erreur lors de la création.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="tk-modal-overlay" onClick={onClose}>
            <motion.div
                className="tk-modal"
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }}
                transition={{ duration: 0.25 }}
            >
                <div className="tk-modal-header">
                    <div>
                        <div className="tk-modal-title">Nouveau Ticket</div>
                        <div className="tk-modal-subtitle">Décrivez votre problème en détail</div>
                    </div>
                    <button onClick={onClose} className="tk-btn-close">
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="tk-modal-body">
                    {formError && <div className="ss-inline-error"><div className="ss-inline-error-accent" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} /><div className="ss-inline-error-icon"><span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ef4444' }}>error</span></div><span className="ss-inline-error-text">{formError}</span></div>}

                    <div className="tk-form-group">
                        <label>Titre <span className="tk-required">*</span></label>
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                            placeholder="Ex: Écran noir après redémarrage" />
                    </div>

                    <div className="tk-form-group">
                        <label>Description <span className="tk-required">*</span></label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={4} placeholder="Décrivez le problème en détail…" />
                    </div>

                    <div className="tk-form-group">
                        <label>Priorité</label>
                        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="tk-select-full">
                            {Object.values(PRIORITIES).map((p) => (
                                <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>
                            ))}
                        </select>
                    </div>

                    <div className="tk-modal-actions">
                        <button type="button" onClick={onClose} className="tk-btn-cancel">Annuler</button>
                        <button type="submit" disabled={submitting} className="tk-btn-submit">
                            {submitting ? (
                                <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>Envoi…</>
                            ) : (
                                <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>Créer le ticket</>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
