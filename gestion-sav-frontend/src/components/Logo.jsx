import React, { useId } from 'react';

const Logo = ({ className = '', variant = 'auto' }) => {
    // 1. Générer ID unique l-kolla logo bach may-w9e3ch conflit f les couleurs SVG
    const uniqueId = useId().replace(/:/g, "");

    const techClass = variant === 'dark'  ? 'text-white'
                    : variant === 'light' ? 'text-slate-900'
                    : 'text-slate-900 dark:text-white';

    const interventionClass = variant === 'dark'  ? 'text-blue-400'
                            : variant === 'light' ? 'text-blue-600'
                            : 'text-blue-600 dark:text-blue-400';

    const taglineClass = variant === 'dark'  ? 'text-blue-200'
                       : variant === 'light' ? 'text-slate-500'
                       : 'text-slate-500 dark:text-slate-400';

    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>

            {/* Icon — Hexagon + Gear + Checkmark */}
            <div className="hover:scale-105 transition-transform duration-300 cursor-pointer shrink-0">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" aria-hidden="true">
                    <defs>
                        {/* Kheddemna uniqueId bach n-fer9o bin les logos */}
                        <linearGradient id={`hexGrad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#2563eb" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                        <filter id={`hexShadow-${uniqueId}`} x="-15%" y="-15%" width="130%" height="130%">
                            <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#1d4ed8" floodOpacity="0.35" />
                        </filter>
                        <filter id={`checkGlow-${uniqueId}`}>
                            <feGaussianBlur stdDeviation="0.8" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Appliquer les IDs uniques hna */}
                    <path d="M24 2.5 L42 13.25 L42 34.75 L24 45.5 L6 34.75 L6 13.25 Z" fill={`url(#hexGrad-${uniqueId})`} filter={`url(#hexShadow-${uniqueId})`} />
                    <path d="M24 6.5 L39 15.5 L39 33.5 L24 42.5 L9 33.5 L9 15.5 Z" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                    <path d="M24 2.5 L42 13.25 L42 21 Q33 10 24 11 Q15 10 6 21 L6 13.25 Z" fill="rgba(255,255,255,0.1)" />
                    <path
                        fillOpacity="0.92" fill="white"
                        d="M24 30a6 6 0 1 1 0-12 6 6 0 0 1 0 12Zm9.3-4.2c.05-.36.08-.74.08-1.8 0-1.06-.03-1.44-.08-1.8l2.44-1.9a.57.57 0 0 0 .14-.73L33.57 15a.57.57 0 0 0-.7-.26l-2.88 1.16a8.5 8.5 0 0 0-1.97-1.14l-.44-3.06a.57.57 0 0 0-.56-.7h-2.34a.57.57 0 0 0-.56.56l-.44 3.06a8.5 8.5 0 0 0-1.97 1.14L19.13 14.7a.57.57 0 0 0-.7.26l-2.31 4.01a.57.57 0 0 0 .14.73l2.44 1.9c-.05.36-.08.74-.08 1.8 0 1.06.03 1.44.08 1.8L16.26 27.1a.57.57 0 0 0-.14.73l2.31 4.01c.14.25.44.35.7.26l2.88-1.16c.6.47 1.25.86 1.97 1.14l.44 3.06c.07.3.3.5.56.5h3.06c.26 0 .49-.2.56-.5l.44-3.06a8.5 8.5 0 0 0 1.97-1.14l2.88 1.16c.26.09.56 0 .7-.26l2.31-4.01a.57.57 0 0 0-.14-.73l-2.44-1.9Z"
                    />
                    <circle cx="24" cy="24" r="4.5" fill="#2563eb" />
                    <path stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="m21.8 24 1.7 1.7 2.7-3.2" filter={`url(#checkGlow-${uniqueId})`} />
                </svg>
            </div>

            {/* Brand name + tagline */}
            <div className="flex flex-col leading-tight">
                <span className="text-base tracking-tight leading-none">
                    <span className={`font-extrabold ${techClass}`}>Tech</span>
                    <span className={`font-medium ${interventionClass}`}>Intervention</span>
                </span>
                <span className={`text-[10px] tracking-wide mt-0.5 hidden sm:block ${taglineClass}`}>
                    Enterprise Intelligence Suite
                </span>
            </div>
        </div>
    );
};

export default Logo;