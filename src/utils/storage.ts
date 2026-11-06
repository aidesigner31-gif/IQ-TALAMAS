import { PlayerRecord, AnswerRecord } from '../types';

export const RECORDS_STORAGE_KEY = 'iq_talmas_records';

export function getRecords(): PlayerRecord[] {
  try {
    return JSON.parse(localStorage.getItem(RECORDS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveRecord(record: PlayerRecord): void {
  const records = getRecords();
  records.push(record);
  localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
}

export function deleteRecord(id: string): void {
  const records = getRecords().filter((r) => r.id !== id);
  localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
}

export function clearRecords(): void {
  localStorage.removeItem(RECORDS_STORAGE_KEY);
}

export function getTitleForPercentage(pct: number): string {
  if (pct >= 90) return 'عبقري الأرقام';
  if (pct >= 75) return 'بطل الحساب الذهني';
  if (pct >= 60) return 'نجم سعودي ماث';
  return 'مستكشف الأرقام';
}

export function createPlayerRecord(
  fullName: string,
  phone: string,
  answers: AnswerRecord[],
  heartsLeft: number,
  startedAt: string
): PlayerRecord {
  const totalScore = answers.reduce((sum, a) => sum + a.points, 0);
  const starsCount = answers.filter((a) => a.isAnswerCorrect && a.isLawCorrect).length;
  // Maximum points for 28 questions = 28 * 10 = 280
  const percentage = Math.round((totalScore / 280) * 100);
  const finishedAt = new Date().toISOString();
  const duration = Math.max(1, Math.round((new Date(finishedAt).getTime() - new Date(startedAt).getTime()) / 1000));

  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    fullName,
    phone,
    score: totalScore,
    stars: starsCount,
    percentage,
    title: getTitleForPercentage(percentage),
    heartsLeft,
    startedAt,
    finishedAt,
    duration,
    answers,
  };
}
