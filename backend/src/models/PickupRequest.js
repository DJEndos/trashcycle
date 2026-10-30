import mongoose from 'mongoose';
import { SLOTS, STATUSES } from '../config/constants.js';
import { ref, point } from './helpers.js';
const { Schema, model } = mongoose;

export const PickupRequest = model('PickupRequest', new Schema({
  requestNumber: { type: String, unique: true, required: true },
  type: { type: String, enum: ['pickup', 'dropoff'], default: 'pickup' },
  userId: ref('User', { required: true, index: true }),
  categoryIds: [ref('WasteCategory')],
  estimatedQuantity: Number,
  actualCollectedWeight: Number,
  unit: { type: String, enum: ['kg', 'bags'], default: 'kg' },
  addressSnapshot: { label: String, street: String, city: String, state: String, country: String },
  coordinates: point,
  scheduledDate: { type: String, required: true, index: true }, // YYYY-MM-DD
  timeSlot: { type: String, enum: SLOTS, required: true },
  notes: String,
  status: { type: String, enum: STATUSES, default: 'pending', index: true },
  statusHistory: [{ status: String, at: Date, _id: false }],
  assignedDriverId: ref('Driver', { index: true }),
  adminNotes: String,
  cancellationReason: String,
  collectedAt: Date,
  completedAt: Date,
}, { timestamps: true }));
