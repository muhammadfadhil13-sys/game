import { GradeLevel, QuestionItem, QuestionOption } from '../types/game';
import { INITIAL_QUESTIONS } from '../data/defaultQuestions';

const STORAGE_KEY = 'fadhika_math_questions_v1';

export function getStoredQuestions(): QuestionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_QUESTIONS;
  } catch {
    return INITIAL_QUESTIONS;
  }
}

export function saveStoredQuestions(questions: QuestionItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch (err) {
    console.error('Failed to save questions to localStorage', err);
  }
}

export function resetToDefaultQuestions(): QuestionItem[] {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_QUESTIONS));
  return INITIAL_QUESTIONS;
}

export function exportQuestionsToWord(questions: QuestionItem[]): void {
  const dateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let content = `====================================================\n`;
  content += `BANK SOAL: PETUALANGAN FADHIKA (MATERI PECAHAN)\n`;
  content += `Tanggal Ekspor: ${dateStr}\n`;
  content += `Total Soal: ${questions.length} Butir\n`;
  content += `====================================================\n\n`;

  questions.forEach((q, idx) => {
    content += `SOAL NO. ${idx + 1} [${q.grade}]\n`;
    content += `Judul: ${q.title || 'Soal Pecahan'}\n`;
    content += `Pertanyaan:\n${q.questionText}\n\n`;
    content += `Pilihan Jawaban:\n`;

    let correctLabel = '';
    q.options.forEach((opt) => {
      const isCorrect = opt.id === q.correctOptionId;
      if (isCorrect) correctLabel = opt.label;
      content += `  ${opt.label}. ${opt.text}${isCorrect ? '  (KUNCI JAWABAN)' : ''}\n`;
    });

    content += `\nKunci Jawaban: ${correctLabel}\n`;
    if (q.explanation) {
      content += `Pembahasan:\n${q.explanation}\n`;
    }
    content += `----------------------------------------------------\n\n`;
  });

  const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Bank_Soal_Petualangan_Fadhika_${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportQuestionsToJson(questions: QuestionItem[]): void {
  const jsonStr = JSON.stringify(questions, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `soal_fadhika_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Parses text formatted from Word or plain document
export function parseQuestionsFromText(rawText: string, defaultGrade: GradeLevel = 'Kelas 4'): QuestionItem[] {
  const lines = rawText.split('\n');
  const items: QuestionItem[] = [];

  let currentQuestion: Partial<QuestionItem> | null = null;
  let currentOptions: QuestionOption[] = [];
  let currentCorrectLabel: string = 'A';
  let qCounter = 1;

  function finalizeCurrent() {
    if (currentQuestion && currentQuestion.questionText && currentOptions.length >= 2) {
      const correctOpt = currentOptions.find(o => o.label.toUpperCase() === currentCorrectLabel.toUpperCase()) || currentOptions[0];
      items.push({
        id: `imported-${Date.now()}-${qCounter++}`,
        grade: currentQuestion.grade || defaultGrade,
        title: currentQuestion.title || `Soal ${items.length + 1}`,
        questionText: currentQuestion.questionText.trim(),
        questionImage: currentQuestion.questionImage,
        options: currentOptions,
        correctOptionId: correctOpt.id,
        explanation: currentQuestion.explanation?.trim() || 'Pembahasan telah disediakan.',
      });
    }
    currentQuestion = null;
    currentOptions = [];
    currentCorrectLabel = 'A';
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect question start: "1. ", "1) ", "Soal 1", "No 1"
    const qMatch = line.match(/^(?:(?:SOAL\s*(?:NO\.?)?\s*|NO\.?\s*)?(\d+)[.)\s:-]+)(.*)/i);
    if (qMatch && !line.match(/^[A-E][.)\s]/i)) {
      finalizeCurrent();
      currentQuestion = {
        grade: defaultGrade,
        title: `Soal ${qMatch[1]}`,
        questionText: qMatch[2] ? qMatch[2].trim() : '',
      };
      continue;
    }

    // Detect options: "A. ", "B) ", "C. "
    const optMatch = line.match(/^([A-E])[.)\s]+(.*)/i);
    if (optMatch && currentQuestion) {
      const label = optMatch[1].toUpperCase();
      let optText = optMatch[2].trim();
      if (optText.toLowerCase().includes('(kunci') || optText.toLowerCase().includes('*kunci*')) {
        currentCorrectLabel = label;
        optText = optText.replace(/\(?\*?kunci(?: jawaban)?\*?\)?/gi, '').trim();
      }
      currentOptions.push({
        id: `opt-${label.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        label,
        text: optText,
      });
      continue;
    }

    // Detect answer key: "Kunci: B", "Jawaban: A"
    const keyMatch = line.match(/^(?:Kunci(?: Jawaban)?|Jawaban)\s*:\s*([A-E])/i);
    if (keyMatch && currentQuestion) {
      currentCorrectLabel = keyMatch[1].toUpperCase();
      continue;
    }

    // Detect explanation: "Pembahasan: ..."
    const expMatch = line.match(/^(?:Pembahasan|Penjelasan)\s*:\s*(.*)/i);
    if (expMatch && currentQuestion) {
      currentQuestion.explanation = expMatch[1];
      continue;
    }

    // Continuation of question text or explanation
    if (currentQuestion) {
      if (currentOptions.length === 0) {
        currentQuestion.questionText = (currentQuestion.questionText ? currentQuestion.questionText + ' ' : '') + line;
      } else if (currentQuestion.explanation !== undefined) {
        currentQuestion.explanation += ' ' + line;
      }
    }
  }

  finalizeCurrent();
  return items;
}
