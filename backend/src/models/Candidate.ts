import mongoose, { Document, Schema } from 'mongoose';

export type CandidateStage = 'applied' | 'screening' | 'interview' | 'selected' | 'rejected';

export interface ICandidate extends Document {
  companyId: mongoose.Types.ObjectId;
  recruitmentId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  resumeText?: string;
  stage: CandidateStage;
  aiScore?: number;
  aiSummary?: string;
  interviewScheduledAt?: Date;
  notes?: string;
}

const candidateSchema = new Schema<ICandidate>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    recruitmentId: { type: Schema.Types.ObjectId, ref: 'Recruitment', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    resumeUrl: String,
    resumeText: String,
    stage: {
      type: String,
      enum: ['applied', 'screening', 'interview', 'selected', 'rejected'],
      default: 'applied',
    },
    aiScore: Number,
    aiSummary: String,
    interviewScheduledAt: Date,
    notes: String,
  },
  { timestamps: true }
);

candidateSchema.index({ companyId: 1, recruitmentId: 1, stage: 1 });
candidateSchema.index({ resumeText: 'text' });

export const Candidate = mongoose.model<ICandidate>('Candidate', candidateSchema);
