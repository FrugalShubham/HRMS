import mongoose from 'mongoose';
import { Employee, Payroll, Payslip } from '../models';
import { IPayslipComponents } from '../models/Payslip';
import { NotFoundError, ValidationError } from '../utils/errors';

function calculateSalary(emp: { salaryStructure?: Partial<IPayslipComponents> & { otherDeductions?: number } }): IPayslipComponents {
  const s = emp.salaryStructure ?? {};
  const basic = s.basic ?? 0;
  const hra = s.hra ?? 0;
  const bonus = s.bonus ?? 0;
  const incentives = s.incentives ?? 0;
  const pf = s.pf ?? 0;
  const esi = s.esi ?? 0;
  const tds = s.tds ?? 0;
  const deductions = (s as { otherDeductions?: number }).otherDeductions ?? 0;
  const gross = basic + hra + bonus + incentives;
  const net = gross - pf - esi - tds - deductions;
  return { basic, hra, bonus, incentives, pf, esi, tds, deductions, gross, net };
}

export async function generatePayroll(params: {
  companyId: string;
  month: number;
  year: number;
  userId: string;
}) {
  const existing = await Payroll.findOne({
    companyId: params.companyId,
    month: params.month,
    year: params.year,
  });
  if (existing?.status === 'completed') {
    throw new ValidationError('Payroll already completed for this period');
  }

  const employees = await Employee.find({
    companyId: params.companyId,
    status: 'active',
  });

  let payroll = existing;
  if (!payroll) {
    payroll = await Payroll.create({
      companyId: params.companyId,
      month: params.month,
      year: params.year,
      status: 'processing',
      generatedBy: new mongoose.Types.ObjectId(params.userId),
    });
  } else {
    payroll.status = 'processing';
    await payroll.save();
  }

  let totalGross = 0;
  let totalNet = 0;
  const payslips = [];

  for (const emp of employees) {
    const components = calculateSalary(emp);
    totalGross += components.gross;
    totalNet += components.net;

    const payslip = await Payslip.findOneAndUpdate(
      {
        companyId: params.companyId,
        employeeId: emp._id,
        month: params.month,
        year: params.year,
      },
      {
        payrollId: payroll._id,
        components,
      },
      { upsert: true, new: true }
    );
    payslips.push(payslip);
  }

  payroll.employeeCount = employees.length;
  payroll.totalGross = totalGross;
  payroll.totalNet = totalNet;
  payroll.status = 'completed';
  payroll.processedAt = new Date();
  await payroll.save();

  return { payroll, payslips };
}

export async function getPayslip(companyId: string, payslipId: string, employeeId?: string) {
  const query: Record<string, unknown> = {
    _id: payslipId,
    companyId,
  };
  if (employeeId) query.employeeId = employeeId;

  const payslip = await Payslip.findOne(query).populate('employeeId', 'firstName lastName employeeNumber');
  if (!payslip) throw new NotFoundError('Payslip not found');
  return payslip;
}
