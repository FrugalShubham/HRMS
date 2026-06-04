import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Plan, User } from '../models';
import { hashPassword } from '../services/auth.service';
import { CompanyFeatures } from '../types';

dotenv.config();

const plans: {
  name: string;
  slug: string;
  priceMonthly: number;
  durationDays?: number;
  maxEmployees: number;
  features: CompanyFeatures;
  sortOrder: number;
}[] = [
  {
    name: 'Free Trial',
    slug: 'free-trial',
    priceMonthly: 0,
    durationDays: 14,
    maxEmployees: 10,
    sortOrder: 1,
    features: {
      attendance: true,
      leave: true,
      payroll: false,
      recruitment: false,
      whatsapp: false,
      aiAssistant: false,
      geoFencing: false,
      faceRecognition: false,
      performanceManagement: false,
      assetManagement: false,
      reports: false,
    },
  },
  {
    name: 'Starter',
    slug: 'starter',
    priceMonthly: 999,
    maxEmployees: 50,
    sortOrder: 2,
    features: {
      attendance: true,
      leave: true,
      payroll: false,
      recruitment: false,
      whatsapp: false,
      aiAssistant: false,
      geoFencing: false,
      faceRecognition: false,
      performanceManagement: false,
      assetManagement: false,
      reports: false,
    },
  },
  {
    name: 'Professional',
    slug: 'professional',
    priceMonthly: 2999,
    maxEmployees: 200,
    sortOrder: 3,
    features: {
      attendance: true,
      leave: true,
      payroll: true,
      recruitment: false,
      whatsapp: true,
      aiAssistant: false,
      geoFencing: false,
      faceRecognition: false,
      performanceManagement: false,
      assetManagement: false,
      reports: true,
    },
  },
  {
    name: 'Business',
    slug: 'business',
    priceMonthly: 5999,
    maxEmployees: 1000,
    sortOrder: 4,
    features: {
      attendance: true,
      leave: true,
      payroll: true,
      recruitment: true,
      whatsapp: true,
      aiAssistant: true,
      geoFencing: true,
      faceRecognition: false,
      performanceManagement: true,
      assetManagement: true,
      reports: true,
    },
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    priceMonthly: 0,
    maxEmployees: 999999,
    sortOrder: 5,
    features: {
      attendance: true,
      leave: true,
      payroll: true,
      recruitment: true,
      whatsapp: true,
      aiAssistant: true,
      geoFencing: true,
      faceRecognition: true,
      performanceManagement: true,
      assetManagement: true,
      reports: true,
    },
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrflow';
  await mongoose.connect(uri);

  for (const p of plans) {
    await Plan.findOneAndUpdate({ slug: p.slug }, { ...p, currency: 'INR', isActive: true }, { upsert: true });
  }
  console.log('Plans seeded');

  const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@hrflow.ai';
  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({
      email,
      passwordHash: await hashPassword(process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123'),
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      isActive: true,
      emailVerified: true,
    });
    console.log(`Super admin created: ${email}`);
  }

  await mongoose.disconnect();
  console.log('Seed complete');
}

seed().catch(console.error);
