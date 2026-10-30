import mongoose from 'mongoose';
import { ROLES } from '../config/constants.js';
const { Schema, model } = mongoose;

export const User = model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: String,
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ROLES, default: 'user' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  profileImage: String,
  // Proof that the user accepted the legal documents when registering (which version, and when).
  consent: {
    termsVersion: String,
    privacyVersion: String,
    acceptedAt: Date,
  },
  notificationPreferences: {
    pickupUpdates: { type: Boolean, default: true },
    reminders: { type: Boolean, default: true },
    promotions: { type: Boolean, default: false },
  },
}, { timestamps: true }));
