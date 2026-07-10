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

const Register = () => {
    const { register } = useAuth();
    const navigate     = useNavigate();

    const [name, setName]         = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
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
        
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        
        setLoading(true);
        try {
            const user = await register(name, email, password, 'Client');
            if (user.role === 'Admin')      navigate('/dashboard',  { replace: true });
            else if (user.role === 'Technician') navigate('/technicien', { replace: true });
            else                           navigate('/client',     { replace: true });
        } catch (err) {
            setError(err.response?.data?.message ?? 'Registration failed. Please try again.');
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
                        Join the future of<br />support ecosystem
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25, duration: 0.6 }}
                        style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', marginBottom: '36px', lineHeight: 1.65, maxWidth: '400px' }}
                    >
                        Create your account today and start resolving tickets with our state of the art tools.
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
                            "Onboarding was seamless. Within minutes of registering, our entire team was aligned and closing tickets faster than ever."
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span className="material-symbols-outlined" style={{ color: '#fff', fontSize: '22px' }}>person</span>
                            </div>
                            <div>
                                <p style={{ fontSize: '13px', fontWeight: '700', color: '#fff', margin: 0 }}>Sarah Jenkins</p>
                                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', margin: 0 }}>Lead Engineer at Nexus Corp</p>
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
                        <h2 style={{ fontSize: '30px', fontWeight: '800', color: t.text, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Create an Account</h2>
                        <p style={{ fontSize: '14px', color: t.textMuted, margin: 0, lineHeight: 1.5 }}>Sign up to manage your support requests.</p>
                    </motion.div>

                    {/* Error */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                style={{ backgroundColor: '#ffdad6', border: '1px solid #ffb4ab', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', color: '#ba1a1a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        
                        {/* Name */}
                        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }} htmlFor="name">
                                Full Name
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: t.textMuted, fontSize: '20px', pointerEvents: 'none' }}>person</span>
                                <input
                                    id="name" type="text" required
                                    value={name} onChange={e => setName(e.target.value)}
                                    placeholder="John Doe"
                                    style={inputStyle()}
                                    onFocus={onFocus} onBlur={onBlur}
                                />
                            </div>
                        </motion.div>

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
                                    placeholder="john@example.com"
                                    style={inputStyle()}
                                    onFocus={onFocus} onBlur={onBlur}
                                />
                            </div>
                        </motion.div>


                        {/* Password */}
                        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }} htmlFor="password">
                                Password
                            </label>
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

                        {/* Confirm Password */}
                        <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '12px', fontWeight: '600', color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }} htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <span className="material-symbols-outlined" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: t.textMuted, fontSize: '20px', pointerEvents: 'none' }}>lock_reset</span>
                                <input
                                    id="confirmPassword" type={showPass ? 'text' : 'password'} required
                                    value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={inputStyle(true)}
                                    onFocus={onFocus} onBlur={onBlur}
                                />
                            </div>
                        </motion.div>

                        {/* Submit — Framer Motion button */}
                        <motion.div variants={itemVariants} style={{ marginTop: '8px' }}>
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
                                        Creating account...
                                    </>
                                ) : (
                                    <>
                                        Sign Up
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                                    </>
                                )}
                            </motion.button>
                        </motion.div>

                    </form>

                    {/* Login link */}
                    <motion.div variants={itemVariants} style={{ marginTop: '28px', textAlign: 'center' }}>
                        <p style={{ fontSize: '13px', color: t.textMuted, margin: 0 }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: '#004ac6', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
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

export default Register;
