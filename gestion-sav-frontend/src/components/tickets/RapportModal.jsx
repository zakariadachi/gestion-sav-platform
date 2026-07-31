import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

export default function RapportModal({ ticket, onClose, onSuccess }) {
    const [rapportForm, setRapportForm] = useState({ contenu: '' });
    const [rapportPhotos, setRapportPhotos] = useState([]);
    const [rapportError, setRapportError] = useState('');
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);

    const handleRapportSubmit = async (e) => {
        e.preventDefault();
        if (!rapportForm.contenu.trim() || rapportForm.contenu.trim().length < 10) {
            setRapportError('Le contenu doit contenir au moins 10 caractères.');
            return;
        }
        setIsSubmittingReport(true);
        setRapportError('');
        try {
            const fd = new FormData();
            fd.append('contenu', rapportForm.contenu);
            rapportPhotos.forEach((f) => fd.append('photos[]', f));
            await api.post(`/tickets/${ticket.id}/rapport`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onSuccess(ticket.id);
        } catch (err) {
            setRapportError(err.response?.data?.message ?? 'Erreur lors de la soumission.');
        } finally {
            setIsSubmittingReport(false);
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
                        <div className="tk-modal-title">Rapport d'Intervention</div>
                        <div className="tk-modal-subtitle">Ticket #{ticket.id} — {ticket.title}</div>
                    </div>
                    <button onClick={onClose} className="tk-btn-close">
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                    </button>
                </div>

                <form onSubmit={handleRapportSubmit} className="tk-modal-body">
                    {rapportError && <div className="ss-inline-error"><div className="ss-inline-error-accent" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} /><div className="ss-inline-error-icon"><span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ef4444' }}>error</span></div><span className="ss-inline-error-text">{rapportError}</span></div>}

                    <div className="tk-form-group">
                        <label>Contenu du rapport <span className="tk-required">*</span></label>
                        <textarea
                            value={rapportForm.contenu}
                            onChange={(e) => setRapportForm({ contenu: e.target.value })}
                            rows={5}
                            placeholder="Décrivez les actions effectuées, les pièces remplacées, le diagnostic…"
                        />
                        <div className="tk-char-count">{rapportForm.contenu.length} caractères (minimum 10)</div>
                    </div>

                    <div className="tk-form-group">
                        <label>Photos (optionnel)</label>
                        <label className="tk-file-upload">
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>upload_file</span>
                            <div>
                                <div className="tk-file-title">Cliquez pour sélectionner des photos</div>
                                <div className="tk-file-hint">JPEG, PNG, WEBP — max 2 Mo par fichier</div>
                            </div>
                            <input type="file" multiple accept="image/*" className="tk-file-input"
                                onChange={(e) => setRapportPhotos(Array.from(e.target.files))} />
                        </label>
                        {rapportPhotos.length > 0 && (
                            <div className="tk-file-list">
                                {rapportPhotos.map((f, i) => (
                                    <span key={i} className="tk-file-tag">
                                        <span className="material-symbols-outlined" style={{ fontSize: 12 }}>image</span>
                                        {f.name}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="tk-info-banner">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>info</span>
                        <span>La soumission de ce rapport marquera automatiquement le ticket comme <strong>Résolu</strong>.</span>
                    </div>

                    <div className="tk-modal-actions">
                        <button type="button" onClick={onClose} className="tk-btn-cancel">Annuler</button>
                        <button type="submit" disabled={isSubmittingReport} className="tk-btn-submit">
                            {isSubmittingReport ? (
                                <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>Envoi…</>
                            ) : (
                                <><span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>Soumettre le rapport</>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
