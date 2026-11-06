import React, { useState } from 'react';
import { motion } from 'motion/react';
import { playClick } from '../utils/audio';

interface RegisterScreenProps {
  onRegister: (fullName: string, phone: string) => void;
  onBack: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onRegister, onBack }) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const validate = () => {
    const errs: { name?: string; phone?: string } = {};
    if (!fullName.trim()) {
      errs.name = 'الرجاء إدخال الاسم الكامل ✏️';
    }
    if (!phone.trim()) {
      errs.phone = 'الرجاء إدخال رقم الجوال 📱';
    } else if (!/^[\d+\-\s]{7,15}$/.test(phone.trim())) {
      errs.phone = 'رقم الجوال غير صحيح 📱';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    if (validate()) {
      onRegister(fullName.trim(), phone.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card-game max-w-md w-full"
      >
        <div className="text-center mb-6">
          <span className="text-5xl block mb-3">📝</span>
          <h2 className="text-2xl font-black text-foreground">تسجيل اللاعب</h2>
          <p className="text-muted-foreground mt-1">أدخل بياناتك للبدء في البطولة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              الاسم الكامل
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: أحمد محمد"
              className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-lg focus:border-primary focus:outline-none transition-colors"
            />
            {errors.name && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-destructive text-sm mt-1 font-bold"
              >
                {errors.name}
              </motion.p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-2">
              رقم الجوال
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XXXXXXXX"
              className="w-full rounded-xl border-2 border-border bg-background px-4 py-3 text-lg focus:border-primary focus:outline-none transition-colors"
              dir="ltr"
            />
            {errors.phone && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-destructive text-sm mt-1 font-bold"
              >
                {errors.phone}
              </motion.p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="btn-primary w-full text-xl"
          >
            🎮 ابدأ اللعب
          </motion.button>

          <button
            type="button"
            onClick={() => {
              playClick();
              onBack();
            }}
            className="w-full text-center text-muted-foreground hover:text-foreground transition-colors text-sm cursor-pointer"
          >
            ← العودة للرئيسية
          </button>
        </form>
      </motion.div>
    </div>
  );
};
