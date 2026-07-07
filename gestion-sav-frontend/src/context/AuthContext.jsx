import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

/* ─── Dedicated axios instance for the CSRF cookie endpoint (root, not /api) ─── */
import axios from 'axios';
const sanctum = axios.create({
    baseURL: import.meta.env.VITE_SANCTUM_URL || 'http://localhost:8000',
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
});

/* ═══════════════════════════════════════════════════════════════ */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);

    const isAuthenticated = Boolean(user);

    /* ── Initialisation (Survie au F5) ── */
    useEffect(() => {
        // Ping l'API pour récupérer l'utilisateur avec le cookie de session existant
        api.get('/user')
            .then(({ data }) => setUser(data?.data ?? data))
            .catch(() => setUser(null))
            .finally(() => setIsInitializing(false));
    }, []);

    /* ── Rafraîchir les informations utilisateur ── */
    const getUser = useCallback(async () => {
        try {
            const { data } = await api.get('/user');
            const userData = data?.data ?? data;
            setUser(userData);
            return userData;
        } catch (e) {
            console.error('Erreur getUser', e);
        }
    }, []);

    /* ── Connexion ── */
    const login = useCallback(async (email, password) => {
        await sanctum.get('/sanctum/csrf-cookie');
        const { data } = await api.post('/login', { email, password });
        setUser(data.user);
        return data.user;
    }, []);

    /* ── Inscription ── */
    const register = useCallback(async (name, email, password) => {
        await sanctum.get('/sanctum/csrf-cookie');
        const { data } = await api.post('/register', { name, email, password });
        setUser(data.user);
        return data.user;
    }, []);

    /* ── Déconnexion ── */
    const logout = useCallback(async () => {
        try {
            await api.post('/logout');
        } finally {
            setUser(null);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isInitializing, login, register, logout, getUser }}>
            {children}
        </AuthContext.Provider>
    );
};

/* ── Custom hook ── */
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
};
