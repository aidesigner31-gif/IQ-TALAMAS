import React from 'react';
import { motion } from 'motion/react';
import { playClick } from '../utils/audio';

interface LevelSelectScreenProps {
  onSelectLevel: (level: 'easy' | 'advanced') => void;
}

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({ onSelectLevel }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card-game max-w-lg w-full text-center"
      >
        <span className="text-5xl block mb-3">🏆</span>
        <h2 className="text-2xl font-black text-foreground mb-2">اختر المستوى</h2>
        <p className="text-muted-foreground mb-8">اختر المستوى الذي تريد البدء به</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playClick();
              onSelectLevel('easy');
            }}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl border-3 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors cursor-pointer"
          >
            <span className="text-6xl">🟢</span>
            <span className="text-xl font-black text-foreground">المستوى السهل</span>
            <span className="text-sm text-muted-foreground">10 أسئلة تمهيدية</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playClick();
              onSelectLevel('advanced');
            }}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl border-3 border-red-500/40 bg-red-500/10 hover:bg-red-500/20 transition-colors cursor-pointer"
          >
            <span className="text-6xl">🔴</span>
            <span className="text-xl font-black text-foreground">المستوى المتقدم</span>
            <span className="text-sm text-muted-foreground">28 سؤال ذهني</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
