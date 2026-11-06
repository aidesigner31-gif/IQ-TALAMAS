import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { defaultEasyQuestions } from '../data/questions';
import { generateOptions, formatTime, POSITIVE_FEEDBACK, NEGATIVE_FEEDBACK } from '../utils/helpers';
import { playClick, playCorrect, playWrong, playStar } from '../utils/audio';

interface EasyQuizScreenProps {
  onComplete: () => void;
  onUpdateScore: (score: number, stars: number, hearts: number, elapsed: number) => void;
}

export const EasyQuizScreen: React.FC<EasyQuizScreenProps> = ({ onComplete, onUpdateScore }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative'>('positive');
  const [elapsed, setElapsed] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentQ = defaultEasyQuestions[currentIndex];
  const options = useMemo(() => generateOptions(currentQ.correctAnswer), [currentQ.id]);

  const handleConfirm = useCallback(() => {
    if (selectedAnswer === null) return;
    playClick();

    if (selectedAnswer === currentQ.correctAnswer) {
      playCorrect();
      setTimeout(() => playStar(), 300);
      setStars((s) => s + 1);
      setScore((sc) => sc + 10);
      setFeedbackType('positive');
      setFeedback(POSITIVE_FEEDBACK[Math.floor(Math.random() * POSITIVE_FEEDBACK.length)]);
    } else {
      playWrong();
      setHearts((h) => Math.max(0, h - 1));
      setFeedbackType('negative');
      setFeedback(NEGATIVE_FEEDBACK[Math.floor(Math.random() * NEGATIVE_FEEDBACK.length)]);
    }
    setIsConfirmed(true);
  }, [selectedAnswer, currentQ]);

  const handleNext = useCallback(() => {
    playClick();
    setFeedback(null);
    setSelectedAnswer(null);
    setIsConfirmed(false);

    if (currentIndex >= defaultEasyQuestions.length - 1) {
      onUpdateScore(score, stars, hearts, elapsed);
      onComplete();
    } else {
      setCurrentIndex((idx) => idx + 1);
    }
  }, [currentIndex, score, stars, hearts, elapsed, onComplete, onUpdateScore]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const progressPercent = ((currentIndex + 1) / defaultEasyQuestions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col px-4 py-4 max-w-2xl mx-auto">
      {/* Top Header Stats */}
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="score-badge bg-amber-500/20 text-amber-600 dark:text-amber-400">
          🏅 {score} نقطة
        </div>
        <div className="score-badge bg-blue-500/20 text-blue-600 font-mono text-base">
          ⏱️ {formatTime(elapsed)}
        </div>
        <div className="score-badge bg-purple-500/20 text-purple-600">
          ⭐ {stars} نجمة
        </div>
        <div className="score-badge bg-pink-500/20 text-red-500">
          {'❤️'.repeat(hearts)}
          {'🤍'.repeat(Math.max(0, 3 - hearts))}
        </div>
      </div>

      {/* Level Tag */}
      <div className="text-center mb-2">
        <span className="inline-block bg-teal-500/20 text-teal-700 font-black text-sm px-4 py-1 rounded-full">
          🟢 المستوى السهل
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm font-bold text-muted-foreground mb-1">
          <span>السؤال {currentIndex + 1} / {defaultEasyQuestions.length}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <div className="progress-fill h-full" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Main Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 30, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="card-game flex-1"
        >
          {/* Story Prompt */}
          <div className="bg-blue-500/10 rounded-2xl p-4 mb-5 border border-blue-500/15">
            <p className="text-2xl font-bold leading-loose text-foreground">
              📖 {currentQ.story}
            </p>
          </div>

          {/* Question & Options */}
          <div className="mb-5">
            <h3 className="text-lg font-black text-teal-600 mb-3">
              👉 {currentQ.question}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {options.map((opt, i) => {
                let statusClass = '';
                if (isConfirmed) {
                  if (opt === currentQ.correctAnswer) {
                    statusClass = 'option-btn-correct';
                  } else if (opt === selectedAnswer && opt !== currentQ.correctAnswer) {
                    statusClass = 'option-btn-wrong';
                  }
                } else if (opt === selectedAnswer) {
                  statusClass = 'option-btn-selected';
                }

                return (
                  <motion.button
                    key={i}
                    whileTap={isConfirmed ? {} : { scale: 0.95 }}
                    disabled={isConfirmed}
                    onClick={() => {
                      playClick();
                      setSelectedAnswer(opt);
                    }}
                    className={`option-btn text-center text-base py-3 px-3 ${statusClass}`}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          {isConfirmed ? (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="btn-secondary w-full"
            >
              {currentIndex >= defaultEasyQuestions.length - 1
                ? '🚀 انتقل للمستوى المتقدم'
                : '➡️ السؤال التالي'}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={selectedAnswer === null}
              onClick={handleConfirm}
              className="btn-primary w-full"
            >
              ✅ تأكيد الإجابة
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating Feedback Bubble */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl font-black text-lg shadow-2xl z-50 pointer-events-none text-white ${
              feedbackType === 'positive'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : 'bg-gradient-to-r from-red-500 to-rose-500'
            }`}
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
