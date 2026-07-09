import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

const getInitials = (name = '') =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '??';

export default function ClientNavbar({ onNewTicket, onSearch, searchQuery }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login', { replace: true });
    };

    const initials = getInitials(user?.name);
    const currentPath = location.pathname;

    return (
        <header className="es-topbar">
            <div className="es-topbar-inner">
                {/* Mobile Menu Toggle */}
                <button 
                    className="es-mobile-menu-btn" 
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    <span className="material-symbols-outlined">
                        {mobileMenuOpen ? 'close' : 'menu'}
                    </span>
                </button>

                {/* Brand */}
                <div className="es-brand-wrapper">
                    <Logo />
                </div>

                {/* Navigation (Desktop) */}
                <nav className="es-nav">
                    <Link 
                        to="/client" 
                        className={`es-nav-link ${currentPath === '/client' ? 'active' : ''}`}
                    >
                        Dashboard
                    </Link>
                    {currentPath === '/client' ? (
                        <a href="#tickets-section" className="es-nav-link" onClick={(e) => { 
                            e.preventDefault(); 
                            document.getElementById('tickets-section')?.scrollIntoView({ behavior: 'smooth' }); 
                        }}>Tickets</a>
                    ) : (
                        <Link to="/client" className="es-nav-link">Tickets</Link>
                    )}
                    <Link 
                        to="/client/knowledge-base" 
                        className={`es-nav-link ${currentPath === '/client/knowledge-base' ? 'active' : ''}`}
                    >
                        Knowledge Base
                    </Link>
                    <Link 
                        to="/client/reports" 
                        className={`es-nav-link ${currentPath === '/client/reports' ? 'active' : ''}`}
                    >
                        Reports
                    </Link>
                </nav>

                {/* Actions */}
                <div className="es-topbar-actions">
                    {onSearch && (
                        <div className="es-search-bar">
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>search</span>
                            <input 
                                type="text" 
                                placeholder="Rechercher..."
                                value={searchQuery || ''} 
                                onChange={e => onSearch(e.target.value)} 
                            />
                        </div>
                    )}

                    <div className="es-desktop-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <NotificationBell />

                        <div className="es-topbar-divider" />

                        {onNewTicket && (
                            <button onClick={onNewTicket} className="es-btn-primary">
                                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
                                New Ticket
                            </button>
                        )}
                    </div>

                    <div className="es-user-chip">
                        {user?.avatar_url ? (
                            <img src={user.avatar_url} alt="Avatar" className="es-user-avatar" style={{ objectFit: 'cover' }} />
                        ) : (
                            <div className="es-user-avatar">{initials}</div>
                        )}
                        <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <span className="es-user-name" style={{ cursor: 'pointer' }}>{user?.name}</span>
                        </Link>
                        <button onClick={handleLogout} className="es-icon-btn es-logout es-desktop-actions" title="Déconnexion">
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="es-mobile-dropdown">
                    <nav className="es-mobile-nav">
                        <Link 
                            to="/client" 
                            className={`es-mobile-link ${currentPath === '/client' ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="material-symbols-outlined">dashboard</span>
                            Dashboard
                        </Link>
                        {currentPath === '/client' ? (
                            <a href="#tickets-section" className="es-mobile-link" onClick={(e) => { 
                                e.preventDefault(); 
                                document.getElementById('tickets-section')?.scrollIntoView({ behavior: 'smooth' });
                                setMobileMenuOpen(false);
                            }}>
                                <span className="material-symbols-outlined">confirmation_number</span>
                                Tickets
                            </a>
                        ) : (
                            <Link to="/client" className="es-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                                <span className="material-symbols-outlined">confirmation_number</span>
                                Tickets
                            </Link>
                        )}
                        <Link 
                            to="/client/knowledge-base" 
                            className={`es-mobile-link ${currentPath === '/client/knowledge-base' ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="material-symbols-outlined">menu_book</span>
                            Knowledge Base
                        </Link>
                        <Link 
                            to="/client/reports" 
                            className={`es-mobile-link ${currentPath === '/client/reports' ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="material-symbols-outlined">bar_chart</span>
                            Reports
                        </Link>

                        <div style={{ height: '1px', background: '#f1f5f9', margin: '8px 0' }} />
                        
                        <Link 
                            to="/profile" 
                            className="es-mobile-link"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="material-symbols-outlined">person</span>
                            Mon Profil
                        </Link>
                        
                        <button onClick={handleLogout} className="es-mobile-link" style={{ color: '#ef4444', border: 'none', background: 'transparent', cursor: 'pointer', width: '100%' }}>
                            <span className="material-symbols-outlined">logout</span>
                            Déconnexion
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
}
