import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import ClientLayout from '../components/ClientLayout';
import api from '../services/api';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] } })
};

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };

// Custom hook for debouncing
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

// Simple Article Reader Modal
const ArticleReaderModal = ({ articleId, onClose }) => {
    const { data: article, isLoading, error } = useQuery({
        queryKey: ['article', articleId],
        queryFn: async () => {
            const res = await api.get(`/articles/${articleId}`);
            return res.data;
        },
        enabled: !!articleId,
    });

    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={{
                    position: 'relative', zIndex: 10000,
                    width: '100%', maxWidth: '700px', maxHeight: '85vh',
                    background: '#fff', borderRadius: '24px', overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    display: 'flex', flexDirection: 'column'
                }}
            >
                {isLoading ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                        <span className="material-symbols-outlined animate-spin" style={{ fontSize: '32px' }}>progress_activity</span>
                        <p style={{ marginTop: '12px' }}>Chargement de l'article...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#ef4444' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '40px' }}>error</span>
                        <p style={{ marginTop: '12px', fontWeight: 600 }}>Impossible de charger l'article.</p>
                        <button onClick={onClose} style={{ marginTop: '16px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' }}>Fermer</button>
                    </div>
                ) : article && (
                    <>
                        <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{article.icon || 'description'}</span>
                                </div>
                                <div>
                                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{article.category}</span>
                                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: '4px 0 0', lineHeight: 1.3 }}>{article.title}</h2>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>person</span> {article.author?.name || 'Auteur inconnu'}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>visibility</span> {article.views} vues</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '10px', border: 'none', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
                            </button>
                        </div>
                        <div style={{ padding: '32px', overflowY: 'auto', flex: 1, fontSize: '15px', lineHeight: 1.7, color: '#334155' }}>
                            {article.content.split('\n').map((paragraph, idx) => (
                                <p key={idx} style={{ marginBottom: '16px' }}>{paragraph}</p>
                            ))}
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default function ClientKnowledgeBase() {
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [selectedArticleId, setSelectedArticleId] = useState(null);

    const { data, isLoading } = useQuery({
        queryKey: ['articles', debouncedSearch],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (debouncedSearch) params.append('search', debouncedSearch);
            const res = await api.get(`/articles?${params.toString()}`);
            return res.data;
        },
        keepPreviousData: true
    });

    const articles = data?.articles?.data || [];
    const categories = data?.categories || [];

    return (
        <ClientLayout searchQuery={searchQuery} onSearch={setSearchQuery}>
            <motion.div initial="hidden" animate="visible" variants={stagger}>
                
                {/* ── HERO ── */}
                <motion.section className="es-hero" variants={fadeUp}>
                    <div className="es-hero-shimmer" />
                    <div className="es-hero-content" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
                        <div>
                            <p className="es-hero-date">BASE DE CONNAISSANCES</p>
                            <h1 className="es-hero-title">Comment pouvons-nous vous aider ?</h1>
                            <p className="es-hero-subtitle">
                                Parcourez nos guides et articles pour trouver des solutions rapides à vos problèmes.
                            </p>
                        </div>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '600px', marginTop: '8px' }}>
                            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>search</span>
                            <input 
                                type="text" 
                                placeholder="Rechercher un article, un guide, un mot-clé..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '16px 16px 16px 48px',
                                    borderRadius: '12px',
                                    border: 'none',
                                    fontSize: '15px',
                                    outline: 'none',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                    color: '#1e293b'
                                }}
                            />
                        </div>
                    </div>
                </motion.section>

                <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                    
                    {/* ── CATEGORIES ── */}
                    <motion.div variants={fadeUp} style={{ flex: '1 1 60%', minWidth: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Parcourir par catégorie</h2>
                        </div>
                        <div className="es-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                            {categories.map((cat, i) => (
                                <motion.div 
                                    key={cat.title} 
                                    className="es-ticket-card" 
                                    custom={i} 
                                    whileHover={{ y: -4 }}
                                    style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', padding: '20px' }}
                                >
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <span className="material-symbols-outlined">{cat.icon || 'folder'}</span>
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px', color: '#1e293b' }}>{cat.title}</h3>
                                        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 10px', lineHeight: 1.4 }}>Articles associés</p>
                                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '100px' }}>
                                            {cat.count} articles
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── ARTICLES POPULAIRES ── */}
                    <motion.div variants={fadeUp} custom={2} style={{ flex: '1 1 30%', minWidth: '300px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{debouncedSearch ? 'Résultats de recherche' : 'Articles les plus consultés'}</h2>
                            {isLoading && <span className="material-symbols-outlined animate-spin" style={{ color: '#94a3b8', fontSize: '18px' }}>progress_activity</span>}
                        </div>
                        
                        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e0e3e5', overflow: 'hidden' }}>
                            {articles.length > 0 ? articles.map((article, i) => (
                                <div key={article.id} style={{ 
                                    padding: '16px 20px', 
                                    borderBottom: i !== articles.length - 1 ? '1px solid #f1f5f9' : 'none',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s ease',
                                }}
                                onClick={() => setSelectedArticleId(article.id)}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#94a3b8', marginTop: '2px' }}>{article.icon || 'description'}</span>
                                            <div>
                                                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', margin: '0 0 6px', lineHeight: 1.3 }}>{article.title}</h4>
                                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{article.category}</span>
                                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>{article.views} vues</div>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#cbd5e1' }}>chevron_right</span>
                                    </div>
                                </div>
                            )) : !isLoading && (
                                <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '32px', marginBottom: '8px', color: '#cbd5e1' }}>search_off</span>
                                    <p style={{ margin: 0, fontSize: '14px' }}>Aucun article trouvé pour "{debouncedSearch}"</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            <AnimatePresence>
                {selectedArticleId && (
                    <ArticleReaderModal 
                        articleId={selectedArticleId} 
                        onClose={() => setSelectedArticleId(null)} 
                    />
                )}
            </AnimatePresence>
        </ClientLayout>
    );
}
