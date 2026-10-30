import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { api, getToken, setToken, requestRefresh } from '../services/api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [socket, setSocket] = useState(null);
  const start = (d) => { setToken(d.token); setUser(d.user); };

  useEffect(() => {
    requestRefresh().then(({ data }) => start(data)).catch(() => {}).finally(() => setReady(true));
    const expired = () => setUser(null);
    window.addEventListener('auth:expired', expired);
    return () => window.removeEventListener('auth:expired', expired);
  }, []);

  useEffect(() => {
    if (!user) { setSocket(null); return; }
    const s = io(import.meta.env.VITE_SOCKET_URL || undefined, { auth: (cb) => cb({ token: getToken() }) }); // fresh token on every (re)connect
    setSocket(s);
    return () => s.close();
  }, [user?.id]);

  const login = async (path, body) => { const { data } = await api.post(path, body); start(data); return data.user; };
  const logout = async () => { await api.post('/auth/logout').catch(() => {}); setToken(null); setUser(null); };
  return <Ctx.Provider value={{ user, setUser, ready, socket, login, logout }}>{children}</Ctx.Provider>;
}
