import mongoose, { Document, Schema } from 'mongoose';

export interface IPayslipComponents {
  basic: number;
  hra: number;
  bonus: number;
  incentives: number;
  pf: number;
  esi: number;
  tds: number;
  deductions: number;
  gross: number;
  net: number;
}

export interface IPayslip extends Document {
  companyId: mongoose.Types.ObjectId;
  payrollId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  components: IPayslipComponents;
  pdfUrl?: string;
  sentViaWhatsapp: boolean;
  sentViaEmail: boolean;
}

const payslipSchema = new Schema<IPayslip>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    payrollId: { type: Schema.Types.ObjectId, ref: 'Payroll', required: true },
    employeeId: { type: Schema.Types.ObjectId, ref: 'Employee', required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    components: {
      basic: Number,
      hra: Number,
      bonus: Number,
      incentives: Number,
      pf: Number,
      esi: Number,
      tds: Number,
      deductions: Number,
      gross: Number,
      net: Number,
    },
    pdfUrl: String,
    sentViaWhatsapp: { type: Boolean, default: false },
    sentViaEmail: { type: Boolean, default: false },
  },
  { timestamps: true }
);

payslipSchema.index({ companyId: 1, employeeId: 1, year: 1, month: 1 }, { unique: true });

export const Payslip = mongoose.model<IPayslip>('Payslip', payslipSchema);
