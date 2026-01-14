import axios from 'axios';

// Use a relative path so the Vite dev server proxy handles /api and avoids CORS.
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

 // Debug: log each outgoing request so we can confirm the resolved URL and origin
api.interceptors.request.use((config) => {
  try {
    const resolvedUrl = `${config.baseURL ?? ''}${config.url ?? ''}`;
    console.debug('[api] Request:', config.method, resolvedUrl, config);
  } catch (e) {
    console.debug('[api] Request (failed to format):', config);
  }

  const token = localStorage.getItem('token');
  if (token) {
    // eslint-disable-next-line no-param-reassign
    config.headers = config.headers ?? {};
    // eslint-disable-next-line no-param-reassign
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;