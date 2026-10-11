import React from 'react';
import { Volume2, VolumeX, Pause, BookOpen } from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderHUDProps {
  score: number;
  maxScore: number;
  answeredCount: number;
  totalCount: number;
  lives: number;
  maxLives: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenQuestionBank: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  score,
  maxScore,
  answeredCount,
  totalCount,
  lives,
  maxLives,
  isMuted,
  onToggleMute,
  onPause,
  onOpenQuestionBank,
}) => {
  const progressPct = totalCount > 0 ? Math.min(100, Math.round((answeredCount / totalCount) * 100)) : 0;

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-2 sm:p-3 select-none">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2 bg-white/90 backdrop-blur-md rounded-2xl border-2 border-amber-300 shadow-lg px-3 py-2 sm:px-4 sm:py-2.5">
        {/* Title & Fadhika Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl" role="img" aria-label="Bintang">🌟</span>
          <div>
            <h1 className="font-bold text-amber-900 text-sm sm:text-base leading-tight tracking-wide font-sans">
              PETUALANGAN FADHIKA
            </h1>
            <p className="text-[11px] text-amber-700 font-medium hidden sm:block">
              Materi Pecahan Matematika Ceria
            </p>
          </div>
        </div>

        {/* Stats: Score, Stars, Hearts */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Score */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-950">
            <span className="text-amber-500 text-base">⭐</span>
            <span>SKOR: <span className="text-amber-600 font-extrabold">{score}</span></span>
          </div>

          {/* Stars Count */}
          <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-slate-800">
            <span className="text-sky-500">🔢</span>
            <span>{answeredCount}/{totalCount}</span>
          </div>

          {/* Hearts / Lives */}
          <div className="flex items-center gap-0.5">
            {Array.from({ length: maxLives }).map((_, i) => (
              <span
                key={i}
                className={`text-sm sm:text-base transition-transform ${
                  i < lives ? 'scale-100 text-rose-500' : 'scale-90 opacity-25 grayscale'
                }`}
              >
                ❤️
              </span>
            ))}
          </div>

          {/* Progress Bar (Desktop & Tablet) */}
          <div className="hidden md:flex flex-col gap-1 w-24 lg:w-32">
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-500 font-semibold text-right">
              {progressPct}% Selesai
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Bank Soal Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenQuestionBank();
            }}
            className="flex items-center gap-1 bg-sky-100 hover:bg-sky-200 active:scale-95 text-sky-800 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-sky-300 shadow-sm transition-all"
            title="Kelola & Bank Soal"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">Bank Soal</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleMute();
              sound.playClick();
            }}
            className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 border border-amber-300 shadow-sm transition-all"
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
            aria-label="Sound Toggle"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={() => {
              sound.playClick();
              onPause();
            }}
            className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 border border-amber-300 shadow-sm transition-all"
            title="Jeda Game"
            aria-label="Pause Button"
          >
            <Pause className="w-4 h-4 text-amber-800" />
          </button>
        </div>
      </div>
    </header>
  );
};
