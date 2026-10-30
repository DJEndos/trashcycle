import { Router } from 'express';
import { z } from 'zod';
import { PickupRequest, Address, Driver, RewardTransaction, WasteCategory } from '../models/index.js';
import { SLOTS, STATUSES, TRANSITIONS, ACTIVE_STATUSES as ACTIVE } from '../config/constants.js';
import { h } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/HttpError.js';
import { parse, oid } from '../utils/validation.js';
import { str } from '../utils/helpers.js';
import { auth } from '../middleware/auth.js';
import { notifyUser } from '../services/notification.service.js';
import { audit } from '../services/audit.service.js';
import { CAP, today, LABEL, populate, view, load, broadcast, setStatus } from '../services/pickup.service.js';

const r = Router();

// --- availability & stats (declared before /:id) ---
r.get('/availability', auth(), h(async (req, res) => {
  const date = str(req.query.date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new HttpError(422, 'A valid date is required.');
  const counts = await PickupRequest.aggregate([{ $match: { scheduledDate: date, status: { $nin: ['cancelled', 'rejected'] } } }, { $group: { _id: '$timeSlot', n: { $sum: 1 } } }]);
  const used = Object.fromEntries(counts.map((c) => [c._id, c.n]));
  res.json({ date, slots: SLOTS.map((s) => ({ slot: s, remaining: Math.max(0, CAP() - (used[s] || 0)) })) });
}));

r.get('/stats/me', auth('user'), h(async (req, res) => {
  const now = new Date();
  const m0 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const m1 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const sum = async (from, to) => (await PickupRequest.aggregate([{ $match: { userId: req.user._id, collectedAt: { $gte: from, $lt: to }, status: { $in: ['collected', 'completed'] } } }, { $group: { _id: null, kg: { $sum: '$actualCollectedWeight' } } }]))[0]?.kg || 0;
  const thisMonth = await sum(m0, new Date(Date.UTC(2100, 0, 1)));
  const lastMonth = await sum(m1, m0);
  res.json({ thisMonthKg: thisMonth, lastMonthKg: lastMonth, changePct: lastMonth ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null });
}));

// --- list ---
r.get('/', auth(), h(async (req, res) => {
  const q = {};
  if (req.user.role === 'user') q.userId = req.user._id;
  if (req.user.role === 'driver') { const d = await Driver.findOne({ userId: req.user._id }); q.assignedDriverId = d?._id; }
  const status = str(req.query.status);
  if (status === 'active') q.status = { $in: ACTIVE };
  else if (STATUSES.includes(status)) q.status = status;
  if (['pickup', 'dropoff'].includes(str(req.query.type))) q.type = req.query.type;
  if (str(req.query.search)) q.requestNumber = new RegExp(str(req.query.search).replace(/[^\w-]/g, ''), 'i');
  if (/^\d{4}-\d{2}-\d{2}$/.test(str(req.query.date))) q.scheduledDate = req.query.date;
  const page = Math.max(1, Number(req.query.page) || 1), limit = Math.min(100, Number(req.query.limit) || 20);
  const sort = req.query.sort === 'upcoming' ? { scheduledDate: 1, timeSlot: 1 } : { createdAt: -1 };
  const [items, total] = await Promise.all([
    populate(PickupRequest.find(q).sort(sort).skip((page - 1) * limit).limit(limit)),
    PickupRequest.countDocuments(q),
  ]);
  res.json({ items: items.map((p) => view(p, req.user)), total, page, pages: Math.ceil(total / limit) });
}));

// --- create ---
const createSchema = z.object({
  categoryIds: z.array(oid).min(1, 'Select at least one waste category.'),
  addressId: oid,
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeSlot: z.enum(SLOTS),
  estimatedQuantity: z.number().positive().max(10000),
  unit: z.enum(['kg', 'bags']).default('kg'),
  notes: z.string().max(500).optional(),
});
r.post('/', auth('user'), h(async (req, res) => {
  const b = parse(createSchema, req.body);
  const d = new Date(b.scheduledDate + 'T00:00:00Z');
  if (isNaN(d) || b.scheduledDate < today()) throw new HttpError(422, 'Choose a date that is today or later.');
  if (d.getUTCDay() === 0) throw new HttpError(422, 'Collections are not available on Sundays.');
  if (b.scheduledDate > new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10)) throw new HttpError(422, 'You can book up to 90 days ahead.');
  const addr = await Address.findOne({ _id: b.addressId, userId: req.user._id });
  if (!addr) throw new HttpError(422, 'Choose one of your saved addresses.');
  const cats = await WasteCategory.countDocuments({ _id: { $in: b.categoryIds }, isActive: true });
  if (cats !== new Set(b.categoryIds).size) throw new HttpError(422, 'One or more categories are unavailable.');
  const taken = await PickupRequest.countDocuments({ scheduledDate: b.scheduledDate, timeSlot: b.timeSlot, status: { $nin: ['cancelled', 'rejected'] } });
  if (taken >= CAP()) throw new HttpError(409, 'That time slot is full. Please choose another.');

  const p = await PickupRequest.create({
    requestNumber: `EC-${b.scheduledDate.replace(/-/g, '')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    userId: req.user._id, categoryIds: b.categoryIds, estimatedQuantity: b.estimatedQuantity, unit: b.unit,
    addressSnapshot: { label: addr.label, street: addr.street, city: addr.city, state: addr.state, country: addr.country },
    coordinates: addr.coordinates, scheduledDate: b.scheduledDate, timeSlot: b.timeSlot, notes: b.notes,
    status: 'pending', statusHistory: [{ status: 'pending', at: new Date() }],
  });
  const doc = await populate(PickupRequest.findById(p._id)); // persisted first, then broadcast
  req.app.get('io').to('admins').emit('pickup:created', view(doc, { role: 'admin' }));
  res.status(201).json(view(doc, req.user));
}));

r.get('/:id', auth(), h(async (req, res) => res.json(view(await load(req.params.id, req.user), req.user))));

r.patch('/:id', auth('admin'), h(async (req, res) => {
  const b = parse(z.object({ scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(), timeSlot: z.enum(SLOTS).optional(), adminNotes: z.string().max(500).optional() }), req.body);
  const p = await load(req.params.id, req.user);
  if (!ACTIVE.includes(p.status)) throw new HttpError(409, 'Finished requests cannot be changed.');
  if (b.scheduledDate && b.scheduledDate < today()) throw new HttpError(422, 'Choose a date that is today or later.');
  const date = b.scheduledDate || p.scheduledDate, slot = b.timeSlot || p.timeSlot;
  if (date !== p.scheduledDate || slot !== p.timeSlot) {
    const taken = await PickupRequest.countDocuments({ _id: { $ne: p._id }, scheduledDate: date, timeSlot: slot, status: { $nin: ['cancelled', 'rejected'] } });
    if (taken >= CAP()) throw new HttpError(409, 'That time slot is full.');
  }
  Object.assign(p, { scheduledDate: date, timeSlot: slot, ...(b.adminNotes !== undefined && { adminNotes: b.adminNotes }) });
  await p.save();
  await audit(req.user._id, 'pickup.update', 'PickupRequest', p._id, b);
  await notifyUser(req.app.get('io'), p.userId._id, { type: 'pickup', title: 'Pickup updated', message: `${p.requestNumber} is now scheduled for ${date}, ${slot}.`, relatedPickupId: p._id });
  await broadcast(req, p);
  res.json(view(await load(String(p._id), req.user), req.user));
}));

r.post('/:id/assign', auth('admin'), h(async (req, res) => {
  const { driverId } = parse(z.object({ driverId: oid }), req.body);
  const p = await load(req.params.id, req.user);
  if (!['confirmed', 'assigned'].includes(p.status)) throw new HttpError(409, 'Confirm the request before assigning a driver.');
  const d = await Driver.findOne({ _id: driverId, isActive: true });
  if (!d) throw new HttpError(422, 'Driver not found or inactive.');
  p.assignedDriverId = d._id;
  if (p.status === 'confirmed') setStatus(p, 'assigned');
  await p.save();
  await audit(req.user._id, 'pickup.assign', 'PickupRequest', p._id, { driverId });
  const io = req.app.get('io');
  await notifyUser(io, p.userId._id, { type: 'pickup', title: 'Driver assigned', message: `A driver has been assigned to ${p.requestNumber}.`, relatedPickupId: p._id });
  await broadcast(req, p, 'pickup:assigned');
  res.json(view(await load(String(p._id), req.user), req.user));
}));

r.patch('/:id/status', auth('admin', 'driver'), h(async (req, res) => {
  const b = parse(z.object({ status: z.enum(STATUSES), actualCollectedWeight: z.number().positive().max(100000).optional(), reason: z.string().max(300).optional() }), req.body);
  const p = await load(req.params.id, req.user);
  if (req.user.role === 'driver' && !['on_the_way', 'arrived', 'collected'].includes(b.status)) throw new HttpError(403, 'Drivers cannot set this status.');
  if (!TRANSITIONS[p.status].includes(b.status)) throw new HttpError(409, `A ${p.status.replace(/_/g, ' ')} request cannot move to ${b.status.replace(/_/g, ' ')}.`);
  if (b.status === 'assigned') throw new HttpError(409, 'Use the assign endpoint to assign a driver.');
  if (b.status === 'collected') {
    if (!b.actualCollectedWeight) throw new HttpError(422, 'Record the collected weight.');
    p.actualCollectedWeight = b.actualCollectedWeight; p.collectedAt = new Date();
  }
  if (['rejected', 'cancelled'].includes(b.status)) { if (!b.reason) throw new HttpError(422, 'A reason is required.'); p.cancellationReason = b.reason; }
  setStatus(p, b.status);
  if (b.status === 'completed') {
    p.completedAt = new Date();
    try { // unique (pickupId, type) index makes retries idempotent
      await RewardTransaction.create({ userId: p.userId._id, pickupId: p._id, points: Math.round(p.actualCollectedWeight * Number(process.env.POINTS_PER_KG || 10)), description: `Collection ${p.requestNumber}` });
    } catch (e) { if (e.code !== 11000) throw e; }
  }
  await p.save();
  await audit(req.user._id, 'pickup.status', 'PickupRequest', p._id, b);
  await notifyUser(req.app.get('io'), p.userId._id, { type: 'pickup', title: 'Pickup update', message: `${p.requestNumber} is ${LABEL[b.status]}.${b.reason ? ' ' + b.reason : ''}`, relatedPickupId: p._id });
  await broadcast(req, p);
  res.json(view(await load(String(p._id), req.user), req.user));
}));

r.post('/:id/cancel', auth('user', 'admin'), h(async (req, res) => {
  const { reason } = parse(z.object({ reason: z.string().max(300).default('Cancelled by user') }), req.body);
  const p = await load(req.params.id, req.user);
  const allowed = req.user.role === 'admin' ? ['pending', 'confirmed', 'assigned'] : ['pending', 'confirmed'];
  if (!allowed.includes(p.status)) throw new HttpError(409, 'This request can no longer be cancelled.');
  p.cancellationReason = reason; setStatus(p, 'cancelled'); await p.save();
  await audit(req.user._id, 'pickup.cancel', 'PickupRequest', p._id, { reason });
  await broadcast(req, p);
  res.json(view(await load(String(p._id), req.user), req.user));
}));
export default r;
