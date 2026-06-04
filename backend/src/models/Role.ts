import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  companyId?: mongoose.Types.ObjectId;
  name: string;
  permissions: string[];
  isSystem: boolean;
}

const roleSchema = new Schema<IRole>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', index: true },
    name: { type: String, required: true },
    permissions: [String],
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

roleSchema.index({ companyId: 1, name: 1 }, { unique: true });

export const Role = mongoose.model<IRole>('Role', roleSchema);
