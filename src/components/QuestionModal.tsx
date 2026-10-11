import React, { useState } from 'react';
import { QuestionItem } from '../types/game';
import { sound } from '../utils/audio';
import { CheckCircle2, AlertCircle, ArrowRight, Lightbulb } from 'lucide-react';

interface QuestionModalProps {
  question: QuestionItem;
  starNumber: number;
  totalStars: number;
  onCorrectAnswer: () => void;
  onWrongAnswer: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  starNumber,
  totalStars,
  onCorrectAnswer,
  onWrongAnswer,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [wrongOptionIds, setWrongOptionIds] = useState<string[]>([]);

  const handleSelectOption = (optionId: string) => {
    if (feedbackStatus === 'correct') return; // already solved

    setSelectedOptionId(optionId);

    if (optionId === question.correctOptionId) {
      setFeedbackStatus('correct');
      sound.playCorrect();
      // Wait for celebration and auto close
      setTimeout(() => {
        onCorrectAnswer();
      }, 1600);
    } else {
      setFeedbackStatus('wrong');
      sound.playWrong();
      if (!wrongOptionIds.includes(optionId)) {
        setWrongOptionIds((prev) => [...prev, optionId]);
      }
      onWrongAnswer();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl border-4 border-amber-300 shadow-2xl p-4 sm:p-6 flex flex-col gap-4">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">⭐</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                Bintang Pecahan #{starNumber} dari {totalStars}
              </span>
              <h2 className="text-base sm:text-lg font-black text-amber-950">
                {question.title || 'Tantangan Pecahan Fadhika'}
              </h2>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-full border border-amber-300">
            {question.grade}
          </span>
        </div>

        {/* Question Text */}
        <div className="bg-white/90 rounded-2xl p-3.5 sm:p-4 border-2 border-amber-200/60 shadow-sm">
          <p className="text-slate-800 text-sm sm:text-base font-semibold leading-relaxed">
            {question.questionText}
          </p>

          {/* Question Image / Fraction diagram if present */}
          {question.questionImage && (
            <div className="mt-3 flex justify-center p-2 bg-amber-50/70 rounded-xl border border-amber-200">
              <img
                src={question.questionImage}
                alt="Diagram Pecahan"
                className="max-h-36 sm:max-h-44 object-contain rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Feedback Banner (Correct or Wrong) */}
        {feedbackStatus === 'correct' && (
          <div className="p-3 bg-emerald-100 border-2 border-emerald-400 rounded-2xl flex items-center gap-3 animate-scale-up text-emerald-900 shadow-md">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 animate-pulse" />
            <div className="flex-1">
              <h4 className="font-black text-base text-emerald-700">🎉 BENAR!</h4>
              <p className="text-xs sm:text-sm font-bold text-emerald-800">
                Hebat! Kamu menemukan jawabannya! <span className="text-amber-600">+10 ⭐</span>
              </p>
            </div>
            <button
              onClick={onCorrectAnswer}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow transition-all active:scale-95"
            >
              <span>Lanjut</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {feedbackStatus === 'wrong' && (
          <div className="p-3 bg-rose-100 border-2 border-rose-400 rounded-2xl flex items-center gap-3 animate-shake text-rose-900 shadow-md">
            <AlertCircle className="w-7 h-7 text-rose-600 shrink-0" />
            <div className="flex-1">
              <h4 className="font-black text-sm sm:text-base text-rose-700">😊 COBA LAGI!</h4>
              <p className="text-xs sm:text-sm font-bold text-rose-800">
                Belum tepat. Coba pikirkan lagi! <span className="text-rose-600 text-xs">(-10 Skor)</span>
              </p>
            </div>
          </div>
        )}

        {/* Options List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {question.options.map((option) => {
            const isSelected = selectedOptionId === option.id;
            const isCorrect = option.id === question.correctOptionId;
            const isKnownWrong = wrongOptionIds.includes(option.id);

            let btnStyle = 'bg-white hover:bg-amber-100/80 border-amber-300 text-slate-800';

            if (feedbackStatus === 'correct' && isCorrect) {
              btnStyle = 'bg-emerald-200 border-emerald-500 text-emerald-950 font-bold ring-4 ring-emerald-300/60 shadow-lg';
            } else if (isKnownWrong) {
              btnStyle = 'bg-rose-100 border-rose-300 text-rose-700 opacity-80';
            } else if (isSelected && feedbackStatus === 'wrong') {
              btnStyle = 'bg-rose-200 border-rose-400 text-rose-900';
            }

            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                disabled={feedbackStatus === 'correct'}
                className={`relative flex items-center gap-3 p-3 rounded-2xl border-2 text-left transition-all active:scale-98 shadow-sm ${btnStyle}`}
              >
                {/* Option Badge A, B, C, D */}
                <span className="w-8 h-8 rounded-xl bg-amber-200/90 text-amber-900 font-black flex items-center justify-center text-sm shrink-0 shadow-inner">
                  {option.label}
                </span>

                <div className="flex-1 min-w-0">
                  <span className="text-xs sm:text-sm font-semibold break-words leading-tight">
                    {option.text}
                  </span>
                  {/* Option Image if available */}
                  {option.image && (
                    <img
                      src={option.image}
                      alt={`Pilihan ${option.label}`}
                      className="mt-1.5 max-h-16 rounded border border-amber-200 object-contain"
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation on correct answer */}
        {feedbackStatus === 'correct' && question.explanation && (
          <div className="bg-amber-100/80 p-3 rounded-2xl border border-amber-300 text-xs sm:text-sm text-amber-900 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Penjelasan Ceria: </span>
              <span>{question.explanation}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
