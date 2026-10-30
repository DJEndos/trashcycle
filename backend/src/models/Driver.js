import mongoose from 'mongoose';
import { ref, point } from './helpers.js';
const { Schema, model } = mongoose;

export const Driver = model('Driver', new Schema({
  userId: ref('User', { required: true, unique: true }),
  phone: String,
  vehicle: { plate: String, type: String },
  availabilityStatus: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
  lastKnownLocation: point,
  lastLocationUpdatedAt: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true }));
