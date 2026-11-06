/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { ScreenType, PlayerRecord, AnswerRecord } from './types';
import { SoundToggle } from './components/SoundToggle';
import { HomeScreen } from './components/HomeScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { LevelSelectScreen } from './components/LevelSelectScreen';
import { EasyQuizScreen } from './components/EasyQuizScreen';
import { AdvancedQuizScreen } from './components/AdvancedQuizScreen';
import { ResultScreen } from './components/ResultScreen';
import { CertificateScreen } from './components/CertificateScreen';
import { AdminLoginScreen } from './components/AdminLoginScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { createPlayerRecord, saveRecord } from './utils/storage';
import { getMuted } from './utils/audio';

export default function App() {
  const [screen, setScreen] = useState<ScreenType>('home');
  const [muted, setMutedState] = useState(getMuted);

  const [playerData, setPlayerData] = useState<{
    fullName: string;
    phone: string;
    startedAt: string;
  } | null>(null);

  const [introScore, setIntroScore] = useState<{
    score: number;
    stars: number;
    hearts: number;
    elapsed: number;
  }>({
    score: 0,
    stars: 0,
    hearts: 3,
    elapsed: 0,
  });

  const [lastRecord, setLastRecord] = useState<PlayerRecord | null>(null);

  const handleRegister = useCallback((fullName: string, phone: string) => {
    setPlayerData({
      fullName,
      phone,
      startedAt: new Date().toISOString(),
    });
    setIntroScore({
      score: 0,
      stars: 0,
      hearts: 3,
      elapsed: 0,
    });
    setScreen('level-select');
  }, []);

  const handleUpdateIntroScore = useCallback(
    (score: number, stars: number, hearts: number, elapsed: number) => {
      setIntroScore({ score, stars, hearts, elapsed });
    },
    []
  );

  const handleFinishQuiz = useCallback(
    (answers: AnswerRecord[], finalHearts: number) => {
      const name = playerData?.fullName || 'طالب متميز';
      const phone = playerData?.phone || '0500000000';
      const started = playerData?.startedAt || new Date().toISOString();

      const record = createPlayerRecord(name, phone, answers, finalHearts, started);
      saveRecord(record);
      setLastRecord(record);
      setScreen('result');
    },
    [playerData]
  );

  const handleReplay = useCallback(() => {
    setIntroScore({
      score: 0,
      stars: 0,
      hearts: 3,
      elapsed: 0,
    });
    setLastRecord(null);
    setScreen('register');
  }, []);

  return (
    <div className="relative min-h-screen bg-background text-foreground" dir="rtl">
      {/* Sound Toggle Floating Button */}
      <SoundToggle muted={muted} onToggle={setMutedState} />

      {/* Screen Router */}
      {screen === 'home' && (
        <HomeScreen
          onStart={() => setScreen('register')}
          onAdmin={() => setScreen('admin-login')}
        />
      )}

      {screen === 'register' && (
        <RegisterScreen
          onRegister={handleRegister}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'level-select' && (
        <LevelSelectScreen
          onSelectLevel={(level) =>
            setScreen(level === 'easy' ? 'intro-quiz' : 'quiz')
          }
        />
      )}

      {screen === 'intro-quiz' && (
        <EasyQuizScreen
          onComplete={() => setScreen('quiz')}
          onUpdateScore={handleUpdateIntroScore}
        />
      )}

      {screen === 'quiz' && (
        <AdvancedQuizScreen
          onFinish={handleFinishQuiz}
          introScore={introScore}
        />
      )}

      {screen === 'result' && lastRecord && (
        <ResultScreen
          record={lastRecord}
          onCertificate={() => setScreen('certificate')}
          onReplay={handleReplay}
        />
      )}

      {screen === 'certificate' && lastRecord && (
        <CertificateScreen
          record={lastRecord}
          onReplay={handleReplay}
          onHome={() => setScreen('home')}
        />
      )}

      {screen === 'admin-login' && (
        <AdminLoginScreen
          onLogin={() => setScreen('admin-dashboard')}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'admin-dashboard' && (
        <AdminDashboard onBack={() => setScreen('home')} />
      )}
    </div>
  );
}
