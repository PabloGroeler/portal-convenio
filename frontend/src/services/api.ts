import axios from 'axios';

// Prefer VITE_API_URL when provided (e.g. http://localhost:8080/api or http://app:8080/api in Docker).
// Otherwise use a relative path so the Vite dev server proxy handles /api and avoids CORS.
const API_URL = import.meta.env.VITE_API_URL ?? '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug: log each outgoing request so we can confirm the resolved URL and origin
api.interceptors.request.use((config) => {
  try {
    const base = config.baseURL ?? '';
    const url = config.url ?? '';
    const resolvedUrl = `${base}${base.endsWith('/') || url.startsWith('/') ? '' : '/'}${url}`;
    console.debug('[api] Request:', config.method, resolvedUrl);
  } catch {
    console.debug('[api] Request (failed to format):', config.method, config.baseURL, config.url);
  }

  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de resposta para tratar token expirado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se retornar 401 (Unauthorized), limpar sessão e redirecionar para login
    if (error.response && error.response.status === 401) {
      const errorData = error.response.data;

      // Verificar se é token expirado
      if (errorData?.expired || errorData?.error?.includes('expirado') || errorData?.error?.includes('expired')) {
        console.warn('⚠️ Token expirado! Fazendo logout automático...');

        // Limpar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirecionar para login com mensagem
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
