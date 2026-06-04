import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployeeDocument extends Document {
  companyId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  name: string;
  type: 'resume' | 'id_proof' | 'contract' | 'certificate' | 'other';
  fileUrl: string;
  uploadedBy: mongoose.Types.ObjectId;
}

const docSchema = new Schema<IEmployeeDocument>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['resume', 'id_proof', 'contract', 'certificate', 'other'],
      default: 'other',
    },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const EmployeeDocument = mongoose.model<IEmployeeDocument>('EmployeeDocument', docSchema);
