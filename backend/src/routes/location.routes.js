import { Router } from 'express';
import { z } from 'zod';
import { DropOffLocation } from '../models/index.js';
import { h } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/HttpError.js';
import { parse, oid, pt } from '../utils/validation.js';
import { str } from '../utils/helpers.js';
import { km } from '../utils/geo.js';
import { auth } from '../middleware/auth.js';
import { audit } from '../services/audit.service.js';

const locations = Router();
const locSchema = z.object({ name: z.string().trim().min(2).max(100), type: z.enum(['recycling_center', 'transfer_station', 'ewaste']).optional(), description: z.string().max(300).optional(), address: z.string().trim().min(5).max(250), coordinates: pt, supportedCategoryIds: z.array(oid).optional(), operatingHours: z.string().max(120).optional(), isActive: z.boolean().optional() });
locations.get('/', auth(), h(async (req, res) => {
  const q = req.user.role === 'admin' && req.query.all === '1' ? {} : { isActive: true };
  if (['recycling_center', 'transfer_station', 'ewaste'].includes(str(req.query.type))) q.type = req.query.type;
  if (str(req.query.q)) { const re = new RegExp(str(req.query.q).replace(/[^\w\s-]/g, ''), 'i'); q.$or = [{ name: re }, { address: re }]; }
  let items = (await DropOffLocation.find(q).limit(200)).map((l) => l.toObject());
  const lat = Number(req.query.lat), lng = Number(req.query.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng) && req.query.lat !== '') {
    items = items.map((l) => ({ ...l, distanceKm: +km({ lat, lng }, l.coordinates).toFixed(1) })).sort((a, b) => a.distanceKm - b.distanceKm);
  }
  res.json(items);
}));
locations.post('/', auth('admin'), h(async (req, res) => { const l = await DropOffLocation.create(parse(locSchema, req.body)); await audit(req.user._id, 'location.create', 'DropOffLocation', l._id); res.status(201).json(l); }));
locations.patch('/:id', auth('admin'), h(async (req, res) => {
  const l = await DropOffLocation.findByIdAndUpdate(oid.parse(req.params.id), parse(locSchema.partial(), req.body), { new: true });
  if (!l) throw new HttpError(404, 'Location not found.'); await audit(req.user._id, 'location.update', 'DropOffLocation', l._id); res.json(l);
}));

export default locations;
