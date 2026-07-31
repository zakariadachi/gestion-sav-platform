import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ClientLayout from '../components/ClientLayout';
import api from '../services/api';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] } })
};

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

export default function ClientReports() {
    const [stats, setStats] = useState([]);
    const [chartData, setChartData] = useState({ months: [], data: [] });
    const [breakdown, setBreakdown] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await api.get('/client/reports');
                setStats(res.data.stats || []);
                setChartData(res.data.chart || { months: [], data: [] });
                setBreakdown(res.data.breakdown || []);
            } catch (error) {
                console.error("Erreur lors du chargement des rapports", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const MAX_TICKETS = chartData.data.length > 0 ? Math.max(...chartData.data) : 1;

    return (
        <ClientLayout>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
                
                {/* ── HERO ── */}
                <motion.section className="es-hero" variants={fadeUp} style={{ marginBottom: '32px' }}>
                    <div className="es-hero-shimmer" />
                    <div className="es-hero-content">
                        <div>
                            <p className="es-hero-date">RAPPORTS & ANALYSES</p>
                            <h1 className="es-hero-title">Aperçu de vos demandes</h1>
                            <p className="es-hero-subtitle">
                                Suivez vos indicateurs de support et le volume de vos tickets.
                            </p>
                        </div>
                    </div>
                </motion.section>

                {loading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: '32px', marginBottom: '16px' }}>progress_activity</span>
                        <p>Calcul des statistiques...</p>
                    </div>
                ) : (
                    <>
                        {/* ── STATS ROW ── */}
                        <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                            {stats.map((stat, i) => (
                                <motion.div 
                                    key={i} 
                                    variants={fadeUp} 
                                    className="es-ticket-card"
                                    style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '24px' }}
                                >
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {stat.label}
                                    </span>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                                        <span style={{ fontSize: '36px', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
                                            {stat.value}
                                        </span>
                                        {stat.trend !== '' && (
                                            <span style={{ 
                                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                fontSize: '12px', fontWeight: 700, padding: '4px 8px', borderRadius: '100px',
                                                background: stat.trendUp ? '#d1fae5' : '#fef2f2',
                                                color: stat.trendUp ? '#059669' : '#dc2626',
                                                marginBottom: '4px'
                                            }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                                    {stat.trendUp ? 'trending_down' : 'trending_up'}
                                                </span>
                                                {stat.trend}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* ── CHARTS ROW ── */}
                        <motion.div variants={fadeUp} custom={2} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                            
                            {/* Bar Chart Mock */}
                            <div className="es-ticket-card" style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: '0 0 24px' }}>Volume de tickets (6 derniers mois)</h3>
                                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #e2e8f0' }}>
                                    {chartData.data.map((val, i) => {
                                        const heightPct = MAX_TICKETS > 0 ? (val / MAX_TICKETS) * 100 : 0;
                                        return (
                                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8' }}>{val}</span>
                                                <motion.div 
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${heightPct}%` }}
                                                    transition={{ duration: 0.8, delay: 0.2 + (i * 0.1), ease: [0.22, 1, 0.36, 1] }}
                                                    style={{ 
                                                        width: '100%', maxWidth: '40px', background: '#3b82f6', borderRadius: '6px 6px 0 0',
                                                        opacity: i === chartData.data.length - 1 ? 1 : 0.4
                                                    }} 
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                                    {chartData.months.map((m, i) => (
                                        <span key={i} style={{ flex: 1, textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{m}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Breakdown Mock */}
                            <div className="es-ticket-card" style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: '0 0 24px' }}>Répartition par priorité</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {breakdown.map((item, i) => {
                                        const colorMap = {
                                            'Low': '#10b981',
                                            'Medium': '#3b82f6',
                                            'High': '#f59e0b',
                                            'Critical': '#ef4444',
                                        };
                                        const itemColor = colorMap[item.label] || '#8b5cf6';
                                        return (
                                            <div key={i}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                                                    <span style={{ color: '#475569' }}>{item.label}</span>
                                                    <span style={{ color: '#1e293b' }}>{item.pct}%</span>
                                                </div>
                                                <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '100px', overflow: 'hidden' }}>
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${item.pct}%` }}
                                                        transition={{ duration: 0.8, delay: 0.4 + (i * 0.1), ease: [0.22, 1, 0.36, 1] }}
                                                        style={{ height: '100%', background: itemColor, borderRadius: '100px' }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {breakdown.length === 0 && (
                                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                                            Aucune donnée disponible.
                                        </div>
                                    )}
                                </div>
                            </div>

                        </motion.div>
                    </>
                )}
            </motion.div>
        </ClientLayout>
    );
}
