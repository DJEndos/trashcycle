import { Notification } from '../models/index.js';

export async function notifyUser(io, recipientId, { type, title, message, relatedPickupId }) {
  const n = await Notification.create({ recipientId, type, title, message, relatedPickupId });
  io.to(`user:${recipientId}`).emit('notification:new', n);
  return n;
}
