import React from 'react';
import { motion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AwaitingVerification() {
    const { user, logout, getUser } = useAuth();

    const resendMutation = useMutation({
        mutationFn: () => api.post('/email/verification-notification'),
        onSuccess: () => {
            toast.success('Lien de vérification envoyé ! Veuillez vérifier votre boîte de réception.', {
                icon: '✉️',
                style: { borderRadius: '12px', background: '#333', color: '#fff' }
            });
        },
        onError: async (error) => {
            if (error.response?.status === 400 && error.response?.data?.message === 'Email is already verified.') {
                toast.success('Votre adresse e-mail est déjà vérifiée ! Redirection en cours...');
                if (getUser) await getUser();
                window.location.reload();
            } else if (error.response?.status === 429) {
                toast.error('Veuillez patienter avant de renvoyer un autre lien.');
            } else {
                toast.error("Erreur lors de l'envoi du lien de vérification.");
            }
        },
    });

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    if (user.email_verified_at) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0a0a0f] text-slate-100 p-6">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        opacity: [0.15, 0.25, 0.15] 
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/30 blur-[120px]"
                />
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                        opacity: [0.1, 0.2, 0.1] 
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-emerald-600/20 blur-[120px]"
                />
            </div>

            <motion.div 
                className="relative z-10 max-w-[480px] w-full mx-4"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Glassmorphism Card */}
                <div className="relative p-8 sm:p-12 rounded-[2rem] bg-white/5 dark:bg-[#111118]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] flex flex-col items-center text-center">
                    
                    {/* Floating Icon */}
                    <div className="relative mb-8">
                        <motion.div 
                            animate={{ y: [-5, 5, -5] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                            className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-blue-600/5 rounded-full flex items-center justify-center border border-blue-500/20"
                        >
                            <span className="material-symbols-outlined text-5xl text-blue-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                                mark_email_unread
                            </span>
                        </motion.div>
                        <motion.div 
                            animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -inset-2 bg-blue-500/20 rounded-full blur-xl -z-10"
                        />
                    </div>

                    <h1 className="text-3xl font-black mb-4 tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Vérifiez votre e-mail
                    </h1>
                    
                    <p className="text-slate-400 mb-10 text-sm leading-relaxed max-w-[320px] mx-auto">
                        Pour sécuriser votre compte, veuillez confirmer l'adresse <br/>
                        <strong className="text-white font-semibold mt-1 inline-block px-3 py-1 bg-white/5 rounded-lg border border-white/10">{user.email}</strong>
                    </p>

                    <div className="w-full flex flex-col gap-4">
                        {/* Verify Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={async () => {
                                if (getUser) await getUser();
                                window.location.reload();
                            }}
                            className="relative group w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-white overflow-hidden transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-[radial-gradient(circle_at_center,white_0%,transparent_70%)] transition-opacity" />
                            <span className="relative z-10 material-symbols-outlined text-[22px]">check_circle</span>
                            <span className="relative z-10">J'ai vérifié mon e-mail</span>
                        </motion.button>

                        {/* Resend Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => resendMutation.mutate()}
                            disabled={resendMutation.isPending}
                            className="relative group w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl font-bold text-white overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10 material-symbols-outlined text-[20px]">
                                {resendMutation.isPending ? 'progress_activity' : 'send'}
                            </span>
                            <span className="relative z-10">
                                {resendMutation.isPending ? 'Envoi en cours...' : 'Renvoyer le lien'}
                            </span>
                            {resendMutation.isPending && (
                                <span className="absolute inset-0 bg-white/10 animate-pulse z-0" />
                            )}
                        </motion.button>

                        {/* Logout Button */}
                        <motion.button
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={logout}
                            className="mt-2 w-full py-4 px-6 rounded-2xl font-semibold text-slate-300 bg-white/5 border border-white/5 hover:text-white transition-colors"
                        >
                            Se déconnecter
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
