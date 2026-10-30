import mongoose from 'mongoose';
const { Schema, model } = mongoose;

export const WasteCategory = model('WasteCategory', new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  icon: { type: String, default: 'Recycle' },
  color: { type: String, default: '#168452' },
  acceptedMaterials: [String],
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true }));
