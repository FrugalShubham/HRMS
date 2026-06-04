import { env } from '../config/env';
import { Employee, Company } from '../models';
import * as attendanceService from './attendance.service';
import * as leaveService from './leave.service';
import { Payslip, Holiday } from '../models';

const COMMANDS = ['CHECKIN', 'CHECKOUT', 'ATTENDANCE', 'LEAVE', 'PAYSLIP', 'PROFILE', 'HOLIDAYS', 'HELP'] as const;

async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  if (!env.WHATSAPP_ACCESS_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) {
    console.log(`[WhatsApp Mock] To: ${to} — ${text}`);
    return;
  }

  await fetch(
    `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''),
        type: 'text',
        text: { body: text },
      }),
    }
  );
}

export async function handleIncomingMessage(from: string, body: string, location?: { latitude: number; longitude: number }) {
  const phone = from.replace(/\D/g, '');
  const employee = await Employee.findOne({
    $or: [{ whatsappNumber: phone }, { phone: { $regex: phone.slice(-10) } }],
    status: 'active',
  }).populate('companyId');

  if (!employee) {
    await sendWhatsAppMessage(from, 'HRFlow: Phone not linked. Contact your HR admin.');
    return;
  }

  const company = await Company.findById(employee.companyId);
  if (!company?.features.whatsapp) {
    await sendWhatsAppMessage(from, 'HRFlow: WhatsApp feature not enabled for your company.');
    return;
  }

  const cmd = body.trim().toUpperCase().split(/\s+/)[0];

  if (!COMMANDS.includes(cmd as typeof COMMANDS[number])) {
    await sendWhatsAppMessage(
      from,
      `HRFlow Commands:\n${COMMANDS.join(', ')}\n\nExample: CHECKIN (share location when prompted)`
    );
    return;
  }

  const companyId = employee.companyId.toString();
  const employeeId = employee._id.toString();

  switch (cmd) {
    case 'CHECKIN': {
      if (!location) {
        await sendWhatsAppMessage(from, 'Please share your live location, then send CHECKIN again.');
        return;
      }
      await attendanceService.checkIn({
        companyId,
        employeeId,
        source: 'whatsapp',
        record: { location: { latitude: location.latitude, longitude: location.longitude } },
      });
      await sendWhatsAppMessage(from, `✅ Checked in at ${new Date().toLocaleTimeString('en-IN')}`);
      break;
    }
    case 'CHECKOUT': {
      await attendanceService.checkOut({
        companyId,
        employeeId,
        source: 'whatsapp',
        record: location ? { location: { latitude: location.latitude, longitude: location.longitude } } : {},
      });
      await sendWhatsAppMessage(from, `✅ Checked out at ${new Date().toLocaleTimeString('en-IN')}`);
      break;
    }
    case 'ATTENDANCE': {
      const { data } = await attendanceService.listAttendance(companyId, {
        employeeId,
        limit: 5,
      });
      const lines = data.map(
        (a) =>
          `${new Date(a.date).toLocaleDateString('en-IN')}: ${a.status}${a.checkIn ? ` IN ${a.checkIn.time.toLocaleTimeString('en-IN')}` : ''}`
      );
      await sendWhatsAppMessage(from, lines.length ? lines.join('\n') : 'No attendance records.');
      break;
    }
    case 'PROFILE': {
      await sendWhatsAppMessage(
        from,
        `👤 ${employee.firstName} ${employee.lastName}\nID: ${employee.employeeNumber}\nEmail: ${employee.email}`
      );
      break;
    }
    case 'HOLIDAYS': {
      const holidays = await Holiday.find({
        companyId,
        date: { $gte: new Date() },
      })
        .sort({ date: 1 })
        .limit(10);
      const lines = holidays.map((h) => `${h.name} — ${new Date(h.date).toLocaleDateString('en-IN')}`);
      await sendWhatsAppMessage(from, lines.length ? lines.join('\n') : 'No upcoming holidays.');
      break;
    }
    case 'PAYSLIP': {
      const payslip = await Payslip.findOne({ companyId, employeeId }).sort({ year: -1, month: -1 });
      if (!payslip) {
        await sendWhatsAppMessage(from, 'No payslip available.');
        return;
      }
      await sendWhatsAppMessage(
        from,
        `💰 Payslip ${payslip.month}/${payslip.year}\nGross: ₹${payslip.components.gross}\nNet: ₹${payslip.components.net}`
      );
      break;
    }
    case 'LEAVE': {
      await sendWhatsAppMessage(
        from,
        'To apply leave, use the HRFlow web app or reply:\nLEAVE <type> <from YYYY-MM-DD> <to YYYY-MM-DD> <reason>'
      );
      break;
    }
    default:
      await sendWhatsAppMessage(from, 'Command received. Use HELP for options.');
  }

  if (company) {
    company.whatsappCredits = Math.max(0, company.whatsappCredits - 1);
    await company.save();
  }
}

export async function verifyWebhook(mode: string, token: string, challenge: string): Promise<string | null> {
  if (mode === 'subscribe' && token === env.WHATSAPP_VERIFY_TOKEN) {
    return challenge;
  }
  return null;
}

export { sendWhatsAppMessage };
