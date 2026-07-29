import { motion } from 'framer-motion';
import { TICKET_STATUS, TICKET_STATUS_LABELS, PRIORITIES, PRIORITY_LABELS } from '../../constants/enums';

const fmt = (iso) =>
    iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—';

const SLA_HOURS = { [PRIORITIES.CRITICAL]: 4, [PRIORITIES.HIGH]: 12, [PRIORITIES.MEDIUM]: 48, [PRIORITIES.LOW]: 120 };

const getSlaInfo = (ticket) => {
    const maxH = SLA_HOURS[ticket.priority] ?? 48;
    const created = new Date(ticket.created_at);
    const deadline = new Date(created.getTime() + maxH * 3600000);
    const now = new Date();
    const remaining = deadline - now;
    const totalMs = maxH * 3600000;
    const percent = Math.max(0, Math.min(100, (remaining / totalMs) * 100));
    const hoursLeft = Math.max(0, Math.round(remaining / 3600000));

    let label, color, urgency;
    if (remaining <= 0) {
        label = 'Dépassé'; color = '#ef4444'; urgency = 'critical';
    } else if (remaining < 3600000 * 2) {
        label = `${Math.round(remaining / 60000)}min`; color = '#ef4444'; urgency = 'critical';
    } else if (remaining < 3600000 * 6) {
        label = `${hoursLeft}h`; color = '#f59e0b'; urgency = 'warning';
    } else {
        label = `${hoursLeft}h`; color = '#10b981'; urgency = 'ok';
    }
    return { percent, label, color, urgency };
};

const STATUS_STYLES = {
    [TICKET_STATUS.NEW]:         { bg: 'rgba(59, 130, 246, 0.1)',  color: '#3b82f6', border: 'rgba(59, 130, 246, 0.2)',  dot: '#3b82f6', label: TICKET_STATUS_LABELS[TICKET_STATUS.NEW] },
    [TICKET_STATUS.IN_PROGRESS]: { bg: 'rgba(245, 158, 11, 0.1)',  color: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)',  dot: '#f59e0b', label: TICKET_STATUS_LABELS[TICKET_STATUS.IN_PROGRESS] },
    [TICKET_STATUS.RESOLVED]:    { bg: 'rgba(16, 185, 129, 0.1)',  color: '#10b981', border: 'rgba(16, 185, 129, 0.2)',  dot: '#10b981', label: TICKET_STATUS_LABELS[TICKET_STATUS.RESOLVED] },
};

const PRIORITY_STYLES = {
    [PRIORITIES.LOW]:      { color: '#64748b', label: PRIORITY_LABELS[PRIORITIES.LOW] },
    [PRIORITIES.MEDIUM]:   { color: '#3b82f6', label: PRIORITY_LABELS[PRIORITIES.MEDIUM] },
    [PRIORITIES.HIGH]:     { color: '#f97316', label: PRIORITY_LABELS[PRIORITIES.HIGH] },
    [PRIORITIES.CRITICAL]: { color: '#ef4444', label: PRIORITY_LABELS[PRIORITIES.CRITICAL] },
};

const FILTER_OPTIONS = [
    { key: 'all',      label: 'Tous',    icon: 'list' },
    { key: 'priority', label: 'Urgents', icon: 'priority_high' },
    { key: 'newest',   label: 'Récents', icon: 'schedule' },
    { key: 'oldest',   label: 'Anciens', icon: 'history' },
];

const SlaBar = ({ ticket }) => {
    const sla = getSlaInfo(ticket);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
            <div style={{ flex: 1, height: '4px', borderRadius: '2px', background: 'var(--dc-surface-2)', overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sla.percent}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: '100%', borderRadius: '2px', background: sla.color }}
                />
            </div>
            <span style={{
                fontSize: '10px', fontWeight: 700, color: sla.color,
                minWidth: '42px', textAlign: 'right',
                animation: sla.urgency === 'critical' ? 'pulse-soft 1.5s ease-in-out infinite' : 'none'
            }}>
                {sla.label}
            </span>
        </div>
    );
};

export default function TicketTable({ filteredTickets, filter, setFilter, handleResolve, resolving }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', minWidth: 0 }}>

            {/* Quick Filters */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '12px 20px',
                background: 'var(--dc-surface)',
                border: '1px solid var(--dc-border)',
                borderBottom: 'none',
                borderRadius: '16px 16px 0 0',
            }}>
                <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16, color: 'var(--dc-text-faint)', marginRight: '4px' }}>tune</span>
                {FILTER_OPTIONS.map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '5px 12px', borderRadius: '100px',
                            border: filter === f.key ? '1px solid transparent' : '1px solid var(--dc-border-strong)',
                            background: filter === f.key ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent',
                            color: filter === f.key ? '#fff' : 'var(--dc-text-muted)',
                            fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.2s ease', fontFamily: 'inherit',
                            boxShadow: filter === f.key ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none',
                        }}
                    >
                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 14 }}>{f.icon}</span>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Active Tickets Table */}
            <div className="dc-table-card" style={{ borderRadius: '0 0 16px 16px' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--dc-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dc-text)', margin: 0 }}>Tickets Actifs</h2>
                        <p style={{ fontSize: '11px', color: 'var(--dc-text-muted)', margin: '3px 0 0' }}>
                            {filter === 'priority' ? 'Triés par priorité (urgents en premier)' :
                             filter === 'newest'   ? 'Triés du plus récent au plus ancien' :
                             filter === 'oldest'   ? 'Triés du plus ancien au plus récent' :
                             'Tickets en attente de résolution'}
                        </p>
                    </div>
                    <span style={{ padding: '4px 12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '20px', fontSize: '11px', fontWeight: 700, border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                        {filteredTickets.length} actifs
                    </span>
                </div>

                {filteredTickets.length === 0 ? (
                    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 28, color: '#10b981' }}>celebration</span>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dc-text)', marginBottom: '6px' }}>Tous les tickets sont résolus !</div>
                        <div style={{ fontSize: '13px', color: 'var(--dc-text-muted)' }}>Excellent travail ! Aucun ticket n'est en attente.</div>
                    </div>
                ) : (
                    <div className="dc-table-scroll" style={{ overflowX: 'auto' }}>
                        <table className="dc-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                            <thead>
                                <tr>
                                    {['Ticket', 'Client', 'Priorité', 'Statut', 'SLA', 'Action'].map((h, idx) => (
                                        <th key={h} className="dc-th" style={{ padding: '10px 16px', textAlign: idx === 0 ? 'left' : 'center' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.map((t, idx) => {
                                    const ss = STATUS_STYLES[t.status] ?? STATUS_STYLES[TICKET_STATUS.NEW];
                                    const ps = PRIORITY_STYLES[t.priority] ?? PRIORITY_STYLES[PRIORITIES.MEDIUM];
                                    const isUrgent = t.priority === PRIORITIES.CRITICAL || t.priority === PRIORITIES.HIGH;
                                    return (
                                        <motion.tr
                                            key={t.id}
                                            className="dc-row"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03, duration: 0.3 }}
                                            style={isUrgent ? { background: 'rgba(239, 68, 68, 0.02)' } : undefined}
                                        >
                                            <td className="dc-td" style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: isUrgent ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16, color: isUrgent ? '#ef4444' : 'var(--dc-accent)' }}>
                                                            {isUrgent ? 'priority_high' : 'confirmation_number'}
                                                        </span>
                                                    </div>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dc-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{t.title}</div>
                                                        <div style={{ fontSize: '10px', color: 'var(--dc-text-faint)', marginTop: '1px', fontFamily: "'JetBrains Mono', monospace" }}>#{t.id} · {fmt(t.created_at)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="dc-td" style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', color: 'var(--dc-text)', fontWeight: 500 }}>
                                                {t.client?.name ?? '—'}
                                            </td>
                                            <td className="dc-td" style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                <span style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: ps.color, background: `color-mix(in srgb, ${ps.color} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${ps.color} 20%, transparent)` }}>
                                                    {ps.label ?? PRIORITY_LABELS[PRIORITIES.MEDIUM]}
                                                </span>
                                            </td>
                                            <td className="dc-td" style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '100px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: ss.color, background: ss.bg, border: `1px solid ${ss.border}` }}>
                                                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: ss.dot, flexShrink: 0 }} />
                                                    {ss.label ?? TICKET_STATUS_LABELS[TICKET_STATUS.NEW]}
                                                </span>
                                            </td>
                                            <td className="dc-td" style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                <SlaBar ticket={t} />
                                            </td>
                                            <td className="dc-td" style={{ padding: '12px 16px', textAlign: 'center' }}>
                                                {t.status !== TICKET_STATUS.RESOLVED && (
                                                    <button
                                                        onClick={() => handleResolve(t)}
                                                        disabled={resolving === t.id}
                                                        className="dc-btn-create"
                                                        style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 700, background: 'linear-gradient(135deg, #10b981, #14b8a6)', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: resolving === t.id ? 0.6 : 1 }}
                                                    >
                                                        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 13 }}>
                                                            {resolving === t.id ? 'progress_activity' : 'check_circle'}
                                                        </span>
                                                        Résoudre
                                                    </button>
                                                )}
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
