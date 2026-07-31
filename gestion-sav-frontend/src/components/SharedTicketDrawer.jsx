import React, { useState, useEffect, useRef, useCallback } from 'react';

const STORAGE_URL = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/api$/, '') + '/storage';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';
import echo from '../services/echo';

/* ─── helpers ───────────────────────────────────────────────────── */
const fmt = (iso) =>
    iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const chatTimeAgo = (iso) => {
    if (!iso) return '';
    const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

import { TICKET_STATUS_LABELS, PRIORITY_LABELS, TICKET_STATUS, PRIORITIES, ROLE_LABELS } from '../constants/enums';
import { isOverdue, isDueSoon } from '../lib/ticket-helpers';

/* ─── status / priority configs ───────────────────────────────── */
const STATUT_CFG = {
    [TICKET_STATUS.NEW]: { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', border: 'rgba(59,130,246,0.2)' },
    [TICKET_STATUS.IN_PROGRESS]: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    [TICKET_STATUS.RESOLVED]: { color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
};

const PRIORITE_CFG = {
    [PRIORITIES.LOW]: { color: '#6b7280' },
    [PRIORITIES.MEDIUM]: { color: '#3b82f6' },
    [PRIORITIES.HIGH]: { color: '#f97316' },
    [PRIORITIES.CRITICAL]: { color: '#ef4444' },
};

export default function SharedTicketDrawer({
    ticket,
    currentUser,
    onClose,
    onAssign,
    onResolve,
    onRapport,
    isResolving
}) {
    /* state */
    const [ticketReport, setTicketReport] = useState(null);
    const [isLoadingReport, setIsLoadingReport] = useState(false);
    
    const [comments, setComments] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sendingMsg, setSendingMsg] = useState(false);
    const [attachment, setAttachment] = useState(null);
    const chatEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);

    const queryClient = useQueryClient();
    const [ratingForm, setRatingForm] = useState({ rating: 0, feedback: '' });
    const [hoverRating, setHoverRating] = useState(0);
    const [localRating, setLocalRating] = useState(null);
    const [localFeedback, setLocalFeedback] = useState(null);

    const rateMutation = useMutation({
        mutationFn: (data) => api.post(`/tickets/${ticket.id}/rate`, data),
        onSuccess: (_, variables) => {
            setLocalRating(variables.rating);
            setLocalFeedback(variables.feedback);
            toast.success("Avis envoyé !");
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
        },
        onError: () => toast.error("Erreur lors de l'envoi de l'avis.")
    });

    const displayRating = localRating || ticket?.rating;
    const displayFeedback = localFeedback || ticket?.feedback;

    /* fetch rapport if resolved */
    useEffect(() => {
        if (!ticket || ticket.status !== TICKET_STATUS.RESOLVED) {
            setTicketReport(null);
            return;
        }
        const controller = new AbortController();
        setIsLoadingReport(true);
        api.get(`/tickets/${ticket.id}/rapport`, { signal: controller.signal })
            .then((r) => setTicketReport(r.data?.data ?? r.data))
            .catch((e) => {
                if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
                    setTicketReport(null);
                }
            })
            .finally(() => setIsLoadingReport(false));
            
        return () => controller.abort();
    }, [ticket]);

    /* fetch comments */
    const fetchComments = useCallback((signal) => {
        if (!ticket) return;
        api.get(`/tickets/${ticket.id}/comments`, { signal })
            .then((r) => setComments(r.data?.data ?? []))
            .catch(() => {});
    }, [ticket]);

    useEffect(() => { 
        const controller = new AbortController();
        fetchComments(controller.signal);
        
        return () => controller.abort();
    }, [fetchComments]);

    /* ── Real-time WebSocket listener (replaces polling) ── */
    useEffect(() => {
        if (!ticket) return;

        const channel = echo.private(`ticket.${ticket.id}`);

        channel.listen('TicketCommentCreated', (e) => {
            const incoming = e.comment;
            // Avoid duplicates (the sender already appended optimistically)
            setComments((prev) => {
                if (prev.some((c) => c.id === incoming.id)) return prev;
                return [...prev, incoming];
            });
        });

        return () => {
            echo.leave(`ticket.${ticket.id}`);
        };
    }, [ticket]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    /* send message */
    const handleSendMessage = async () => {
        const msg = newMessage.trim();
        if ((!msg && !attachment) || sendingMsg || !ticket) return;
        setSendingMsg(true);
        try {
            const formData = new FormData();
            if (msg) formData.append('message', msg);
            if (attachment) formData.append('attachment', attachment);

            const res = await api.post(`/tickets/${ticket.id}/comments`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setComments(prev => [...prev, res.data?.data ?? res.data]);
            setNewMessage('');
            setAttachment(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (e) {
            console.error('Erreur envoi message:', e);
            alert(e.response?.data?.message || 'Erreur lors de l\'envoi du message');
        } finally {
            setSendingMsg(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validation (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('Le fichier est trop volumineux (max 5MB).');
            return;
        }
        
        setAttachment(file);
    };

    if (!ticket) return null;

    return (
        <>
            <motion.div
                className="tk-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
                className="tk-drawer"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                style={{ zIndex: 101 }}
            >
                <div className="tk-drawer-header">
                    <div>
                        <div className="tk-drawer-meta">
                            <span className="tk-id">#{ticket.id}</span>
                            <span className="tk-status-badge" style={{
                                color: (STATUT_CFG[ticket.status] ?? STATUT_CFG[TICKET_STATUS.NEW]).color,
                                background: (STATUT_CFG[ticket.status] ?? STATUT_CFG[TICKET_STATUS.NEW]).bg,
                                borderColor: (STATUT_CFG[ticket.status] ?? STATUT_CFG[TICKET_STATUS.NEW]).border,
                            }}>
                                <span className="tk-status-dot" style={{ background: (STATUT_CFG[ticket.status] ?? STATUT_CFG[TICKET_STATUS.NEW]).color }} />
                                {TICKET_STATUS_LABELS[ticket.status] ?? TICKET_STATUS_LABELS[TICKET_STATUS.NEW]}
                            </span>
                            <span className="tk-priority-badge" style={{
                                color: (PRIORITE_CFG[ticket.priority] ?? PRIORITE_CFG[PRIORITIES.MEDIUM]).color,
                                background: `color-mix(in srgb, ${(PRIORITE_CFG[ticket.priority] ?? PRIORITE_CFG[PRIORITIES.MEDIUM]).color} 8%, transparent)`,
                            }}>
                                {PRIORITY_LABELS[ticket.priority] ?? PRIORITY_LABELS[PRIORITIES.MEDIUM]}
                            </span>
                        </div>
                        <h2 className="tk-drawer-title">{ticket.title}</h2>
                    </div>
                    <button onClick={onClose} className="tk-btn-close">
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                    </button>
                </div>

                <div className="tk-drawer-body">
                    <div className="tk-drawer-grid">
                        {[
                            currentUser?.role !== 'Client' ? { label: 'Client', value: ticket.client?.name ?? '—', icon: 'person' } : { label: 'Catégorie', value: ticket.category ?? '—', icon: 'category' },
                            { label: 'Technicien', value: ticket.technician?.name ?? 'Non assigné', icon: 'engineering' },
                            { label: 'Créé le', value: fmt(ticket.created_at), icon: 'calendar_today' },
                            { label: 'Mis à jour', value: fmt(ticket.updated_at), icon: 'update' },
                            ...(ticket.due_date ? [{
                                label: 'Échéance (SLA)',
                                value: (
                                    <span style={{ 
                                        color: isOverdue(ticket) ? '#ef4444' : isDueSoon(ticket) ? '#f59e0b' : 'inherit',
                                        fontWeight: isOverdue(ticket) || isDueSoon(ticket) ? 700 : 'normal',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        {isOverdue(ticket) && <span className="material-symbols-outlined" style={{ fontSize: 14 }}>warning</span>}
                                        {isDueSoon(ticket) && !isOverdue(ticket) && <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>}
                                        {fmt(ticket.due_date)}
                                    </span>
                                ),
                                icon: 'alarm'
                            }] : []),
                        ].map(({ label, value, icon }) => (
                            <div key={label} className="tk-drawer-detail">
                                <div className="tk-detail-label">
                                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>{icon}</span>
                                    <span>{label}</span>
                                </div>
                                <div className="tk-detail-value">{value}</div>
                            </div>
                        ))}
                    </div>

                    <div className="tk-drawer-section">
                        <div className="tk-section-label">Description</div>
                        <div className="tk-description-box">
                            {ticket.description || <span className="tk-no-data">Aucune description.</span>}
                        </div>
                    </div>

                    {/* ── Chat / Commentaires ── */}
                    <div className="tk-drawer-section" style={{ display: 'flex', flexDirection: 'column', height: '400px', background: 'var(--dc-bg-alt)', borderRadius: '12px', border: '1px solid var(--dc-border)', overflow: 'hidden' }}>
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--dc-border)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--dc-bg)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--dc-accent)' }}>chat</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dc-text)' }}>Messagerie</span>
                            <span style={{ marginLeft: 'auto', background: 'var(--dc-accent-subtle)', color: 'var(--dc-accent)', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 800 }}>
                                {comments.length}
                            </span>
                        </div>
                        <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {comments.length === 0 && (
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--dc-text-muted)' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 24, marginBottom: '8px', opacity: 0.5 }}>forum</span>
                                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Aucun message</span>
                                </div>
                            )}
                            {comments.map((c) => {
                                const isMe = c.user_id === currentUser?.id;
                                const initials2 = (c.user?.name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                                return (
                                    <div key={c.id} style={{ display: 'flex', gap: '8px', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                                        {!isMe && (
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--dc-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: 'var(--dc-text-muted)', flexShrink: 0 }}>
                                                {initials2}
                                            </div>
                                        )}
                                        <div style={{ maxWidth: '75%', padding: '10px 12px', borderRadius: '16px', borderBottomRightRadius: isMe ? '4px' : '16px', borderBottomLeftRadius: !isMe ? '4px' : '16px', background: isMe ? 'var(--dc-accent)' : 'var(--dc-bg)', color: isMe ? '#fff' : 'var(--dc-text)', border: isMe ? 'none' : '1px solid var(--dc-border)' }}>
                                            {!isMe && (
                                                <div style={{ fontSize: '10px', fontWeight: 700, marginBottom: '4px', color: 'var(--dc-accent)' }}>
                                                    {c.user?.name} <span style={{ opacity: 0.7, fontWeight: 500 }}>• {ROLE_LABELS[c.user?.role] ?? c.user?.role}</span>
                                                </div>
                                            )}
                                            <div style={{ fontSize: '12px', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.message}</div>
                                            
                                            {/* Attachment Rendering */}
                                            {c.attachment_url && (
                                                <div style={{ marginTop: '8px' }}>
                                                    {c.attachment_url.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                                                        <a href={c.attachment_url} target="_blank" rel="noreferrer">
                                                            <img src={c.attachment_url} alt="Pièce jointe" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', cursor: 'pointer', border: '1px solid rgba(0,0,0,0.1)' }} />
                                                        </a>
                                                    ) : (
                                                        <a href={c.attachment_url} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: isMe ? 'rgba(255,255,255,0.2)' : 'var(--dc-bg-alt)', color: isMe ? '#fff' : 'var(--dc-text)', borderRadius: '8px', textDecoration: 'none', fontSize: '11px', fontWeight: 600, border: isMe ? 'none' : '1px solid var(--dc-border)' }}>
                                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>description</span>
                                                            Ouvrir le fichier
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            <div style={{ fontSize: '9px', fontWeight: 600, marginTop: '6px', textAlign: isMe ? 'right' : 'left', color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--dc-text-muted)' }}>
                                                {chatTimeAgo(c.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>
                        <div style={{ padding: '12px', borderTop: '1px solid var(--dc-border)', background: 'var(--dc-bg)' }}>
                            {attachment && (
                                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: 'var(--dc-surface)', borderRadius: '6px', fontSize: '11px', border: '1px solid var(--dc-border)' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'var(--dc-accent)' }}>attach_file</span>
                                    <span style={{ flex: 1, color: 'var(--dc-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{attachment.name}</span>
                                    <button onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--dc-text-muted)', display: 'flex' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                                    </button>
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--dc-surface)', border: '1px solid var(--dc-border)', color: 'var(--dc-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                                    title="Joindre un fichier"
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>attach_file</span>
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange} 
                                    style={{ display: 'none' }} 
                                    accept=".jpg,.jpeg,.png,.pdf" 
                                />
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Répondre au ticket..."
                                    rows={1}
                                    style={{ flex: 1, resize: 'none', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--dc-border)', background: 'var(--dc-bg-alt)', color: 'var(--dc-text)', fontSize: '12px', outline: 'none', fontFamily: 'inherit', maxHeight: '100px' }}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={(!newMessage.trim() && !attachment) || sendingMsg}
                                    style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--dc-accent)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: ((!newMessage.trim() && !attachment) || sendingMsg) ? 'not-allowed' : 'pointer', opacity: ((!newMessage.trim() && !attachment) || sendingMsg) ? 0.5 : 1, flexShrink: 0 }}
                                >
                                    {sendingMsg ? (
                                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>send</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {ticket.status === TICKET_STATUS.RESOLVED && (
                        <div className="tk-drawer-section">
                            <div className="tk-section-label">
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>description</span>
                                Rapport d'Intervention
                            </div>

                            {isLoadingReport && (
                                <div className="tk-report-loading">
                                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: 15, color: 'var(--dc-accent)' }}>progress_activity</span>
                                    Chargement du rapport…
                                </div>
                            )}

                            {!isLoadingReport && ticketReport && (
                                <div className="tk-report-content">
                                    <div className="tk-report-text">{ticketReport.contenu}</div>
                                    {ticketReport.photos?.length > 0 && (
                                        <>
                                            <div className="tk-photo-label">
                                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>photo_library</span>
                                                {ticketReport.photos.length} photo{ticketReport.photos.length > 1 ? 's' : ''}
                                            </div>
                                            <div className="tk-photo-grid">
                                                {ticketReport.photos.map((path, i) => (
                                                        <a href={`${STORAGE_URL}/${path}`} target="_blank" rel="noreferrer" className="tk-photo-thumb">
                                                        <img src={`${STORAGE_URL}/${path}`} alt={`photo-${i + 1}`} />
                                                    </a>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {!isLoadingReport && !ticketReport && (
                                <div className="tk-no-report">Aucun rapport soumis pour ce ticket.</div>
                            )}
                        </div>
                    )}

                    {/* ── CSAT (Customer Satisfaction) ── */}
                    {ticket.status === TICKET_STATUS.RESOLVED && (
                        <div className="tk-drawer-section">
                            <div className="tk-section-label">
                                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>star_rate</span>
                                Évaluation du service
                            </div>
                            
                            {displayRating ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '16px', background: 'var(--dc-bg-alt)', borderRadius: '12px', border: '1px solid var(--dc-border)' }}>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span key={star} className="material-symbols-outlined" style={{ fontSize: 24, color: star <= displayRating ? '#fbbf24' : '#e2e8f0' }}>star</span>
                                        ))}
                                    </div>
                                    {displayFeedback && (
                                        <div style={{ fontSize: '11px', color: 'var(--dc-text)', fontStyle: 'italic', textAlign: 'center', marginTop: '4px' }}>
                                            "{displayFeedback}"
                                        </div>
                                    )}
                                </div>
                            ) : (currentUser?.role === 'Client' && ticket.client_id === currentUser.id) ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--dc-bg-alt)', borderRadius: '12px', border: '1px solid var(--dc-border)' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dc-text-muted)' }}>Comment évalueriez-vous notre intervention ?</div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <motion.button
                                                key={star}
                                                whileHover={{ scale: 1.2 }}
                                                whileTap={{ scale: 0.9 }}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                            >
                                                <span className="material-symbols-outlined" style={{ fontSize: 32, color: star <= (hoverRating || ratingForm.rating) ? '#fbbf24' : '#e2e8f0', transition: 'color 0.2s' }}>star</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                    <textarea
                                        value={ratingForm.feedback}
                                        onChange={(e) => setRatingForm({ ...ratingForm, feedback: e.target.value })}
                                        placeholder="Un commentaire ? (Optionnel)"
                                        rows={2}
                                        style={{ width: '100%', padding: '10px', fontSize: '11px', borderRadius: '8px', border: '1px solid var(--dc-border)', background: 'var(--dc-bg)', color: 'var(--dc-text)', resize: 'none', outline: 'none' }}
                                    />
                                    <button 
                                        onClick={() => rateMutation.mutate(ratingForm)}
                                        disabled={rateMutation.isPending || rateMutation.isSuccess || ratingForm.rating === 0}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'var(--dc-accent)', color: '#fff', fontSize: '11px', fontWeight: 700, border: 'none', cursor: (rateMutation.isPending || rateMutation.isSuccess || ratingForm.rating === 0) ? 'not-allowed' : 'pointer', opacity: (rateMutation.isPending || rateMutation.isSuccess || ratingForm.rating === 0) ? 0.6 : 1 }}
                                    >
                                        {rateMutation.isPending ? 'Envoi...' : 'Envoyer mon avis'}
                                    </button>
                                </div>
                            ) : (
                                <div style={{ fontSize: '11px', color: 'var(--dc-text-muted)', textAlign: 'center', padding: '16px', fontStyle: 'italic' }}>
                                    Le client n'a pas encore laissé d'avis.
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* ── Role-based Actions ── */}
                    {currentUser?.role === 'Admin' && ticket.status !== TICKET_STATUS.RESOLVED && onAssign && (
                        <div className="tk-drawer-section" style={{ marginTop: 'auto', paddingTop: '16px' }}>
                            <button onClick={() => onAssign(ticket)} className="tk-btn-assign" style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '13px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span> {ticket.technician ? 'Ré-assigner' : 'Assigner'} un Technicien
                            </button>
                        </div>
                    )}
                    
                    {currentUser?.role === 'Technician' && Number(ticket.technician_id) === Number(currentUser.id) && ticket.status !== TICKET_STATUS.RESOLVED && (
                        <div className="tk-drawer-section" style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '10px' }}>
                            {onResolve && (
                                <button onClick={() => onResolve(ticket)} disabled={isResolving} className="tk-btn-resolve" style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '13px' }}>
                                    {isResolving ? (
                                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: 16 }}>progress_activity</span>
                                    ) : (
                                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check_circle</span>
                                    )}
                                    Résoudre
                                </button>
                            )}
                            {onRapport && (
                                <button onClick={() => onRapport(ticket)} className="tk-btn-rapport" style={{ flex: 1, justifyContent: 'center', padding: '10px', fontSize: '13px' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit_note</span> Rédiger Rapport
                                </button>
                            )}
                        </div>
                    )}

                </div>
            </motion.div>
        </>
    );
}
