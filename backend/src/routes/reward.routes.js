import { Router } from 'express';
import { RewardTransaction } from '../models/index.js';
import { h } from '../utils/asyncHandler.js';
import { auth } from '../middleware/auth.js';

const rewards = Router();
rewards.get('/me', auth('user'), h(async (req, res) => {
  const history = await RewardTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  res.json({ points: history.reduce((s, t) => s + t.points, 0), history });
}));

export default rewards;
