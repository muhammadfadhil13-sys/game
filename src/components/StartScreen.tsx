import React from 'react';
import { Play, BookOpen, Volume2, VolumeX, Sparkles, HelpCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface StartScreenProps {
  onStartGame: () => void;
  onOpenQuestionBank: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  totalQuestions: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onOpenQuestionBank,
  isMuted,
  onToggleMute,
  totalQuestions,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-gradient-to-b from-sky-400 via-sky-300 to-amber-200 flex items-center justify-center p-4 select-none overflow-y-auto">
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl border-4 border-amber-300 shadow-2xl p-5 sm:p-7 text-center flex flex-col items-center gap-4 animate-scale-up">
        
        {/* Animated Badge & Star */}
        <div className="relative">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-4 border-white shadow-xl flex items-center justify-center text-4xl sm:text-5xl animate-bounce">
            🌟
          </div>
          <Sparkles className="w-6 h-6 text-amber-500 absolute -top-1 -right-1 animate-spin" />
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-wide font-sans">
            PETUALANGAN FADHIKA
          </h1>
          <p className="text-sm sm:text-base font-bold text-amber-700 mt-1">
            Petualangan Matematika Seru — Materi Pecahan
          </p>
          <div className="inline-block mt-1 px-3 py-0.5 bg-amber-100 rounded-full text-xs font-semibold text-amber-800 border border-amber-300">
            {totalQuestions} Bintang Tantangan Tersedia
          </div>
        </div>

        {/* Story Intro */}
        <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
          Hai Teman-teman! Aku <strong className="text-amber-900 font-bold">Fadhika</strong>, sang petualang cilik.
          Bantu aku menjelajahi dunia angka dan temukan semua bintang pecahan ajaib!
        </p>

        {/* How to Play Card */}
        <div className="w-full bg-sky-50 rounded-2xl p-3 sm:p-4 border-2 border-sky-200 text-left text-xs sm:text-sm text-sky-950 font-semibold space-y-2">
          <div className="font-black text-sky-900 uppercase tracking-wider text-xs flex items-center gap-1.5 pb-1 border-b border-sky-200">
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span>Cara Bermain:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-sky-100">
              <span className="text-base">👆</span>
              <span>Ketuk 1x → <strong>Lompat</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-sky-100">
              <span className="text-base">👆👆</span>
              <span>Ketuk 2x → <strong>Double Jump</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-sky-100">
              <span className="text-base">🎯</span>
              <span>Sentuh Bintang → <strong>Jawab Soal</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 p-2 rounded-xl border border-sky-100">
              <span className="text-base">⭐</span>
              <span>Jawaban Benar → <strong>+10 Skor</strong></span>
            </div>
          </div>
          <p className="text-[11px] text-sky-700 font-normal">
            *Untuk keyboard komputer: Gunakan panah ⬅️ ➡️ untuk jalan, Spasi / W untuk lompat.
          </p>
        </div>

        {/* Main Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 pt-1">
          <button
            onClick={() => {
              sound.playClick();
              onStartGame();
            }}
            className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 active:scale-98 text-white font-black text-base sm:text-lg rounded-2xl shadow-xl border-2 border-yellow-200 flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-6 h-6 fill-white stroke-none" />
            <span>MULAI PETUALANGAN</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onOpenQuestionBank();
              }}
              className="flex-1 py-2.5 bg-sky-100 hover:bg-sky-200 active:scale-98 text-sky-800 font-bold text-xs sm:text-sm rounded-xl border border-sky-300 shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <BookOpen className="w-4 h-4 text-sky-600" />
              <span>Kelola Soal (Bank Soal)</span>
            </button>

            <button
              onClick={() => {
                onToggleMute();
                sound.playClick();
              }}
              className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 active:scale-98 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 shadow-sm flex items-center justify-center gap-1 transition-all"
              title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
              <span className="hidden sm:inline">{isMuted ? 'Mute' : 'Audio'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
