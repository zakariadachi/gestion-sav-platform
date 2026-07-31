import { useState, useMemo, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import api from '../services/api';

/* ─── Animation Variants ─── */
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    })
};

const initials = (name) =>
    name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() ?? '??';

const hashColor = (str = '') => {
    const colors = [
        { bg: 'linear-gradient(135deg, #3b82f6, #60a5fa)', text: '#fff' },
        { bg: 'linear-gradient(135deg, #10b981, #34d399)', text: '#fff' },
        { bg: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', text: '#fff' },
        { bg: 'linear-gradient(135deg, #f59e0b, #fbbf24)', text: '#fff' },
        { bg: 'linear-gradient(135deg, #ec4899, #f472b6)', text: '#fff' },
        { bg: 'linear-gradient(135deg, #14b8a6, #2dd4bf)', text: '#fff' },
    ];
    const i = str.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
    return colors[i];
};

/* ─── Status / Ticket Badge Config ─── */
const STATUS_CONFIG = {
    Active:   { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', dot: '#10b981', label: 'Actif' },
    Inactive: { bg: 'rgba(148, 163, 184, 0.12)', text: '#94a3b8', dot: '#94a3b8', label: 'Inactif' },
};

/* ═══════════════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════════════ */
const StatCard = ({ icon, label, value, gradient, delay = 0 }) => (
    <motion.div
        className="dc-stat-card"
        variants={fadeUp}
        custom={delay}
        whileHover={{ y: -6, transition: { duration: 0.25 } }}
    >
        <div className="dc-stat-icon" style={{ background: gradient }}>
            <span className="material-symbols-outlined" style={{ fontSize: 22, color: '#fff' }}>{icon}</span>
        </div>
        <div className="dc-stat-info">
            <span className="dc-stat-value">{value}</span>
            <span className="dc-stat-label">{label}</span>
        </div>
        <div className="dc-stat-glow" style={{ background: gradient }} />
    </motion.div>
);

/* ═══════════════════════════════════════════════════════════════
   CLIENT CARD
═══════════════════════════════════════════════════════════════ */
const ClientCard = ({ client, index, onView, onEdit, setDeleteModal }) => {
    const col = hashColor(client.name);
    const status = STATUS_CONFIG[client.status] || STATUS_CONFIG.Inactif;
    const ticketUrgent = client.openTickets >= 3;

    return (
        <motion.div
            variants={fadeUp}
            custom={index}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            style={{
                background: 'var(--dc-surface)',
                border: '1px solid var(--dc-border)',
                borderRadius: '16px',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'box-shadow 0.3s, border-color 0.3s',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = 'var(--dc-shadow-lg)';
                e.currentTarget.style.borderColor = 'var(--dc-border-strong)';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--dc-border)';
            }}
        >
            {/* Top accent */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: 'linear-gradient(90deg, #3b82f6, #06b6d4)', opacity: 0.5,
            }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '14px',
                        background: col.bg, color: col.text,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '15px', fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}>
                        {initials(client.name)}
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dc-text)', lineHeight: 1.3 }}>
                            {client.name}
                        </div>
                        {client.company && (
                            <div style={{ fontSize: '12px', color: 'var(--dc-text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>domain</span>
                                {client.company}
                            </div>
                        )}
                    </div>
                </div>

                {/* Status pill */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '4px 10px', borderRadius: '20px',
                    background: status.bg, fontSize: '11px', fontWeight: 600, color: status.text,
                }}>
                    <span style={{
                        width: '6px', height: '6px', borderRadius: '50%', background: status.dot,
                        boxShadow: client.status === 'Active' ? `0 0 6px ${status.dot}` : 'none',
                        animation: client.status === 'Active' ? 'pulse-soft 2s infinite' : 'none',
                    }} />
                    {status.label}
                </div>
            </div>

            {/* Contact info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--dc-text-muted)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--dc-text-faint)' }}>mail</span>
                    {client.email}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--dc-text-muted)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: 'var(--dc-text-faint)' }}>phone</span>
                    {client.phone}
                </div>
            </div>

            {/* Bottom row: tickets + actions */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: '14px', borderTop: '1px solid var(--dc-border)',
            }}>
                {/* Open tickets badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '5px 12px', borderRadius: '8px',
                        background: ticketUrgent ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                    }}>
                        <span className="material-symbols-outlined" style={{
                            fontSize: 15,
                            color: ticketUrgent ? '#ef4444' : 'var(--dc-accent)',
                        }}>confirmation_number</span>
                        <span style={{
                            fontSize: '12px', fontWeight: 700,
                            color: ticketUrgent ? '#ef4444' : 'var(--dc-accent)',
                        }}>
                            {client.openTickets}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--dc-text-faint)' }}>
                            ticket{client.openTickets !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                        onClick={() => onView?.(client)}
                        style={{
                            width: '34px', height: '34px', borderRadius: '10px',
                            background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--dc-text-muted)', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--dc-surface-2)'; e.currentTarget.style.color = 'var(--dc-text-muted)'; e.currentTarget.style.borderColor = 'var(--dc-border)'; }}
                        title="Voir détails"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>visibility</span>
                    </button>
                    <button
                        onClick={() => onEdit?.(client)}
                        style={{
                            width: '34px', height: '34px', borderRadius: '10px',
                            background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--dc-text-muted)', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.color = '#7c3aed'; e.currentTarget.style.borderColor = '#7c3aed'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--dc-surface-2)'; e.currentTarget.style.color = 'var(--dc-text-muted)'; e.currentTarget.style.borderColor = 'var(--dc-border)'; }}
                        title="Modifier"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>edit</span>
                    </button>
                    <button
                        onClick={() => setDeleteModal?.(client)}
                        style={{
                            width: '34px', height: '34px', borderRadius: '10px',
                            background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--dc-text-muted)', transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--dc-surface-2)'; e.currentTarget.style.color = 'var(--dc-text-muted)'; e.currentTarget.style.borderColor = 'var(--dc-border)'; }}
                        title="Supprimer"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: 17 }}>delete</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function ClientManagement() {
    const [clients, setClients] = useState([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);

    // View & Edit state
    const [viewClient, setViewClient] = useState(null);
    const [editClient, setEditClient] = useState(null);
    const [editFormData, setEditFormData] = useState({ company: '', name: '', email: '', phone: '', status: 'Active' });
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        company: '', name: '', email: '', phone: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);

    const [deleteModal, setDeleteModal] = useState(null);
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/users/${id}`),
        onSuccess: (_, id) => {
            setClients(prev => prev.filter(c => c.id !== id));
            setDeleteModal(null);
            toast.success('Client supprimé avec succès.');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Erreur lors de la suppression.');
        }
    });

    useEffect(() => {
        fetchClients(page);
    }, [page]);

    const fetchClients = async (currentPage) => {
        setIsLoadingClients(true);
        try {
            const res = await api.get(`/users/clients?page=${currentPage}`);
            setClients(res.data.data);
            if (res.data.meta) setMeta(res.data.meta);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        } finally {
            setIsLoadingClients(false);
        }
    };

    // Computed stats
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'Active').length;
    const totalOpenTickets = clients.reduce((sum, c) => sum + c.openTickets, 0);
    const companiesCount = new Set(clients.map(c => c.company).filter(Boolean)).size;

    // Filtered list
    const filteredClients = useMemo(() => {
        return clients.filter(c => {
            const matchSearch =
                (c.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.company || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchStatus = filterStatus === 'all' || c.status === filterStatus;
            return matchSearch && matchStatus;
        });
    }, [clients, searchQuery, filterStatus]);

    const handleOpenModal = () => { setIsModalOpen(true); setFormSuccess(false); };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ company: '', name: '', email: '', phone: '' });
        setFormSuccess(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('/users', {
                ...formData,
                role: 'Client',
                status: 'Active'
            });
            
            const newClient = {
                id: res.data.data.id,
                name: res.data.data.name,
                company: formData.company,
                email: res.data.data.email,
                phone: res.data.data.phone,
                openTickets: 0,
                status: 'Active',
            };
            setClients(prev => [newClient, ...prev]);
            setFormSuccess(true);
            setTimeout(() => handleCloseModal(), 1200);
        } catch (error) {
            console.error('Failed to create client:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    /* ── Topbar Actions ── */
    const headerActions = (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button className="dc-btn-secondary dc-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                Exporter
            </button>
            <button onClick={handleOpenModal} className="dc-btn-create" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                <span>Nouveau Client</span>
            </button>
        </div>
    );

    const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

    /* ─── Input styles ─── */
    const inputStyle = {
        width: '100%',
        padding: '11px 14px 11px 42px',
        background: 'var(--dc-surface-2)',
        border: '1px solid var(--dc-border)',
        borderRadius: '10px',
        fontSize: '13px',
        color: 'var(--dc-text)',
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
    };
    const inputFocus = (e) => {
        e.target.style.borderColor = 'var(--dc-accent)';
        e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
    };
    const inputBlur = (e) => {
        e.target.style.borderColor = 'var(--dc-border)';
        e.target.style.boxShadow = 'none';
    };
    const iconPos = { position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: 'var(--dc-text-faint)', fontSize: '18px', pointerEvents: 'none' };

    return (
        <AppLayout
            title="Gestion des Clients"
            subtitle="Portefeuille clients et contacts"
            actions={headerActions}
        >
            <motion.div
                initial="hidden" animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
                {/* ── Greeting ── */}
                <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--dc-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                            {dateStr}
                        </div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dc-text)', margin: 0, lineHeight: 1.2 }}>
                            Portefeuille <span style={{ color: 'var(--dc-accent)' }}>Clients</span> 🏢
                        </h1>
                        <p style={{ fontSize: '13px', color: 'var(--dc-text-muted)', margin: '4px 0 0' }}>
                            Vue d'ensemble de vos clients et de leurs tickets de support.
                        </p>
                    </div>
                </motion.div>

                {/* ── Stats Cards ── */}
                <div className="dc-stats-grid">
                    <StatCard icon="groups"               label="Total Clients"     value={totalClients}     gradient="linear-gradient(135deg, #3b82f6, #60a5fa)" delay={0} />
                    <StatCard icon="domain"               label="Entreprises"       value={companiesCount}   gradient="linear-gradient(135deg, #8b5cf6, #a78bfa)" delay={1} />
                    <StatCard icon="confirmation_number"  label="Tickets Ouverts"   value={totalOpenTickets}  gradient="linear-gradient(135deg, #f59e0b, #fbbf24)" delay={2} />
                    <StatCard icon="radio_button_checked" label="Actifs"            value={activeClients}    gradient="linear-gradient(135deg, #10b981, #34d399)" delay={3} />
                </div>

                {/* ── Filters ── */}
                <motion.div variants={fadeUp} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                }}>
                    {/* Search */}
                    <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
                        <span className="material-symbols-outlined" style={{ ...iconPos, left: '14px' }}>search</span>
                        <input
                            type="text"
                            placeholder="Rechercher un client, email ou entreprise..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={inputStyle}
                            onFocus={inputFocus}
                            onBlur={inputBlur}
                        />
                    </div>

                    {/* Filter pills */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {[
                            { key: 'all', label: 'Tous', icon: 'tune' },
                            { key: 'Active', label: 'Actifs', icon: 'check_circle' },
                            { key: 'Inactive', label: 'Inactifs', icon: 'cancel' },
                        ].map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilterStatus(f.key)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    padding: '7px 14px', borderRadius: '20px',
                                    border: filterStatus === f.key ? '1.5px solid var(--dc-accent)' : '1.5px solid var(--dc-border)',
                                    background: filterStatus === f.key ? 'rgba(59, 130, 246, 0.1)' : 'var(--dc-surface)',
                                    color: filterStatus === f.key ? 'var(--dc-accent)' : 'var(--dc-text-muted)',
                                    fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: 15 }}>{f.icon}</span>
                                {f.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* ── Client Cards Grid ── */}
                {isLoadingClients ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            border: '3px solid var(--dc-border)', borderTopColor: 'var(--dc-accent)',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                        <p style={{ marginTop: '16px', color: 'var(--dc-text-muted)', fontSize: '14px', fontWeight: 500 }}>Chargement des clients...</p>
                    </div>
                ) : filteredClients.length > 0 ? (
                    <motion.div
                        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                            gap: '20px',
                        }}
                    >
                        {filteredClients.map((client, i) => (
                            <ClientCard key={client.id} client={client} index={i}
                                onView={(c) => setViewClient(c)}
                                onEdit={(c) => { setEditClient(c); setEditFormData({ company: c.company || '', name: c.name || '', email: c.email || '', phone: c.phone || '', status: c.status || 'Active' }); }}
                                setDeleteModal={setDeleteModal}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div variants={fadeUp} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '60px 24px', background: 'var(--dc-surface)', borderRadius: '16px',
                        border: '1px solid var(--dc-border)',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--dc-text-faint)', marginBottom: '12px' }}>person_search</span>
                        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--dc-text)', marginBottom: '4px' }}>Aucun client trouvé</p>
                        <p style={{ fontSize: '12px', color: 'var(--dc-text-muted)' }}>Essayez un autre filtre ou ajoutez un nouveau client.</p>
                    </motion.div>
                )}

                {/* ── Pagination ── */}
                {meta && meta.last_page > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                        <div style={{ fontSize: '13px', color: 'var(--dc-text-faint)' }}>
                            Page <strong>{meta.current_page}</strong> sur <strong>{meta.last_page}</strong>
                            <span style={{ marginLeft: 8 }}>(Total: {meta.total})</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                style={{
                                    padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--dc-border)',
                                    background: page === 1 ? 'var(--dc-bg)' : 'var(--dc-surface)',
                                    color: page === 1 ? 'var(--dc-text-faint)' : 'var(--dc-text)',
                                    cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600,
                                }}
                            >
                                Précédent
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                disabled={page === meta.last_page}
                                style={{
                                    padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--dc-border)',
                                    background: page === meta.last_page ? 'var(--dc-bg)' : 'var(--dc-surface)',
                                    color: page === meta.last_page ? 'var(--dc-text-faint)' : 'var(--dc-text)',
                                    cursor: page === meta.last_page ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600,
                                }}
                            >
                                Suivant
                            </button>
                        </div>
                    </div>
                )}

            </motion.div>

            {/* ═══════════════════════════════════════
               ADD CLIENT MODAL
            ═══════════════════════════════════════ */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleCloseModal}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                position: 'relative', width: '100%', maxWidth: '480px',
                                background: 'var(--dc-surface)', borderRadius: '20px',
                                boxShadow: 'var(--dc-shadow-xl)', overflow: 'hidden',
                                border: '1px solid var(--dc-border)',
                            }}
                        >
                            {/* Modal header */}
                            <div style={{
                                position: 'relative', padding: '24px 24px 20px',
                                borderBottom: '1px solid var(--dc-border)',
                            }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #10b981)' }} />
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--dc-text)', margin: 0 }}>Nouveau Client</h3>
                                        <p style={{ fontSize: '12px', color: 'var(--dc-text-muted)', margin: '4px 0 0' }}>Ajouter un client à votre portefeuille</p>
                                    </div>
                                    <button onClick={handleCloseModal} style={{
                                        width: '36px', height: '36px', borderRadius: '10px',
                                        background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: 'var(--dc-text-muted)', transition: 'all 0.2s',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--dc-surface-2)'; e.currentTarget.style.color = 'var(--dc-text-muted)'; }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                                    </button>
                                </div>
                            </div>

                            {/* Success state */}
                            <AnimatePresence>
                                {formSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        style={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            padding: '48px 24px', gap: '12px',
                                        }}
                                    >
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                                            style={{
                                                width: '64px', height: '64px', borderRadius: '50%',
                                                background: 'rgba(16, 185, 129, 0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: 32, color: '#10b981', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                        </motion.div>
                                        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dc-text)' }}>Client ajouté avec succès !</p>
                                        <p style={{ fontSize: '12px', color: 'var(--dc-text-muted)' }}>Le client a été ajouté à votre portefeuille.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Form */}
                            {!formSuccess && (
                                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

                                    {/* Company */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            Nom de l'entreprise <span style={{ opacity: 0.5, fontWeight: 400 }}>(optionnel)</span>
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <span className="material-symbols-outlined" style={iconPos}>domain</span>
                                            <input
                                                type="text" name="company"
                                                value={formData.company} onChange={handleInputChange}
                                                placeholder="Acme Corporation"
                                                style={inputStyle}
                                                onFocus={inputFocus} onBlur={inputBlur}
                                            />
                                        </div>
                                    </div>

                                    {/* Full Name */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            Nom complet du contact
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <span className="material-symbols-outlined" style={iconPos}>person</span>
                                            <input
                                                type="text" name="name" required
                                                value={formData.name} onChange={handleInputChange}
                                                placeholder="Sophie Martin"
                                                style={inputStyle}
                                                onFocus={inputFocus} onBlur={inputBlur}
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            Adresse Email
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <span className="material-symbols-outlined" style={iconPos}>mail</span>
                                            <input
                                                type="email" name="email" required
                                                value={formData.email} onChange={handleInputChange}
                                                placeholder="sophie@entreprise.com"
                                                style={inputStyle}
                                                onFocus={inputFocus} onBlur={inputBlur}
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            Numéro de téléphone
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <span className="material-symbols-outlined" style={iconPos}>phone</span>
                                            <input
                                                type="tel" name="phone" required
                                                value={formData.phone} onChange={handleInputChange}
                                                placeholder="+33 6 12 34 56 78"
                                                style={inputStyle}
                                                onFocus={inputFocus} onBlur={inputBlur}
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                                        gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--dc-border)', marginTop: '4px',
                                    }}>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="dc-btn-secondary"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="dc-btn-primary"
                                            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="material-symbols-outlined" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }}>progress_activity</span>
                                                    Ajout en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                                                    Ajouter le client
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ═══════════════════════════════════════
               VIEW DETAIL DRAWER
            ═══════════════════════════════════════ */}
            <AnimatePresence>
                {viewClient && (() => {
                    const col = hashColor(viewClient.name);
                    const status = STATUS_CONFIG[viewClient.status] || STATUS_CONFIG.Inactif;
                    return (
                        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setViewClient(null)}
                                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
                            />
                            <motion.div
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                style={{
                                    position: 'relative', width: '100%', maxWidth: '420px',
                                    background: 'var(--dc-surface)', borderLeft: '1px solid var(--dc-border)',
                                    boxShadow: 'var(--dc-shadow-xl)', display: 'flex', flexDirection: 'column',
                                    overflow: 'hidden',
                                }}
                            >
                                <div style={{ position: 'relative', padding: '24px', borderBottom: '1px solid var(--dc-border)' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #10b981)' }} />
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--dc-text)', margin: 0 }}>Détails du Client</h3>
                                        <button onClick={() => setViewClient(null)} style={{
                                            width: '36px', height: '36px', borderRadius: '10px',
                                            background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', color: 'var(--dc-text-muted)', transition: 'all 0.2s',
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--dc-surface-2)'; e.currentTarget.style.color = 'var(--dc-text-muted)'; }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                                        </button>
                                    </div>
                                </div>
                                <div style={{ padding: '24px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', paddingBottom: '20px', borderBottom: '1px solid var(--dc-border)' }}>
                                        <div style={{
                                            width: '72px', height: '72px', borderRadius: '20px',
                                            background: col.bg, color: col.text,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '22px', fontWeight: 700,
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                        }}>
                                            {initials(viewClient.name)}
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--dc-text)' }}>{viewClient.name}</div>
                                            {viewClient.company && (
                                                <div style={{ fontSize: '13px', color: 'var(--dc-text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                                    <span className="material-symbols-outlined" style={{ fontSize: 15 }}>domain</span>
                                                    {viewClient.company}
                                                </div>
                                            )}
                                        </div>
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '5px',
                                            padding: '5px 14px', borderRadius: '20px',
                                            background: status.bg, fontSize: '12px', fontWeight: 600, color: status.text,
                                        }}>
                                            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: status.dot, boxShadow: viewClient.status === 'Active' ? `0 0 6px ${status.dot}` : 'none' }} />
                                            {viewClient.status}
                                        </div>
                                    </div>
                                    {[
                                        { icon: 'mail', label: 'Email', value: viewClient.email },
                                        { icon: 'phone', label: 'Téléphone', value: viewClient.phone },
                                        { icon: 'confirmation_number', label: 'Tickets ouverts', value: `${viewClient.openTickets} ticket${viewClient.openTickets !== 1 ? 's' : ''}` },
                                    ].map(row => (
                                        <div key={row.icon} style={{
                                            display: 'flex', alignItems: 'center', gap: '14px',
                                            padding: '14px 16px', borderRadius: '12px',
                                            background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)',
                                        }}>
                                            <div style={{
                                                width: '40px', height: '40px', borderRadius: '10px',
                                                background: 'rgba(59,130,246,0.08)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                            }}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--dc-accent)' }}>{row.icon}</span>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--dc-text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</div>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--dc-text)', marginTop: '2px' }}>{row.value}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--dc-border)', display: 'flex', gap: '8px' }}>
                                    <button
                                        onClick={() => { setViewClient(null); setEditClient(viewClient); setEditFormData({ company: viewClient.company || '', name: viewClient.name, email: viewClient.email, phone: viewClient.phone, status: viewClient.status }); }}
                                        className="dc-btn-primary"
                                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                                        Modifier
                                    </button>
                                    <button onClick={() => setViewClient(null)} className="dc-btn-secondary" style={{ flex: 1 }}>
                                        Fermer
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    );
                })()}
            </AnimatePresence>

            {/* ═══════════════════════════════════════
               EDIT CLIENT MODAL
            ═══════════════════════════════════════ */}
            <AnimatePresence>
                {editClient && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 55, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setEditClient(null)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                                position: 'relative', width: '100%', maxWidth: '480px',
                                background: 'var(--dc-surface)', borderRadius: '20px',
                                boxShadow: 'var(--dc-shadow-xl)', overflow: 'hidden',
                                border: '1px solid var(--dc-border)',
                            }}
                        >
                            <div style={{ position: 'relative', padding: '24px 24px 20px', borderBottom: '1px solid var(--dc-border)' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #7c3aed, #a78bfa, #c4b5fd)' }} />
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--dc-text)', margin: 0 }}>Modifier le client</h3>
                                        <p style={{ fontSize: '12px', color: 'var(--dc-text-muted)', margin: '4px 0 0' }}>{editClient.name}</p>
                                    </div>
                                    <button onClick={() => setEditClient(null)} style={{
                                        width: '36px', height: '36px', borderRadius: '10px',
                                        background: 'var(--dc-surface-2)', border: '1px solid var(--dc-border)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: 'var(--dc-text-muted)', transition: 'all 0.2s',
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--dc-surface-2)'; e.currentTarget.style.color = 'var(--dc-text-muted)'; }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                                    </button>
                                </div>
                            </div>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                setIsEditSubmitting(true);
                                try {
                                    await api.put(`/users/${editClient.id}`, {
                                        name: editFormData.name,
                                        email: editFormData.email,
                                        status: editFormData.status
                                    });
                                    setClients(prev => prev.map(c =>
                                        c.id === editClient.id
                                            ? { ...c, name: editFormData.name, company: editFormData.company, email: editFormData.email, phone: editFormData.phone, status: editFormData.status }
                                            : c
                                    ));
                                    setEditClient(null);
                                } catch (error) {
                                    console.error('Failed to update client', error);
                                } finally {
                                    setIsEditSubmitting(false);
                                }
                            }} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Entreprise</label>
                                    <div style={{ position: 'relative' }}>
                                        <span className="material-symbols-outlined" style={iconPos}>domain</span>
                                        <input type="text" value={editFormData.company} onChange={e => setEditFormData(p => ({ ...p, company: e.target.value }))} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nom complet</label>
                                    <div style={{ position: 'relative' }}>
                                        <span className="material-symbols-outlined" style={iconPos}>person</span>
                                        <input type="text" required value={editFormData.name} onChange={e => setEditFormData(p => ({ ...p, name: e.target.value }))} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
                                    <div style={{ position: 'relative' }}>
                                        <span className="material-symbols-outlined" style={iconPos}>mail</span>
                                        <input type="email" required value={editFormData.email} onChange={e => setEditFormData(p => ({ ...p, email: e.target.value }))} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Téléphone</label>
                                    <div style={{ position: 'relative' }}>
                                        <span className="material-symbols-outlined" style={iconPos}>phone</span>
                                        <input type="tel" required value={editFormData.phone} onChange={e => setEditFormData(p => ({ ...p, phone: e.target.value }))} style={inputStyle} onFocus={inputFocus} onBlur={inputBlur} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Statut</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        {['Active', 'Inactive'].map(s => {
                                            const sel = editFormData.status === s;
                                            const cfg = STATUS_CONFIG[s];
                                            return (
                                                <button key={s} type="button" onClick={() => setEditFormData(p => ({ ...p, status: s }))} style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', cursor: 'pointer',
                                                    border: sel ? `2px solid ${cfg.text}` : '1.5px solid var(--dc-border)', background: sel ? cfg.bg : 'var(--dc-surface-2)', transition: 'all 0.2s',
                                                }}>
                                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.dot }} />
                                                    <span style={{ fontSize: '12px', fontWeight: 700, color: sel ? cfg.text : 'var(--dc-text-muted)' }}>{s}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: '1px solid var(--dc-border)', marginTop: '4px' }}>
                                    <button type="button" onClick={() => setEditClient(null)} className="dc-btn-secondary">Annuler</button>
                                    <button type="submit" disabled={isEditSubmitting} className="dc-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {isEditSubmitting ? (
                                            <>
                                                <span className="material-symbols-outlined" style={{ fontSize: 16, animation: 'spin 1s linear infinite' }}>progress_activity</span>
                                                Sauvegarde...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>save</span>
                                                Enregistrer
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── DELETE MODAL ── */}
            {deleteModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '16px' }}>
                    <div style={{ background: 'var(--dc-surface)', borderRadius: '20px', padding: '24px', maxWidth: '400px', width: '100%', border: '1px solid var(--dc-border)' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 12px' }}>Supprimer {deleteModal.name} ?</h3>
                        <p style={{ fontSize: '13px', color: 'var(--dc-text-muted)', marginBottom: '24px' }}>Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setDeleteModal(null)} className="dc-btn-secondary">Annuler</button>
                            <button onClick={() => deleteMutation.mutate(deleteModal.id)} className="dc-btn-danger" disabled={deleteMutation.isPending}>
                                {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </AppLayout>
    );
}
