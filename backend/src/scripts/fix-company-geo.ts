/**
 * One-time fix: remove invalid officeLocation from companies (missing coordinates).
 * Run: npx tsx src/scripts/fix-company-geo.ts
 */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Company } from '../models/Company';

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const broken = await Company.find({
    officeLocation: { $exists: true },
    $or: [
      { 'officeLocation.coordinates': { $exists: false } },
      { 'officeLocation.coordinates': null },
      { 'officeLocation.coordinates': { $not: { $size: 2 } } },
    ],
  });
  for (const c of broken) {
    c.officeLocation = undefined;
    await c.save();
  }
  const result = { modifiedCount: broken.length };
  console.log('Fixed companies:', result.modifiedCount);
  await mongoose.disconnect();
}

main().catch(console.error);
