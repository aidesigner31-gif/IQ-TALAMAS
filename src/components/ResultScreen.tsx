import React from 'react';
import { motion } from 'motion/react';
import { PlayerRecord } from '../types';
import { playClick } from '../utils/audio';

interface ResultScreenProps {
  record: PlayerRecord;
  onCertificate: () => void;
  onReplay: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ record, onCertificate, onReplay }) => {
  const trophyEmoji =
    record.percentage >= 90
      ? '🏆'
      : record.percentage >= 75
      ? '🥇'
      : record.percentage >= 60
      ? '⭐'
      : '💪';

  const motivationalMessage =
    record.percentage >= 90
      ? 'أنت عبقري حقيقي! أداء مذهل 🎉'
      : record.percentage >= 75
      ? 'أداء رائع! أنت بطل الحساب 💪'
      : record.percentage >= 60
      ? 'عمل جيد! استمر في التطور ⭐'
      : 'محاولة جيدة! تدرب أكثر وستتحسن 🌟';

  const minutes = Math.floor(record.duration / 60);
  const seconds = (record.duration % 60).toString().padStart(2, '0');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="card-game max-w-md w-full text-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-7xl mb-4"
        >
          {trophyEmoji}
        </motion.div>

        <h2 className="text-3xl font-black text-foreground mb-2">النتيجة النهائية</h2>
        <p className="text-xl font-bold text-teal-600 mb-6">{record.title}</p>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center bg-muted rounded-xl p-3">
            <span className="font-bold text-muted-foreground">الاسم</span>
            <span className="font-black text-foreground">{record.fullName}</span>
          </div>

          <div className="flex justify-between items-center bg-muted rounded-xl p-3">
            <span className="font-bold text-muted-foreground">الدرجة</span>
            <span className="font-black text-orange-600">{record.score} / 280</span>
          </div>

          <div className="flex justify-between items-center bg-muted rounded-xl p-3">
            <span className="font-bold text-muted-foreground">النجوم</span>
            <span className="font-black text-amber-500">⭐ {record.stars}</span>
          </div>

          <div className="flex justify-between items-center bg-muted rounded-xl p-3">
            <span className="font-bold text-muted-foreground">النسبة</span>
            <span className="font-black text-purple-600">{record.percentage}%</span>
          </div>

          <div className="flex justify-between items-center bg-muted rounded-xl p-3">
            <span className="font-bold text-muted-foreground">القلوب المتبقية</span>
            <span className="font-black">
              {'❤️'.repeat(record.heartsLeft)}
              {'🤍'.repeat(Math.max(0, 3 - record.heartsLeft))}
            </span>
          </div>

          <div className="flex justify-between items-center bg-muted rounded-xl p-3">
            <span className="font-bold text-muted-foreground">الوقت المستغرق</span>
            <span className="font-black text-blue-600 font-mono">
              {minutes}:{seconds} دقيقة
            </span>
          </div>
        </div>

        <p className="text-lg font-bold text-foreground mb-6">{motivationalMessage}</p>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              playClick();
              onCertificate();
            }}
            className="btn-primary w-full text-xl"
          >
            🎓 عرض الشهادة
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              playClick();
              onReplay();
            }}
            className="btn-secondary w-full text-lg"
          >
            🔄 إعادة اللعب
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
