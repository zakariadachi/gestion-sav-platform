import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable ErrorState component for 404, 403, 500, etc.
 * Uses Tailwind CSS and Framer Motion.
 */
export default function ErrorState({ 
    code, 
    title, 
    description, 
    actionText = "Retour à l'accueil", 
    onAction 
}) {
    const navigate = useNavigate();

    const handleAction = () => {
        if (onAction) {
            onAction();
        } else {
            navigate('/');
        }
    };

    return (
        <div 
            className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-zinc-950"
            style={{ minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
        >
            <motion.div 
                className="max-w-md w-full text-center flex flex-col items-center"
                style={{ maxWidth: '28rem', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Code (e.g. 404, 500) */}
                {code && (
                    <motion.div 
                        className="text-7xl md:text-9xl font-black mb-4 tracking-tighter"
                        style={{ color: '#004ac6', opacity: 0.1, fontSize: '6rem', fontWeight: 900, marginBottom: '1rem' }}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                    >
                        {code}
                    </motion.div>
                )}

                {/* Title */}
                <h1 
                    className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-4 z-10"
                    style={{ fontSize: '1.875rem', fontWeight: 800, marginTop: '-3rem', marginBottom: '1rem', zIndex: 10 }}
                >
                    {title}
                </h1>

                {/* Description */}
                <p 
                    className="text-slate-600 dark:text-zinc-400 mb-8 text-sm md:text-base leading-relaxed max-w-sm z-10"
                    style={{ color: '#475569', marginBottom: '2rem', fontSize: '1rem', maxWidth: '24rem', zIndex: 10 }}
                >
                    {description}
                </p>

                {/* Action Button */}
                <button
                    onClick={handleAction}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl z-10 hover:-translate-y-0.5 active:translate-y-0"
                    style={{ 
                        backgroundColor: '#004ac6', 
                        boxShadow: '0 10px 25px -5px rgba(0, 74, 198, 0.4)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.75rem',
                        fontWeight: 700,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        border: 'none',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
                    {actionText}
                </button>
            </motion.div>
        </div>
    );
}
