import React, { useState } from 'react';
import { motion } from 'motion/react';
import { playClick } from '../utils/audio';

interface AdminLoginScreenProps {
  onLogin: () => void;
  onBack: () => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClick();

    if (username === 'admin' && password === 'IQTalmas2026') {
      onLogin();
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة ❌');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card-game max-w-sm w-full"
      >
        <div className="text-center mb-6">
          <span className="text-5xl block mb-3">🔐</span>
          <h2 className="text-2xl font-black text-foreground">دخول المسؤول</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">
              اسم المستخدم
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="w-full rounded-xl border-2 border-border bg-background px-4 py-2 text-base focus:border-primary focus:outline-none transition-colors"
              dir="ltr"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full rounded-xl border-2 border-border bg-background px-4 py-2 text-base focus:border-primary focus:outline-none transition-colors"
              dir="ltr"
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-destructive text-sm font-bold text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn-primary w-full text-lg"
          >
            تسجيل الدخول
          </motion.button>

          <button
            type="button"
            onClick={() => {
              playClick();
              onBack();
            }}
            className="w-full text-center text-muted-foreground hover:text-foreground transition-colors text-sm cursor-pointer"
          >
            ← العودة
          </button>
        </form>
      </motion.div>
    </div>
  );
};
