import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
    baseURL:         import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    withCredentials: true,
    withXSRFToken:   true,
    xsrfCookieName:  'XSRF-TOKEN',
    xsrfHeaderName:  'X-XSRF-TOKEN',
    headers: {
        'Accept':           'application/json',
        'Content-Type':     'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

/* ── Response interceptor — handle expired session and global errors ── */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isCancel(error)) {
            return Promise.reject(error);
        }

        const status  = error.response?.status;
        const publicPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
        const isPublicRoute = publicPaths.includes(window.location.pathname);

        // Clear stale session and redirect only when not already on a public route
        if (status === 401 && !isPublicRoute) {
            window.location.href = '/login';
            toast.error('Votre session a expiré. Veuillez vous reconnecter.');
            return Promise.reject(error);
        }

        // Global Error Handling with Toast
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const message = error.response.data?.message || 'Une erreur inattendue est survenue.';
            
            // Only show toast if it's not a 422 validation error (which are usually handled inline by forms),
            // or if we want to show all errors. Let's show for 400, 403, 500.
            if (status !== 422 && status !== 401) {
                toast.error(message);
            }
        } else if (error.request) {
            // The request was made but no response was received
            toast.error('Impossible de se connecter au serveur. Vérifiez votre connexion.');
        } else {
            // Something happened in setting up the request that triggered an Error
            toast.error('Erreur de requête interne.');
        }

        return Promise.reject(error);
    }
);
// api.defaults.withCredentials = true;
// api.defaults.withXSRFToken = true;
// api.defaults.xsrfCookieName = 'XSRF-TOKEN';
// api.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
export default api;
