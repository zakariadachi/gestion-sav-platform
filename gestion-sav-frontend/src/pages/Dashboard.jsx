import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api';
import AppLayout from '../components/AppLayout';
import { CardSkeleton } from '../components/ui/Skeletons';
import { greeting } from '../utils/helpers';
import { fadeUp } from '../utils/animations';

const initials = (name) =>
    name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() ?? '??';

const hashColor = (str = '') => {
    const colors = [
        { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
        { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
        { bg: 'rgba(29, 78, 216, 0.1)', text: '#60a5fa' },
        { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316' },
        { bg: 'rgba(236, 72, 153, 0.1)', text: '#ec4899' },
        { bg: 'rgba(20, 184, 166, 0.1)', text: '#14b8a6' },
    ];
    const i = str.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
    return colors[i];
};

const ALERTS = [
    { id: 1, icon: 'priority_high', title: 'SLA Critique : Ticket #442', desc: "Délai dépassé — serveur US-East", time: '5 min', severity: 'high' },
    { id: 2, icon: 'person_add', title: 'Nouveau client enregistré', desc: "Compte entreprise activé", time: '2h', severity: 'info' },
    { id: 3, icon: 'check_circle', title: 'Ticket #389 résolu', desc: "Confirmé par le client", time: '4h', severity: 'ok' },
];

const SEVERITY = {
    high: { bg: 'rgba(239, 68, 68, 0.1)', icon: '#ef4444', badge: 'rgba(239, 68, 68, 0.15)', badgeText: '#ef4444', label: 'Critique' },
    info: { bg: 'rgba(59, 130, 246, 0.1)', icon: '#3b82f6', badge: 'rgba(59, 130, 246, 0.15)', badgeText: '#3b82f6', label: 'Info' },
    ok: { bg: 'rgba(16, 185, 129, 0.1)', icon: '#10b981', badge: 'rgba(16, 185, 129, 0.15)', badgeText: '#10b981', label: 'OK' },
};

/* ── Stat Card with glassmorphism ── */
const StatCard = ({ icon, label, value, gradient, delay = 0 }) => (
    <motion.div
        className="dc-stat-card"
        variants={fadeUp}
        custom={delay}
        whileHover={{ y: -6, transition: { duration: 0.25 } }}
    >
        <div className="dc-stat-icon" style={{ background: gradient }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 22, color: '#fff' }}>{icon}</span>
        </div>
        <div className="dc-stat-info">
            <span className="dc-stat-value">{value}</span>
            <span className="dc-stat-label">{label}</span>
        </div>
        <div className="dc-stat-glow" style={{ background: gradient }} />
    </motion.div>
);

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ performance_techniciens: [], tickets_by_status: {}, total_tickets: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/dashboard/stats')
            .then((r) => {
                const data = r.data;
                if (!Array.isArray(data.performance_techniciens)) {
                    data.performance_techniciens = [];
                }
                setStats(data);
            })
            .catch(() => setError('Impossible de charger les statistiques.'))
            .finally(() => setLoading(false));
    }, []);

    const resRate = (tech) => Math.round((tech.tickets_resolus / (tech.total_tickets || 1)) * 100);

    const CARDS = [
        { label: 'Total Tickets', value: stats.total_tickets, icon: 'confirmation_number', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
        { label: 'Nouveaux', value: stats.tickets_by_status?.['New'] || 0, icon: 'fiber_new', gradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)' },
        { label: 'En Cours', value: stats.tickets_by_status?.['In_Progress'] || 0, icon: 'pending', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
        { label: 'Résolus', value: stats.tickets_by_status?.['Resolved'] || 0, icon: 'check_circle', gradient: 'linear-gradient(135deg, #10b981, #14b8a6)' },
        { label: 'CSAT', value: `${stats.average_csat || 0} / 5`, icon: 'star', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
    ];
    return (
        <AppLayout
            title="Tableau de bord Admin"
            subtitle="Vue d'ensemble et performances"
            actions={
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="dc-btn-secondary dc-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>calendar_today</span>
                        Aujourd'hui
                    </button>
                    <Link to="/tickets" className="dc-btn-create" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>add</span>
                        <span>Nouveau Ticket</span>
                    </Link>
                </div>
            }
        >
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.05 } } }} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Hero / Greeting */}
                <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dc-text)', margin: 0, lineHeight: 1.2 }}>
                            {greeting()}, <span style={{ color: 'var(--dc-accent)' }}>{user?.name?.split(' ')[0] ?? 'Admin'}</span>
                        </h1>
                        <p style={{ fontSize: '13px', color: 'var(--dc-text-muted)', margin: '4px 0 0' }}>Voici l'état actuel de votre support client.</p>
                    </div>
                </motion.div>

                {/* Loading state */}
                {loading && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
                        {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)}
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="ss-page-error">
                        <div className="ss-page-error-left">
                            <div className="ss-page-error-icon">
                                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 22 }}>cloud_off</span>
                            </div>
                            <div className="ss-page-error-content">
                                <div className="ss-page-error-title">Impossible de charger les données</div>
                                <div className="ss-page-error-message">{error}</div>
                            </div>
                        </div>
                        <div className="ss-page-error-actions">
                            <button className="ss-page-error-retry" onClick={() => { setError(''); setLoading(true); api.get('/dashboard/stats').then(r => { setStats(r.data); setLoading(false); }).catch(() => { setError('Impossible de charger les statistiques.'); setLoading(false); }); }}>
                                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>refresh</span>
                                Réessayer
                            </button>
                            <button className="ss-page-error-dismiss" onClick={() => setError('')}>
                                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>close</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Stats cards grid */}
                {!loading && !error && (
                    <div className="dc-stats-grid">
                        {CARDS.map((card, idx) => (
                            <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} gradient={card.gradient} delay={idx} />
                        ))}
                    </div>
                )}

                {!loading && !error && (
                    <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'start' }}>

                        {/* Left column: table */}
                        <div className="dc-table-card" style={{ gridColumn: '1 / -1' }}>
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--dc-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--dc-text)', margin: 0 }}>Performance des Techniciens</h2>
                                    <p style={{ fontSize: '12px', color: 'var(--dc-text-muted)', margin: '4px 0 0' }}>Productivité en temps réel</p>
                                </div>
                                <span style={{ padding: '4px 10px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--dc-accent)', borderRadius: '20px', fontSize: '11px', fontWeight: 600 }}>
                                    {(Array.isArray(stats?.performance_techniciens) ? stats.performance_techniciens : []).length} membres
                                </span>
                            </div>
                            <div className="dc-table-scroll" style={{ overflowX: 'auto' }}>
                                <table className="dc-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                                    <thead>
                                        <tr>
                                            {['Technicien', 'Assignés', 'En cours', 'Résolus', 'Taux'].map((h, idx) => (
                                                <th key={h} className={`dc-th ${idx !== 0 ? 'text-center' : ''}`} style={{ padding: '12px 24px', textAlign: idx === 0 ? 'left' : 'center' }}>
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(Array.isArray(stats?.performance_techniciens) ? stats.performance_techniciens : []).length === 0 ? (
                                            <tr>
                                                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', fontSize: '13px', color: 'var(--dc-text-muted)', fontStyle: 'italic' }}>
                                                    Aucun technicien trouvé.
                                                </td>
                                            </tr>
                                        ) : (
                                            (Array.isArray(stats?.performance_techniciens) ? stats.performance_techniciens : []).map((tech) => {
                                                const rate = resRate(tech);
                                                const col = hashColor(tech.name);
                                                return (
                                                    <tr key={tech.id} className="dc-row">
                                                        <td className="dc-td" style={{ padding: '16px 24px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: col.bg, color: col.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                                                                    {initials(tech.name)}
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dc-text)' }}>{tech.name}</div>
                                                                    <div style={{ fontSize: '10px', color: 'var(--dc-text-muted)', marginTop: '2px' }}>Technicien</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="dc-td" style={{ padding: '16px 24px', textAlign: 'center', fontSize: '13px', color: 'var(--dc-text)', fontWeight: 600 }}>
                                                            {tech.total_tickets}
                                                        </td>
                                                        <td className="dc-td" style={{ padding: '16px 24px', textAlign: 'center' }}>
                                                            <span style={{ padding: '4px 8px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                                                                {tech.tickets_en_cours}
                                                            </span>
                                                        </td>
                                                        <td className="dc-td" style={{ padding: '16px 24px', textAlign: 'center' }}>
                                                            <span style={{ padding: '4px 8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                                                                {tech.tickets_resolus}
                                                            </span>
                                                        </td>
                                                        <td className="dc-td" style={{ padding: '16px 24px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                                                                <div style={{ width: '60px', height: '6px', background: 'var(--dc-surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
                                                                    <div style={{ width: `${rate}%`, height: '100%', background: 'var(--dc-accent)', borderRadius: '3px' }} />
                                                                </div>
                                                                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dc-text-muted)', minWidth: '30px' }}>{rate}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Right column: side panel */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            {/* Alerts */}
                            <div className="dc-ticket-card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dc-text)' }}>Dernières Alertes</span>
                                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {(stats?.alerts || []).length}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {(!stats?.alerts || stats.alerts.length === 0) ? (
                                        <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--dc-text-muted)' }}>
                                            Aucune alerte pour le moment.
                                        </div>
                                    ) : (Array.isArray(stats?.alerts) ? stats.alerts : []).map((a) => {
                                        const isCritical = a.priority === 'Critical';
                                        const severity = isCritical ? 'high' : 'info';
                                        const s = SEVERITY[severity];
                                        const icon = isCritical ? 'priority_high' : 'person_add';
                                        const title = isCritical ? `Critique : ${a.title}` : `Non assigné : ${a.title}`;
                                        
                                        // Simple relative time calculation
                                        const diff = Math.floor((new Date() - new Date(a.created_at)) / 60000);
                                        const time = diff < 60 ? `${diff} min` : `${Math.floor(diff/60)}h`;

                                        return (
                                            <div key={a.id} style={{ display: 'flex', gap: '10px', padding: '10px', borderRadius: '10px', cursor: 'pointer', border: '1px solid var(--dc-surface-2)', background: 'var(--dc-surface)' }} onClick={() => navigate(`/tickets`)}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16, color: s.icon }}>{icon}</span>
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--dc-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</span>
                                                        <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', background: s.badge, color: s.badgeText }}>{s.label}</span>
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: 'var(--dc-text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Client : {a.client?.name}</div>
                                                    <div style={{ fontSize: '10px', color: 'var(--dc-text-faint)', marginTop: '4px' }}>Il y a {time}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Weekly report */}
                            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: '16px', padding: '20px', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: 'var(--dc-shadow-md)' }}>
                                <div style={{ position: 'absolute', top: '-16px', right: '-16px', width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 22, opacity: 0.9 }}>assessment</span>
                                        <span style={{ padding: '3px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', fontSize: '9px', fontWeight: 700 }}>Semaine {Math.ceil((new Date() - new Date(new Date().getFullYear(), 0, 1)) / 604800000)}</span>
                                    </div>
                                    <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>Rapport Hebdomadaire</div>
                                    <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '14px' }}>Performance globale de l'équipe</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: 800 }}>{stats.total_tickets}</div>
                                            <div style={{ fontSize: '9px', opacity: 0.7, textTransform: 'uppercase', marginTop: '2px' }}>Tickets traités</div>
                                        </div>
                                        <div style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px' }}>
                                            <div style={{ fontSize: '16px', fontWeight: 800 }}>
                                                {stats?.total_tickets ? Math.round(((stats.tickets_by_status?.['Resolved'] || 0) / stats.total_tickets) * 100) : 0}%
                                            </div>
                                            <div style={{ fontSize: '9px', opacity: 0.7, textTransform: 'uppercase', marginTop: '2px' }}>Taux résolution</div>
                                        </div>
                                    </div>
                                    {/* Télécharger — hidden until export feature is implemented */}
                                </div>
                            </div>

                            {/* Recent Feedback Widget */}
                            <div className="dc-ticket-card" style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dc-text)' }}>Derniers Avis Clients</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {(!stats?.recent_feedbacks || stats.recent_feedbacks.length === 0) ? (
                                        <div style={{ padding: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--dc-text-muted)' }}>
                                            Aucun avis client pour le moment.
                                        </div>
                                    ) : (Array.isArray(stats?.recent_feedbacks) ? stats.recent_feedbacks : []).map((fb) => (
                                        <div key={fb.id} style={{ display: 'flex', gap: '10px', padding: '12px', borderRadius: '10px', border: '1px solid var(--dc-surface-2)', background: 'var(--dc-surface)' }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--dc-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fb.client?.name}</span>
                                                    <div style={{ display: 'flex', gap: '2px' }}>
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <span key={s} className="material-symbols-outlined" style={{ fontSize: '14px', color: s <= fb.rating ? '#fbbf24' : '#e2e8f0' }}>star</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '12px', color: 'var(--dc-text-muted)', marginTop: '6px', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    "{fb.feedback}"
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AppLayout>
    );
}
