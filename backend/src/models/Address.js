import mongoose from 'mongoose';
import { ref, point } from './helpers.js';
const { Schema, model } = mongoose;

export const Address = model('Address', new Schema({
  userId: ref('User', { required: true, index: true }),
  label: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: String, country: String,
  coordinates: point,
  isDefault: { type: Boolean, default: false },
}, { timestamps: true }));
