import { motion } from 'framer-motion';
import { fadeUp } from '../../utils/animations';

const StatCard = ({ icon, label, value, gradient, delay = 0, pulse }) => (
    <motion.div
        className="dc-stat-card"
        variants={fadeUp}
        custom={delay}
        whileHover={{ y: -6, transition: { duration: 0.25 } }}
        style={{ position: 'relative' }}
    >
        <div className="dc-stat-icon" style={{ background: gradient }}>
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 22, color: '#fff' }}>{icon}</span>
        </div>
        <div className="dc-stat-info">
            <span className="dc-stat-value">{value}</span>
            <span className="dc-stat-label">{label}</span>
        </div>
        <div className="dc-stat-glow" style={{ background: gradient }} />
        {pulse && (
            <span style={{
                position: 'absolute', top: '12px', right: '12px',
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.2)',
                animation: 'pulse-soft 1.5s ease-in-out infinite'
            }} />
        )}
    </motion.div>
);

export default function StatCards({ total, enCours, resolus, urgents, loading }) {
    const CARDS = [
        { label: 'Total Assignés', value: total,          icon: 'assignment',      gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
        { label: 'En Cours',       value: enCours,        icon: 'pending_actions', gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)' },
        { label: 'Résolus',        value: resolus,        icon: 'check_circle',    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)' },
        { label: 'Urgents',        value: urgents.length, icon: 'warning',         gradient: 'linear-gradient(135deg, #ef4444, #f97316)', pulse: urgents.length > 0 },
    ];

    if (loading) {
        return (
            <div className="dc-stats-grid">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="dc-stat-card" style={{ height: '108px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                        <div style={{ height: '10px', width: '40%', background: 'var(--dc-surface-2)', borderRadius: '5px', animation: 'pulse-soft 1.5s infinite' }} />
                        <div style={{ height: '24px', width: '60%', background: 'var(--dc-surface-2)', borderRadius: '5px', animation: 'pulse-soft 1.5s infinite' }} />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="dc-stats-grid">
            {CARDS.map((card, idx) => (
                <StatCard key={card.label} icon={card.icon} label={card.label} value={card.value} gradient={card.gradient} delay={idx} pulse={card.pulse} />
            ))}
        </div>
    );
}
