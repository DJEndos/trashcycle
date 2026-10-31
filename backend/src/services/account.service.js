import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { User, Address, Notification, RewardTransaction, PickupRequest } from '../models/index.js';
import { ACTIVE_STATUSES } from '../config/constants.js';

// A customer cannot delete their account while a pickup is still in progress.
export const BLOCKS_DELETION = [...ACTIVE_STATUSES, 'collected'];

// Deletes what only matters to the person, strips personal details from records we keep,
// and turns the account itself into an anonymous, locked shell (so old pickups still have an owner).
export async function deleteUserAccount(userId) {
  await Promise.all([
    Address.deleteMany({ userId }),
    Notification.deleteMany({ recipientId: userId }),
    RewardTransaction.deleteMany({ userId }),
    PickupRequest.updateMany({ userId }, {
      $unset: { 'addressSnapshot.label': '', 'addressSnapshot.street': '', coordinates: '', notes: '', cancellationReason: '' },
    }),
  ]);
  await User.updateOne({ _id: userId }, {
    $set: {
      name: 'Deleted user',
      email: `deleted-${userId}@deleted.invalid`,
      passwordHash: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10), // nobody can ever sign in again
      isActive: false,
      notificationPreferences: { pickupUpdates: false, reminders: false, promotions: false },
    },
    $unset: { phone: '', profileImage: '', consent: '' },
  });
}
