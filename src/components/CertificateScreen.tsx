import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { PlayerRecord } from '../types';
import { playClick, playFanfare } from '../utils/audio';
import { triggerConfetti } from '../utils/helpers';

interface CertificateScreenProps {
  record: PlayerRecord;
  onReplay: () => void;
  onHome: () => void;
}

export const CertificateScreen: React.FC<CertificateScreenProps> = ({ record, onReplay, onHome }) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const confettiRan = useRef(false);

  useEffect(() => {
    if (!confettiRan.current) {
      confettiRan.current = true;
      playFanfare();
      triggerConfetti();
    }
  }, []);

  const formattedDate = new Date(record.finishedAt).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrint = () => {
    playClick();
    window.print();
  };

  const handleSaveJson = () => {
    playClick();
    const jsonStr = JSON.stringify(record, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `شهادة_${record.fullName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Printable Certificate Card */}
      <motion.div
        ref={certificateRef}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="max-w-lg w-full rounded-3xl p-8 text-center relative overflow-hidden print:shadow-none bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-100/60 border-4 border-amber-500 shadow-2xl"
        style={{
          boxShadow: '0 0 40px rgba(245, 158, 11, 0.3), inset 0 0 60px rgba(245, 158, 11, 0.1)',
        }}
      >
        {/* Corner Decorative Icons */}
        <div className="absolute top-3 right-3 text-3xl select-none">⭐</div>
        <div className="absolute top-3 left-3 text-3xl select-none">⭐</div>
        <div className="absolute bottom-3 right-3 text-3xl select-none">✨</div>
        <div className="absolute bottom-3 left-3 text-3xl select-none">✨</div>

        <div className="text-6xl mb-3">🏆</div>
        <h1 className="text-3xl font-black text-amber-600 mb-1">شهادة إنجاز</h1>
        <p className="text-sm font-bold text-teal-600 mb-4">بطولة سعودي ماث – IQ TALMAS</p>

        <div className="border-t-2 border-b-2 border-amber-500/30 py-4 my-4 space-y-2">
          <p className="text-muted-foreground text-sm">تشهد هذه الشهادة بأن</p>
          <p className="text-2xl font-black text-foreground">{record.fullName}</p>
          <p className="text-sm text-muted-foreground font-mono" dir="ltr">{record.phone}</p>
        </div>

        <div className="space-y-2 mb-4 text-base font-bold">
          <p className="text-foreground">
            حصل على لقب:{' '}
            <span className="text-purple-600 font-black">{record.title}</span>
          </p>
          <p className="text-foreground">
            الدرجة:{' '}
            <span className="text-orange-600 font-black">{record.score} / 280</span>
          </p>
          <p className="text-foreground">
            النسبة:{' '}
            <span className="text-teal-600 font-black">{record.percentage}%</span>
          </p>
          <p className="text-foreground">
            النجوم:{' '}
            <span className="text-amber-500">
              {'⭐'.repeat(Math.min(record.stars, 10))}
              {record.stars > 10 ? ` +${record.stars - 10}` : ''}
            </span>
          </p>
        </div>

        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </motion.div>

      {/* Action Buttons (hidden in print) */}
      <div className="flex flex-wrap gap-3 mt-6 justify-center print:hidden">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playClick();
            onReplay();
          }}
          className="btn-primary"
        >
          🔄 إعادة اللعب
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handlePrint}
          className="btn-secondary"
        >
          🖨️ طباعة الشهادة
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleSaveJson}
          className="btn-accent"
        >
          💾 حفظ النتيجة
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playClick();
            onHome();
          }}
          className="btn-game bg-muted text-foreground hover:bg-muted/80"
        >
          🏠 الرئيسية
        </motion.button>
      </div>
    </div>
  );
};
