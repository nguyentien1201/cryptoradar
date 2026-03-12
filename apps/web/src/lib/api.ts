import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('cryptoradar-refresh');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await api.post('/auth/refresh', { refreshToken });
        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
        original.headers['Authorization'] = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('cryptoradar-auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
