import axios from 'axios';

// The short-lived access token lives only in memory (never in localStorage).
let token = null;
export const getToken = () => token;
export const setToken = (t) => { token = t; };

export const api = axios.create({ baseURL: '/api/v1', withCredentials: true });
api.interceptors.request.use((c) => { if (token) c.headers.Authorization = `Bearer ${token}`; return c; });

// Asks the server for a fresh access token using the httpOnly refresh cookie.
export const requestRefresh = () => axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });

api.interceptors.response.use((r) => r, async (e) => {
  const o = e.config;
  if (e.response?.status === 401 && o && !o._retry && !o.url.startsWith('/auth/')) {
    o._retry = true;
    try {
      const { data } = await requestRefresh();
      token = data.token; o.headers.Authorization = `Bearer ${token}`;
      return api(o);
    } catch { token = null; window.dispatchEvent(new Event('auth:expired')); }
  }
  return Promise.reject(e);
});

export const errMsg = (e) => e?.response?.data?.message || (e?.request ? 'Cannot reach the server. Check your connection.' : 'Something went wrong.');
export const fieldErrs = (e) => e?.response?.data?.details || {};
