import { Router } from 'express';
import { Notification } from '../models/index.js';
import { h } from '../utils/asyncHandler.js';
import { oid } from '../utils/validation.js';
import { auth } from '../middleware/auth.js';

const notifications = Router();
notifications.use(auth());
notifications.get('/', h(async (req, res) => {
  const [items, unread] = await Promise.all([Notification.find({ recipientId: req.user._id }).sort({ createdAt: -1 }).limit(50), Notification.countDocuments({ recipientId: req.user._id, isRead: false })]);
  res.json({ items, unread });
}));
notifications.patch('/:id/read', h(async (req, res) => { await Notification.updateOne({ _id: oid.parse(req.params.id), recipientId: req.user._id }, { isRead: true }); res.json({ ok: true }); }));

export default notifications;
