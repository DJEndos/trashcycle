import { userFromToken } from '../services/auth.service.js';

// Authenticate every socket from its JWT; rooms come from the verified user, never from client input.
export function registerSocketHandlers(io) {
  io.use(async (socket, next) => {
    const u = await userFromToken(socket.handshake.auth?.token || '');
    if (!u) return next(new Error('unauthorized'));
    socket.data.user = u; next();
  });
  io.on('connection', (socket) => {
    const u = socket.data.user;
    socket.join(`user:${u._id}`);
    if (u.role === 'admin') socket.join('admins');
  });
}
