import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import ClientLayout from '../components/ClientLayout';

/* ─────────────────────────────────────────────
   CONFIG & CONSTANTS
───────────────────────────────────────────── */
import TicketCard from '../components/TicketCard';
import { STATUS_CFG, PRIORITY_CFG, fmtFull, getInitials, fmt } from '../lib/ticket-helpers';
import SharedTicketDrawer from '../components/SharedTicketDrawer';
import { TICKET_STATUS, TICKET_STATUS_LABELS, PRIORITIES, PRIORITY_LABELS } from '../constants/enums';

const CATEGORIES = ['Matériel', 'Logiciel', 'Réseau', 'Accès / Droits', 'Autre'];

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] } })
};

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

/* ─────────────────────────────────────────────
   CREATE TICKET MODAL
───────────────────────────────────────────── */
const CreateTicketModal = ({ onClose, onCreated }) => {
    const [form, setForm] = useState({ title: '', description: '', priority: PRIORITIES.MEDIUM, category: 'Logiciel' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.title.trim()) { setError('Le titre est requis.'); return; }
        setLoading(true);
        try {
            const { data } = await api.post('/tickets', form);
            onCreated(data.ticket || data.data || data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la création.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="es-modal-overlay" onClick={onClose}>
            <motion.div
                className="es-modal"
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
                <div className="es-modal-header">
                    <div className="es-modal-header-left">
                        <div className="es-modal-icon">
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
                        </div>
                        <h2>Nouveau ticket</h2>
                    </div>
                    <button onClick={onClose} className="es-btn-close">
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="es-modal-body">
                    {error && (
                        <div className="ss-inline-error">
                            <div className="ss-inline-error-accent" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} />
                            <div className="ss-inline-error-icon">
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ef4444' }}>error</span>
                            </div>
                            <span className="ss-inline-error-text">{error}</span>
                        </div>
                    )}
                    <div className="es-form-group">
                        <label>Titre du problème *</label>
                        <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                            placeholder="Ex : Disque dur non reconnu, surchauffe..." />
                    </div>
                    <div className="es-form-group">
                        <label>Description détaillée</label>
                        <textarea value={form.description} onChange={e => set('description', e.target.value)}
                            rows={4} placeholder="Veuillez décrire le problème avec le plus de précision possible..." />
                    </div>
                    <div className="es-form-row">
                        <div className="es-form-group">
                            <label>Priorité</label>
                            <select value={form.priority} onChange={e => set('priority', e.target.value)}>
                                {Object.values(PRIORITIES).map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                            </select>
                        </div>
                        <div className="es-form-group">
                            <label>Catégorie</label>
                            <select value={form.category} onChange={e => set('category', e.target.value)}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="es-modal-actions">
                        <button type="button" onClick={onClose} className="es-btn-secondary">Annuler</button>
                        <button type="submit" disabled={loading} className="es-btn-primary">
                            {loading ? (
                                <><span className="material-symbols-outlined animate-spin" style={{ fontSize: 15 }}>progress_activity</span> Envoi…</>
                            ) : (
                                <><span className="material-symbols-outlined" style={{ fontSize: 15 }}>send</span> Soumettre</>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

/* ─────────────────────────────────────────────
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
const Toast = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);
    return (
        <motion.div className="es-toast"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#10b981' }}>check_circle</span>
            {message}
            <button onClick={onClose} className="es-toast-close">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
            </button>
        </motion.div>
    );
};

/* ═════════════════════════════════════════════
   MAIN DASHBOARD CLIENT COMPONENT
═════════════════════════════════════════════ */
export default function DashboardClient() {
    const { user } = useAuth();

    /* ── State ── */
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tous');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [toast, setToast] = useState('');

    /* ── Fetch ── */
    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/tickets');
            setTickets(Array.isArray(data) ? data : data.tickets || data.data || []);
        } catch { setTickets([]); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchTickets(); }, [fetchTickets]);

    /* ── Stats ── */
    const counts = {
        total: tickets.length,
        nouveau: tickets.filter(t => t.status === TICKET_STATUS.NEW).length,
        enCours: tickets.filter(t => t.status === TICKET_STATUS.IN_PROGRESS).length,
        resolu: tickets.filter(t => t.status === TICKET_STATUS.RESOLVED).length,
    };

    /* ── Filter ── */
    const filtered = tickets.filter(t => {
        const q = searchQuery.toLowerCase();
        const matchSearch = !q || t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q) || String(t.id).includes(q);
        const matchStatus = statusFilter === 'Tous' || t.status === statusFilter;
        return matchSearch && matchStatus;
    });

    /* ── Actions ── */
    const handleCreated = (newTicket) => { setTickets(prev => [newTicket, ...prev]); setShowCreate(false); setToast('Ticket créé avec succès !'); };

    const firstName = user?.name?.split(' ')[0] || 'Client';
    const initials = getInitials(user?.name);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

    const FILTERS = [
        { key: 'Tous', label: 'Tous', count: counts.total, dot: null },
        { key: TICKET_STATUS.NEW, label: TICKET_STATUS_LABELS[TICKET_STATUS.NEW], count: counts.nouveau, dot: '#3b82f6' },
        { key: TICKET_STATUS.IN_PROGRESS, label: TICKET_STATUS_LABELS[TICKET_STATUS.IN_PROGRESS], count: counts.enCours, dot: '#f59e0b' },
        { key: TICKET_STATUS.RESOLVED, label: TICKET_STATUS_LABELS[TICKET_STATUS.RESOLVED], count: counts.resolu, dot: '#10b981' },
    ];

    return (
        <ClientLayout 
            onNewTicket={() => setShowCreate(true)} 
            onSearch={setSearchQuery} 
            searchQuery={searchQuery}
        >
            <motion.div initial="hidden" animate="visible" variants={stagger}>

                    {/* ── HERO ── */}
                    <motion.section className="es-hero" variants={fadeUp}>
                        <div className="es-hero-shimmer" />
                        <div className="es-hero-content">
                            <div>
                                <h1 className="es-hero-title">{greeting}, {firstName}</h1>
                                <p className="es-hero-subtitle">
                                    Vous avez <strong>{counts.enCours} demande{counts.enCours !== 1 ? 's' : ''}</strong> en cours de traitement.
                                </p>
                            </div>
                            <div className="es-hero-pills">
                                <div className="es-hero-pill">
                                    <span className="es-pill-num">{counts.total}</span>
                                    <span className="es-pill-label">Total</span>
                                </div>
                                <div className="es-hero-pill">
                                    <span className="es-pill-num">{counts.enCours}</span>
                                    <span className="es-pill-label">En cours</span>
                                </div>
                                <div className="es-hero-pill">
                                    <span className="es-pill-num">{counts.resolu}</span>
                                    <span className="es-pill-label">Résolu</span>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* ── FILTERS ── */}
                    <motion.div id="tickets-section" className="es-filters" variants={fadeUp} custom={1} style={{ scrollMarginTop: '80px' }}>
                        <span className="es-filter-label">Filtrer :</span>
                        {FILTERS.map(f => (
                            <button key={f.key}
                                onClick={() => setStatusFilter(f.key)}
                                className={`es-filter-pill ${statusFilter === f.key ? 'active' : ''}`}>
                                {f.dot && <span className="es-filter-dot" style={{ background: f.dot }} />}
                                {f.label}
                                <span className="es-filter-count">{f.count}</span>
                            </button>
                        ))}
                    </motion.div>

                    {/* ── CARDS GRID ── */}
                    {loading ? (
                        <div className="es-loading">
                            <span className="material-symbols-outlined animate-spin" style={{ fontSize: 30, color: '#3b82f6' }}>progress_activity</span>
                            <p>Chargement des données...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="es-empty">
                            <div className="es-empty-icon">
                                <span className="material-symbols-outlined" style={{ fontSize: 32 }}>folder_open</span>
                            </div>
                            <p className="es-empty-title">Aucun ticket trouvé</p>
                            <p className="es-empty-desc">Soumettez une nouvelle demande pour commencer.</p>
                        </div>
                    ) : (
                        <motion.div className="es-cards-grid" variants={stagger}>
                            {filtered.map((ticket, i) => (
                                <TicketCard key={ticket.id} ticket={ticket} onClick={setSelectedTicket} index={i} />
                            ))}
                        </motion.div>
                    )}
                </motion.div>

            {/* ── MODALS / DRAWERS ── */}
            <AnimatePresence>
                {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} onCreated={handleCreated} />}
            </AnimatePresence>
            <AnimatePresence>
                {selectedTicket && (
                    <SharedTicketDrawer 
                        ticket={selectedTicket} 
                        currentUser={user} 
                        onClose={() => setSelectedTicket(null)} 
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {toast && <Toast message={toast} onClose={() => setToast('')} />}
            </AnimatePresence>
        </ClientLayout>
    );
}
