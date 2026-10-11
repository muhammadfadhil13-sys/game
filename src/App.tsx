import React, { useState, useRef, useEffect, useCallback } from 'react';
import { QuestionItem, GameScreen } from './types/game';
import {
  getStoredQuestions,
  saveStoredQuestions,
  resetToDefaultQuestions,
} from './services/questionStorage';
import { GameCanvas, GameCanvasHandle } from './game/GameCanvas';
import { HeaderHUD } from './components/HeaderHUD';
import { TouchControls } from './components/TouchControls';
import { QuestionModal } from './components/QuestionModal';
import { StartScreen } from './components/StartScreen';
import { PauseModal } from './components/PauseModal';
import { EndScreen } from './components/EndScreen';
import { QuestionBankModal } from './components/QuestionBankModal';
import { sound } from './utils/audio';

export default function App() {
  const [questions, setQuestions] = useState<QuestionItem[]>(() => getStoredQuestions());
  const [activeScreen, setActiveScreen] = useState<GameScreen>('start');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [maxLives] = useState<number>(3);
  const [answeredStarsCount, setAnsweredStarsCount] = useState<number>(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null);
  const [celebratingIndex, setCelebratingIndex] = useState<number | null>(null);
  const [confusedIndex, setConfusedIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showQuestionBank, setShowQuestionBank] = useState<boolean>(false);

  const canvasRef = useRef<GameCanvasHandle | null>(null);

  const maxScore = questions.length * 10;

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  }, []);

  // Start / Restart game session
  const handleStartGame = useCallback(() => {
    setScore(0);
    setLives(3);
    setAnsweredStarsCount(0);
    setActiveQuestionIndex(null);
    setCelebratingIndex(null);
    setConfusedIndex(null);
    setActiveScreen('playing');
    if (canvasRef.current) {
      canvasRef.current.restartGame();
    }
  }, []);

  const handlePause = useCallback(() => {
    setActiveScreen('paused');
  }, []);

  const handleResume = useCallback(() => {
    setActiveScreen('playing');
  }, []);

  const handleHome = useCallback(() => {
    setActiveScreen('start');
  }, []);

  // When Fadhika touches a floating star
  const handleStarTouched = useCallback((qIndex: number) => {
    setActiveQuestionIndex(qIndex);
    setActiveScreen('question');
  }, []);

  // When player answers correctly (+10 score, celebrate)
  const handleCorrectAnswer = useCallback(() => {
    setScore((prev) => prev + 10);
    setAnsweredStarsCount((prev) => {
      const nextCount = prev + 1;
      if (nextCount >= questions.length) {
        // Victory!
        setTimeout(() => {
          sound.playLevelComplete();
          setActiveScreen('victory');
        }, 1200);
      }
      return nextCount;
    });

    if (activeQuestionIndex !== null) {
      setCelebratingIndex(activeQuestionIndex);
      setTimeout(() => setCelebratingIndex(null), 1500);
    }

    setActiveQuestionIndex(null);
    setActiveScreen('playing');
  }, [activeQuestionIndex, questions.length]);

  // When player answers incorrectly (-10 score, try again)
  const handleWrongAnswer = useCallback(() => {
    setScore((prev) => Math.max(0, prev - 10));
    if (activeQuestionIndex !== null) {
      setConfusedIndex(activeQuestionIndex);
      setTimeout(() => setConfusedIndex(null), 1200);
    }
  }, [activeQuestionIndex]);

  // Fall into pit penalty
  const handleFallPenalty = useCallback(() => {
    setLives((prev) => {
      const remaining = prev - 1;
      if (remaining <= 0) {
        // Kid-friendly checkpoint recovery
        return 3;
      }
      return remaining;
    });
  }, []);

  // Save changes to Question Bank
  const handleSaveQuestions = useCallback((updated: QuestionItem[]) => {
    setQuestions(updated);
    saveStoredQuestions(updated);
  }, []);

  // Reset to default questions
  const handleResetQuestions = useCallback(() => {
    const defaults = resetToDefaultQuestions();
    setQuestions(defaults);
  }, []);

  const currentQuestionItem =
    activeQuestionIndex !== null && questions[activeQuestionIndex]
      ? questions[activeQuestionIndex]
      : null;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Top Header HUD (Visible when playing, paused, or answering) */}
      {activeScreen !== 'start' && activeScreen !== 'victory' && (
        <HeaderHUD
          score={score}
          maxScore={maxScore}
          answeredCount={answeredStarsCount}
          totalCount={questions.length}
          lives={lives}
          maxLives={maxLives}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={handlePause}
          onOpenQuestionBank={() => setShowQuestionBank(true)}
        />
      )}

      {/* Main 2D Platformer Canvas */}
      <GameCanvas
        ref={canvasRef}
        questions={questions}
        score={score}
        lives={lives}
        isPaused={activeScreen !== 'playing'}
        activeScreen={activeScreen}
        onStarTouched={handleStarTouched}
        onFallPenalty={handleFallPenalty}
        celebratingQuestionIndex={celebratingIndex}
        confusedQuestionIndex={confusedIndex}
      />

      {/* On-Screen Touch Controls (Mobile / Tablet) */}
      {activeScreen === 'playing' && (
        <TouchControls
          onMoveLeft={(active) => canvasRef.current?.triggerMoveLeft(active)}
          onMoveRight={(active) => canvasRef.current?.triggerMoveRight(active)}
          onJump={() => canvasRef.current?.triggerJump()}
        />
      )}

      {/* Question Modal (When touching a star) */}
      {activeScreen === 'question' && currentQuestionItem && (
        <QuestionModal
          question={currentQuestionItem}
          starNumber={(activeQuestionIndex ?? 0) + 1}
          totalStars={questions.length}
          onCorrectAnswer={handleCorrectAnswer}
          onWrongAnswer={handleWrongAnswer}
        />
      )}

      {/* Start Screen */}
      {activeScreen === 'start' && (
        <StartScreen
          onStartGame={handleStartGame}
          onOpenQuestionBank={() => setShowQuestionBank(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          totalQuestions={questions.length}
        />
      )}

      {/* Pause Screen */}
      {activeScreen === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleStartGame}
          onHome={handleHome}
          onOpenQuestionBank={() => setShowQuestionBank(true)}
        />
      )}

      {/* End / Victory Screen */}
      {activeScreen === 'victory' && (
        <EndScreen
          score={score}
          maxScore={maxScore}
          starsCollected={answeredStarsCount}
          totalStars={questions.length}
          onPlayAgain={handleStartGame}
          onHome={handleHome}
          onOpenQuestionBank={() => setShowQuestionBank(true)}
        />
      )}

      {/* Question Bank Manager Modal */}
      {showQuestionBank && (
        <QuestionBankModal
          questions={questions}
          onSaveQuestions={handleSaveQuestions}
          onResetQuestions={handleResetQuestions}
          onClose={() => setShowQuestionBank(false)}
        />
      )}
    </div>
  );
}
