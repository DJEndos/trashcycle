import mongoose from 'mongoose';
import { ref } from './helpers.js';
const { Schema, model } = mongoose;

export const Notification = model('Notification', new Schema({
  recipientId: ref('User', { required: true, index: true }),
  type: String, title: String, message: String,
  relatedPickupId: ref('PickupRequest'),
  isRead: { type: Boolean, default: false },
}, { timestamps: true }));
