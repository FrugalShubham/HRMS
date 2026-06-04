import mongoose, { Document, Schema } from 'mongoose';

export interface IShift extends Document {
  companyId: mongoose.Types.ObjectId;
  name: string;
  type: 'morning' | 'evening' | 'night' | 'flexible';
  startTime: string;
  endTime: string;
  graceMinutes: number;
  isActive: boolean;
}

const shiftSchema = new Schema<IShift>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['morning', 'evening', 'night', 'flexible'], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    graceMinutes: { type: Number, default: 15 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Shift = mongoose.model<IShift>('Shift', shiftSchema);
