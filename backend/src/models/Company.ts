import mongoose, { Document, Schema } from 'mongoose';
import { CompanyFeatures, CompanyStatus } from '../types';

export interface ICompanySettings {
  requirePhoto: boolean;
  officeRadius: number;
  timezone: string;
  workingDays: number[];
  checkInTime: string;
  checkOutTime: string;
}

export interface ICompany extends Document {
  name: string;
  slug: string;
  status: CompanyStatus;
  ownerId: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  planId?: mongoose.Types.ObjectId;
  features: CompanyFeatures;
  settings: ICompanySettings;
  aiCredits: number;
  whatsappCredits: number;
  officeLocation?: {
    type: 'Point';
    coordinates: [number, number];
  };
  address?: string;
  logoUrl?: string;
  employeeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const defaultFeatures: CompanyFeatures = {
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
};

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    status: {
      type: String,
      enum: ['active', 'suspended', 'pending', 'deleted'],
      default: 'pending',
    },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription' },
    planId: { type: Schema.Types.ObjectId, ref: 'Plan' },
    features: { type: Schema.Types.Mixed, default: () => ({ ...defaultFeatures }) },
    settings: {
      requirePhoto: { type: Boolean, default: false },
      officeRadius: { type: Number, default: 200 },
      timezone: { type: String, default: 'Asia/Kolkata' },
      workingDays: { type: [Number], default: [1, 2, 3, 4, 5] },
      checkInTime: { type: String, default: '09:00' },
      checkOutTime: { type: String, default: '18:00' },
    },
    aiCredits: { type: Number, default: 0 },
    whatsappCredits: { type: Number, default: 100 },
    officeLocation: {
      type: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number] },
      },
      _id: false,
    },
    address: String,
    logoUrl: String,
    employeeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/** Strip invalid GeoJSON before save (prevents 2dsphere index errors) */
function sanitizeOfficeLocation(doc: ICompany): void {
  const loc = doc.officeLocation;
  if (
    !loc ||
    !Array.isArray(loc.coordinates) ||
    loc.coordinates.length !== 2 ||
    loc.coordinates.some((n) => typeof n !== 'number' || Number.isNaN(n))
  ) {
    doc.officeLocation = undefined;
    doc.set?.('officeLocation', undefined, { strict: false });
  }
}

companySchema.pre('save', function (next) {
  sanitizeOfficeLocation(this as ICompany);
  next();
});

companySchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate() as Record<string, unknown>;
  const set = (update?.$set ?? update) as Record<string, unknown>;
  const loc = set?.officeLocation as { coordinates?: number[] } | undefined;
  if (loc && (!loc.coordinates || loc.coordinates.length !== 2)) {
    if (update.$set) delete (update.$set as Record<string, unknown>).officeLocation;
    else delete set.officeLocation;
  }
  next();
});

companySchema.index({ status: 1 });
companySchema.index({ officeLocation: '2dsphere' }, { sparse: true });

export const Company = mongoose.model<ICompany>('Company', companySchema);
