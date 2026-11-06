import confetti from 'canvas-confetti';

export function generateOptions(correctAnswer: number): number[] {
  const set = new Set<number>();
  set.add(correctAnswer);
  const deltas = [-3, -2, -1, 1, 2, 3, 4, 5, -4, -5].sort(() => Math.random() - 0.5);

  for (const delta of deltas) {
    if (set.size >= 4) break;
    const opt = correctAnswer + delta;
    if (!set.has(opt)) {
      set.add(opt);
    }
  }

  return Array.from(set).sort(() => Math.random() - 0.5);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const POSITIVE_FEEDBACK = [
  'أحسنت يا بطل! ✨',
  'ممتاز! إجابة رائعة 🎉',
  'أبدعت! استمر ⭐',
];

export const NEGATIVE_FEEDBACK = [
  'انت قدها، حاول ثانية 🤗',
  'قريب جدًا، ركّز مرة أخرى 💡',
  'لا بأس، المحاولة القادمة أفضل 🌟',
];

export function triggerConfetti(): void {
  try {
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 120,
        origin: { y: 0.4 },
      });
    }, 600);
  } catch {
    // Ignore fallback if confetti fails
  }
}
