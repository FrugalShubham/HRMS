import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  code?: string;
  headId?: mongoose.Types.ObjectId;
  description?: string;
  isActive: boolean;
}

const departmentSchema = new Schema<IDepartment>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true },
    code: String,
    headId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    description: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

departmentSchema.index({ companyId: 1, name: 1 });

export const Department = mongoose.model<IDepartment>('Department', departmentSchema);
