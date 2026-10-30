import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/index.js';
import { LEGAL_VERSIONS } from '../config/legal.js';
import { h } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/HttpError.js';
import { parse } from '../utils/validation.js';
import { auth } from '../middleware/auth.js';
import { signAccess, signRefresh, verifyRefresh, cookieOpts } from '../services/auth.service.js';

const r = Router();
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, phone: u.phone, role: u.role, profileImage: u.profileImage, notificationPreferences: u.notificationPreferences });
const session = (res, u) => { res.cookie('rt', signRefresh(u), cookieOpts()); return { token: signAccess(u), user: pub(u) }; };

// Registration is refused unless the person has explicitly accepted BOTH documents.
const mustAccept = (message) => z.literal(true, { errorMap: () => ({ message }) });
const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  password: z.string().min(8).max(100),
  acceptTerms: mustAccept('You must accept the Terms of Use to create an account.'),
  acceptPrivacy: mustAccept('You must accept the Privacy Policy to create an account.'),
});

r.post('/register', h(async (req, res) => {
  const b = parse(registerSchema, req.body);
  if (await User.exists({ email: b.email.toLowerCase() })) throw new HttpError(409, 'An account with this email already exists.');
  const u = await User.create({
    name: b.name, email: b.email, phone: b.phone, passwordHash: await bcrypt.hash(b.password, 12),
    role: 'user', // role is never client-controlled
    consent: { termsVersion: LEGAL_VERSIONS.terms, privacyVersion: LEGAL_VERSIONS.privacy, acceptedAt: new Date() },
  });
  res.status(201).json(session(res, u));
}));

r.post('/login', h(async (req, res) => {
  const b = parse(z.object({ email: z.string().email(), password: z.string().min(1) }), req.body);
  const u = await User.findOne({ email: b.email.toLowerCase() });
  if (!u || !(await bcrypt.compare(b.password, u.passwordHash))) throw new HttpError(401, 'Email or password is incorrect.');
  if (!u.isActive) throw new HttpError(403, 'This account is suspended. Contact support.');
  res.json(session(res, u));
}));

r.post('/refresh', h(async (req, res) => {
  let p; try { p = verifyRefresh(req.cookies.rt || ''); } catch { throw new HttpError(401, 'Session expired.'); }
  const u = await User.findById(p.sub);
  if (!u || !u.isActive) throw new HttpError(401, 'Session expired.');
  res.json(session(res, u));
}));

r.post('/logout', (req, res) => { res.clearCookie('rt', cookieOpts()); res.json({ ok: true }); });
r.get('/me', auth(), (req, res) => res.json({ user: pub(req.user) }));
export default r;
