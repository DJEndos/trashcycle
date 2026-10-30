import { PickupRequest, Driver } from '../models/index.js';
import { HttpError } from '../utils/HttpError.js';
import { oid } from '../utils/validation.js';

export const CAP = () => Number(process.env.SLOT_CAPACITY || 5);
export const today = () => new Date().toISOString().slice(0, 10);
export const LABEL = { confirmed: 'confirmed', assigned: 'assigned to a driver', on_the_way: 'on the way', arrived: 'arrived', collected: 'collected', completed: 'completed', rejected: 'rejected', cancelled: 'cancelled' };

export const populate = (q) => q.populate('categoryIds', 'name slug icon color').populate('userId', 'name email phone')
  .populate({ path: 'assignedDriverId', populate: { path: 'userId', select: 'name profileImage' } });

// Customers only see driver contact details while a driver is actively assigned.
export function view(p, user) {
  const o = p.toObject();
  if (user.role === 'user' && o.assignedDriverId && !['assigned', 'on_the_way', 'arrived'].includes(o.status)) delete o.assignedDriverId.phone;
  return o;
}
export async function load(id, user) {
  if (!oid.safeParse(id).success) throw new HttpError(404, 'Request not found.');
  const p = await populate(PickupRequest.findById(id));
  if (!p) throw new HttpError(404, 'Request not found.');
  if (user.role === 'user' && String(p.userId._id) !== String(user._id)) throw new HttpError(404, 'Request not found.');
  if (user.role === 'driver') {
    const d = await Driver.findOne({ userId: user._id });
    if (!d || String(p.assignedDriverId?._id) !== String(d._id)) throw new HttpError(404, 'Request not found.');
  }
  return p;
}
export async function broadcast(req, p, event = 'pickup:statusChanged') {
  const io = req.app.get('io');
  const doc = view(await populate(PickupRequest.findById(p._id)), { role: 'admin' });
  io.to('admins').emit('pickup:updated', doc);
  io.to(`user:${p.userId._id || p.userId}`).emit(event, view(await populate(PickupRequest.findById(p._id)), { role: 'user' }));
  if (p.assignedDriverId) {
    const d = await Driver.findById(p.assignedDriverId._id || p.assignedDriverId);
    if (d) io.to(`user:${d.userId}`).emit('pickup:updated', doc);
  }
}
export function setStatus(p, status) { p.status = status; p.statusHistory.push({ status, at: new Date() }); }
