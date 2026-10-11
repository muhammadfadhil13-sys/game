import React, { useState } from 'react';
import { GradeLevel, QuestionItem, QuestionOption } from '../types/game';
import {
  exportQuestionsToWord,
  exportQuestionsToJson,
  parseQuestionsFromText,
} from '../services/questionStorage';
import { sound } from '../utils/audio';
import {
  X,
  Plus,
  Trash2,
  Copy,
  Edit3,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  RefreshCw,
  Image as ImageIcon,
  Check,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface QuestionBankModalProps {
  questions: QuestionItem[];
  onSaveQuestions: (updated: QuestionItem[]) => void;
  onResetQuestions: () => void;
  onClose: () => void;
}

export const QuestionBankModal: React.FC<QuestionBankModalProps> = ({
  questions,
  onSaveQuestions,
  onResetQuestions,
  onClose,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('Semua');
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importGrade, setImportGrade] = useState<GradeLevel>('Kelas 4');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Filtered questions based on selected grade
  const filteredQuestions = questions.filter((q) => {
    if (selectedGrade === 'Semua') return true;
    return q.grade === selectedGrade;
  });

  // Reorder question in main array
  const handleMove = (id: string, direction: 'up' | 'down') => {
    const idx = questions.findIndex((q) => q.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    const copy = [...questions];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    onSaveQuestions(copy);
    sound.playClick();
  };

  // Duplicate question
  const handleDuplicate = (q: QuestionItem) => {
    const newId = `soal-dup-${Date.now()}`;
    const duplicated: QuestionItem = {
      ...JSON.parse(JSON.stringify(q)),
      id: newId,
      title: `${q.title} (Salinan)`,
    };
    const idx = questions.findIndex((item) => item.id === q.id);
    const copy = [...questions];
    copy.splice(idx + 1, 0, duplicated);
    onSaveQuestions(copy);
    sound.playClick();
    showToast(`Soal "${q.title}" berhasil digandakan!`);
  };

  // Delete question
  const handleDelete = (id: string) => {
    if (questions.length <= 1) {
      alert('Minimal harus ada 1 soal dalam game!');
      return;
    }
    const q = questions.find((item) => item.id === id);
    if (confirm(`Hapus soal "${q?.title || 'ini'}"?`)) {
      const copy = questions.filter((item) => item.id !== id);
      onSaveQuestions(copy);
      sound.playClick();
      showToast('Soal berhasil dihapus.');
    }
  };

  // Start creating new question
  const handleStartCreate = () => {
    const newQ: QuestionItem = {
      id: `soal-${Date.now()}`,
      grade: selectedGrade === 'Semua' ? 'Kelas 4' : selectedGrade,
      title: `Soal Baru #${questions.length + 1}`,
      questionText: '',
      options: [
        { id: `opt-a-${Date.now()}`, label: 'A', text: '' },
        { id: `opt-b-${Date.now()}`, label: 'B', text: '' },
        { id: `opt-c-${Date.now()}`, label: 'C', text: '' },
        { id: `opt-d-${Date.now()}`, label: 'D', text: '' },
      ],
      correctOptionId: '',
      explanation: '',
    };
    newQ.correctOptionId = newQ.options[0].id;
    setEditingQuestion(newQ);
    setIsCreatingNew(true);
  };

  // Save question from editor
  const handleSaveEditor = (qToSave: QuestionItem) => {
    if (!qToSave.questionText.trim()) {
      alert('Pertanyaan tidak boleh kosong!');
      return;
    }
    if (qToSave.options.some((o) => !o.text.trim() && !o.image)) {
      alert('Semua pilihan jawaban harus diisi teks atau gambar!');
      return;
    }
    if (!qToSave.correctOptionId) {
      alert('Pilih salah satu jawaban yang benar!');
      return;
    }

    let updatedList: QuestionItem[];
    if (isCreatingNew) {
      updatedList = [...questions, qToSave];
      showToast('Soal baru berhasil ditambahkan!');
    } else {
      updatedList = questions.map((item) => (item.id === qToSave.id ? qToSave : item));
      showToast('Perubahan soal berhasil disimpan!');
    }

    onSaveQuestions(updatedList);
    setEditingQuestion(null);
    setIsCreatingNew(false);
    sound.playClick();
  };

  // Import handler
  const handleExecuteImport = () => {
    if (!importText.trim()) {
      alert('Masukkan atau tempel teks soal terlebih dahulu!');
      return;
    }

    let parsed: QuestionItem[] = [];
    try {
      // Test if JSON
      const testJson = JSON.parse(importText);
      if (Array.isArray(testJson)) {
        parsed = testJson;
      }
    } catch {
      // Parse as plain text / Word
      parsed = parseQuestionsFromText(importText, importGrade);
    }

    if (parsed.length === 0) {
      alert('Format soal tidak terdeteksi. Gunakan format standar seperti:\n1. Pertanyaan...\nA. Opsi A\nB. Opsi B\nC. Opsi C\nD. Opsi D\nKunci: A');
      return;
    }

    const merged = [...questions, ...parsed];
    onSaveQuestions(merged);
    setShowImportModal(false);
    setImportText('');
    sound.playClick();
    showToast(`Berhasil mengimpor ${parsed.length} butir soal baru!`);
  };

  // File upload for import
  const handleFileImportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportText(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 select-none overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-50 rounded-3xl border-4 border-amber-300 shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        
        {/* Toast notification */}
        {feedbackMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-xl text-xs sm:text-sm font-bold flex items-center gap-2 animate-bounce">
            <Check className="w-4 h-4" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 border-b-2 border-amber-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-950">
                BANK SOAL & KELOLA MATERI PECAHAN
              </h2>
              <p className="text-xs font-semibold text-amber-800">
                Total {questions.length} Butir Soal Terpasang di Petualangan
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-700 shadow transition-all active:scale-95"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Grade Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Kelas:</span>
            {(['Semua', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'] as GradeLevel[]).map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`px-2.5 py-1 text-xs font-bold rounded-xl border transition-all ${
                  selectedGrade === grade
                    ? 'bg-amber-400 border-amber-500 text-amber-950 shadow-sm'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleStartCreate}
              className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Soal</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-1 bg-sky-100 hover:bg-sky-200 active:scale-95 text-sky-800 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-sky-300 shadow-sm transition-all"
            >
              <Upload className="w-3.5 h-3.5 text-sky-600" />
              <span>Import Word / Teks</span>
            </button>

            <button
              onClick={() => {
                exportQuestionsToWord(questions);
                showToast('File Word (.doc) berhasil diunduh!');
              }}
              className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 active:scale-95 text-amber-900 text-xs font-bold px-2.5 py-1.5 rounded-xl border border-amber-300 shadow-sm transition-all"
              title="Ekspor daftar soal ke Microsoft Word"
            >
              <Download className="w-3.5 h-3.5 text-amber-700" />
              <span>Ekspor Word</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Kembalikan 20 soal bawaan pecahan default? Soal yang Anda buat/edit saat ini akan digantikan.')) {
                  onResetQuestions();
                  showToast('Bank soal di-reset ke 20 soal bawaan.');
                }
              }}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 transition-all active:scale-95"
              title="Reset ke Soal Bawaan"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Questions List Container */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-sm">Tidak ada soal pada kategori ini.</p>
              <button
                onClick={handleStartCreate}
                className="mt-3 text-xs text-emerald-600 font-bold underline"
              >
                Buat soal baru sekarang
              </button>
            </div>
          ) : (
            filteredQuestions.map((q, idx) => {
              const mainIndex = questions.findIndex((item) => item.id === q.id);
              const isFirst = mainIndex === 0;
              const isLast = mainIndex === questions.length - 1;

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border-2 border-slate-200 hover:border-amber-300 shadow-sm p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-black text-sm flex items-center justify-center shrink-0 border border-amber-200">
                      #{mainIndex + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200">
                          {q.grade}
                        </span>
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                          {q.title || 'Soal Pecahan'}
                        </h4>
                        <span className="text-[11px] text-slate-400">
                          ({q.options.length} Pilihan Jawaban)
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {q.questionText}
                      </p>

                      {/* Thumbnail indicator if image uploaded */}
                      {q.questionImage && (
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-700 font-semibold">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>Ada Gambar Soal</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Item Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    {/* Move Up */}
                    <button
                      onClick={() => handleMove(q.id, 'up')}
                      disabled={isFirst}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-all"
                      title="Urutkan ke Atas"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Move Down */}
                    <button
                      onClick={() => handleMove(q.id, 'down')}
                      disabled={isLast}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-all"
                      title="Urutkan ke Bawah"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Duplicate */}
                    <button
                      onClick={() => handleDuplicate(q)}
                      className="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all"
                      title="Duplikasi / Gandakan Soal"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => {
                        setEditingQuestion(JSON.parse(JSON.stringify(q)));
                        setIsCreatingNew(false);
                      }}
                      className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-300 transition-all"
                      title="Edit Soal"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all"
                      title="Hapus Soal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            Soal tersimpan otomatis di browser & siap dimainkan semua orang.
          </span>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow transition-all active:scale-95"
          >
            Tutup & Lanjut Bermain
          </button>
        </div>

        {/* SUBMODAL: QUESTION FORM EDITOR (ADD / EDIT) */}
        {editingQuestion && (
          <QuestionFormEditor
            question={editingQuestion}
            isNew={isCreatingNew}
            onSave={handleSaveEditor}
            onCancel={() => setEditingQuestion(null)}
          />
        )}

        {/* SUBMODAL: IMPORT FROM WORD / TEXT */}
        {showImportModal && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 select-none">
            <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-amber-300 shadow-2xl p-5 flex flex-col gap-3 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-black text-amber-950 text-base flex items-center gap-1.5">
                  <Upload className="w-5 h-5 text-sky-600" />
                  <span>Import Soal dari Word atau Dokumen Teks</span>
                </h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-slate-600 leading-relaxed bg-sky-50 p-3 rounded-xl border border-sky-200">
                <p className="font-bold text-sky-900 mb-1">Cara Mengimpor:</p>
                <p>1. Salin (Copy) teks soal dari Word lalu tempelkan (Paste) di kotak bawah.</p>
                <p>2. Atau pilih file <code>.doc / .txt / .json</code> dari komputermu.</p>
                <p className="mt-1 font-semibold text-sky-800">
                  Format yang didukung:
                  <br />
                  1. Pertanyaan...
                  <br />
                  A. Opsi A
                  <br />
                  B. Opsi B
                  <br />
                  Kunci: A
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-700">Tingkat Kelas:</label>
                <select
                  value={importGrade}
                  onChange={(e) => setImportGrade(e.target.value as GradeLevel)}
                  className="text-xs font-bold border border-slate-300 rounded-lg p-1.5 bg-white"
                >
                  {(['Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'] as GradeLevel[]).map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>

                <label className="ml-auto cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 shadow-sm transition-all flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih File</span>
                  <input
                    type="file"
                    accept=".txt,.doc,.docx,.json"
                    onChange={handleFileImportUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                rows={7}
                placeholder="Tempelkan soal di sini..."
                className="w-full text-xs font-mono p-3 rounded-xl border-2 border-slate-300 focus:border-amber-400 focus:outline-none"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  onClick={handleExecuteImport}
                  className="px-4 py-1.5 text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow transition-all active:scale-95"
                >
                  Proses & Tambahkan Soal
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// SUBCOMPONENT: QuestionFormEditor for manual input & editing with image uploads & dynamic options
interface QuestionFormEditorProps {
  question: QuestionItem;
  isNew: boolean;
  onSave: (q: QuestionItem) => void;
  onCancel: () => void;
}

const QuestionFormEditor: React.FC<QuestionFormEditorProps> = ({
  question,
  isNew,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<QuestionItem>({ ...question });

  // Handle uploading image for question
  const handleQuestionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        questionImage: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle uploading image for specific option
  const handleOptionImageUpload = (optionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({
        ...prev,
        options: prev.options.map((opt) =>
          opt.id === optionId ? { ...opt, image: event.target?.result as string } : opt
        ),
      }));
    };
    reader.readAsDataURL(file);
  };

  // Add new option choice (e.g. A, B, C -> D -> E)
  const handleAddOption = () => {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextIdx = formData.options.length;
    if (nextIdx >= labels.length) {
      alert('Maksimum 6 pilihan jawaban (A sampai F)!');
      return;
    }
    const newOpt: QuestionOption = {
      id: `opt-${labels[nextIdx].toLowerCase()}-${Date.now()}`,
      label: labels[nextIdx],
      text: '',
    };
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, newOpt],
    }));
  };

  // Remove option choice
  const handleRemoveOption = (optionId: string) => {
    if (formData.options.length <= 2) {
      alert('Minimal harus ada 2 pilihan jawaban!');
      return;
    }
    const updated = formData.options.filter((o) => o.id !== optionId);
    // Relabel
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const relabeled = updated.map((o, idx) => ({ ...o, label: labels[idx] }));
    let newCorrectId = formData.correctOptionId;
    if (newCorrectId === optionId) {
      newCorrectId = relabeled[0].id;
    }
    setFormData((prev) => ({
      ...prev,
      options: relabeled,
      correctOptionId: newCorrectId,
    }));
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 select-none overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-3xl border-4 border-amber-300 shadow-2xl p-5 flex flex-col gap-4 max-h-[92vh] overflow-y-auto animate-scale-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-slate-200">
          <div>
            <h3 className="font-black text-amber-950 text-base sm:text-lg">
              {isNew ? '➕ Tambah Soal Pecahan Baru' : '✏️ Edit Soal Pecahan'}
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Isi pertanyaan, upload gambar jika ada, dan tentukan pilihan jawaban
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-3.5 text-xs sm:text-sm">
          {/* Grade & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Tingkat Kelas:</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value as GradeLevel })}
                className="w-full p-2 rounded-xl border border-slate-300 font-semibold focus:border-amber-400 focus:outline-none"
              >
                {(['Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'] as GradeLevel[]).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Judul / Topik Soal:</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Pecahan Senilai, Penjumlahan 1/2 + 1/4"
                className="w-full p-2 rounded-xl border border-slate-300 font-semibold focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Teks Pertanyaan:</label>
            <textarea
              rows={3}
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              placeholder="Tuliskan pertanyaan pecahan secara jelas dan ramah anak..."
              className="w-full p-2.5 rounded-xl border-2 border-slate-300 font-semibold focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Question Image Upload */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>Gambar Soal (Opsional):</span>
              </span>
              <label className="cursor-pointer bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-xl border border-slate-300 text-xs shadow-sm flex items-center gap-1">
                <span>Upload Gambar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleQuestionImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {formData.questionImage && (
              <div className="mt-2 flex items-center gap-3">
                <img
                  src={formData.questionImage}
                  alt="Preview"
                  className="h-20 w-auto rounded-lg border border-slate-300 object-contain bg-white p-1"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, questionImage: undefined })}
                  className="text-xs text-rose-600 font-bold hover:underline"
                >
                  Hapus Gambar
                </button>
              </div>
            )}
          </div>

          {/* Dynamic Multiple Choice Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-black text-slate-800 text-sm">
                Pilihan Ganda (Pilih lingkaran untuk Kunci Jawaban):
              </label>
              <button
                type="button"
                onClick={handleAddOption}
                className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-xl border border-emerald-300 flex items-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Opsi ({String.fromCharCode(65 + formData.options.length)})</span>
              </button>
            </div>

            <div className="space-y-2">
              {formData.options.map((opt) => {
                const isCorrect = formData.correctOptionId === opt.id;

                return (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl border-2 transition-all ${
                      isCorrect
                        ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300/50'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    {/* Select as Correct Radio */}
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, correctOptionId: opt.id })}
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 border-2 transition-all ${
                        isCorrect
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow'
                          : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
                      }`}
                      title="Klik untuk jadikan kunci jawaban"
                    >
                      {opt.label}
                    </button>

                    {/* Option Text */}
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          options: prev.options.map((o) => (o.id === opt.id ? { ...o, text: val } : o)),
                        }));
                      }}
                      placeholder={`Jawaban pilihan ${opt.label}...`}
                      className="flex-1 p-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-semibold focus:border-amber-400 focus:outline-none"
                    />

                    {/* Image for option */}
                    <label
                      className="cursor-pointer p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 shrink-0"
                      title="Upload gambar opsi"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleOptionImageUpload(opt.id, e)}
                        className="hidden"
                      />
                    </label>

                    {/* Option image preview thumbnail */}
                    {opt.image && (
                      <div className="relative shrink-0">
                        <img
                          src={opt.image}
                          alt="Thumbnail"
                          className="w-8 h-8 rounded border object-contain bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              options: prev.options.map((o) =>
                                o.id === opt.id ? { ...o, image: undefined } : o
                              ),
                            }));
                          }}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    {/* Delete option button */}
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0"
                        title="Hapus pilihan ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Pembahasan / Tips Ceria (Ditampilkan saat anak menjawab benar):
            </label>
            <textarea
              rows={2}
              value={formData.explanation || ''}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Contoh: Kalikan pembilang dan penyebut dengan angka 2 untuk mencari pecahan senilai..."
              className="w-full p-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:border-amber-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onSave(formData)}
            className="px-5 py-2 font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg transition-all active:scale-95"
          >
            Simpan Soal
          </button>
        </div>

      </div>
    </div>
  );
};
