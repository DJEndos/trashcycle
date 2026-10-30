import { z } from 'zod';
import { HttpError } from './HttpError.js';

export const oid = z.string().regex(/^[a-f\d]{24}$/i);
export const pt = z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) });

export const parse = (schema, data) => {
  const r = schema.safeParse(data);
  if (!r.success) throw new HttpError(422, 'Please check the highlighted fields.', r.error.flatten().fieldErrors);
  return r.data;
};
