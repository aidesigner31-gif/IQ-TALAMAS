import React from 'react';
import { setMuted, getMuted } from '../utils/audio';

interface SoundToggleProps {
  muted: boolean;
  onToggle: (muted: boolean) => void;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({ muted, onToggle }) => {
  const handleClick = () => {
    const next = !muted;
    setMuted(next);
    onToggle(next);
  };

  return (
    <button
      onClick={handleClick}
      className="fixed top-4 left-4 z-50 w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center text-xl shadow-lg hover:scale-110 active:scale-95 transition-transform print:hidden cursor-pointer"
      title={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
      aria-label={muted ? 'تشغيل الصوت' : 'كتم الصوت'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  );
};
