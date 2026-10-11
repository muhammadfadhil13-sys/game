import React from 'react';
import { RotateCcw, Home, BookOpen, Award, CheckCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface EndScreenProps {
  score: number;
  maxScore: number;
  starsCollected: number;
  totalStars: number;
  onPlayAgain: () => void;
  onHome: () => void;
  onOpenQuestionBank: () => void;
}

export const EndScreen: React.FC<EndScreenProps> = ({
  score,
  maxScore,
  starsCollected,
  totalStars,
  onPlayAgain,
  onHome,
  onOpenQuestionBank,
}) => {
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  let titleBadge = '💪 TERUS BERLATIH!';
  let subtitleBadge = 'Jangan patah semangat, berlatih lagi bersama Fadhika!';
  let badgeColor = 'from-amber-500 to-orange-500';

  if (percentage >= 90) {
    titleBadge = '🌟 MASTER PECAHAN!';
    subtitleBadge = 'Luar biasa! Pemahaman pecahanmu sempurna!';
    badgeColor = 'from-yellow-400 to-amber-500';
  } else if (percentage >= 70) {
    titleBadge = '🏆 HEBAT!';
    subtitleBadge = 'Kerja bagus! Kamu menguasai sebagian besar tantangan!';
    badgeColor = 'from-emerald-400 to-teal-500';
  } else if (percentage >= 50) {
    titleBadge = '👍 BAGUS!';
    subtitleBadge = 'Kemampuan matematikamu sudah berkembang pesat!';
    badgeColor = 'from-sky-400 to-blue-500';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none overflow-y-auto">
      <div className="w-full max-w-md bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-3xl border-4 border-amber-300 shadow-2xl p-6 sm:p-7 text-center flex flex-col items-center gap-4 animate-scale-up">
        
        {/* Trophy Celebration */}
        <div className="relative">
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr ${badgeColor} text-white shadow-xl flex items-center justify-center text-4xl sm:text-5xl border-4 border-white animate-bounce`}>
            🏆
          </div>
          <span className="absolute -bottom-1 -right-1 text-2xl animate-spin">
            ✨
          </span>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-amber-950 font-sans tracking-wide">
            🎉 PETUALANGAN SELESAI!
          </h2>
          <div className="mt-2 inline-block px-4 py-1.5 bg-amber-200/80 rounded-2xl border border-amber-300 shadow-sm">
            <span className="text-base sm:text-lg font-black text-amber-900">
              {titleBadge}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-amber-800 mt-1.5">
            {subtitleBadge}
          </p>
        </div>

        {/* Score Card */}
        <div className="w-full bg-white/90 rounded-2xl p-4 border-2 border-amber-200 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-100">
            <span className="text-xs sm:text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Skor Akhir Kamu:</span>
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-600">
              ⭐ {score} / {maxScore}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-600 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Bintang Terkumpul:</span>
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-800">
              {starsCollected} / {totalStars} Bintang
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 pt-1">
          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 active:scale-98 text-white font-black text-base rounded-2xl shadow-lg border border-emerald-300 flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span>MAIN LAGI</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onHome();
              }}
              className="flex-1 py-2.5 bg-white hover:bg-slate-100 active:scale-98 text-slate-700 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <Home className="w-4 h-4 text-slate-600" />
              <span>Menu Utama</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onOpenQuestionBank();
              }}
              className="flex-1 py-2.5 bg-sky-100 hover:bg-sky-200 active:scale-98 text-sky-800 font-bold text-xs sm:text-sm rounded-xl border border-sky-300 shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <BookOpen className="w-4 h-4 text-sky-600" />
              <span>Bank Soal</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
