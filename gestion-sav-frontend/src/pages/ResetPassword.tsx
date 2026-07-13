import React, { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import Logo from '../components/Logo';

/* ─── Interfaces ─── */
interface ResetPasswordResponse {
    message: string;
}

interface ApiError {
    response?: {
        status: number;
        data: {
            message: string;
            errors?: Record<string, string[]>;
        };
    };
    message: string;
}

/* ─── Animation Variants ─── */
const containerVariants = {
    hidden:  {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const itemVariants = {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // Extract token and email from URL parameters
    const token = searchParams.get('token') || '';
    const email = searchParams.get('email') || '';

    const [password, setPassword] = useState<string>('');
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
    const [showPass, setShowPass] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [isDark, setIsDark] = useState<boolean>(() => {
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

    // Check if token or email are missing
    useEffect(() => {
        if (!token || !email) {
            setError('Invalid reset link. Missing token or email parameter.');
        }
    }, [token, email]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirmation) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            await api.post<ResetPasswordResponse>('/reset-password', {
                token,
                email,
                password,
                password_confirmation: passwordConfirmation,
            });
            
            toast.success('Password has been reset successfully!');
            navigate('/login', { replace: true });
        } catch (err) {
            const apiError = err as ApiError;
            if (apiError.response?.status === 422) {
                const errors = apiError.response.data.errors;
                const firstError = errors ? Object.values(errors)[0][0] : 'Validation failed.';
                setError(firstError);
            } else if (apiError.response?.status === 429) {
                setError('Too many requests. Please try again later.');
            } else {
                setError(apiError.response?.data?.message || 'An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    /* ─── Theme-aware tokens ─── */
    const t = {
        pageBg:      isDark ? '#020617' : '#eff6ff',
        text:        isDark ? '#f1f5f9' : '#191c1e',
        textMuted:   isDark ? '#94a3b8' : '#64748b',
        inputBg:     isDark ? '#0f172a' : '#f1f5f9',
        inputBorder: isDark ? '#1e293b' : '#cbd5e1',
        toggleBg:    isDark ? '#1e293b' : '#e2e8f0',
    };

    /* ─── Input focus handlers ─── */
    const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        e.target.style.borderColor = '#004ac6';
        e.target.style.boxShadow   = '0 0 0 3px rgba(0,74,198,0.18)';
        e.target.style.backgroundColor = isDark ? '#1e293b' : '#ffffff';
    };
    const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
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
        boxSizing: 'border-box' as const,
        transition: 'border-color 0.2s, box-shadow 0.2s, background-color 0.2s',
    });

    return (
        <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: t.pageBg, transition: 'background-color 0.3s' }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
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

            <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ width: '100%', maxWidth: '380px', padding: '24px' }}>
                <motion.div variants={itemVariants} style={{ marginBottom: '32px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                        <Logo variant={isDark ? "dark" : "light"} />
                    </div>
                    <h2 style={{ fontSize: '26px', fontWeight: '800', color: t.text, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>Set New Password</h2>
                    <p style={{ fontSize: '14px', color: t.textMuted, margin: 0, lineHeight: 1.5 }}>Choose a strong password to secure your account.</p>
                </motion.div>

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
                    {/* New Password */}
                    <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }} htmlFor="password">
                            New Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: t.textMuted, fontSize: '20px', pointerEvents: 'none' }}>lock</span>
                            <input
                                id="password" type={showPass ? 'text' : 'password'} required
                                value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={inputStyle(true)}
                                onFocus={onFocus} onBlur={onBlur}
                                disabled={!token || !email}
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
                        <label style={{ fontSize: '12px', fontWeight: '600', color: t.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }} htmlFor="password_confirmation">
                            Confirm Password
                        </label>
                        <div style={{ position: 'relative' }}>
                            <span className="material-symbols-outlined" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: t.textMuted, fontSize: '20px', pointerEvents: 'none' }}>lock_reset</span>
                            <input
                                id="password_confirmation" type={showPass ? 'text' : 'password'} required
                                value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)}
                                placeholder="••••••••"
                                style={inputStyle(true)}
                                onFocus={onFocus} onBlur={onBlur}
                                disabled={!token || !email}
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <motion.button
                            type="submit"
                            disabled={loading || !token || !email}
                            whileHover={!(loading || !token || !email) ? { scale: 1.02, y: -2 } : {}}
                            whileTap={!(loading || !token || !email) ? { scale: 0.97 } : {}}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            style={{ width: '100%', backgroundColor: '#004ac6', color: '#fff', fontWeight: '700', fontSize: '15px', padding: '13px 24px', borderRadius: '10px', border: 'none', cursor: (loading || !token || !email) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 24px rgba(0,74,198,0.35)', opacity: (loading || !token || !email) ? 0.7 : 1 }}
                        >
                            {loading ? (
                                <><span className="material-symbols-outlined" style={{ fontSize: '20px', animation: 'spin 1s linear infinite' }}>progress_activity</span> Updating...</>
                            ) : (
                                <><span className="material-symbols-outlined" style={{ fontSize: '20px' }}>key</span> Reset Password</>
                            )}
                        </motion.button>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
