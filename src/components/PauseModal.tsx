import React from 'react';
import { Play, RotateCcw, Home, BookOpen } from 'lucide-react';
import { sound } from '../utils/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onOpenQuestionBank: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  onOpenQuestionBank,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-sm bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl border-4 border-amber-300 shadow-2xl p-6 text-center flex flex-col items-center gap-4 animate-scale-up">
        
        <div className="w-16 h-16 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-3xl shadow-inner border-2 border-white">
          ⏸️
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-amber-950 font-sans">
            GAME DIJEDA
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-amber-700 mt-1">
            Fadhika sedang beristirahat sejenak!
          </p>
        </div>

        <div className="w-full flex flex-col gap-2.5 pt-2">
          {/* Lanjutkan */}
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-98 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg border border-emerald-300 flex items-center justify-center gap-2 transition-all"
          >
            <Play className="w-5 h-5 fill-white stroke-none" />
            <span>Lanjutkan Petualangan</span>
          </button>

          {/* Mulai Ulang */}
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-2.5 bg-amber-200 hover:bg-amber-300 active:scale-98 text-amber-950 font-bold text-sm rounded-xl border border-amber-400 shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-800" />
            <span>Mulai Ulang Level</span>
          </button>

          {/* Kelola Soal */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenQuestionBank();
            }}
            className="w-full py-2.5 bg-sky-100 hover:bg-sky-200 active:scale-98 text-sky-900 font-bold text-sm rounded-xl border border-sky-300 shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <BookOpen className="w-4 h-4 text-sky-700" />
            <span>Bank Soal / Pengaturan</span>
          </button>

          {/* Menu Utama */}
          <button
            onClick={() => {
              sound.playClick();
              onHome();
            }}
            className="w-full py-2.5 bg-white hover:bg-slate-100 active:scale-98 text-slate-700 font-bold text-sm rounded-xl border border-slate-300 shadow-sm flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4 text-slate-600" />
            <span>Menu Utama</span>
          </button>
        </div>

      </div>
    </div>
  );
};
