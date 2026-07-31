import { useState, useMemo, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

/* ─── Animation Variants ─── */
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
    })
};

/* ─── Category Config ─── */
const CATEGORIES = [
    'Accès & Sécurité',
    'Matériel & Équipement',
    'Réseau & Internet',
    'Logiciels & OS',
    'Facturation',
    'Général',
];

const CATEGORY_ICONS = {
    'Accès & Sécurité': { icon: 'key', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
    'Matériel & Équipement': { icon: 'memory', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
    'Réseau & Internet': { icon: 'router', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
    'Logiciels & OS': { icon: 'terminal', gradient: 'linear-gradient(135deg, #10b981, #34d399)' },
    'Facturation': { icon: 'receipt_long', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)' },
    'Général': { icon: 'description', gradient: 'linear-gradient(135deg, #64748b, #94a3b8)' },
};

const fmt = (iso) =>
    iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

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
   TOAST
═══════════════════════════════════════════════════════════════ */
const Toast = ({ message, type = 'success', onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);

    const cfg = type === 'success'
        ? { icon: 'check_circle', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
        : { icon: 'error', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            style={{
                position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
                background: 'var(--dc-surface)', border: '1px solid var(--dc-border)',
                borderRadius: '14px', padding: '14px 20px',
                display: 'flex', alignItems: 'center', gap: '10px',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                fontSize: '13px', fontWeight: 600, color: 'var(--dc-text)',
            }}
        >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: cfg.color }}>{cfg.icon}</span>
            {message}
        </motion.div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   ARTICLE MODAL
═══════════════════════════════════════════════════════════════ */
const ArticleModal = ({ isOpen, onClose, onSubmit, initial = null, saving }) => {
    const [form, setForm] = useState({ title: '', category: CATEGORIES[0], desc: '', content: '', icon: '' });

    useEffect(() => {
        if (initial) {
            setForm({
                title: initial.title || '',
                category: initial.category || CATEGORIES[0],
                desc: initial.desc || '',
                content: initial.content || '',
                icon: initial.icon || '',
            });
        } else {
            setForm({ title: '', category: CATEGORIES[0], desc: '', content: '', icon: '' });
        }
    }, [initial, isOpen]);

    const handleChange = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(form);
    };

    if (!isOpen) return null;

    const isEdit = !!initial;

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{
                    position: 'relative', zIndex: 201,
                    width: '100%', maxWidth: '640px', maxHeight: '90vh',
                    background: 'var(--dc-surface)', border: '1px solid var(--dc-border)',
                    borderRadius: '20px', overflow: 'hidden',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '24px 28px 20px', borderBottom: '1px solid var(--dc-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20, color: '#fff' }}>
                                {isEdit ? 'edit_note' : 'post_add'}
                            </span>
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--dc-text)' }}>
                                {isEdit ? 'Modifier l\'article' : 'Nouvel article'}
                            </h3>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--dc-text-muted)' }}>
                                {isEdit ? 'Modifiez les champs nécessaires' : 'Remplissez les informations de l\'article'}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                        background: 'var(--dc-hover)', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', color: 'var(--dc-text-muted)',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: '24px 28px', overflowY: 'auto', maxHeight: 'calc(90vh - 160px)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        {/* Title */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dc-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Titre *
                            </label>
                            <input
                                type="text"
                                required
                                value={form.title}
                                onChange={handleChange('title')}
                                placeholder="Ex: Comment réinitialiser son mot de passe ?"
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                                    border: '1px solid var(--dc-border)', background: 'var(--dc-bg)',
                                    fontSize: '14px', color: 'var(--dc-text)', outline: 'none',
                                    transition: 'border-color 0.2s',
                                    boxSizing: 'border-box',
                                }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = 'var(--dc-border)'}
                            />
                        </div>

                        {/* Category + Icon */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dc-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Catégorie *
                                </label>
                                <select
                                    required
                                    value={form.category}
                                    onChange={handleChange('category')}
                                    style={{
                                        width: '100%', padding: '10px 14px', borderRadius: '10px',
                                        border: '1px solid var(--dc-border)', background: 'var(--dc-bg)',
                                        fontSize: '14px', color: 'var(--dc-text)', outline: 'none',
                                        cursor: 'pointer', boxSizing: 'border-box',
                                    }}
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dc-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Icône (Material)
                                </label>
                                <input
                                    type="text"
                                    value={form.icon}
                                    onChange={handleChange('icon')}
                                    placeholder="Ex: key, memory, router"
                                    style={{
                                        width: '100%', padding: '10px 14px', borderRadius: '10px',
                                        border: '1px solid var(--dc-border)', background: 'var(--dc-bg)',
                                        fontSize: '14px', color: 'var(--dc-text)', outline: 'none',
                                        boxSizing: 'border-box',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dc-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Description courte
                            </label>
                            <input
                                type="text"
                                value={form.desc}
                                onChange={handleChange('desc')}
                                placeholder="Résumé en une phrase..."
                                style={{
                                    width: '100%', padding: '10px 14px', borderRadius: '10px',
                                    border: '1px solid var(--dc-border)', background: 'var(--dc-bg)',
                                    fontSize: '14px', color: 'var(--dc-text)', outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--dc-text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Contenu *
                            </label>
                            <textarea
                                required
                                value={form.content}
                                onChange={handleChange('content')}
                                placeholder="Écrivez le contenu détaillé de l'article ici..."
                                rows={6}
                                style={{
                                    width: '100%', padding: '12px 14px', borderRadius: '10px',
                                    border: '1px solid var(--dc-border)', background: 'var(--dc-bg)',
                                    fontSize: '14px', color: 'var(--dc-text)', outline: 'none',
                                    resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
                                    boxSizing: 'border-box',
                                }}
                                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                                onBlur={e => e.target.style.borderColor = 'var(--dc-border)'}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{
                        display: 'flex', justifyContent: 'flex-end', gap: '10px',
                        marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--dc-border)',
                    }}>
                        <button type="button" onClick={onClose} style={{
                            padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--dc-border)',
                            background: 'transparent', color: 'var(--dc-text)', fontSize: '13px',
                            fontWeight: 600, cursor: 'pointer',
                        }}>
                            Annuler
                        </button>
                        <button type="submit" disabled={saving} className="dc-btn-create" style={{
                            padding: '10px 24px', borderRadius: '10px', border: 'none',
                            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                            color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            opacity: saving ? 0.6 : 1, boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                                {saving ? 'progress_activity' : (isEdit ? 'save' : 'add')}
                            </span>
                            {saving ? 'Enregistrement...' : (isEdit ? 'Enregistrer' : 'Créer l\'article')}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   DELETE CONFIRM MODAL
═══════════════════════════════════════════════════════════════ */
const DeleteConfirm = ({ article, onClose, onConfirm, deleting }) => {
    if (!article) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                style={{
                    position: 'relative', zIndex: 201, width: '100%', maxWidth: '420px',
                    background: 'var(--dc-surface)', border: '1px solid var(--dc-border)',
                    borderRadius: '20px', padding: '32px', textAlign: 'center',
                    boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                }}
            >
                <div style={{
                    width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 16px',
                    background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28, color: '#ef4444' }}>delete_forever</span>
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: 'var(--dc-text)' }}>
                    Supprimer cet article ?
                </h3>
                <p style={{ margin: '0 0 24px', fontSize: '13px', color: 'var(--dc-text-muted)', lineHeight: 1.5 }}>
                    L'article <strong>"{article.title}"</strong> sera supprimé définitivement. Cette action est irréversible.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={onClose} style={{
                        padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--dc-border)',
                        background: 'transparent', color: 'var(--dc-text)', fontSize: '13px',
                        fontWeight: 600, cursor: 'pointer',
                    }}>
                        Annuler
                    </button>
                    <button onClick={() => onConfirm(article.id)} disabled={deleting} style={{
                        padding: '10px 24px', borderRadius: '10px', border: 'none',
                        background: 'linear-gradient(135deg, #ef4444, #f87171)',
                        color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        opacity: deleting ? 0.6 : 1, boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                            {deleting ? 'progress_activity' : 'delete'}
                        </span>
                        {deleting ? 'Suppression...' : 'Supprimer'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function KnowledgeBaseManagement() {
    const [articles, setArticles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [articlesMeta, setArticlesMeta] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCat, setFilterCat] = useState('');

    /* Modal states */
    const [modalOpen, setModalOpen] = useState(false);
    const [editArticle, setEditArticle] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [toast, setToast] = useState(null);

    /* Fetch */
    const fetchArticles = async (query = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (query) params.append('search', query);
            const res = await api.get(`/articles?${params.toString()}`);
            setArticles(res.data.articles?.data || []);
            setArticlesMeta(res.data.articles?.meta || null);
            setCategories(res.data.categories || []);
        } catch (err) {
            console.error('Erreur chargement articles:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchArticles(search);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    /* Filtered (only by category client-side since search is server-side) */
    const filtered = useMemo(() => {
        let list = articles;
        if (filterCat) {
            list = list.filter(a => a.category === filterCat);
        }
        return list;
    }, [articles, filterCat]);

    /* CRUD handlers */
    const handleCreate = () => { setEditArticle(null); setModalOpen(true); };
    const handleEdit = (article) => { setEditArticle(article); setModalOpen(true); };

    const handleSubmit = async (form) => {
        setSaving(true);
        try {
            if (editArticle) {
                const res = await api.put(`/articles/${editArticle.id}`, form);
                setArticles(prev => prev.map(a => a.id === editArticle.id ? res.data : a));
                setToast({ message: 'Article modifié avec succès', type: 'success' });
            } else {
                const res = await api.post('/articles', form);
                setArticles(prev => [res.data, ...prev]);
                setToast({ message: 'Article créé avec succès', type: 'success' });
            }
            setModalOpen(false);
            setEditArticle(null);
        } catch (err) {
            console.error('Erreur:', err);
            setToast({ message: 'Erreur lors de l\'enregistrement', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            await api.delete(`/articles/${id}`);
            setArticles(prev => prev.filter(a => a.id !== id));
            setDeleteTarget(null);
            setToast({ message: 'Article supprimé', type: 'success' });
        } catch (err) {
            console.error('Erreur suppression:', err);
            setToast({ message: 'Erreur lors de la suppression', type: 'error' });
        } finally {
            setDeleting(false);
        }
    };

    /* Unique categories from data */
    const uniqueCategories = useMemo(() => [...new Set(articles.map(a => a.category))], [articles]);

    return (
        <AppLayout
            title="Base de connaissances"
            subtitle="Gérez les articles et guides pour vos utilisateurs"
            actions={
                <button onClick={handleCreate} className="dc-btn-create" style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 18px', borderRadius: '10px', border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                    color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
                }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 17 }}>add</span>
                    Ajouter un article
                </button>
            }
        >
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>

                {/* ── STAT CARDS ── */}
                <div className="dc-stats-grid" style={{ marginBottom: '28px' }}>
                    <StatCard icon="menu_book" label="Total articles" value={articles.length} gradient="linear-gradient(135deg, #3b82f6, #06b6d4)" delay={0} />
                    <StatCard icon="category" label="Catégories" value={uniqueCategories.length} gradient="linear-gradient(135deg, #8b5cf6, #a78bfa)" delay={1} />
                    <StatCard icon="visibility" label="Vues totales" value={articles.reduce((s, a) => s + (a.views || 0), 0).toLocaleString()} gradient="linear-gradient(135deg, #10b981, #34d399)" delay={2} />
                    <StatCard icon="person" label="Avec auteur" value={articles.filter(a => a.author).length} gradient="linear-gradient(135deg, #f59e0b, #fbbf24)" delay={3} />
                </div>

                {/* ── FILTERS ── */}
                <motion.div variants={fadeUp} custom={4} style={{
                    display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center',
                }}>
                    <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
                        <span className="material-symbols-outlined" style={{
                            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                            fontSize: 18, color: 'var(--dc-text-faint)',
                        }}>search</span>
                        <input
                            type="text"
                            placeholder="Rechercher un article..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 14px 10px 42px', borderRadius: '10px',
                                border: '1px solid var(--dc-border)', background: 'var(--dc-surface)',
                                fontSize: '13px', color: 'var(--dc-text)', outline: 'none',
                                boxSizing: 'border-box',
                            }}
                        />
                    </div>
                    <select
                        value={filterCat}
                        onChange={e => setFilterCat(e.target.value)}
                        style={{
                            padding: '10px 14px', borderRadius: '10px',
                            border: '1px solid var(--dc-border)', background: 'var(--dc-surface)',
                            fontSize: '13px', color: 'var(--dc-text)', outline: 'none', cursor: 'pointer',
                        }}
                    >
                        <option value="">Toutes les catégories</option>
                        {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </motion.div>

                {/* ── TABLE ── */}
                <motion.div variants={fadeUp} custom={5} style={{
                    background: 'var(--dc-surface)', border: '1px solid var(--dc-border)',
                    borderRadius: '16px', overflow: 'hidden',
                }}>
                    {loading ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--dc-text-muted)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 32, animation: 'spin 1s linear infinite' }}>progress_activity</span>
                            <p style={{ marginTop: '12px', fontSize: '13px' }}>Chargement des articles...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--dc-text-muted)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--dc-text-faint)', marginBottom: '12px' }}>search_off</span>
                            <p style={{ fontSize: '14px', fontWeight: 600 }}>Aucun article trouvé</p>
                            <p style={{ fontSize: '12px' }}>Essayez un autre mot-clé ou ajoutez un nouvel article.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                                <thead>
                                    <tr>
                                        {['Article', 'Catégorie', 'Auteur', 'Vues', 'Date', 'Actions'].map((h, i) => (
                                            <th key={h} className="dc-th" style={{
                                                padding: '12px 16px',
                                                textAlign: i === 0 ? 'left' : 'center',
                                                fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                                                letterSpacing: '0.06em', color: 'var(--dc-text-faint)',
                                                borderBottom: '1px solid var(--dc-border)',
                                            }}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((article, idx) => {
                                        const catCfg = CATEGORY_ICONS[article.category] || CATEGORY_ICONS['Général'];
                                        return (
                                            <motion.tr
                                                key={article.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.03, duration: 0.3 }}
                                                style={{ borderBottom: '1px solid var(--dc-border)' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--dc-hover)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                {/* Article */}
                                                <td style={{ padding: '14px 16px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{
                                                            width: '38px', height: '38px', borderRadius: '10px',
                                                            background: catCfg.gradient,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            flexShrink: 0,
                                                        }}>
                                                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#fff' }}>
                                                                {article.icon || catCfg.icon}
                                                            </span>
                                                        </div>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div style={{
                                                                fontSize: '13px', fontWeight: 600, color: 'var(--dc-text)',
                                                                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '260px',
                                                            }}>
                                                                {article.title}
                                                            </div>
                                                            {article.desc && (
                                                                <div style={{
                                                                    fontSize: '11px', color: 'var(--dc-text-muted)', marginTop: '2px',
                                                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '260px',
                                                                }}>
                                                                    {article.desc}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Catégorie */}
                                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: '100px',
                                                        fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                                                        letterSpacing: '0.04em',
                                                        background: `color-mix(in srgb, ${catCfg.gradient.includes('#3b82f6') ? '#3b82f6' : catCfg.gradient.includes('#8b5cf6') ? '#8b5cf6' : catCfg.gradient.includes('#f59e0b') ? '#f59e0b' : catCfg.gradient.includes('#10b981') ? '#10b981' : catCfg.gradient.includes('#ec4899') ? '#ec4899' : '#64748b'} 10%, transparent)`,
                                                        color: catCfg.gradient.includes('#3b82f6') ? '#3b82f6' : catCfg.gradient.includes('#8b5cf6') ? '#8b5cf6' : catCfg.gradient.includes('#f59e0b') ? '#f59e0b' : catCfg.gradient.includes('#10b981') ? '#10b981' : catCfg.gradient.includes('#ec4899') ? '#ec4899' : '#64748b',
                                                    }}>
                                                        {article.category}
                                                    </span>
                                                </td>

                                                {/* Auteur */}
                                                <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', color: 'var(--dc-text)', fontWeight: 500 }}>
                                                    {article.author?.name ?? '—'}
                                                </td>

                                                {/* Vues */}
                                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                        fontSize: '12px', fontWeight: 600, color: 'var(--dc-text-muted)',
                                                    }}>
                                                        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>visibility</span>
                                                        {(article.views || 0).toLocaleString()}
                                                    </span>
                                                </td>

                                                {/* Date */}
                                                <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '12px', color: 'var(--dc-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
                                                    {fmt(article.created_at)}
                                                </td>

                                                {/* Actions */}
                                                <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={() => handleEdit(article)}
                                                            title="Modifier"
                                                            style={{
                                                                width: '32px', height: '32px', borderRadius: '8px',
                                                                border: '1px solid var(--dc-border)', background: 'var(--dc-surface)',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                color: '#3b82f6', transition: 'all 0.2s',
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'; e.currentTarget.style.borderColor = '#3b82f6'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--dc-surface)'; e.currentTarget.style.borderColor = 'var(--dc-border)'; }}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteTarget(article)}
                                                            title="Supprimer"
                                                            style={{
                                                                width: '32px', height: '32px', borderRadius: '8px',
                                                                border: '1px solid var(--dc-border)', background: 'var(--dc-surface)',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                color: '#ef4444', transition: 'all 0.2s',
                                                            }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--dc-surface)'; e.currentTarget.style.borderColor = 'var(--dc-border)'; }}
                                                        >
                                                            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </motion.div>

            {/* ── MODALS ── */}
            <AnimatePresence>
                {modalOpen && (
                    <ArticleModal
                        isOpen={modalOpen}
                        onClose={() => { setModalOpen(false); setEditArticle(null); }}
                        onSubmit={handleSubmit}
                        initial={editArticle}
                        saving={saving}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteTarget && (
                    <DeleteConfirm
                        article={deleteTarget}
                        onClose={() => setDeleteTarget(null)}
                        onConfirm={handleDelete}
                        deleting={deleting}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </AnimatePresence>
        </AppLayout>
    );
}
