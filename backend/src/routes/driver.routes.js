import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User, Driver, PickupRequest } from '../models/index.js';
import { h } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/HttpError.js';
import { parse, oid, pt } from '../utils/validation.js';
import { auth } from '../middleware/auth.js';
import { audit } from '../services/audit.service.js';

const drivers = Router();
drivers.get('/', auth('admin'), h(async (req, res) => {
  const list = await Driver.find().populate('userId', 'name email profileImage').lean();
  const load = await PickupRequest.aggregate([{ $match: { status: { $in: ['assigned', 'on_the_way', 'arrived'] } } }, { $group: { _id: '$assignedDriverId', n: { $sum: 1 } } }]);
  const m = Object.fromEntries(load.map((x) => [String(x._id), x.n]));
  res.json(list.map((d) => ({ ...d, activeAssignments: m[String(d._id)] || 0 })));
}));
drivers.post('/', auth('admin'), h(async (req, res) => {
  const b = parse(z.object({ name: z.string().trim().min(2), email: z.string().email(), password: z.string().min(8), phone: z.string().max(30).optional(), vehicle: z.object({ plate: z.string().max(20), type: z.string().max(40).optional() }).optional() }), req.body);
  if (await User.exists({ email: b.email.toLowerCase() })) throw new HttpError(409, 'Email already in use.');
  const u = await User.create({ name: b.name, email: b.email, phone: b.phone, role: 'driver', isVerified: true, passwordHash: await bcrypt.hash(b.password, 12) });
  const d = await Driver.create({ userId: u._id, phone: b.phone, vehicle: b.vehicle });
  await audit(req.user._id, 'driver.create', 'Driver', d._id); res.status(201).json(d);
}));
drivers.patch('/:id', auth('admin'), h(async (req, res) => {
  const b = parse(z.object({ phone: z.string().max(30).optional(), vehicle: z.object({ plate: z.string().max(20), type: z.string().max(40).optional() }).optional(), availabilityStatus: z.enum(['available', 'busy', 'offline']).optional(), isActive: z.boolean().optional() }), req.body);
  const d = await Driver.findByIdAndUpdate(oid.parse(req.params.id), b, { new: true });
  if (!d) throw new HttpError(404, 'Driver not found.'); await audit(req.user._id, 'driver.update', 'Driver', d._id, b); res.json(d);
}));
// A driver reports their own real GPS position; nothing is simulated.
drivers.post('/me/location', auth('driver'), h(async (req, res) => {
  const b = parse(pt, req.body);
  const d = await Driver.findOneAndUpdate({ userId: req.user._id }, { lastKnownLocation: b, lastLocationUpdatedAt: new Date() }, { new: true });
  if (!d) throw new HttpError(404, 'Driver profile not found.');
  const jobs = await PickupRequest.find({ assignedDriverId: d._id, status: { $in: ['assigned', 'on_the_way', 'arrived'] } }).select('userId');
  const io = req.app.get('io');
  for (const j of jobs) io.to(`user:${j.userId}`).emit('driver:locationUpdated', { pickupId: j._id, location: b, at: d.lastLocationUpdatedAt });
  res.json({ ok: true });
}));

export default drivers;
