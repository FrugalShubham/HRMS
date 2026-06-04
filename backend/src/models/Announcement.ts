import mongoose, { Document, Schema } from 'mongoose';

export interface IAnnouncement extends Document {
  companyId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  createdBy: mongoose.Types.ObjectId;
  scheduledAt?: Date;
  publishedAt?: Date;
  status: 'draft' | 'scheduled' | 'published';
  sendWhatsapp: boolean;
  sendEmail: boolean;
  targetDepartments?: mongoose.Types.ObjectId[];
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: Date,
    publishedAt: Date,
    status: { type: String, enum: ['draft', 'scheduled', 'published'], default: 'draft' },
    sendWhatsapp: { type: Boolean, default: false },
    sendEmail: { type: Boolean, default: true },
    targetDepartments: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
  },
  { timestamps: true }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', announcementSchema);
