import mongoose, { Document, Schema } from 'mongoose';

export interface ISalaryStructure {
  basic: number;
  hra: number;
  bonus: number;
  incentives: number;
  pf: number;
  esi: number;
  tds: number;
  otherDeductions: number;
}

export interface IEmployee extends Document {
  companyId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappNumber?: string;
  departmentId?: mongoose.Types.ObjectId;
  designationId?: mongoose.Types.ObjectId;
  managerId?: mongoose.Types.ObjectId;
  shiftId?: mongoose.Types.ObjectId;
  joinDate: Date;
  status: 'active' | 'inactive' | 'terminated';
  salaryStructure?: ISalaryStructure;
  dateOfBirth?: Date;
  gender?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

const employeeSchema = new Schema<IEmployee>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    employeeNumber: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    whatsappNumber: String,
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    designationId: { type: Schema.Types.ObjectId, ref: 'Designation' },
    managerId: { type: Schema.Types.ObjectId, ref: 'Employee' },
    shiftId: { type: Schema.Types.ObjectId, ref: 'Shift' },
    joinDate: { type: Date, required: true },
    status: { type: String, enum: ['active', 'inactive', 'terminated'], default: 'active' },
    salaryStructure: {
      basic: Number,
      hra: Number,
      bonus: Number,
      incentives: Number,
      pf: Number,
      esi: Number,
      tds: Number,
      otherDeductions: Number,
    },
    dateOfBirth: Date,
    gender: String,
    address: String,
  },
  { timestamps: true }
);

employeeSchema.index({ companyId: 1, employeeNumber: 1 }, { unique: true });
employeeSchema.index({ companyId: 1, whatsappNumber: 1 });
employeeSchema.index({ companyId: 1, managerId: 1 });

export const Employee = mongoose.model<IEmployee>('Employee', employeeSchema);
