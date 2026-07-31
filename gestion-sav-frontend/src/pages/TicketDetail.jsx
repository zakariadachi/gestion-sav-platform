import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const STORAGE_URL = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/api$/, '') + '/storage';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import echo from '../services/echo';
import Logo from '../components/Logo';
import ClientLayout from '../components/ClientLayout';
import { TicketDetailSkeleton } from '../components/ui/Skeletons';

/* ─── HELPERS ─────────────────────────────────────────────────── */
const fmtFull = (iso) =>
    iso ? new Date(iso).toLocaleString('fr-FR', {
        weekday: 'long', day: '2-digit', month: 'long',
        year: 'numeric', hour: '2-digit', minute: '2-digit',
    }) : '—';

const fmt = (iso) =>
    iso ? new Date(iso).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
    }) : '—';

import { TICKET_STATUS_LABELS, PRIORITY_LABELS, TICKET_STATUS, PRIORITIES } from '../constants/enums';
import { isOverdue, isDueSoon } from '../lib/ticket-helpers';
import { motion } from 'framer-motion';

/* ─── CONFIG & CONSTANTS ───────────────────────────────────────── */
const STATUS_CFG = {
    [TICKET_STATUS.NEW]: {
        label: 'Soumise',
        pill: 'bg-blue-50 text-blue-700 border-blue-150/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/30',
        dot: 'bg-blue-500',
        border: 'border-slate-100 dark:border-zinc-800/80',
        step: 0
    },
    [TICKET_STATUS.IN_PROGRESS]: {
        label: 'En intervention',
        pill: 'bg-amber-50 text-amber-750 border-amber-150/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/30',
        dot: 'bg-amber-500',
        border: 'border-slate-100 dark:border-zinc-800/80',
        step: 1
    },
    [TICKET_STATUS.RESOLVED]: {
        label: 'Résolue',
        pill: 'bg-emerald-50 text-emerald-700 border-emerald-150/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/30',
        dot: 'bg-emerald-500',
        border: 'border-slate-100 dark:border-zinc-800/80',
        step: 2
    },
    'Fermé': {
        label: 'Fermée',
        pill: 'bg-slate-100 text-slate-605 border-slate-200 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-700',
        dot: 'bg-slate-400',
        border: 'border-slate-100 dark:border-zinc-800/80',
        step: 3
    }
};

const PRIORITY_CFG = {
    [PRIORITIES.LOW]: {
        label: PRIORITY_LABELS[PRIORITIES.LOW],
        color: 'text-slate-500 dark:text-zinc-400',
        bg: 'bg-slate-50 dark:bg-zinc-800/50',
        border: 'border-slate-150/60 dark:border-zinc-800/30',
        icon: 'keyboard_arrow_down'
    },
    [PRIORITIES.MEDIUM]: {
        label: PRIORITY_LABELS[PRIORITIES.MEDIUM],
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        border: 'border-blue-100 dark:border-blue-900/30',
        icon: 'remove'
    },
    [PRIORITIES.HIGH]: {
        label: PRIORITY_LABELS[PRIORITIES.HIGH],
        color: 'text-orange-655 dark:text-orange-400',
        bg: 'bg-orange-50 dark:bg-orange-950/30',
        border: 'border-orange-100 dark:border-orange-900/30',
        icon: 'keyboard_arrow_up'
    },
    [PRIORITIES.CRITICAL]: {
        label: PRIORITY_LABELS[PRIORITIES.CRITICAL],
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950/30',
        border: 'border-red-100 dark:border-red-900/30',
        icon: 'priority_high'
    }
};

const TIMELINE = [
    { step: 0, label: 'Demande soumise',       icon: 'inbox',        desc: 'Votre demande a été reçue par notre équipe.'          },
    { step: 1, label: 'Technicien assigné',     icon: 'engineering',  desc: 'Un technicien a pris en charge votre demande.'        },
    { step: 2, label: 'Intervention terminée',  icon: 'check_circle', desc: 'Votre problème a été résolu et le rapport est prêt.'  },
];

/* ─── MAIN COMPONENT ────────────────────────────────────────────── */
export default function TicketDetail() {
    const { id }           = useParams();
    const { user, logout } = useAuth();
    const navigate         = useNavigate();

    /* ── Theme State ── */
    const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
    }, [isDark]);

    const [ticket, setTicket]         = useState(null);
    const [report, setReport]         = useState(null);
    const [loading, setLoading]       = useState(true);
    const [loadingReport, setLoadingReport] = useState(false);
    const [error, setError]           = useState('');
    const [lightbox, setLightbox]     = useState(null); // photo URL

    /* ── Comments / Chat State ── */
    const [comments, setComments]       = useState([]);
    const [newMessage, setNewMessage]   = useState('');
    const [sendingMsg, setSendingMsg]   = useState(false);
    const chatEndRef                    = useRef(null);
    const chatContainerRef              = useRef(null);

    /* ── Edit ticket state ── */
    const queryClient = useQueryClient();
    const [editOpen, setEditOpen]             = useState(false);
    const [editForm, setEditForm]             = useState({ title: '', description: '', priority: '' });
    const [editErrors, setEditErrors]         = useState({});

    const openEdit = () => {
        setEditForm({ title: ticket.title, description: ticket.description, priority: ticket.priority });
        setEditErrors({});
        setEditOpen(true);
    };
    const closeEdit = () => { setEditOpen(false); setEditErrors({}); };

    const editMutation = useMutation({
        mutationFn: (payload) => api.put(`/tickets/${ticket.id}`, payload).then(r => r.data?.data ?? r.data),
        onSuccess: (updated) => {
            setTicket(prev => ({ ...prev, ...updated }));
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            toast.success('Demande mise à jour avec succès.');
            closeEdit();
        },
        onError: (err) => {
            if (err.response?.status === 422) {
                const apiErrors = err.response.data?.errors ?? {};
                // Flatten: { title: ['msg'], ... } → { title: 'msg' }
                setEditErrors(Object.fromEntries(
                    Object.entries(apiErrors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
                ));
            }
            // Generic 403/other errors are handled by api.js global interceptor
        },
    });

    const handleEditSubmit = (e) => {
        e.preventDefault();
        setEditErrors({});
        editMutation.mutate(editForm);
    };

    const reopenMutation = useMutation({
        mutationFn: () => api.post(`/tickets/${ticket.id}/reopen`).then(r => r.data?.data ?? r.data),
        onSuccess: (updated) => {
            setTicket(prev => ({ ...prev, ...updated }));
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            toast.success('Demande rouverte avec succès.');
        },
        onError: () => {
            toast.error('Erreur lors de la réouverture.');
        }
    });

    const handleReopen = () => {
        if (window.confirm('Voulez-vous vraiment rouvrir cette demande ? (ex: Le problème persiste)')) {
            reopenMutation.mutate();
        }
    };

    /* ── Edit/Delete Comment State ── */
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editingCommentMsg, setEditingCommentMsg] = useState('');

    const deleteCommentMutation = useMutation({
        mutationFn: (commentId) => api.delete(`/tickets/${ticket.id}/comments/${commentId}`),
        onSuccess: (_, commentId) => {
            setComments(prev => prev.filter(c => c.id !== commentId));
            toast.success('Commentaire supprimé.');
        }
    });

    const editCommentMutation = useMutation({
        mutationFn: ({ commentId, message }) => api.put(`/tickets/${ticket.id}/comments/${commentId}`, { message }).then(r => r.data?.data ?? r.data),
        onSuccess: (updatedComment) => {
            setComments(prev => prev.map(c => c.id === updatedComment.id ? { ...c, message: updatedComment.message } : c));
            setEditingCommentId(null);
            toast.success('Commentaire modifié.');
        }
    });

    const handleEditComment = (comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentMsg(comment.message);
    };

    const submitEditComment = (commentId) => {
        if (!editingCommentMsg.trim()) return;
        editCommentMutation.mutate({ commentId, message: editingCommentMsg });
    };

    /* ── Edit Rapport State ── */
    const [isEditingRapport, setIsEditingRapport] = useState(false);
    const [editRapportForm, setEditRapportForm] = useState({ contenu: '' });

    const editRapportMutation = useMutation({
        mutationFn: (payload) => api.put(`/tickets/${ticket.id}/rapport`, payload).then(r => r.data?.data ?? r.data),
        onSuccess: (updatedRapport) => {
            setReport(updatedRapport);
            setIsEditingRapport(false);
            toast.success('Rapport modifié avec succès.');
        },
        onError: (err) => {
            if (err.response?.status === 422) {
                toast.error('Données invalides. Veuillez vérifier le contenu.');
            }
        }
    });

    const handleEditRapportSubmit = () => {
        if (!editRapportForm.contenu.trim()) {
            toast.error('Le contenu du rapport est requis.');
            return;
        }
        editRapportMutation.mutate(editRapportForm);
    };

    /* ── CSAT State ── */
    const [ratingForm, setRatingForm] = useState({ rating: 0, feedback: '' });
    const [hoverRating, setHoverRating] = useState(0);
    const [localRating, setLocalRating] = useState(null);
    const [localFeedback, setLocalFeedback] = useState(null);

    const rateMutation = useMutation({
        mutationFn: (payload) => api.post(`/tickets/${ticket.id}/rate`, payload).then(r => r.data?.data ?? r.data),
        onSuccess: (updatedTicket, variables) => {
            setLocalRating(variables.rating);
            setLocalFeedback(variables.feedback);
            setTicket(prev => ({ ...prev, ...updatedTicket }));
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            toast.success('Merci pour votre évaluation !');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'évaluation.');
        }
    });

    const handleRateSubmit = (e) => {
        e.preventDefault();
        if (ratingForm.rating < 1 || ratingForm.rating > 5) {
            toast.error('Veuillez sélectionner une note entre 1 et 5 étoiles.');
            return;
        }
        rateMutation.mutate(ratingForm);
    };

    /* fetch ticket */
    useEffect(() => {
        const controller = new AbortController();
        
        api.get(`/tickets/${id}`, { signal: controller.signal })
            .then((r) => setTicket(r.data?.data ?? r.data))
            .catch((e) => {
                if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
                    setError('Ticket introuvable ou accès non autorisé.');
                }
            })
            .finally(() => setLoading(false));
            
        return () => controller.abort();
    }, [id]);

    /* fetch report once ticket is resolved */
    useEffect(() => {
        if (!ticket || ticket.status !== TICKET_STATUS.RESOLVED) return;
        
        const controller = new AbortController();
        setLoadingReport(true);
        
        api.get(`/tickets/${ticket.id}/rapport`, { signal: controller.signal })
            .then((r) => setReport(r.data?.data ?? r.data))
            .catch((e) => {
                if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
                    setReport(null);
                }
            })
            .finally(() => setLoadingReport(false));
            
        return () => controller.abort();
    }, [ticket]);

    /* ── Fetch comments ── */
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
            setComments((prev) => {
                if (prev.some((c) => c.id === incoming.id)) return prev;
                return [...prev, incoming];
            });
        });

        return () => {
            echo.leave(`ticket.${ticket.id}`);
        };
    }, [ticket]);

    /* ── Auto-scroll chat ── */
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);

    /* ── Send message ── */
    const handleSendMessage = async () => {
        const msg = newMessage.trim();
        if (!msg || sendingMsg || !ticket) return;
        setSendingMsg(true);
        try {
            const res = await api.post(`/tickets/${ticket.id}/comments`, { message: msg });
            setComments(prev => [...prev, res.data?.data ?? res.data]);
            setNewMessage('');
        } catch (e) {
            console.error('Erreur envoi message:', e);
        } finally {
            setSendingMsg(false);
        }
    };

    /* ── Chat time helper ── */
    const chatTimeAgo = (iso) => {
        if (!iso) return '';
        const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
        if (diff < 60)    return "À l'instant";
        if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
        return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const initials = (name = '') =>
        name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '??';

    /* ── Loading skeleton ── */
    const displayRating = localRating || ticket?.rating;
    const displayFeedback = localFeedback || ticket?.feedback;

    if (loading) return (
        <ClientLayout>
            <TicketDetailSkeleton />
        </ClientLayout>
    );

    /* ── Error state ── */
    if (error) return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 flex items-center justify-center font-sans">
            <div className="text-center p-10 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 rounded-2xl shadow-xl max-w-md">
                <span className="material-symbols-outlined text-[48px] text-red-500 mb-3 block">error</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mb-2">{error}</div>
                <Link to="/client" className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">← Retour au portail</Link>
            </div>
        </div>
    );

    const s = STATUS_CFG[ticket.status]    ?? STATUS_CFG[TICKET_STATUS.NEW];
    const p = PRIORITY_CFG[ticket.priority] ?? PRIORITY_CFG[PRIORITIES.MEDIUM];

    return (
        <ClientLayout>
            <div className="max-w-7xl mx-auto px-6 py-8 w-full flex flex-col gap-6 animate-slide-up" style={{ marginTop: '20px' }}>

                {/* ── Hero card ── */}
                <div className={`bg-white dark:bg-zinc-900 rounded-2xl border ${s.border} shadow-sm overflow-hidden`}>
                    {/* color bar */}
                    <div className={`h-1 ${s.dot}`} />
                    <div className="p-6 md:px-8 md:py-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="min-w-0">
                                {/* badges row */}
                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <span className="text-xs font-mono text-slate-400 dark:text-zinc-500">Demande #{ticket.id}</span>
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight border ${s.pill}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                        {s.label}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight border ${p.border} ${p.bg} ${p.color}`}>
                                        <span className="material-symbols-outlined text-[13px]">{p.icon}</span>
                                        {PRIORITY_LABELS[ticket.priority] ?? PRIORITY_LABELS[PRIORITIES.MEDIUM]}
                                    </span>
                                </div>
                                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-2 tracking-tight">
                                    {ticket.title}
                                </h1>
                                <div className="text-xs text-slate-450 dark:text-zinc-500 font-semibold">Soumis le {fmtFull(ticket.created_at)}</div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-3 self-start md:self-center">
                                {ticket.status === TICKET_STATUS.RESOLVED && (
                                    <button 
                                        onClick={handleReopen} 
                                        disabled={reopenMutation.isPending}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 dark:bg-orange-950/30 dark:hover:bg-orange-900/40 dark:border-orange-900/50 dark:text-orange-400 rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer disabled:opacity-60"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">
                                            {reopenMutation.isPending ? 'progress_activity' : 'refresh'}
                                        </span>
                                        Rouvrir la demande
                                    </button>
                                )}
                                <Link to="/client" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-300 transition-colors shadow-sm cursor-pointer">
                                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                    Retour au portail
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Main content: 2 columns on wide, 1 on narrow ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                    {/* Left column */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Description */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/85 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 20 }}>description</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Description de la demande</span>
                                {/* Edit button — only visible when ticket is still 'New' */}
                                {ticket.status === TICKET_STATUS.NEW && !editOpen && (
                                    <button
                                        onClick={openEdit}
                                        title="Modifier la demande"
                                        className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                                        Modifier
                                    </button>
                                )}
                            </div>
                            <div className="p-6 text-xs text-slate-700 dark:text-zinc-350 leading-relaxed whitespace-pre-wrap">
                                {ticket.description || <span className="text-slate-400 dark:text-zinc-500 italic">Aucune description fournie.</span>}
                            </div>
                        </div>

                        {/* ── Inline Edit Form (only when ticket.status === 'New') ── */}
                        {editOpen && (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-blue-200 dark:border-blue-800/60 shadow-md overflow-hidden animate-slide-up">
                                {/* Header */}
                                <div className="px-5 py-4 border-b border-blue-100 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/60 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/10 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 20 }}>edit_note</span>
                                    <span className="text-sm font-bold text-blue-900 dark:text-blue-200">Modifier la demande</span>
                                    <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-[10px] font-black uppercase tracking-wider">En attente</span>
                                    <button
                                        onClick={closeEdit}
                                        disabled={editMutation.isPending}
                                        className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 dark:text-zinc-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                                    </button>
                                </div>

                                {/* Form */}
                                <form onSubmit={handleEditSubmit} className="p-6 flex flex-col gap-5">
                                    {/* Title */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Titre <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.title}
                                            onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                                            maxLength={255}
                                            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium bg-slate-50 dark:bg-zinc-800/60 text-slate-900 dark:text-white outline-none transition-all focus:ring-2 ${
                                                editErrors.title
                                                    ? 'border-red-300 dark:border-red-700 focus:ring-red-200 dark:focus:ring-red-900/40'
                                                    : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-200 dark:focus:ring-blue-900/40 focus:border-blue-400 dark:focus:border-blue-600'
                                            }`}
                                        />
                                        {editErrors.title && (
                                            <span className="text-[11px] text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>error</span>
                                                {editErrors.title}
                                            </span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={editForm.description}
                                            onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                                            rows={5}
                                            maxLength={10000}
                                            style={{ resize: 'vertical', minHeight: '100px' }}
                                            className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium bg-slate-50 dark:bg-zinc-800/60 text-slate-900 dark:text-white outline-none transition-all focus:ring-2 font-sans ${
                                                editErrors.description
                                                    ? 'border-red-300 dark:border-red-700 focus:ring-red-200 dark:focus:ring-red-900/40'
                                                    : 'border-slate-200 dark:border-zinc-700 focus:ring-blue-200 dark:focus:ring-blue-900/40 focus:border-blue-400 dark:focus:border-blue-600'
                                            }`}
                                        />
                                        {editErrors.description && (
                                            <span className="text-[11px] text-red-600 dark:text-red-400 font-semibold flex items-center gap-1">
                                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>error</span>
                                                {editErrors.description}
                                            </span>
                                        )}
                                    </div>

                                    {/* Priority */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-wider">Priorité</label>
                                        <select
                                            value={editForm.priority}
                                            onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))}
                                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-sm font-medium bg-slate-50 dark:bg-zinc-800/60 text-slate-900 dark:text-white outline-none transition-all focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/40 focus:border-blue-400 dark:focus:border-blue-600"
                                        >
                                            {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                                                <option key={val} value={val}>{label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-3 pt-1">
                                        <button
                                            type="submit"
                                            disabled={editMutation.isPending}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-black rounded-xl transition-colors shadow-sm"
                                        >
                                            {editMutation.isPending ? (
                                                <>
                                                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: 15 }}>progress_activity</span>
                                                    Enregistrement…
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>save</span>
                                                    Enregistrer
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeEdit}
                                            disabled={editMutation.isPending}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 disabled:opacity-60 text-slate-600 dark:text-zinc-300 text-xs font-bold rounded-xl transition-colors"
                                        >
                                            Annuler
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800/80 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800/85 flex items-center gap-2">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 20 }}>timeline</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">Suivi de l'intervention</span>
                            </div>
                            <div className="p-6 md:p-8 flex flex-col gap-0">
                                {TIMELINE.map((item, idx) => {
                                    const done    = s.step > item.step;
                                    const current = s.step === item.step;
                                    const pending = s.step < item.step;
                                    return (
                                        <div key={idx} className="flex gap-4 relative">
                                            {/* Vertical line */}
                                            {idx < TIMELINE.length - 1 && (
                                                <div className={`absolute left-[15px] top-[32px] bottom-[-8px] w-0.5 ${done ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-zinc-800'} z-0`} />
                                            )}
                                            {/* Icon */}
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${done ? 'bg-emerald-500 text-white' : current ? `${s.dot} text-white ring-4 ring-blue-500/20 dark:ring-blue-500/10` : 'bg-slate-100 dark:bg-zinc-800 text-slate-350 dark:text-zinc-650'}`}>
                                                {done
                                                    ? <span className="material-symbols-outlined text-[16px]">check</span>
                                                    : <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                                                }
                                            </div>
                                            {/* Content */}
                                            <div className={`flex-1 ${idx < TIMELINE.length - 1 ? 'pb-6' : ''}`}>
                                                <div className={`text-xs md:text-sm font-bold mb-1 flex items-center flex-wrap gap-2 ${pending ? 'text-slate-400 dark:text-zinc-500' : 'text-slate-900 dark:text-white'}`}>
                                                    {item.label}
                                                    {current && (
                                                        <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border ${s.pill}`}>En cours</span>
                                                    )}
                                                    {done && (
                                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50">Terminé</span>
                                                    )}
                                                </div>
                                                <div className={`text-xs leading-relaxed ${pending ? 'text-slate-350 dark:text-zinc-600' : 'text-slate-500 dark:text-zinc-400'} font-medium`}>
                                                    {item.desc}
                                                </div>
                                                {/* Show technician on step 1 */}
                                                {item.step === 1 && (done || current) && ticket.technician && (
                                                    <div className="inline-flex items-center gap-2 mt-3 p-2 bg-slate-50 dark:bg-zinc-850/40 border border-slate-100 dark:border-zinc-800/50 rounded-xl">
                                                        <div className="w-5.5 h-5.5 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-[9px] font-black text-blue-755 dark:text-blue-400 shadow-sm">
                                                            {ticket.technician.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">{ticket.technician.name}</span>
                                                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold">• Technicien assigné</span>
                                                    </div>
                                                )}
                                                {/* Show resolved date on step 2 */}
                                                {item.step === 2 && done && (
                                                    <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-bold flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                        Résolu le {fmt(ticket.updated_at)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ── Chat / Commentaires ── */}
                        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '520px', background: 'var(--dc-bg-alt)', borderRadius: '12px', border: '1px solid var(--dc-border)', overflow: 'hidden' }}>
                            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--dc-border)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--dc-bg)', flexShrink: 0 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--dc-accent)' }}>chat</span>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dc-text)' }}>Messagerie</span>
                                <span style={{ marginLeft: 'auto', background: 'var(--dc-accent-subtle)', color: 'var(--dc-accent)', padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 800 }}>
                                    {comments.length}
                                </span>
                            </div>

                            {/* Messages area */}
                            <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '200px' }}>
                                {comments.length === 0 && (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--dc-text-muted)', textAlign: 'center', padding: '32px 0' }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 24, marginBottom: '8px', opacity: 0.5 }}>forum</span>
                                        <span style={{ fontSize: '12px', fontWeight: 600 }}>Aucun message</span>
                                    </div>
                                )}

                                {comments.map((c) => {
                                    const isMe = c.user_id === user?.id;
                                    const initials2 = (c.user?.name || '?').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
                                    return (
                                        <div key={c.id} style={{ display: 'flex', gap: '8px', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', group: 'true' }} className="group">
                                            {!isMe && (
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--dc-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: 'var(--dc-text-muted)', flexShrink: 0 }}>
                                                    {initials2}
                                                </div>
                                            )}
                                            <div style={{ maxWidth: '75%', padding: '10px 12px', borderRadius: '16px', borderBottomRightRadius: isMe ? '4px' : '16px', borderBottomLeftRadius: !isMe ? '4px' : '16px', background: isMe ? 'var(--dc-accent)' : 'var(--dc-bg)', color: isMe ? '#fff' : 'var(--dc-text)', border: isMe ? 'none' : '1px solid var(--dc-border)', position: 'relative' }}>
                                                
                                                {!isMe && (
                                                    <div style={{ fontSize: '10px', fontWeight: 700, marginBottom: '4px', color: 'var(--dc-accent)' }}>
                                                        {c.user?.name || 'Utilisateur'}
                                                        {c.user?.role && (
                                                            <span style={{ marginLeft: '6px', fontSize: '9px', fontWeight: 500, opacity: 0.7 }}>• {c.user.role}</span>
                                                        )}
                                                    </div>
                                                )}

                                                {editingCommentId === c.id ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
                                                        <textarea
                                                            value={editingCommentMsg}
                                                            onChange={(e) => setEditingCommentMsg(e.target.value)}
                                                            className="w-full text-xs p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 outline-none focus:ring-1 focus:ring-white/30"
                                                            rows={2}
                                                            style={{ resize: 'none' }}
                                                        />
                                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                                            <button onClick={() => setEditingCommentId(null)} className="px-2 py-1 text-[10px] rounded hover:bg-white/10 transition-colors">Annuler</button>
                                                            <button onClick={() => submitEditComment(c.id)} disabled={editCommentMutation.isPending} className="px-2 py-1 text-[10px] bg-white text-blue-600 font-bold rounded hover:bg-slate-100 transition-colors flex items-center gap-1">
                                                                {editCommentMutation.isPending && <span className="material-symbols-outlined animate-spin text-[12px]">progress_activity</span>}
                                                                Enregistrer
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div style={{ fontSize: '12px', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{c.message}</div>
                                                        <div style={{ fontSize: '9px', fontWeight: 600, marginTop: '6px', textAlign: isMe ? 'right' : 'left', color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--dc-text-muted)' }}>
                                                            {chatTimeAgo(c.created_at)}
                                                            {c.created_at !== c.updated_at && <span className="ml-1 opacity-70">(modifié)</span>}
                                                        </div>
                                                        
                                                        {/* Action Buttons */}
                                                        {isMe && (
                                                            <div className="absolute top-2 -left-16 hidden group-hover:flex items-center gap-1">
                                                                <button onClick={() => handleEditComment(c)} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors shadow-sm" title="Modifier">
                                                                    <span className="material-symbols-outlined text-[13px]">edit</span>
                                                                </button>
                                                                <button onClick={() => { if(window.confirm('Voulez-vous vraiment supprimer ce commentaire ?')) deleteCommentMutation.mutate(c.id); }} disabled={deleteCommentMutation.isPending} className="w-6 h-6 flex items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors shadow-sm" title="Supprimer">
                                                                    <span className="material-symbols-outlined text-[13px]">delete</span>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input bar */}
                            <div style={{ padding: '12px', borderTop: '1px solid var(--dc-border)', background: 'var(--dc-bg)', flexShrink: 0 }}>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
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
                                        disabled={!newMessage.trim() || sendingMsg}
                                        style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--dc-accent)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: (!newMessage.trim() || sendingMsg) ? 'not-allowed' : 'pointer', opacity: (!newMessage.trim() || sendingMsg) ? 0.5 : 1, flexShrink: 0 }}
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

                        {/* Rapport d'intervention */}
                        {ticket.status === TICKET_STATUS.RESOLVED && (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-emerald-100/80 dark:border-emerald-900/30 shadow-sm overflow-hidden">
                                <div className="px-5 py-4 border-b border-emerald-100 dark:border-emerald-900/50 bg-gradient-to-r from-emerald-50/40 to-emerald-100/10 dark:from-emerald-950/20 dark:to-emerald-900/10 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400" style={{ fontSize: 20 }}>task_alt</span>
                                    <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Rapport d'Intervention</span>
                                    {(user?.role === 'Admin' || user?.id === ticket.technician_id) && !isEditingRapport && report && (
                                        <button onClick={() => { setEditRapportForm({ contenu: report.contenu }); setIsEditingRapport(true); }} className="ml-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors">
                                            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                                            Modifier
                                        </button>
                                    )}
                                    <span className="ml-auto px-2.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider">Résolu</span>
                                </div>

                                {loadingReport && (
                                    <div className="p-6 flex items-center gap-2.5 text-slate-400 dark:text-zinc-500 text-xs font-semibold">
                                        <span className="material-symbols-outlined animate-spin text-blue-500" style={{ fontSize: 16 }}>progress_activity</span>
                                        Chargement du rapport…
                                    </div>
                                )}

                                {!loadingReport && !report && (
                                    <div className="p-5 text-xs font-semibold text-amber-800 dark:text-amber-350 bg-amber-50/50 dark:bg-amber-950/10">
                                        Le rapport n'est pas encore disponible.
                                    </div>
                                )}

                                {!loadingReport && report && (
                                    <div className="p-6 flex flex-col gap-5">
                                        {/* Contenu */}
                                        <div>
                                            <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 text-left uppercase tracking-wider mb-2">Résumé de l'intervention</div>
                                            {isEditingRapport ? (
                                                <div className="flex flex-col gap-3 mt-2 animate-slide-up">
                                                    <textarea 
                                                        value={editRapportForm.contenu}
                                                        onChange={(e) => setEditRapportForm({ contenu: e.target.value })}
                                                        rows={6}
                                                        className="w-full px-4 py-3 text-xs bg-emerald-50/20 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all font-medium"
                                                        placeholder="Description de l'intervention..."
                                                    />
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => setIsEditingRapport(false)} disabled={editRapportMutation.isPending} className="px-4 py-2 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-zinc-800 dark:text-zinc-400 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                                                            Annuler
                                                        </button>
                                                        <button onClick={handleEditRapportSubmit} disabled={editRapportMutation.isPending} className="px-4 py-2 text-[11px] font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm">
                                                            {editRapportMutation.isPending && <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>}
                                                            Enregistrer
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-slate-800 dark:text-zinc-200 leading-relaxed p-4 bg-emerald-50/20 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/60 dark:border-emerald-900/30 whitespace-pre-wrap font-medium">
                                                    {report.contenu}
                                                </div>
                                            )}
                                        </div>

                                        {/* Technicien + date */}
                                        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-850/50 rounded-xl border border-slate-100 dark:border-zinc-800/40">
                                            <span className="material-symbols-outlined text-slate-400 dark:text-zinc-500" style={{ fontSize: 18 }}>engineering</span>
                                            <div>
                                                <div className="text-xs font-bold text-slate-700 dark:text-zinc-250">{ticket.technician?.name ?? '—'}</div>
                                                <div className="text-[10px] text-slate-450 dark:text-zinc-500 font-semibold mt-0.5">Rapport soumis le {fmt(report.created_at ?? ticket.updated_at)}</div>
                                            </div>
                                        </div>

                                        {/* Photo gallery */}
                                        {report.photos?.length > 0 && (
                                            <div>
                                                <div className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[16px]">photo_library</span>
                                                    {report.photos.length} photo{report.photos.length > 1 ? 's' : ''} jointe{report.photos.length > 1 ? 's' : ''}
                                                </div>
                                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                    {report.photos.map((path, i) => (
                                                        <div
                                                            key={i}
                                                            onClick={() => setLightbox(`${STORAGE_URL}/${path}`)}
                                                            className="rounded-xl overflow-hidden border border-emerald-100 dark:border-emerald-900/50 aspect-square cursor-zoom-in bg-emerald-50/20 hover:scale-105 hover:shadow-md transition-all duration-300"
                                                        >
                                                            <img
                                                                src={`${STORAGE_URL}/${path}`}
                                                                alt={`photo-${i + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CSAT (Customer Satisfaction) */}
                        {ticket.status === TICKET_STATUS.RESOLVED && (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-blue-100/80 dark:border-blue-900/30 shadow-sm overflow-hidden mt-6">
                                <div className="px-5 py-4 border-b border-blue-100 dark:border-blue-900/50 bg-gradient-to-r from-blue-50/40 to-blue-100/10 dark:from-blue-950/20 dark:to-blue-900/10 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400" style={{ fontSize: 20 }}>star_rate</span>
                                    <span className="text-sm font-bold text-blue-800 dark:text-blue-300">Évaluation du service</span>
                                </div>
                                <div className="p-6 flex flex-col gap-5">
                                    {displayRating ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span key={star} className="material-symbols-outlined text-[32px]" style={{ color: star <= displayRating ? '#fbbf24' : '#e2e8f0' }}>
                                                        star
                                                    </span>
                                                ))}
                                            </div>
                                            {displayFeedback && (
                                                <div className="w-full text-xs text-slate-700 dark:text-zinc-300 italic text-center p-4 bg-slate-50 dark:bg-zinc-850 rounded-xl border border-slate-100 dark:border-zinc-800">
                                                    "{displayFeedback}"
                                                </div>
                                            )}
                                        </div>
                                    ) : (user?.role === 'Client' && ticket.client_id === user.id) ? (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="text-xs font-semibold text-slate-500 dark:text-zinc-400">Comment évalueriez-vous notre intervention ?</div>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <motion.button
                                                        key={star}
                                                        whileHover={{ scale: 1.2 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onMouseLeave={() => setHoverRating(0)}
                                                        onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                                                        className="focus:outline-none transition-colors"
                                                    >
                                                        <span 
                                                            className="material-symbols-outlined text-[40px]" 
                                                            style={{ 
                                                                color: star <= (hoverRating || ratingForm.rating) ? '#fbbf24' : '#e2e8f0',
                                                                transition: 'color 0.2s ease-in-out'
                                                            }}
                                                        >
                                                            star
                                                        </span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={ratingForm.feedback}
                                                onChange={(e) => setRatingForm({ ...ratingForm, feedback: e.target.value })}
                                                placeholder="Un commentaire ? (Optionnel)"
                                                rows={3}
                                                className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-zinc-850 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 outline-none focus:ring-2 focus:ring-blue-400/50 transition-all font-medium mt-2"
                                            />
                                            <button 
                                                onClick={handleRateSubmit} 
                                                disabled={rateMutation.isPending || rateMutation.isSuccess || ratingForm.rating === 0} 
                                                className="mt-2 w-full px-4 py-3 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {rateMutation.isPending && <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>}
                                                Envoyer mon avis
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-400 dark:text-zinc-500 text-center italic">
                                            Le client n'a pas encore laissé d'avis.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right column — ticket info */}
                    <div className="flex flex-col gap-6">

                        {/* Status card */}
                        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-zinc-800/85">
                                <span className="text-[10px] font-black text-slate-400 dark:text-zinc-550 uppercase tracking-wider">Informations</span>
                            </div>
                            <div className="p-5 flex flex-col gap-4">
                                {[
                                    { label: 'Statut',      value: TICKET_STATUS_LABELS[ticket.status],                    icon: 'info'           },
                                    { label: 'Priorité',    value: PRIORITY_LABELS[ticket.priority] ?? PRIORITY_LABELS[PRIORITIES.MEDIUM],      icon: 'flag'           },
                                    { label: 'Client',      value: ticket.client?.name ?? '—',        icon: 'person'         },
                                    { label: 'Technicien',  value: ticket.technician?.name ?? 'Non assigné', icon: 'engineering' },
                                    { label: 'Créé le',     value: fmt(ticket.created_at),            icon: 'calendar_today' },
                                    { label: 'Mis à jour',  value: fmt(ticket.updated_at),            icon: 'update'         },
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
                                    <div key={label} className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-zinc-850/60 flex items-center justify-center flex-shrink-0 border border-slate-100/50 dark:border-zinc-800/20">
                                            <span className="material-symbols-outlined text-slate-400 dark:text-zinc-500" style={{ fontSize: 15 }}>{icon}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[9px] font-bold text-slate-450 dark:text-zinc-550 uppercase tracking-wider mb-0.5">{label}</div>
                                            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">{value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Need help card */}
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-650 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-white/5" />
                            <span className="material-symbols-outlined text-[24px] opacity-90 block mb-2">support_agent</span>
                            <div className="text-sm font-bold mb-1.5">Besoin d'aide ?</div>
                            <div className="text-xs opacity-80 mb-4.5 leading-relaxed font-medium">
                                Notre équipe est disponible pour répondre à vos questions.
                            </div>
                            <Link to="/client" className="w-full bg-white/15 border border-white/20 hover:bg-white/20 text-white text-xs font-bold py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer">
                                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                                Mes demandes
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Lightbox ── */}
            {lightbox && (
                <div
                    onClick={() => setLightbox(null)}
                    className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 cursor-zoom-out animate-modal"
                >
                    <button onClick={() => setLightbox(null)} className="absolute top-5 right-5 bg-white/10 hover:bg-white/20 border-none rounded-full w-9 h-9 flex items-center justify-center cursor-pointer text-white transition-colors">
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                    </button>
                    <img src={lightbox} alt="Aperçu photo d'intervention" className="max-w-[90vw] max-h-[85vh] rounded-xl shadow-2xl object-contain" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </ClientLayout>
    );
}
