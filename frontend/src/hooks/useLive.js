import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

// Subscribe to a socket event; `onReconnect` lets pages refetch persisted state after a drop.
export function useLive(event, handler, onReconnect) {
  const { socket } = useAuth();
  const h = useRef(handler); h.current = handler;
  const rc = useRef(onReconnect); rc.current = onReconnect;
  useEffect(() => {
    if (!socket) return;
    const fn = (...a) => h.current(...a);
    const re = () => rc.current?.();
    socket.on(event, fn); socket.io.on('reconnect', re);
    return () => { socket.off(event, fn); socket.io.off('reconnect', re); };
  }, [socket, event]);
}
