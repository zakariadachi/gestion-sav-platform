import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import StatCards from '../components/dashboard/StatCards';
import TicketTable from '../components/dashboard/TicketTable';
import { greeting } from '../utils/helpers';
import { fadeUp } from '../utils/animations';
import { TICKET_STATUS, PRIORITIES } from '../constants/enums';

/* ── Circular Progress Ring ── */
const ProgressRing = ({ percent, size = 80, stroke = 7 }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (percent / 100) * circ;
    return (
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--dc-surface-2)" strokeWidth={stroke} />
            <motion.circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke="url(#ringGrad)" strokeWidth={stroke} strokeLinecap="round"
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                strokeDasharray={circ}
            />
            <defs>
                <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
            </defs>
        </svg>
    );
};

const fmt = (iso) =>
    iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—';

export default function DashboardTechnicien() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const [resolving, setResolving] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        api.get('/tickets')
            .then((r) => setTickets(r.data?.data ?? r.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

    const handleResolve = async (ticket) => {
        setResolving(ticket.id);
        try {
            await api.patch(`/tickets/${ticket.id}/status`, { status: TICKET_STATUS.RESOLVED });
            setTickets((prev) => prev.map((t) => t.id === ticket.id ? { ...t, status: TICKET_STATUS.RESOLVED } : t));
            showToast(`Ticket #${ticket.id} marqué Résolu`);
        } catch {
            showToast('Erreur lors de la mise à jour.');
        } finally {
            setResolving(null);
        }
    };

    /* ── Computed stats ── */
    const total   = tickets.length;
    const enCours = tickets.filter((t) => t.status === TICKET_STATUS.IN_PROGRESS).length;
    const resolus = tickets.filter((t) => t.status === TICKET_STATUS.RESOLVED).length;
    const taux    = total ? Math.round((resolus / total) * 100) : 0;
    const actifs  = tickets.filter((t) => t.status !== TICKET_STATUS.RESOLVED);
    const urgents = actifs.filter((t) => t.priority === PRIORITIES.HIGH || t.priority === PRIORITIES.CRITICAL);

    /* ── Filtered & sorted tickets ── */
    const filteredTickets = useMemo(() => {
        let list = [...actifs];
        switch (filter) {
            case 'priority': {
                const order = { [PRIORITIES.CRITICAL]: 0, [PRIORITIES.HIGH]: 1, [PRIORITIES.MEDIUM]: 2, [PRIORITIES.LOW]: 3 };
                list.sort((a, b) => (order[a.priority] ?? 2) - (order[b.priority] ?? 2));
                break;
            }
            case 'newest': list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
            case 'oldest': list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); break;
            default: break;
        }
        return list;
    }, [actifs, filter]);

    /* ── Recently resolved (this week) ── */
    const recentlyResolved = useMemo(() => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return tickets
            .filter((t) => t.status === TICKET_STATUS.RESOLVED && new Date(t.updated_at || t.created_at) >= oneWeekAgo)
            .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
            .slice(0, 5);
    }, [tickets]);

    return (
        <AppLayout
            title="Mon Espace Technicien"
            subtitle="Vue personnalisée de vos interventions"
            actions={
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="dc-btn-secondary dc-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>calendar_today</span>
                        Aujourd'hui
                    </button>
                    <Link to="/tickets" className="dc-btn-create" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>list_alt</span>
                        <span>Tous mes tickets</span>
                    </Link>
                </div>
            }
        >
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                {/* ── Hero / Greeting ── */}
                <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dc-text)', margin: 0, lineHeight: 1.2 }}>
                            {greeting()}, <span style={{ color: 'var(--dc-accent)' }}>{user?.name?.split(' ')[0] ?? 'Technicien'}</span>
                        </h1>
                        <p style={{ fontSize: '13px', color: 'var(--dc-text-muted)', margin: '4px 0 0' }}>Voici l'état de vos interventions aujourd'hui.</p>
                    </div>
                </motion.div>

                {/* ── Stat Cards ── */}
                <StatCards total={total} enCours={enCours} resolus={resolus} urgents={urgents} loading={loading} />

                {/* ── Urgent Tickets Alert Banner ── */}
                {!loading && urgents.length > 0 && (
                    <motion.div
                        variants={fadeUp}
                        style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)' }}
                    >
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 20, color: '#ef4444' }}>warning</span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--dc-text)' }}>
                                {urgents.length} ticket{urgents.length > 1 ? 's' : ''} urgent{urgents.length > 1 ? 's' : ''} en attente
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--dc-text-muted)', marginTop: '2px' }}>
                                {urgents.filter(t => t.priority === PRIORITIES.CRITICAL).length > 0 && (
                                    <span style={{ color: '#ef4444', fontWeight: 700 }}>
                                        {urgents.filter(t => t.priority === PRIORITIES.CRITICAL).length} critique{urgents.filter(t => t.priority === PRIORITIES.CRITICAL).length > 1 ? 's' : ''}
                                    </span>
                                )}
                                {urgents.filter(t => t.priority === PRIORITIES.CRITICAL).length > 0 && urgents.filter(t => t.priority === PRIORITIES.HIGH).length > 0 && ' · '}
                                {urgents.filter(t => t.priority === PRIORITIES.HIGH).length > 0 && (
                                    <span style={{ color: '#f97316', fontWeight: 600 }}>
                                        {urgents.filter(t => t.priority === PRIORITIES.HIGH).length} haute{urgents.filter(t => t.priority === PRIORITIES.HIGH).length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => setFilter('priority')}
                            style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s ease', flexShrink: 0 }}
                        >
                            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 14 }}>filter_list</span>
                            Voir urgents
                        </button>
                    </motion.div>
                )}

                {/* ── Main content: 2-column layout ── */}
                {!loading && (
                    <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>

                        {/* LEFT: Table */}
                        <TicketTable
                            filteredTickets={filteredTickets}
                            filter={filter}
                            setFilter={setFilter}
                            handleResolve={handleResolve}
                            resolving={resolving}
                        />

                        {/* RIGHT: Side panels */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                            {/* Performance Ring Card */}
                            <div className="dc-ticket-card" style={{ padding: '22px', cursor: 'default' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dc-text)' }}>Performance</span>
                                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                        Temps réel
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                    <ProgressRing percent={taux} size={96} stroke={8} />
                                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                                        <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--dc-text)', letterSpacing: '-0.5px' }}>{taux}%</div>
                                        <div style={{ fontSize: '8px', fontWeight: 700, color: 'var(--dc-text-faint)', textTransform: 'uppercase', letterSpacing: '1px' }}>Résolu</div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '18px' }}>
                                    <div style={{ background: 'var(--dc-surface-2)', borderRadius: '10px', padding: '10px', textAlign: 'center', border: '1px solid var(--dc-border)' }}>
                                        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dc-text)' }}>{resolus}</div>
                                        <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--dc-text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>Résolus</div>
                                    </div>
                                    <div style={{ background: 'var(--dc-surface-2)', borderRadius: '10px', padding: '10px', textAlign: 'center', border: '1px solid var(--dc-border)' }}>
                                        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--dc-text)' }}>{enCours}</div>
                                        <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--dc-text-faint)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>En cours</div>
                                    </div>
                                </div>
                            </div>

                            {/* Recently Resolved */}
                            <div className="dc-ticket-card" style={{ padding: '22px', cursor: 'default' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dc-text)' }}>Historique récent</span>
                                    <span style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--dc-accent)' }}>
                                        7 jours
                                    </span>
                                </div>
                                {recentlyResolved.length === 0 ? (
                                    <div style={{ padding: '20px 0', textAlign: 'center' }}>
                                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 28, color: 'var(--dc-text-faint)', opacity: 0.4 }}>inbox</span>
                                        <div style={{ fontSize: '11px', color: 'var(--dc-text-faint)', marginTop: '8px' }}>Aucune résolution cette semaine</div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {recentlyResolved.map((t) => (
                                            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '10px', transition: 'background 0.15s ease', cursor: 'default' }}>
                                                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 14, color: '#10b981' }}>check_circle</span>
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dc-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                                                    <div style={{ fontSize: '10px', color: 'var(--dc-text-faint)', marginTop: '1px' }}>#{t.id} · {fmt(t.updated_at || t.created_at)}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Weekly summary gradient card */}
                            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '16px', padding: '22px', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: 'var(--dc-shadow-md)' }}>
                                <div style={{ position: 'absolute', top: '-16px', right: '-16px', width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                                <div style={{ position: 'absolute', bottom: '-24px', left: '-12px', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 22, opacity: 0.9 }}>engineering</span>
                                        <span style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', fontSize: '9px', fontWeight: 700 }}>Bilan</span>
                                    </div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Bilan Interventions</div>
                                    <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '14px' }}>Suivi de vos performances techniques</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: 800 }}>{total}</div>
                                            <div style={{ fontSize: '9px', opacity: 0.7, textTransform: 'uppercase', marginTop: '2px' }}>Total assignés</div>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: 800 }}>{taux}%</div>
                                            <div style={{ fontSize: '9px', opacity: 0.7, textTransform: 'uppercase', marginTop: '2px' }}>Taux résolution</div>
                                        </div>
                                    </div>
                                    <Link to="/tickets" style={{ textDecoration: 'none' }}>
                                        <button className="dc-btn-primary" style={{ width: '100%', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s ease' }}>
                                            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 14 }}>visibility</span>
                                            Voir tous les tickets
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* ── Toast notification ── */}
            <AnimatePresence>
                {toast && (() => {
                    const isError = toast.toLowerCase().includes('erreur');
                    const color = isError ? '#ef4444' : '#10b981';
                    const icon = isError ? 'error' : 'check_circle';
                    const title = isError ? 'ERREUR' : 'SUCCÈS';
                    const bg = isError ? 'rgba(239, 68, 68, 0.06)' : 'rgba(16, 185, 129, 0.06)';
                    const borderColor = isError ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.18)';
                    const gradient = isError ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)';
                    return (
                        <motion.div
                            initial={{ opacity: 0, x: 60, scale: 0.92 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 60, scale: 0.92 }}
                            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                            style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 44px 14px 18px', background: 'var(--dc-surface)', color: 'var(--dc-text)', borderRadius: '16px', border: `1px solid ${borderColor}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 30px -5px rgba(0,0,0,0.08)', overflow: 'hidden', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
                        >
                            <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: gradient, borderRadius: '16px 0 0 16px' }} />
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 20, color }}>{icon}</span>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color, lineHeight: 1, marginBottom: '3px' }}>{title}</div>
                                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--dc-text)', lineHeight: 1.4 }}>{toast}</div>
                            </div>
                            <button onClick={() => setToast('')} style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dc-text-faint)', transition: 'all 0.2s ease' }}>
                                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>close</span>
                            </button>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            <style>{`
                @media (max-width: 900px) {
                    .dt-main-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </AppLayout>
    );
}
