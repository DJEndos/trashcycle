import { Router } from 'express';
import { z } from 'zod';
import { WasteCategory } from '../models/index.js';
import { h } from '../utils/asyncHandler.js';
import { HttpError } from '../utils/HttpError.js';
import { parse, oid } from '../utils/validation.js';
import { slug } from '../utils/helpers.js';
import { auth } from '../middleware/auth.js';
import { audit } from '../services/audit.service.js';

const categories = Router();
const catSchema = z.object({ name: z.string().trim().min(2).max(40), description: z.string().max(200).optional(), icon: z.string().max(30).optional(), color: z.string().regex(/^#[0-9a-f]{6}$/i).optional(), acceptedMaterials: z.array(z.string()).optional(), order: z.number().optional(), isActive: z.boolean().optional() });
categories.get('/', auth(), h(async (req, res) => {
  const q = req.user.role === 'admin' && req.query.all === '1' ? {} : { isActive: true };
  res.json(await WasteCategory.find(q).sort({ order: 1, name: 1 }));
}));
categories.post('/', auth('admin'), h(async (req, res) => {
  const b = parse(catSchema, req.body);
  const c = await WasteCategory.create({ ...b, slug: slug(b.name) }).catch((e) => { throw e.code === 11000 ? new HttpError(409, 'A category with that name exists.') : e; });
  await audit(req.user._id, 'category.create', 'WasteCategory', c._id, b); res.status(201).json(c);
}));
categories.patch('/:id', auth('admin'), h(async (req, res) => {
  const c = await WasteCategory.findByIdAndUpdate(oid.parse(req.params.id), parse(catSchema.partial(), req.body), { new: true });
  if (!c) throw new HttpError(404, 'Category not found.');
  await audit(req.user._id, 'category.update', 'WasteCategory', c._id, req.body); res.json(c);
}));
categories.delete('/:id', auth('admin'), h(async (req, res) => { // deactivate, never hard-delete (history references it)
  const c = await WasteCategory.findByIdAndUpdate(oid.parse(req.params.id), { isActive: false }, { new: true });
  if (!c) throw new HttpError(404, 'Category not found.');
  await audit(req.user._id, 'category.deactivate', 'WasteCategory', c._id); res.json(c);
}));

export default categories;
