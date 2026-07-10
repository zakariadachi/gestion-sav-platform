import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

/* ─── Animation Variants ─── */
const containerVariants = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const itemVariants = {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

/* ─── Star rating ─── */
const Stars = () => (
    <div style={{ display: 'flex', gap: '3px', marginBottom: '8px' }}>
        {[1,2,3,4,5].map(i => (
            <span key={i} className="material-symbols-outlined"
                style={{ color: '#fbbf24', fontSize: '15px', fontVariationSettings: "'FILL' 1" }}>
                star
            </span>
        ))}
    </div>
);

const Login = () => {
    const { login }   = useAuth();
    const navigate    = useNavigate();

    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [remember, setRemember] = useState(false);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const [isDark, setIsDark]     = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved) return saved === 'dark';
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            if (user.role === 'Admin')      navigate('/dashboard',  { replace: true });
            else if (user.role === 'Technician') navigate('/technicien', { replace: true });
            else                           navigate('/client',     { replace: true });
        } catch (err) {
            if (err.response?.status === 403 || err.response?.status === 401) {
                setError(err.response.data.message);
            } else if (err.response?.status === 419) {
                setError("Session expirée. Veuillez réessayer.");
            } else if (err.response?.status === 422) {
                const errors = err.response.data.errors;
                const firstError = errors ? Object.values(errors)[0][0] : "Données invalides.";
                setError(firstError);
            } else {
                setError(`Erreur: ${err.response?.status || err.message} - ${err.response?.data?.message || 'Inconnue'}`);
            }
        } finally {
            setLoading(false);
        }
    };

    /* ─── Theme-aware tokens ─── */
    const t = {
        pageBg:      isDark ? '#020617' : '#eff6ff',
        rightBg:     isDark ? '#020617' : '#eff6ff',
        text:        isDark ? '#f1f5f9' : '#191c1e',
        textMuted:   isDark ? '#94a3b8' : '#64748b',
        inputBg:     isDark ? '#0f172a' : '#f1f5f9',
        inputBorder: isDark ? '#1e293b' : '#cbd5e1',
        dividerBg:   isDark ? '#020617' : '#ffffff',
        dividerText: isDark ? '#475569' : '#94a3b8',
        toggleBg:    isDark ? '#1e293b' : '#e2e8f0',
        altBtn:      isDark ? '#0f172a' : '#f8fafc',
        altBorder:   isDark ? '#1e293b' : '#e2e8f0',
    };

    /* ─── Input focus handlers ─── */
    const onFocus = e => {
        e.target.style.borderColor = '#004ac6';
        e.target.style.boxShadow   = '0 0 0 3px rgba(0,74,198,0.18)';
        e.target.style.backgroundColor = isDark ? '#1e293b' : '#ffffff';
    };
    const onBlur = e => {
        e.target.style.borderColor = t.inputBorder;
        e.target.style.boxShadow   = 'none';
        e.target.style.backgroundColor = t.inputBg;
    };

    const inputStyle = (extraPaddingRight = false) => ({
        width: '100%',
        paddingLeft: '44px',
        paddingRight: extraPaddingRight ? '44px' : '14px',
        paddingTop: '11px',
        paddingBottom: '11px',
        backgroundColor: t.inputBg,
        border: `1.5px solid ${t.inputBorder}`,
        borderRadius: '10px',
        fontSize: '14px',
        color: t.text,
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
    });

    return (
        <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: t.pageBg, transition: 'background-color 0.3s' }}>

            {/* ── Theme Toggle ── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                style={{ position: 'fixed', top: '24px', right: '24px', zIndex: 100 }}
            >
                <motion.button
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsDark(!isDark)}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: t.toggleBg, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '22px', color: t.text }}>
                        {isDark ? 'light_mode' : 'dark_mode'}
                    </span>
                </motion.button>
            </motion.div>

            {/* ── Left Panel ── */}
            <section style={{ display: 'none', width: '50%', position: 'relative', alignItems: 'center', justifyContent: 'center', padding: '40px', overflow: 'hidden', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e1b4b 100%)', backgroundSize: '400% 400%', animation: 'meshAnim 15s ease infinite' }} className="login-left-panel">

                {/* Ambient blobs */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.18)', filter: 'blur(110px)', top: '-80px', left: '-80px', animation: 'blobPulse 8s ease-in-out infinite' }} />
                    <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246,0.22)', filter: 'blur(90px)', bottom: '-60px', right: '-60px', animation: 'blobPulse 12s ease-in-out infinite reverse' }} />
                </div>

                <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '480px' }}>
                    {/* Brand */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.7, ease: [0.22,1,0.36,1] }}
                        style={{ marginBottom: '28px' }}
                    >
                        <div style={{ marginBottom: '8px' }}>
                            <Logo variant={isDark ? "dark" : "light"} />
                        </div>
                        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: 0, paddingLeft: '4px' }}>Enterprise Intelligence Suite</p>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15, duration: 0.6, ease: [0.22,1,0.36,1] }}
                        style={{ fontSize: '32px', fontWeight: '700', color: '#fff', marginBottom: '14px', lineHeight: 1.2, letterSpacing: '-0.02em' }}
                    >
                        Streamline your<br />support ecosystem
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.6 }}
                        style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', marginBottom: '36px', lineHeight: 1.65, maxWidth: '400px' }}
                    >
                        The modern standard for high-velocity customer resolution and ticket orchestration.
                    </motion.p>

                    {/* Glassmorphic testimonial */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.7, ease: [0.22,1,0.36,1] }}
                        style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}
                    >
                        <Stars />
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.88)', fontStyle: 'italic', marginBottom: '18px', lineHeight: 1.7 }}>
                            "SupportSync has fundamentally redefined how we manage large-scale ticket spikes. Our mean time to resolution dropped by 40% in just two quarters."
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '22px' }}>person</span>
                            </div>
                            <div>
                                <p style={{ fontSize: '13px', fontWeight: '700', color: '#fff', margin: 0 }}>Marcus Sterling</p>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>CTO at GlobalLink Infrastructure</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ── Right Panel ── */}
            <section style={{ flex: 1, backgroundColor: t.rightBg, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px 24px', position: 'relative', transition: 'background-color 0.3s', minHeight: '100vh' }}>

                {/* Mobile brand — hidden on desktop */}
                <div className="login-mobile-brand lg:hidden" style={{ position: 'absolute', top: '10px', left: '28px' }}>
                    <Logo variant="auto" />
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ width: '100%', maxWidth: '380px' }}
                >
                    {/* Heading */}
                    <motion.div variants={itemVariants} style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '30px', fontWeight: '800', color: t.text, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Welcome back</h2>
                        <p style={{ fontSize: '14px', color: t.textMuted, margin: 0, lineHeight: 1.5 }}>Access your support dashboard and ticket queue.</p>
                    </motion.div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="ss-inline-error"
                                style={{ marginBottom: '20px' }}
                            >
                                <div className="ss-inline-error-accent" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }} />
                                <div className="ss-inline-error-icon">
                                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#ef4444' }}>error</span>
                                </div>
                                <span className="ss-inline-error-text">{error}</span>
                                <button className="ss-inline-error-close" onClick={() => setError('')}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>close</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                        {/* Email */}
                        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }} htmlFor="email">
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: t.textMuted, fontSize: '20px', pointerEvents: 'none' }}>mail</span>
                                <input
                                    id="email" type="email" required
                                    value={email} onChange={e => setEmail(e.target.value)}
                                    placeholder="agent@supportsync.com"
                                    style={inputStyle()}
                                    onFocus={onFocus} onBlur={onBlur}
                                />
                            </div>
                        </motion.div>

                        {/* Password */}
                        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ fontSize: '12px', fontWeight: '600', color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }} htmlFor="password">
                                    Password
                                </label>
                                <Link to="/forgot-password" style={{ fontSize: '12px', fontWeight: '600', color: '#004ac6', textDecoration: 'none' }}>Forgot Password?</Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: t.textMuted, fontSize: '20px', pointerEvents: 'none' }}>lock</span>
                                <input
                                    id="password" type={showPass ? 'text' : 'password'} required
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={inputStyle(true)}
                                    onFocus={onFocus} onBlur={onBlur}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: t.textMuted, display: 'flex', alignItems: 'center', padding: 0 }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                                        {showPass ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </motion.div>

                        {/* Remember me */}
                        <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                            <input id="remember" type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#004ac6' }} />
                            <label htmlFor="remember" style={{ fontSize: '13px', color: t.textMuted, cursor: 'pointer', userSelect: 'none' }}>
                                Remember this device for 30 days
                            </label>
                        </motion.div>

                        {/* Submit — Framer Motion button */}
                        <motion.div variants={itemVariants}>
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
                                whileTap={!loading ? { scale: 0.97 } : {}}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                style={{ width: '100%', backgroundColor: '#004ac6', color: '#fff', fontWeight: '700', fontSize: '15px', padding: '13px 24px', borderRadius: '10px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(0,74,198,0.35)', opacity: loading ? 0.7 : 1 }}
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px', animation: 'spin 1s linear infinite' }}>progress_activity</span>
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Sign In to Dashboard
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                                    </>
                                )}
                            </motion.button>
                        </motion.div>

                        {/* Divider */}
                        <motion.div variants={itemVariants} style={{ position: 'relative', padding: '4px 0' }}>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: '100%', borderTop: `1px solid ${t.inputBorder}` }} />
                            </div>
                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                <span style={{ backgroundColor: t.rightBg, padding: '0 14px', fontSize: '11px', color: t.dividerText, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '600' }}>
                                    Or continue with
                                </span>
                            </div>
                        </motion.div>

                        {/* Alt buttons */}
                        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            {[
                                { label: 'SSO', isGoogle: true },
                                { label: 'AD Auth', icon: 'terminal' },
                            ].map(({ label, isGoogle, icon }) => (
                                <motion.button
                                    key={label}
                                    type="button"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.96 }}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', border: `1.5px solid ${t.altBorder}`, borderRadius: '10px', backgroundColor: t.altBtn, color: t.text, fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    {isGoogle ? (
                                        <svg style={{ width: '18px', height: '18px' }} viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                        </svg>
                                    ) : (
                                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{icon}</span>
                                    )}
                                    {label}
                                </motion.button>
                            ))}
                        </motion.div>
                    </form>

                    {/* Register link */}
                    <motion.div variants={itemVariants} style={{ marginTop: '28px', textAlign: 'center' }}>
                        <p style={{ fontSize: '13px', color: t.textMuted, margin: 0 }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ color: '#004ac6', fontWeight: '700', textDecoration: 'none' }}>Register</Link>
                        </p>
                    </motion.div>
                </motion.div>

                {/* Footer links */}
                <div style={{ position: 'absolute', bottom: '24px', display: 'flex', gap: '24px' }}>
                    {['Security Audit', 'Service Status', 'Privacy Policy'].map(link => (
                        <a key={link} href="#" style={{ fontSize: '11px', color: t.textMuted, textDecoration: 'none', letterSpacing: '0.05em', fontWeight: '600' }}>
                            {link}
                        </a>
                    ))}
                </div>
            </section>

            <style>{`
                @keyframes spin     { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes meshAnim { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                @keyframes blobPulse { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.12); opacity: 0.6; } }
                @media (min-width: 1024px) { .login-left-panel { display: flex !important; } }
                @media (min-width: 1024px) { .login-mobile-brand { display: none !important; } }
            `}</style>
        </div>
    );
};

export default Login;
