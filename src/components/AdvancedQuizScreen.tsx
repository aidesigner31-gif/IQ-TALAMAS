import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { getActiveAdvancedQuestions } from '../data/questions';
import { generateOptions, formatTime, POSITIVE_FEEDBACK, NEGATIVE_FEEDBACK } from '../utils/helpers';
import { playClick, playCorrect, playWrong, playStar } from '../utils/audio';
import { AnswerRecord } from '../types';

interface AdvancedQuizScreenProps {
  onFinish: (answers: AnswerRecord[], finalHearts: number) => void;
  introScore?: {
    score: number;
    stars: number;
    hearts: number;
    elapsed: number;
  };
}

export const AdvancedQuizScreen: React.FC<AdvancedQuizScreenProps> = ({ onFinish, introScore }) => {
  const [questions] = useState(getActiveAdvancedQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [selectedLawIndex, setSelectedLawIndex] = useState<number | null>(null);
  const [answersList, setAnswersList] = useState<AnswerRecord[]>([]);

  const [hearts, setHearts] = useState(introScore?.hearts ?? 3);
  const [score, setScore] = useState(introScore?.score ?? 0);
  const [stars, setStars] = useState(introScore?.stars ?? 0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'positive' | 'negative'>('positive');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [elapsed, setElapsed] = useState(introScore?.elapsed ?? 0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const currentQ = questions[currentIndex];
  const options = useMemo(() => generateOptions(currentQ.correctAnswer), [currentQ.id, currentQ.correctAnswer]);

  const handleConfirm = useCallback(() => {
    if (selectedAnswer === null || selectedLawIndex === null) return;
    playClick();

    const isAnswerCorrect = selectedAnswer === currentQ.correctAnswer;
    const isLawCorrect = selectedLawIndex === currentQ.lawCorrectIndex;

    let pointsGained = 0;
    if (isAnswerCorrect) pointsGained += 5;
    if (isLawCorrect) pointsGained += 5;

    if (isAnswerCorrect && isLawCorrect) {
      playCorrect();
      setTimeout(() => playStar(), 300);
      setStars((s) => s + 1);
      setFeedbackType('positive');
      setFeedback(POSITIVE_FEEDBACK[Math.floor(Math.random() * POSITIVE_FEEDBACK.length)]);
    } else {
      playWrong();
      setFeedbackType('negative');
      setFeedback(NEGATIVE_FEEDBACK[Math.floor(Math.random() * NEGATIVE_FEEDBACK.length)]);
      if (!isAnswerCorrect && !isLawCorrect) {
        setHearts((h) => Math.max(0, h - 1));
      }
    }

    setScore((sc) => sc + pointsGained);
    setIsConfirmed(true);

    const record: AnswerRecord = {
      questionId: currentQ.id,
      selectedAnswer,
      selectedLawIndex,
      isAnswerCorrect,
      isLawCorrect,
      points: pointsGained,
    };

    setAnswersList((prev) => [...prev, record]);
  }, [selectedAnswer, selectedLawIndex, currentQ]);

  const handleNext = useCallback(() => {
    playClick();
    setFeedback(null);
    setSelectedAnswer(null);
    setSelectedLawIndex(null);
    setIsConfirmed(false);

    if (currentIndex >= questions.length - 1) {
      onFinish(answersList, hearts);
    } else {
      setCurrentIndex((idx) => idx + 1);
    }
  }, [currentIndex, questions.length, answersList, hearts, onFinish]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

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
        <span className="inline-block bg-orange-500/20 text-orange-600 font-black text-sm px-4 py-1 rounded-full">
          🔴 المستوى المتقدم
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm font-bold text-muted-foreground mb-1">
          <span>السؤال {currentIndex + 1} / {questions.length}</span>
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

          {/* Part A: Numerical Answer */}
          <div className="mb-5">
            <h3 className="text-lg font-black text-teal-600 mb-3">
              أ) {currentQ.questionA}
            </h3>
            <div className="grid grid-cols-2 gap-2">
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
                    className={`option-btn text-center text-base py-2.5 px-3 ${statusClass}`}
                  >
                    {opt}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Part B: Law / Rule Question */}
          <div className="mb-5">
            <h3 className="text-lg font-black text-purple-600 mb-3">
              ب) {currentQ.questionB}
            </h3>
            <div className="space-y-2">
              {currentQ.lawOptions.map((law, idx) => {
                let statusClass = '';
                if (isConfirmed) {
                  if (idx === currentQ.lawCorrectIndex) {
                    statusClass = 'option-btn-correct';
                  } else if (idx === selectedLawIndex && idx !== currentQ.lawCorrectIndex) {
                    statusClass = 'option-btn-wrong';
                  }
                } else if (idx === selectedLawIndex) {
                  statusClass = 'option-btn-selected';
                }

                return (
                  <motion.button
                    key={idx}
                    whileTap={isConfirmed ? {} : { scale: 0.98 }}
                    disabled={isConfirmed}
                    onClick={() => {
                      playClick();
                      setSelectedLawIndex(idx);
                    }}
                    className={`option-btn text-sm py-2.5 px-3 ${statusClass}`}
                  >
                    {String.fromCharCode(65 + idx)}) {law}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Next / Confirm Button */}
          {isConfirmed ? (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleNext}
              className="btn-secondary w-full"
            >
              {currentIndex >= questions.length - 1 ? '🏆 عرض النتيجة' : '➡️ السؤال التالي'}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={selectedAnswer === null || selectedLawIndex === null}
              onClick={handleConfirm}
              className="btn-primary w-full"
            >
              ✅ تأكيد الإجابة
            </motion.button>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Floating Feedback Toast */}
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
