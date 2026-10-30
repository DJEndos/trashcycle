import { Router } from 'express';
import { z } from 'zod';
import { User, PickupRequest, AuditLog } from '../models/index.js';
import { h } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/HttpError.js';
import { parse, oid } from '../utils/validation.js';
import { str } from '../utils/helpers.js';
import { auth } from '../middleware/auth.js';
import { audit } from '../services/audit.service.js';

const admin = Router();
admin.use(auth('admin'));
admin.get('/dashboard', h(async (req, res) => {
  const from = new Date(str(req.query.from) || Date.now() - 30 * 864e5), to = new Date(str(req.query.to) || Date.now() + 864e5);
  const done = { status: { $in: ['collected', 'completed'] }, collectedAt: { $gte: from, $lte: to } };
  const [totalUsers, byStatus, kg, daily, byCategory, recent] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    PickupRequest.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    PickupRequest.aggregate([{ $match: done }, { $group: { _id: null, kg: { $sum: '$actualCollectedWeight' } } }]),
    PickupRequest.aggregate([{ $match: done }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$collectedAt' } }, kg: { $sum: '$actualCollectedWeight' }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    PickupRequest.aggregate([{ $unwind: '$categoryIds' }, { $group: { _id: '$categoryIds', requests: { $sum: 1 } } }, { $lookup: { from: 'wastecategories', localField: '_id', foreignField: '_id', as: 'c' } }, { $project: { name: { $arrayElemAt: ['$c.name', 0] }, color: { $arrayElemAt: ['$c.color', 0] }, requests: 1 } }]),
    AuditLog.find().sort({ createdAt: -1 }).limit(10).populate('actorId', 'name'),
  ]);
  const s = Object.fromEntries(byStatus.map((x) => [x._id, x.n]));
  res.json({ totalUsers, totalRequests: Object.values(s).reduce((a, b) => a + b, 0), byStatus: s, totalKg: kg[0]?.kg || 0, daily, byCategory, recentActivity: recent });
}));
admin.get('/users', h(async (req, res) => {
  const q = { role: 'user' };
  if (str(req.query.q)) { const re = new RegExp(str(req.query.q).replace(/[^\w@.\s-]/g, ''), 'i'); q.$or = [{ name: re }, { email: re }, { phone: re }]; }
  res.json(await User.find(q).select('-passwordHash').sort({ createdAt: -1 }).limit(100));
}));
admin.patch('/users/:id', h(async (req, res) => {
  const b = parse(z.object({ isActive: z.boolean().optional(), isVerified: z.boolean().optional() }), req.body);
  const u = await User.findOneAndUpdate({ _id: oid.parse(req.params.id), role: 'user' }, b, { new: true }).select('-passwordHash');
  if (!u) throw new HttpError(404, 'User not found.'); await audit(req.user._id, 'user.update', 'User', u._id, b); res.json(u);
}));
admin.get('/audit-logs', h(async (req, res) => res.json(await AuditLog.find().sort({ createdAt: -1 }).limit(100).populate('actorId', 'name'))));

export default admin;
