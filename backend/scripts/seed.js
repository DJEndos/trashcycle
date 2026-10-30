import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, WasteCategory } from '../src/models/index.js';

const { MONGODB_URI, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
  console.error('Set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD (12+ chars) in .env first.'); process.exit(1);
}
await mongoose.connect(MONGODB_URI);
const cats = [
  ['Organic', 'Food waste, garden waste', 'Leaf', '#4CAF50', ['Food scraps', 'Garden waste']],
  ['Plastic', 'Bottles, packaging, plastic bags', 'Package', '#2F8FDB', ['Bottles', 'Packaging', 'Plastic bags']],
  ['Paper', 'Paper, cardboard, cartons', 'FileText', '#F5A623', ['Paper', 'Cardboard', 'Cartons']],
  ['Glass', 'Glass bottles, jars, broken glass', 'Wine', '#8E5BD6', ['Bottles', 'Jars', 'Broken glass']],
  ['Metal', 'Cans, metal packaging, foil', 'Container', '#5B7391', ['Cans', 'Metal packaging', 'Foil']],
  ['E-Waste', 'Electronic devices, batteries', 'Monitor', '#E5484D', ['Electronic devices', 'Batteries']],
];
for (const [i, [name, description, icon, color, acceptedMaterials]] of cats.entries()) {
  await WasteCategory.updateOne({ slug: name.toLowerCase().replace(/[^a-z]+/g, '-') }, { $setOnInsert: { name, description, icon, color, acceptedMaterials, order: i } }, { upsert: true });
}
if (!(await User.exists({ email: ADMIN_EMAIL.toLowerCase() }))) {
  await User.create({ name: ADMIN_NAME || 'Administrator', email: ADMIN_EMAIL, role: 'admin', isVerified: true, passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12) });
  console.log('Admin created.');
} else console.log('Admin already exists.');
await mongoose.disconnect();
console.log('Seed complete.');
