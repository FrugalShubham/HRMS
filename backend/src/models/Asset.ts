import mongoose, { Document, Schema } from 'mongoose';

export interface IAssetAllocation {
  employeeId: mongoose.Types.ObjectId;
  allocatedAt: Date;
  returnedAt?: Date;
  condition: 'good' | 'damaged' | 'lost';
  notes?: string;
}

export interface IAsset extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  type: 'laptop' | 'desktop' | 'mobile' | 'id_card' | 'accessories' | 'other';
  serialNumber?: string;
  status: 'available' | 'allocated' | 'maintenance' | 'retired';
  allocations: IAssetAllocation[];
}

const assetSchema = new Schema<IAsset>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['laptop', 'desktop', 'mobile', 'id_card', 'accessories', 'other'],
      required: true,
    },
    serialNumber: String,
    status: {
      type: String,
      enum: ['available', 'allocated', 'maintenance', 'retired'],
      default: 'available',
    },
    allocations: [
      {
        employeeId: { type: Schema.Types.ObjectId, ref: 'Employee' },
        allocatedAt: Date,
        returnedAt: Date,
        condition: { type: String, enum: ['good', 'damaged', 'lost'] },
        notes: String,
      },
    ],
  },
  { timestamps: true }
);

export const Asset = mongoose.model<IAsset>('Asset', assetSchema);
