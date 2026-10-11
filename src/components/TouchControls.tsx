import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

interface TouchControlsProps {
  onMoveLeft: (active: boolean) => void;
  onMoveRight: (active: boolean) => void;
  onJump: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onJump,
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 px-4 sm:px-8 pointer-events-none z-20 flex justify-between items-end select-none">
      {/* Horizontal directional buttons (Left & Right) */}
      <div className="flex gap-3 pointer-events-auto">
        <button
          type="button"
          aria-label="Gerak Kiri"
          onTouchStart={(e) => {
            e.preventDefault();
            onMoveLeft(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onMoveLeft(false);
          }}
          onMouseDown={() => onMoveLeft(true)}
          onMouseUp={() => onMoveLeft(false)}
          onMouseLeave={() => onMoveLeft(false)}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/75 hover:bg-white/95 active:scale-90 active:bg-amber-100 backdrop-blur-md border-2 border-amber-300 shadow-xl flex items-center justify-center text-amber-900 transition-transform touch-none"
        >
          <ArrowLeft className="w-8 h-8 stroke-[3]" />
        </button>

        <button
          type="button"
          aria-label="Gerak Kanan"
          onTouchStart={(e) => {
            e.preventDefault();
            onMoveRight(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onMoveRight(false);
          }}
          onMouseDown={() => onMoveRight(true)}
          onMouseUp={() => onMoveRight(false)}
          onMouseLeave={() => onMoveRight(false)}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/75 hover:bg-white/95 active:scale-90 active:bg-amber-100 backdrop-blur-md border-2 border-amber-300 shadow-xl flex items-center justify-center text-amber-900 transition-transform touch-none"
        >
          <ArrowRight className="w-8 h-8 stroke-[3]" />
        </button>
      </div>

      {/* Action / Jump button (Single Tap = Jump, Double Tap = Double Jump) */}
      <div className="pointer-events-auto">
        <button
          type="button"
          aria-label="Lompat & Double Jump"
          onTouchStart={(e) => {
            e.preventDefault();
            onJump();
          }}
          onClick={(e) => {
            e.preventDefault();
            onJump();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-t from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-90 text-white shadow-2xl border-2 border-yellow-200 flex flex-col items-center justify-center transition-transform touch-none"
        >
          <ArrowUp className="w-8 h-8 sm:w-9 sm:h-9 stroke-[3]" />
          <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase drop-shadow">
            Lompat
          </span>
        </button>
      </div>
    </div>
  );
};
