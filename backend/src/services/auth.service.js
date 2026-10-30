import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

export const signAccess = (u) => jwt.sign({ sub: String(u._id), role: u.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
export const signRefresh = (u) => jwt.sign({ sub: String(u._id) }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
export const verifyRefresh = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);
export const cookieOpts = () => ({
  httpOnly: true, sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  secure: process.env.NODE_ENV === 'production', maxAge: 7 * 864e5, path: '/api/v1/auth',
});

export async function userFromToken(token) {
  let p;
  try { p = jwt.verify(token, process.env.JWT_ACCESS_SECRET); } catch { return null; }
  const u = await User.findById(p.sub).select('-passwordHash');
  return u && u.isActive ? u : null;
}
