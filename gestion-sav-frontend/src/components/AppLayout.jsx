import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

const getInitials = (name = '') =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '??';

const NAV_ADMIN = [
    { to: '/dashboard', icon: 'space_dashboard', label: 'Dashboard' },
    { to: '/equipe', icon: 'group', label: 'Équipe' },
    { to: '/clients', icon: 'domain', label: 'Clients' },
    { to: '/tickets', icon: 'confirmation_number', label: 'Tickets' },
    { to: '/knowledge-base', icon: 'menu_book', label: 'Base de connaissances' },
];
const NAV_TECH = [
    { to: '/technicien', icon: 'engineering', label: 'Mon Espace' },
    { to: '/tickets', icon: 'confirmation_number', label: 'Mes Tickets' },
];
const NAV_CLIENT = [
    { to: '/client', icon: 'home', label: 'Accueil' },
    { to: '/tickets', icon: 'confirmation_number', label: 'Mes Tickets' },
];

const NAV_MAP = { Admin: NAV_ADMIN, Technician: NAV_TECH, Client: NAV_CLIENT };

/* ── Sidebar Nav Item ── */
const SidebarItem = ({ to, icon, label, active }) => (
    <Link
        to={to}
        className={`dc-sidebar-item ${active ? 'active' : ''}`}
    >
        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{icon}</span>
        <span>{label}</span>
        {active && <span className="dc-sidebar-indicator" />}
    </Link>
);

export default function AppLayout({ children, title, subtitle, actions }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const nav = NAV_MAP[user?.role] ?? NAV_ADMIN;
    const firstName = user?.name?.split(' ')[0] || 'User';
    const initials = getInitials(user?.name);

    const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

    return (
        <div className={`dc-layout ${isDark ? 'dark' : ''}`}>
            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div 
                        className="dc-sidebar-overlay md-only"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════
                SIDEBAR
            ══════════════════════════════════════════ */}
            <aside className={`dc-sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="dc-sidebar-top">
                    <div className="dc-sidebar-brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <Logo />
                        <button className="dc-btn-icon md-only" onClick={() => setMobileMenuOpen(false)} style={{ width: 32, height: 32 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
                        </button>
                    </div>

                    {/* User Profile Card */}
                    <div className="dc-sidebar-user">
                        <div className="dc-avatar-ring">
                            <div className="dc-avatar">{initials}</div>
                            <span className="dc-online-dot" />
                        </div>
                        <div className="dc-user-info">
                            <span className="dc-user-name">{user?.name}</span>
                            <span className="dc-user-role">{user?.role}</span>
                        </div>
                    </div>
                </div>

                <div className="dc-sidebar-label">Navigation</div>
                <nav className="dc-sidebar-nav">
                    {nav.map(({ to, icon, label }) => {
                        const active = location.pathname === to;
                        return (
                            <div key={to} onClick={() => setMobileMenuOpen(false)}>
                                <SidebarItem to={to} icon={icon} label={label} active={active} />
                            </div>
                        );
                    })}
                </nav>

                {/* Sidebar CTA */}
                <div className="dc-sidebar-cta">
                    <div className="dc-cta-card">
                        <div className="dc-cta-glow" />
                        <span className="material-symbols-outlined dc-cta-icon">support_agent</span>
                        <p className="dc-cta-title">Besoin d'aide ?</p>
                        <p className="dc-cta-desc">Notre équipe est disponible 24/7</p>
                        <button 
                            className="dc-cta-btn"
                            onClick={() => {
                                if (user?.role === 'Client') {
                                    navigate('/client/tickets');
                                } else {
                                    window.location.href = 'mailto:support@techintervention.com';
                                }
                            }}
                        >
                            Contacter le support
                        </button>
                    </div>
                </div>
            </aside>

            {/* ══════════════════════════════════════════
                MAIN CONTENT
            ══════════════════════════════════════════ */}
            <div className="dc-main">
                {/* ── Top Bar ── */}
                <header className="dc-topbar">
                    <div className="dc-topbar-left">
                        <button className="dc-btn-icon md-only" onClick={() => setMobileMenuOpen(true)}>
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        
                        <div className="md-only" style={{ marginLeft: 8 }}>
                            <Logo />
                        </div>
                        
                        <div className="dc-topbar-context-titles dc-desktop-only" style={{ marginLeft: 8, minWidth: 0 }}>
                            <div className="dc-page-title" style={{ fontSize: '1.1rem', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
                            {subtitle && <div className="dc-page-subtitle" style={{ margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subtitle}</div>}
                        </div>
                    </div>

                    <div className="dc-topbar-right">
                        {actions}

                        {actions && <div className="dc-topbar-divider" />}

                        <button onClick={() => setIsDark(!isDark)} className="dc-btn-icon" title="Thème">
                            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
                        </button>

                        <NotificationBell />

                        {/* User Menu */}
                        <div className="dc-user-menu-wrap" ref={userMenuRef}>
                            <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="dc-topbar-user-btn">
                                {user?.avatar_url ? (
                                    <img src={user.avatar_url} alt="Avatar" className="dc-avatar-topbar" style={{ objectFit: 'cover' }} />
                                ) : (
                                    <div className="dc-avatar-topbar">{initials}</div>
                                )}
                                <span className="dc-topbar-username">{firstName}</span>
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                    {userMenuOpen ? 'expand_less' : 'expand_more'}
                                </span>
                            </button>

                            <AnimatePresence>
                                {userMenuOpen && (
                                    <motion.div
                                        className="dc-user-dropdown"
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        <div className="dc-dropdown-header">
                                            <p className="dc-dropdown-name">{user?.name}</p>
                                            <p className="dc-dropdown-email">{user?.email}</p>
                                        </div>
                                        <div className="dc-dropdown-body" style={{ padding: '8px 12px' }}>
                                            <Link to="/profile" className="dc-dropdown-link" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', color: 'var(--dc-text)', textDecoration: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 500 }} onClick={() => setUserMenuOpen(false)}>
                                                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>person</span>
                                                Mon Profil
                                            </Link>
                                        </div>
                                        <div className="dc-dropdown-footer" style={{ borderTop: '1px solid var(--dc-border)', paddingTop: '4px' }}>
                                            <button onClick={handleLogout} className="dc-logout-btn">
                                                <span className="material-symbols-outlined" style={{ fontSize: 17 }}>logout</span>
                                                Déconnexion
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* ══ PAGE CONTENT ══ */}
                <main className="dc-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
