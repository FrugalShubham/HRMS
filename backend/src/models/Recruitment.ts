import mongoose, { Document, Schema } from 'mongoose';

export interface IRecruitment extends Document {
  companyId: mongoose.Types.ObjectId;
  title: string;
  departmentId?: mongoose.Types.ObjectId;
  description: string;
  requirements: string[];
  status: 'open' | 'closed' | 'on_hold';
  openings: number;
  postedAt: Date;
  closedAt?: Date;
}

const recruitmentSchema = new Schema<IRecruitment>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    title: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    description: { type: String, required: true },
    requirements: [String],
    status: { type: String, enum: ['open', 'closed', 'on_hold'], default: 'open' },
    openings: { type: Number, default: 1 },
    postedAt: { type: Date, default: Date.now },
    closedAt: Date,
  },
  { timestamps: true }
);

export const Recruitment = mongoose.model<IRecruitment>('Recruitment', recruitmentSchema);
