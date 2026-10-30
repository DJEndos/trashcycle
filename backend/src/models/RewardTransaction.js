import mongoose from 'mongoose';
import { ref } from './helpers.js';
const { Schema, model } = mongoose;

const rt = new Schema({
  userId: ref('User', { required: true, index: true }),
  pickupId: ref('PickupRequest', { required: true }),
  points: { type: Number, required: true },
  transactionType: { type: String, default: 'collection' },
  description: String,
}, { timestamps: true });
rt.index({ pickupId: 1, transactionType: 1 }, { unique: true }); // reward can be issued only once
export const RewardTransaction = model('RewardTransaction', rt);
