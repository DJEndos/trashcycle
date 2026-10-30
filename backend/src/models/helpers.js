import mongoose from 'mongoose';
const { Schema } = mongoose;

export const ref = (m, extra = {}) => ({ type: Schema.Types.ObjectId, ref: m, ...extra });
export const point = { lat: Number, lng: Number };
