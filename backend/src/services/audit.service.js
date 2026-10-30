import { AuditLog } from '../models/index.js';

export const audit = (actorId, action, entityType, entityId, changes) =>
  AuditLog.create({ actorId, action, entityType, entityId: String(entityId), changes }).catch(() => {});
