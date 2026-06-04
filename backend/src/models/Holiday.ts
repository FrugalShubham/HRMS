import mongoose, { Document, Schema } from 'mongoose';

export interface IHoliday extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  date: Date;
  type: 'national' | 'company' | 'department';
  departmentId?: mongoose.Types.ObjectId;
  isOptional: boolean;
}

const holidaySchema = new Schema<IHoliday>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['national', 'company', 'department'], default: 'company' },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    isOptional: { type: Boolean, default: false },
  },
  { timestamps: true }
);

holidaySchema.index({ companyId: 1, date: 1 });

export const Holiday = mongoose.model<IHoliday>('Holiday', holidaySchema);
