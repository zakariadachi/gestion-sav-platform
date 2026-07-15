import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import api from './api';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
    wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
    cluster: import.meta.env.VITE_REVERB_APP_CLUSTER || 'mt1',
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats: true,

    // The Custom Authorizer delegates auth to our pre-configured Axios instance.
    // api.js already handles withCredentials, XSRF tokens, and response interceptors.
    authorizer: (channel, options) => ({
        authorize: (socketId, callback) => {
            const authUrl = `${import.meta.env.VITE_SANCTUM_URL || 'http://localhost:8000'}/broadcasting/auth`;

            api.post(authUrl, {
                socket_id: socketId,
                channel_name: channel.name,
            })
                .then((response) => callback(false, response.data))
                .catch((error) => callback(true, error));
        },
    }),
});

export default echo;
