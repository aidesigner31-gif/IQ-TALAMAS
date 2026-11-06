import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerRecord } from '../types';
import { getRecords, deleteRecord, clearRecords } from '../utils/storage';
import {
  defaultAdvancedQuestions,
  getOverrides,
  saveOverrides,
  clearOverrides,
} from '../data/questions';
import { playClick } from '../utils/audio';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'results' | 'answers'>('results');
  const [records, setRecords] = useState<PlayerRecord[]>(getRecords);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortByScore, setSortByScore] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerRecord | null>(null);

  // Overrides state for Tab 2
  const [overrides, setOverrides] = useState(getOverrides);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editNumAnswer, setEditNumAnswer] = useState('');
  const [editLawIndex, setEditLawIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredRecords = useMemo(() => {
    let list = records.filter(
      (r) => r.fullName.includes(searchQuery) || r.phone.includes(searchQuery)
    );
    if (sortByScore) {
      list = [...list].sort((a, b) => b.score - a.score);
    }
    return list;
  }, [records, searchQuery, sortByScore]);

  const totalPlayers = records.length;
  const highestScore = records.length ? Math.max(...records.map((r) => r.score)) : 0;
  const averageScore = records.length
    ? Math.round(records.reduce((sum, r) => sum + r.score, 0) / records.length)
    : 0;

  const handleDeleteRecord = (id: string) => {
    deleteRecord(id);
    setRecords(getRecords());
    showNotification('تم حذف سجل اللاعب');
  };

  const handleClearAll = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع بيانات الطلاب؟ لا يمكن التراجع عن هذا الإجراء.')) {
      clearRecords();
      setRecords([]);
      showNotification('تم مسح جميع بيانات الطلاب');
    }
  };

  const handleExportCsv = () => {
    const headers = ['الاسم', 'الجوال', 'الدرجة', 'النجوم', 'النسبة', 'اللقب', 'التاريخ', 'المدة (ث)'].join(',');
    const rows = records.map((r) =>
      [
        `"${r.fullName.replace(/"/g, '""')}"`,
        `"${r.phone}"`,
        r.score,
        r.stars,
        `"${r.percentage}%"`,
        `"${r.title}"`,
        `"${new Date(r.finishedAt).toLocaleDateString('ar-SA')}"`,
        r.duration,
      ].join(',')
    );

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'نتائج_سعودي_ماث.csv';
    link.click();
    URL.revokeObjectURL(url);
    showNotification('تم تصدير ملف النتائج بنجاح');
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Answers Tab Handlers
  const startEditQuestion = (q: (typeof defaultAdvancedQuestions)[0]) => {
    const currentOverride = overrides[q.id];
    setEditingQuestionId(q.id);
    setEditNumAnswer(String(currentOverride?.correctAnswer ?? q.correctAnswer));
    setEditLawIndex(currentOverride?.lawCorrectIndex ?? q.lawCorrectIndex);
  };

  const saveEditQuestion = (q: (typeof defaultAdvancedQuestions)[0]) => {
    const num = Number(editNumAnswer);
    if (isNaN(num)) {
      showNotification('أدخل رقمًا صحيحًا للإجابة');
      return;
    }
    const updated = {
      ...overrides,
      [q.id]: {
        correctAnswer: num,
        lawCorrectIndex: editLawIndex,
      },
    };
    saveOverrides(updated);
    setOverrides(updated);
    setEditingQuestionId(null);
    showNotification(`تم حفظ إجابة السؤال ${q.id}`);
  };

  const handleResetOverrides = () => {
    clearOverrides();
    setOverrides({});
    showNotification('تم إعادة جميع الإجابات للافتراضية');
  };

  return (
    <div className="min-h-screen px-4 py-6 max-w-6xl mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background px-6 py-2.5 rounded-xl font-bold shadow-xl text-sm"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-black text-foreground">📊 لوحة الإدارة</h1>
        <button
          onClick={() => {
            playClick();
            onBack();
          }}
          className="text-sm text-muted-foreground hover:text-foreground underline cursor-pointer"
        >
          ← العودة
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => {
            playClick();
            setActiveTab('results');
          }}
          className={`rounded-xl px-5 py-2 text-sm font-bold border-2 transition-colors cursor-pointer ${
            activeTab === 'results'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          📊 النتائج
        </button>
        <button
          onClick={() => {
            playClick();
            setActiveTab('answers');
          }}
          className={`rounded-xl px-5 py-2 text-sm font-bold border-2 transition-colors cursor-pointer ${
            activeTab === 'answers'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-border bg-card text-muted-foreground hover:text-foreground'
          }`}
        >
          ✏️ الإجابات
        </button>
      </div>

      {/* Tab Content: Answers */}
      {activeTab === 'answers' ? (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-lg font-black text-foreground">✏️ تعديل الإجابات الصحيحة</h2>
            <button
              onClick={handleResetOverrides}
              className="text-xs text-destructive hover:underline font-bold cursor-pointer"
            >
              🔄 إعادة للافتراضي
            </button>
          </div>

          <div className="space-y-3">
            {defaultAdvancedQuestions.map((q) => {
              const isOverridden = Boolean(overrides[q.id]);
              const currentAns = overrides[q.id]?.correctAnswer ?? q.correctAnswer;
              const currentLaw = overrides[q.id]?.lawCorrectIndex ?? q.lawCorrectIndex;
              const isEditing = editingQuestionId === q.id;

              return (
                <motion.div
                  key={q.id}
                  layout
                  className={`rounded-xl border-2 p-4 transition-colors ${
                    isOverridden ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground font-bold">سؤال {q.id}</span>
                        {isOverridden && (
                          <span className="bg-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                            معدّل
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-foreground line-clamp-1">{q.story}</p>
                      <div className="flex flex-wrap gap-4 mt-1 text-xs text-muted-foreground">
                        <span>
                          الإجابة: <strong className="text-foreground">{currentAns}</strong>
                        </span>
                        <span>
                          القانون:{' '}
                          <strong className="text-foreground">
                            {q.lawOptions[currentLaw] || `خيار ${currentLaw + 1}`}
                          </strong>
                        </span>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEditQuestion(q)}
                          className="text-xs bg-emerald-500/20 text-emerald-700 rounded-lg px-3 py-1.5 font-bold hover:bg-emerald-500/30 cursor-pointer"
                        >
                          حفظ ✅
                        </button>
                        <button
                          onClick={() => setEditingQuestionId(null)}
                          className="text-xs bg-muted rounded-lg px-3 py-1.5 font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditQuestion(q)}
                        className="text-xs bg-blue-500/10 text-blue-600 rounded-lg px-3 py-1.5 font-bold hover:bg-blue-500/20 cursor-pointer"
                      >
                        تعديل ✏️
                      </button>
                    )}
                  </div>

                  {isEditing && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="mt-3 space-y-3 border-t border-border pt-3"
                    >
                      <div>
                        <label className="text-xs font-bold text-muted-foreground block mb-1">
                          الإجابة الصحيحة (رقم)
                        </label>
                        <input
                          type="number"
                          value={editNumAnswer}
                          onChange={(e) => setEditNumAnswer(e.target.value)}
                          className="w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-muted-foreground block mb-1">
                          القانون الصحيح
                        </label>
                        <select
                          value={editLawIndex}
                          onChange={(e) => setEditLawIndex(Number(e.target.value))}
                          className="w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                        >
                          {q.lawOptions.map((opt, idx) => (
                            <option key={idx} value={idx}>
                              {String.fromCharCode(65 + idx)}) {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Tab Content: Results */
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="card-game text-center">
              <p className="text-3xl font-black text-blue-600">{totalPlayers}</p>
              <p className="text-sm text-muted-foreground font-bold">إجمالي اللاعبين</p>
            </div>
            <div className="card-game text-center">
              <p className="text-3xl font-black text-orange-600">{highestScore}</p>
              <p className="text-sm text-muted-foreground font-bold">أعلى درجة</p>
            </div>
            <div className="card-game text-center">
              <p className="text-3xl font-black text-teal-600">{averageScore}</p>
              <p className="text-sm text-muted-foreground font-bold">متوسط الدرجات</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              placeholder="🔍 بحث بالاسم أو الجوال..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 min-w-[200px] rounded-xl border-2 border-border bg-card px-4 py-2 focus:border-primary focus:outline-none text-sm"
            />
            <button
              onClick={() => setSortByScore(!sortByScore)}
              className={`rounded-xl px-4 py-2 text-sm font-bold border-2 transition-colors cursor-pointer ${
                sortByScore
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground'
              }`}
            >
              ترتيب حسب الدرجة
            </button>
            <button
              onClick={handleExportCsv}
              disabled={records.length === 0}
              className="btn-game bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 cursor-pointer disabled:opacity-50"
            >
              📥 تصدير النتائج
            </button>
            <button
              onClick={handleClearAll}
              disabled={records.length === 0}
              className="btn-game bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm px-4 py-2 cursor-pointer disabled:opacity-50"
            >
              🗑️ حذف الكل
            </button>
          </div>

          {/* Results Table */}
          {filteredRecords.length === 0 ? (
            <div className="card-game text-center py-12">
              <p className="text-5xl mb-3">📭</p>
              <p className="text-muted-foreground font-bold">لا توجد نتائج بعد</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="p-3 text-right font-black text-foreground">#</th>
                    <th className="p-3 text-right font-black text-foreground">الاسم</th>
                    <th className="p-3 text-right font-black text-foreground">الجوال</th>
                    <th className="p-3 text-center font-black text-foreground">الدرجة</th>
                    <th className="p-3 text-center font-black text-foreground">النسبة</th>
                    <th className="p-3 text-center font-black text-foreground">النجوم</th>
                    <th className="p-3 text-right font-black text-foreground">اللقب</th>
                    <th className="p-3 text-center font-black text-foreground">المدة</th>
                    <th className="p-3 text-center font-black text-foreground">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((r, idx) => (
                    <tr key={r.id} className="border-b border-border/60 hover:bg-muted/40 transition-colors">
                      <td className="p-3 font-bold text-muted-foreground">{idx + 1}</td>
                      <td className="p-3 font-bold text-foreground">{r.fullName}</td>
                      <td className="p-3 font-mono text-muted-foreground" dir="ltr">
                        {r.phone}
                      </td>
                      <td className="p-3 text-center font-black text-orange-600">{r.score}</td>
                      <td className="p-3 text-center font-bold text-teal-600">{r.percentage}%</td>
                      <td className="p-3 text-center font-bold text-amber-500">⭐ {r.stars}</td>
                      <td className="p-3 text-right font-bold text-purple-600">{r.title}</td>
                      <td className="p-3 text-center font-mono text-muted-foreground">
                        {formatSeconds(r.duration)}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedPlayer(r)}
                            className="bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                          >
                            عرض
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(r.id)}
                            className="bg-destructive/10 hover:bg-destructive/20 text-destructive text-xs font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors"
                            title="حذف"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Player Details Modal */}
      <AnimatePresence>
        {selectedPlayer && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedPlayer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card-game max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-xl font-black text-foreground mb-4">تفاصيل اللاعب</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-bold text-muted-foreground">الاسم:</span> {selectedPlayer.fullName}
                </p>
                <p>
                  <span className="font-bold text-muted-foreground">الجوال:</span>{' '}
                  <span dir="ltr" className="font-mono">{selectedPlayer.phone}</span>
                </p>
                <p>
                  <span className="font-bold text-muted-foreground">الدرجة:</span>{' '}
                  <span className="font-black text-orange-600">{selectedPlayer.score} / 280</span>
                </p>
                <p>
                  <span className="font-bold text-muted-foreground">النجوم:</span> ⭐ {selectedPlayer.stars}
                </p>
                <p>
                  <span className="font-bold text-muted-foreground">النسبة:</span> {selectedPlayer.percentage}%
                </p>
                <p>
                  <span className="font-bold text-muted-foreground">اللقب:</span> {selectedPlayer.title}
                </p>
                <p>
                  <span className="font-bold text-muted-foreground">القلوب:</span>{' '}
                  {'❤️'.repeat(selectedPlayer.heartsLeft)}
                </p>
                <p>
                  <span className="font-bold text-muted-foreground">المدة:</span> {formatSeconds(selectedPlayer.duration)}
                </p>
              </div>

              <h4 className="text-base font-black text-foreground mt-4 mb-2">الإجابات</h4>
              <div className="space-y-1.5 text-xs max-h-60 overflow-y-auto pr-1">
                {selectedPlayer.answers && selectedPlayer.answers.length > 0 ? (
                  selectedPlayer.answers.map((ans, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center rounded-lg p-2.5 ${
                        ans.isAnswerCorrect && ans.isLawCorrect
                          ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      <span className="font-bold">س{ans.questionId}</span>
                      <div className="flex gap-3">
                        <span>النتيجة: {ans.isAnswerCorrect ? '✅' : '❌'}</span>
                        {ans.isLawCorrect !== undefined && (
                          <span>القانون: {ans.isLawCorrect ? '✅' : '❌'}</span>
                        )}
                        <span className="font-bold">({ans.points} نقاط)</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">لا توجد تفاصيل إجابات مسجلة</p>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="btn-game bg-muted hover:bg-muted/80 text-foreground text-sm px-6 py-2 cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
