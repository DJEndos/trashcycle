import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User, Address, PickupRequest } from '../models/index.js';
import { h } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/HttpError.js';
import { parse, oid, pt } from '../utils/validation.js';
import { auth } from '../middleware/auth.js';
import { cookieOpts } from '../services/auth.service.js';
import { audit } from '../services/audit.service.js';
import { deleteUserAccount, BLOCKS_DELETION } from '../services/account.service.js';

const users = Router();
users.use(auth());
users.get('/me', (req, res) => res.json(req.user));
users.patch('/me', h(async (req, res) => {
  const b = parse(z.object({
    name: z.string().trim().min(2).max(80).optional(), phone: z.string().max(30).optional(),
    profileImage: z.string().url().max(500).optional(),
    notificationPreferences: z.object({ pickupUpdates: z.boolean(), reminders: z.boolean(), promotions: z.boolean() }).partial().optional(),
  }), req.body);
  const { notificationPreferences, ...rest } = b;
  Object.assign(req.user, rest);
  if (notificationPreferences) Object.assign(req.user.notificationPreferences, notificationPreferences);
  await req.user.save(); res.json(req.user);
}));
// Permanently delete the signed-in customer's account. Needs the current password.
// Wrong password is a 403 (not 401) so the client does not mistake it for an expired session.
users.delete('/me', h(async (req, res) => {
  if (req.user.role !== 'user') throw new HttpError(403, 'This account type cannot be deleted here. Please contact support.');
  const { password } = parse(z.object({ password: z.string().min(1).max(100) }), req.body);
  const u = await User.findById(req.user._id);
  if (!u || !(await bcrypt.compare(password, u.passwordHash))) throw new HttpError(403, 'Password is incorrect.');
  if (await PickupRequest.exists({ userId: u._id, status: { $in: BLOCKS_DELETION } })) {
    throw new HttpError(409, 'You still have a pickup in progress. Cancel it or wait until it is completed, then try again.');
  }
  await deleteUserAccount(u._id);
  audit(u._id, 'account_deleted', 'User', u._id);
  const { maxAge, ...clearOpts } = cookieOpts(); // clearing a cookie must not pass maxAge
  res.clearCookie('rt', clearOpts);
  res.json({ ok: true });
}));
const addrSchema = z.object({ label: z.string().trim().min(1).max(40), street: z.string().trim().min(3).max(200), city: z.string().trim().min(2).max(80), state: z.string().max(80).optional(), country: z.string().max(80).optional(), coordinates: pt.optional(), isDefault: z.boolean().optional() });
users.get('/me/addresses', h(async (req, res) => res.json(await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: 1 }))));
users.post('/me/addresses', h(async (req, res) => {
  const b = parse(addrSchema, req.body);
  const first = !(await Address.exists({ userId: req.user._id }));
  const isDefault = first || b.isDefault;
  if (isDefault) await Address.updateMany({ userId: req.user._id }, { isDefault: false });
  res.status(201).json(await Address.create({ ...b, isDefault, userId: req.user._id }));
}));
users.delete('/me/addresses/:id', h(async (req, res) => {
  const a = await Address.findOneAndDelete({ _id: oid.parse(req.params.id), userId: req.user._id });
  if (!a) throw new HttpError(404, 'Address not found.');
  res.json({ ok: true });
}));

export default users;
