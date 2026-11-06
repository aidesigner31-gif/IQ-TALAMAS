import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { getRecords } from '../utils/storage';
import { playClick } from '../utils/audio';

interface HomeScreenProps {
  onStart: () => void;
  onAdmin: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onStart, onAdmin }) => {
  const records = useMemo(() => {
    return [...getRecords()].sort((a, b) => b.score - a.score);
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Decorative Floating Emojis */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <span className="floating-emoji top-[10%] right-[10%] animate-float" style={{ animationDelay: '0s' }}>
          ⭐
        </span>
        <span className="floating-emoji top-[15%] left-[15%] animate-float" style={{ animationDelay: '0.5s' }}>
          🏆
        </span>
        <span className="floating-emoji top-[30%] right-[20%] animate-float" style={{ animationDelay: '1s' }}>
          ✨
        </span>
        <span className="floating-emoji bottom-[20%] left-[10%] animate-float" style={{ animationDelay: '1.5s' }}>
          🎯
        </span>
        <span className="floating-emoji bottom-[30%] right-[8%] animate-float" style={{ animationDelay: '0.8s' }}>
          🧮
        </span>
        <span className="floating-emoji top-[50%] left-[5%] animate-float" style={{ animationDelay: '1.2s' }}>
          💡
        </span>
        <span className="floating-emoji bottom-[10%] right-[25%] animate-float" style={{ animationDelay: '0.3s' }}>
          🌟
        </span>
        <span className="floating-emoji top-[8%] left-[40%] animate-float" style={{ animationDelay: '2s' }}>
          ➕
        </span>
        <span className="floating-emoji bottom-[15%] left-[35%] animate-float" style={{ animationDelay: '1.8s' }}>
          ➖
        </span>
      </div>

      {/* Hero Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, type: 'spring' }}
        className="text-center max-w-lg w-full z-10"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          className="text-8xl mb-4"
        >
          🧒🏻
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-black mb-2 text-gradient leading-tight">
          IQ TALMAS
        </h1>
        <div className="mb-6"></div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="card-game mb-8"
        >
          <p className="text-lg text-foreground leading-relaxed">
            مرحبًا بك في بطولة سعودي ماث! اختبر سرعتك وذكاءك في الحساب الذهني. 🎉
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            playClick();
            onStart();
          }}
          className="btn-primary text-2xl px-12 py-5 w-full max-w-xs mx-auto block"
        >
          🚀 ابدأ الآن
        </motion.button>

        <button
          onClick={() => {
            playClick();
            onAdmin();
          }}
          className="mt-6 text-muted-foreground text-sm hover:text-foreground transition-colors underline cursor-pointer"
        >
          دخول المسؤول
        </button>
      </motion.div>

      {/* Student Leaderboard if records exist */}
      {records.length > 0 && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="card-game max-w-2xl w-full z-10 mt-8"
        >
          <h3 className="text-xl font-black text-foreground mb-4 text-center">
            🏅 نتائج الطلاب
          </h3>
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2 text-right font-black text-foreground">#</th>
                  <th className="p-2 text-right font-black text-foreground">الاسم</th>
                  <th className="p-2 text-center font-black text-foreground">الدرجة</th>
                  <th className="p-2 text-center font-black text-foreground">النسبة</th>
                  <th className="p-2 text-center font-black text-foreground">النجوم</th>
                  <th className="p-2 text-right font-black text-foreground">اللقب</th>
                  <th className="p-2 text-center font-black text-foreground">الوقت</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-2 font-bold text-muted-foreground">{idx + 1}</td>
                    <td className="p-2 font-bold">{r.fullName}</td>
                    <td className="p-2 text-center font-black text-game-orange">{r.score}</td>
                    <td className="p-2 text-center font-bold text-game-teal">{r.percentage}%</td>
                    <td className="p-2 text-center font-bold text-game-yellow">⭐ {r.stars}</td>
                    <td className="p-2 text-right font-bold text-game-purple">{r.title}</td>
                    <td className="p-2 text-center font-mono text-muted-foreground">{formatSeconds(r.duration)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};
