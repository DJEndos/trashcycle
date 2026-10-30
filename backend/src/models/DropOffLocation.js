import mongoose from 'mongoose';
import { ref } from './helpers.js';
const { Schema, model } = mongoose;

export const DropOffLocation = model('DropOffLocation', new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['recycling_center', 'transfer_station', 'ewaste'], default: 'recycling_center' },
  description: String,
  address: { type: String, required: true },
  coordinates: { lat: { type: Number, required: true }, lng: { type: Number, required: true } },
  supportedCategoryIds: [ref('WasteCategory')],
  operatingHours: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true }));
