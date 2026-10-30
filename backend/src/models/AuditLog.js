import mongoose from 'mongoose';
import { ref } from './helpers.js';
const { Schema, model } = mongoose;

export const AuditLog = model('AuditLog', new Schema({
  actorId: ref('User', { index: true }),
  action: String, entityType: String, entityId: String, changes: Schema.Types.Mixed,
}, { timestamps: true }));
