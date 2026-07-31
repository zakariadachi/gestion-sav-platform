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



/* ── Role Config ── */
const ROLE_CONFIG = {
    Admin: {
        icon: 'shield_person',
        bg: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
        badgeBg: 'rgba(124, 58, 237, 0.1)',
        badgeText: '#7c3aed',
        dotBg: '#7c3aed',
    },
    Technician: {
        icon: 'engineering',
        bg: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
        badgeBg: 'rgba(59, 130, 246, 0.1)',
        badgeText: '#3b82f6',
        dotBg: '#3b82f6',
    }
};

/* ── Status Config ── */
const STATUS_CONFIG = {
    Actif: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', dot: '#10b981', label: 'Actif' },
    Inactif: { bg: 'rgba(148, 163, 184, 0.12)', text: '#94a3b8', dot: '#94a3b8', label: 'Inactif' },
};

/* ═══════════════════════════════════════════════════════════════
   STAT CARD — same design language as Admin Dashboard
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
   MEMBER CARD — premium glassmorphic member tile
═══════════════════════════════════════════════════════════════ */
const MemberCard = ({ user, index, setDeleteModal }) => {
    const col = hashColor(user.name);
    const role = ROLE_CONFIG[user.role] || ROLE_CONFIG.Technician;
    const status = STATUS_CONFIG[user.status] || STATUS_CONFIG.Inactif;
    const rate = user.tickets ? Math.round((user.resolved / user.tickets) * 100) : 0;

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
                cursor: 'pointer',
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
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: role.bg, opacity: 0.6,
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                        width: '48px', height: '48px', borderRadius: '14px',
                        background: col.bg, color: col.text,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '15px', fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}>
                        {initials(user.name)}
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--dc-text)', lineHeight: 1.3 }}>
                            {user.name}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--dc-text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>mail</span>
                            {user.email}
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '4px 10px', borderRadius: '20px',
                    background: status.bg, fontSize: '11px', fontWeight: 600, color: status.text,
                }}>
                    <span style={{
                        width: '6px', height: '6px', borderRadius: '50%', background: status.dot,
                        boxShadow: user.status === 'Actif' ? `0 0 6px ${status.dot}` : 'none',
                        animation: user.status === 'Actif' ? 'pulse-soft 2s infinite' : 'none',
                    }} />
                    {status.label}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '5px 12px', borderRadius: '8px',
                    background: role.badgeBg, marginBottom: '16px',
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 15, color: role.badgeText }}>{role.icon}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: role.badgeText, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {user.role === 'Technician' ? 'Technicien' : user.role === 'Admin' ? 'Admin' : user.role}
                    </span>
                </div>
                <button
                    onClick={() => setDeleteModal(user)}
                    style={{
                        background: 'transparent', border: 'none', color: 'var(--dc-text-muted)',
                        cursor: 'pointer', padding: '4px'
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                </button>
            </div>

            <div style={{ marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--dc-text-muted)', fontWeight: 500 }}>Taux de résolution</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444' }}>
                        {rate}%
                    </span>
                </div>
                <div style={{
                    height: '6px', borderRadius: '3px', background: 'var(--dc-surface-2)',
                    overflow: 'hidden',
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rate}%` }}
                        transition={{ duration: 1, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                            height: '100%', borderRadius: '3px',
                            background: rate >= 80
                                ? 'linear-gradient(90deg, #10b981, #34d399)'
                                : rate >= 50
                                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                                    : 'linear-gradient(90deg, #ef4444, #f87171)',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--dc-text-faint)' }}>{user.resolved} résolus</span>
                    <span style={{ fontSize: '10px', color: 'var(--dc-text-faint)' }}>{user.tickets} assignés</span>
                </div>
            </div>
        </motion.div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function TeamManagement() {
    const [team, setTeam] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState(null);

    const [formData, setFormData] = useState({
        name: '', email: '', role: 'Technician'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formSuccess, setFormSuccess] = useState(false);
    const [formError, setFormError] = useState('');

    const [deleteModal, setDeleteModal] = useState(null);
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/users/${id}`),
        onSuccess: (_, id) => {
            setTeam(prev => prev.filter(u => u.id !== id));
            setDeleteModal(null);
            toast.success('Utilisateur supprimé avec succès.');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Erreur lors de la suppression.');
        }
    });

    useEffect(() => {
        fetchTeam(page);
    }, [page]);

    const fetchTeam = async (currentPage) => {
        setIsLoading(true);
        try {
            const res = await api.get(`/users/team?page=${currentPage}`);
            setTeam(res.data.data);
            if (res.data.meta) setMeta(res.data.meta);
        } catch (error) {
            console.error('Failed to fetch team:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const totalMembers = team.length;
    const admins = team.filter(u => u.role === 'Admin').length;
    const techs = team.filter(u => u.role === 'Technician').length;
    const activeCount = team.filter(u => u.status === 'Actif').length;

    const filteredTeam = useMemo(() => {
        return team.filter(user => {
            const matchSearch =
                (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (user.email || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchRole = filterRole === 'all' || user.role === filterRole;
            return matchSearch && matchRole;
        });
    }, [team, searchQuery, filterRole]);

    const handleOpenModal = () => { setIsModalOpen(true); setFormSuccess(false); setFormError(''); };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFormData({ name: '', email: '', role: 'Technician' });
        setFormSuccess(false);
        setFormError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError('');
        try {
            const res = await api.post('/users', {
                ...formData,
                status: 'Active'
            });
            const newUser = {
                id: res.data.data.id,
                name: res.data.data.name,
                email: res.data.data.email,
                role: res.data.data.role,
                status: 'Actif',
                tickets: 0, resolved: 0,
            };
            setTeam(prev => [newUser, ...prev]);
            setFormSuccess(true);
            setTimeout(() => handleCloseModal(), 1200);
        } catch (err) {
            const msg = err.response?.data?.message || 'Une erreur est survenue. Veuillez réessayer.';
            setFormError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const headerActions = (
        <div style={{ display: 'flex', gap: '8px' }}>
            <button className="dc-btn-secondary dc-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                Exporter
            </button>
            <button onClick={handleOpenModal} className="dc-btn-create" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                <span>Ajouter un membre</span>
            </button>
        </div>
    );

    const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

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
            title="Gestion de l'équipe"
            subtitle="Administrateurs et techniciens"
            actions={headerActions}
        >
            <motion.div
                initial="hidden" animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
            >
                <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--dc-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                            {dateStr}
                        </div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--dc-text)', margin: 0, lineHeight: 1.2 }}>
                            Votre équipe <span style={{ color: 'var(--dc-accent)' }}>interne</span> 🛡️
                        </h1>
                    </div>
                </motion.div>

                <div className="dc-stats-grid">
                    <StatCard icon="groups"           label="Total Membres"  value={totalMembers} gradient="linear-gradient(135deg, #3b82f6, #60a5fa)" delay={0} />
                    <StatCard icon="shield_person"    label="Administrateurs" value={admins}       gradient="linear-gradient(135deg, #7c3aed, #a78bfa)" delay={1} />
                    <StatCard icon="engineering"      label="Techniciens"     value={techs}        gradient="linear-gradient(135deg, #06b6d4, #22d3ee)" delay={2} />
                    <StatCard icon="radio_button_checked" label="Actifs"    value={activeCount}  gradient="linear-gradient(135deg, #10b981, #34d399)" delay={3} />
                </div>

                <motion.div variants={fadeUp} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                }}>
                    <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
                        <span className="material-symbols-outlined" style={{ ...iconPos, left: '14px' }}>search</span>
                        <input
                            type="text"
                            placeholder="Rechercher un membre..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={inputStyle}
                            onFocus={inputFocus}
                            onBlur={inputBlur}
                        />
                    </div>
                </motion.div>

                {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            border: '3px solid var(--dc-border)', borderTopColor: 'var(--dc-accent)',
                            animation: 'spin 1s linear infinite'
                        }} />
                        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : filteredTeam.length > 0 ? (
                    <motion.div
                        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                            gap: '20px',
                        }}
                    >
                        {filteredTeam.map((user, i) => (
                            <MemberCard key={user.id} user={user} index={i} setDeleteModal={setDeleteModal} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div variants={fadeUp} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        padding: '60px 24px', background: 'var(--dc-surface)', borderRadius: '16px',
                        border: '1px solid var(--dc-border)',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--dc-text-faint)', marginBottom: '12px' }}>person_search</span>
                        <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--dc-text)', marginBottom: '4px' }}>Aucun membre trouvé</p>
                    </motion.div>
                )}
            </motion.div>

            {/* ═══════════════════════════════════════
               ADD MEMBER MODAL
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
                            {/* Modal header with gradient accent */}
                            <div style={{
                                position: 'relative', padding: '24px 24px 20px',
                                borderBottom: '1px solid var(--dc-border)',
                            }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #3b82f6, #7c3aed, #ec4899)' }} />
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--dc-text)', margin: 0 }}>Ajouter un membre</h3>
                                        <p style={{ fontSize: '12px', color: 'var(--dc-text-muted)', margin: '4px 0 0' }}>Créer un nouveau compte interne</p>
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
                                        <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--dc-text)' }}>Compte créé avec succès !</p>
                                        <p style={{ fontSize: '12px', color: 'var(--dc-text-muted)' }}>Le nouveau membre a été ajouté à l'équipe.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Form */}
                            {!formSuccess && (
                                <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

                                    {/* Name */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            Nom & Prénom
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <span className="material-symbols-outlined" style={iconPos}>person</span>
                                            <input
                                                type="text" name="name" required
                                                value={formData.name} onChange={handleInputChange}
                                                placeholder="Jean Dupont"
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
                                                placeholder="jean@entreprise.com"
                                                style={inputStyle}
                                                onFocus={inputFocus} onBlur={inputBlur}
                                            />
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--dc-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            Rôle
                                        </label>
                                        <div style={{
                                            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
                                        }}>
                                            {[
                                                { value: 'Technician', icon: 'engineering', label: 'Technicien', desc: 'Résout les tickets' },
                                                { value: 'Admin', icon: 'shield_person', label: 'Administrateur', desc: 'Accès complet' },
                                            ].map(opt => {
                                                const selected = formData.role === opt.value;
                                                return (
                                                    <button
                                                        key={opt.value}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, role: opt.value }))}
                                                        style={{
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                                                            padding: '14px 12px', borderRadius: '12px', cursor: 'pointer',
                                                            border: selected ? '2px solid var(--dc-accent)' : '1.5px solid var(--dc-border)',
                                                            background: selected ? 'rgba(59, 130, 246, 0.08)' : 'var(--dc-surface-2)',
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined" style={{
                                                            fontSize: 24,
                                                            color: selected ? 'var(--dc-accent)' : 'var(--dc-text-faint)',
                                                        }}>{opt.icon}</span>
                                                        <span style={{ fontSize: '12px', fontWeight: 700, color: selected ? 'var(--dc-accent)' : 'var(--dc-text)' }}>
                                                            {opt.label}
                                                        </span>
                                                        <span style={{ fontSize: '10px', color: 'var(--dc-text-muted)' }}>{opt.desc}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Password info notice */}
                                    <div style={{
                                        display: 'flex', alignItems: 'flex-start', gap: '10px',
                                        padding: '12px 14px', borderRadius: '10px',
                                        background: 'rgba(59, 130, 246, 0.06)',
                                        border: '1px solid rgba(59, 130, 246, 0.18)',
                                    }}>
                                        <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--dc-accent)', flexShrink: 0, marginTop: '1px' }}>info</span>
                                        <p style={{ fontSize: '12px', color: 'var(--dc-text-muted)', margin: 0, lineHeight: 1.5 }}>
                                            Un email contenant le mot de passe temporaire sera envoyé automatiquement au nouvel utilisateur.
                                        </p>
                                    </div>

                                    {/* Form error */}
                                    {formError && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '10px 14px', borderRadius: '10px',
                                            background: 'rgba(239, 68, 68, 0.06)',
                                            border: '1px solid rgba(239, 68, 68, 0.2)',
                                        }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#ef4444', flexShrink: 0 }}>error</span>
                                            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>{formError}</span>
                                        </div>
                                    )}

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
                                                    Création...
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>person_add</span>
                                                    Créer le compte
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

            {/* ── DELETE MODAL ── */}
            {deleteModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', padding: '16px' }}>
                    <div style={{ background: 'var(--dc-surface)', borderRadius: '20px', padding: '24px', maxWidth: '400px', width: '100%', border: '1px solid var(--dc-border)' }}>
                        <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 12px' }}>Supprimer {deleteModal.name} ?</h3>
                        <p style={{ fontSize: '13px', color: 'var(--dc-text-muted)', marginBottom: '24px' }}>Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.</p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setDeleteModal(null)} className="dc-btn-secondary">Annuler</button>
                            <button onClick={() => deleteMutation.mutate(deleteModal.id)} className="dc-btn-danger" disabled={deleteMutation.isPending}>
                                {deleteMutation.isPending ? 'Suppression...' : 'Supprimer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
