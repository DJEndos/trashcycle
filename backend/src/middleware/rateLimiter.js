import rateLimit from 'express-rate-limit';

const limiter = (max) => rateLimit({
  windowMs: 15 * 60 * 1000, max, standardHeaders: true, legacyHeaders: false,
  message: { message: 'Too many attempts. Try again later.' },
});

export const authLimiter = limiter(20);
