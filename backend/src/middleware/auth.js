import { h } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/HttpError.js';
import { userFromToken } from '../services/auth.service.js';

// Requires a valid access token; optionally restricts the route to the given roles.
export const auth = (...roles) => h(async (req, res, next) => {
  const u = await userFromToken((req.headers.authorization || '').replace('Bearer ', ''));
  if (!u) throw new HttpError(401, 'Please sign in again.');
  if (roles.length && !roles.includes(u.role)) throw new HttpError(403, 'You do not have access to this resource.');
  req.user = u; next();
});
