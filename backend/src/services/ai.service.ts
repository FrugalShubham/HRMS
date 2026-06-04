import OpenAI from 'openai';
import { env } from '../config/env';
import { Company, Attendance, Employee, Candidate } from '../models';
import { ForbiddenError } from '../utils/errors';

let openai: OpenAI | null = null;

function getClient(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw new ForbiddenError('OpenAI is not configured');
  }
  if (!openai) openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  return openai;
}

async function deductCredits(companyId: string, amount = 1) {
  const company = await Company.findById(companyId);
  if (!company || company.aiCredits < amount) {
    throw new ForbiddenError('Insufficient AI credits');
  }
  company.aiCredits -= amount;
  await company.save();
}

export async function hrAssistant(companyId: string, message: string, context?: string) {
  await deductCredits(companyId);
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are HRFlow AI HR Assistant. Help with HR policies, leave rules, and employee queries. Be concise and professional.',
      },
      { role: 'user', content: context ? `Context: ${context}\n\n${message}` : message },
    ],
    max_tokens: 500,
  });
  return completion.choices[0]?.message?.content ?? '';
}

export async function screenResume(companyId: string, candidateId: string, jobDescription: string) {
  await deductCredits(companyId, 2);
  const candidate = await Candidate.findOne({ _id: candidateId, companyId });
  if (!candidate?.resumeText) {
    return { score: 0, summary: 'No resume text available for screening' };
  }

  const client = getClient();
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'Score candidate 0-100 against job description. Respond JSON only: {"score":number,"summary":"string","strengths":[],"concerns":[]}',
      },
      {
        role: 'user',
        content: `Job:\n${jobDescription}\n\nResume:\n${candidate.resumeText.slice(0, 8000)}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  const parsed = JSON.parse(raw) as { score: number; summary: string };
  candidate.aiScore = parsed.score;
  candidate.aiSummary = parsed.summary;
  candidate.stage = 'screening';
  await candidate.save();
  return parsed;
}

export async function attendanceInsights(companyId: string, days = 30) {
  await deductCredits(companyId, 2);
  const since = new Date();
  since.setDate(since.getDate() - days);

  const stats = await Attendance.aggregate([
    { $match: { companyId: companyId as unknown as import('mongoose').Types.ObjectId, date: { $gte: since } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const client = getClient();
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Analyze HR attendance data and provide actionable insights for managers.',
      },
      { role: 'user', content: JSON.stringify(stats) },
    ],
    max_tokens: 400,
  });

  return { stats, insights: completion.choices[0]?.message?.content ?? '' };
}

export async function attritionPrediction(companyId: string) {
  await deductCredits(companyId, 3);
  const employees = await Employee.countDocuments({ companyId, status: 'active' });
  const lateCount = await Attendance.countDocuments({
    companyId,
    status: 'late',
    date: { $gte: new Date(Date.now() - 90 * 86400000) },
  });

  const client = getClient();
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Active employees: ${employees}. Late marks (90d): ${lateCount}. Provide attrition risk summary.`,
      },
    ],
    max_tokens: 400,
  });

  return { employees, lateCount, analysis: completion.choices[0]?.message?.content ?? '' };
}
