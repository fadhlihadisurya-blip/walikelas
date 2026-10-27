import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, BookOpen, Clock, Tag, Sparkles } from 'lucide-react';
import { useJPISData } from '../../context/JPISDataContext';
import { useAuth } from '../../context/AuthContext';
import { AspectType, JournalCategory, Observation } from '../../types';

interface NewJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStudentId?: string;
  initialData?: Observation | null;
}

const ASPECTS: AspectType[] = [
  'Akademik',
  'Ibadah',
  'Karakter dan Adab Islami',
  'Kedisiplinan',
  'Kemandirian',
  'Sosial dan Emosional',
  'Minat, Bakat, dan Potensi',
  'Prestasi',
  'Kebutuhan Pembinaan',
];

const CATEGORIES: { label: JournalCategory; color: string; desc: string }[] = [
  { label: 'Catatan Positif', color: 'border-emerald-500 bg-emerald-50 text-emerald-800', desc: 'Perilaku adab baik atau inisiatif positif' },
  { label: 'Pencapaian', color: 'border-blue-500 bg-blue-50 text-blue-800', desc: 'Keberhasilan target belajar/hafalan' },
  { label: 'Kejadian Penting', color: 'border-purple-500 bg-purple-50 text-purple-800', desc: 'Peristiwa istimewa di kelas/asrama' },
  { label: 'Kebutuhan Pendampingan', color: 'border-amber-500 bg-amber-50 text-amber-800', desc: 'Perilaku yang perlu bimbingan berkelanjutan' },
];

export const NewJournalModal: React.FC<NewJournalModalProps> = ({
  isOpen,
  onClose,
  preselectedStudentId,
  initialData,
}) => {
  const { students, addObservation, updateObservation } = useJPISData();
  const { userProfile } = useAuth();

  const [studentId, setStudentId] = useState(
    initialData?.studentId || preselectedStudentId || (students[0]?.id || '')
  );
  const [dateTime, setDateTime] = useState(
    initialData?.dateTime || new Date().toISOString().slice(0, 16).replace('T', ' ')
  );
  const [aspect, setAspect] = useState<AspectType>(initialData?.aspect || 'Karakter dan Adab Islami');
  const [category, setCategory] = useState<JournalCategory>(initialData?.category || 'Catatan Positif');
  const [indicator, setIndicator] = useState(initialData?.indicator || '');
  const [observedBehavior, setObservedBehavior] = useState(initialData?.observedBehavior || '');
  const [context, setContext] = useState(initialData?.context || '');
  const [evidenceOrSource, setEvidenceOrSource] = useState(initialData?.evidenceOrSource || '');
  const [relevantImpact, setRelevantImpact] = useState(initialData?.relevantImpact || '');
  const [teacherAction, setTeacherAction] = useState(initialData?.teacherAction || '');
  const [initialResult, setInitialResult] = useState(initialData?.initialResult || '');
  const [followUpPlan, setFollowUpPlan] = useState(initialData?.followUpPlan || '');
  const [nextEvaluationDate, setNextEvaluationDate] = useState(
    initialData?.nextEvaluationDate ||
      new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  );

  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!studentId) {
      setValidationError('Pilih siswa terlebih dahulu.');
      return;
    }
    if (!observedBehavior.trim()) {
      setValidationError('Peristiwa atau perilaku teramati wajib diisi secara objektif.');
      return;
    }
    if (!indicator.trim()) {
      setValidationError('Indikator observasi wajib diisi.');
      return;
    }

    // Check for subjective negative labeling (anti-stigmatizing policy)
    const subjectiveLabels = ['malas', 'nakal', 'bodoh', 'buruk', 'jahat', 'bandel'];
    const lowerObs = observedBehavior.toLowerCase();
    const foundLabel = subjectiveLabels.find((label) => lowerObs.includes(label));
    if (foundLabel) {
      setValidationError(
        `Catatan mengandung kata label subjektif "${foundLabel}". Mohon deskripsikan perilaku nyata yang spesifik dan objektif.`
      );
      return;
    }

    const selectedStudent = students.find((s) => s.id === studentId);
    setSubmitting(true);

    try {
      if (initialData) {
        await updateObservation(initialData.id, {
          studentId,
          studentName: selectedStudent ? selectedStudent.fullName : initialData.studentName,
          dateTime,
          aspect,
          category,
          indicator,
          observedBehavior,
          context,
          evidenceOrSource,
          relevantImpact,
          teacherAction,
          initialResult,
          followUpPlan,
          nextEvaluationDate,
        });
      } else {
        await addObservation({
          studentId,
          studentName: selectedStudent ? selectedStudent.fullName : 'Siswa',
          dateTime,
          aspect,
          category,
          indicator,
          observedBehavior,
          context,
          evidenceOrSource,
          relevantImpact,
          teacherAction,
          initialResult,
          followUpPlan,
          nextEvaluationDate,
          authorId: userProfile?.id || 'wali_kelas',
          authorName: userProfile?.displayName || 'Ustadz Wali Kelas',
        });
      }
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Gagal menyimpan catatan jurnal.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-200 border border-emerald-700">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialData ? 'Ubah Catatan Jurnal Harian' : 'Catat Jurnal Harian Siswa'}
              </h2>
              <p className="text-xs text-emerald-300">
                Pencatatan perilaku faktual dan objektif santri Islamic Boarding School
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Warning Alert */}
        {validationError && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <p className="leading-relaxed">{validationError}</p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4.5 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          {/* Row 1: Student & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Pilih Siswa / Santri <span className="text-rose-500">*</span>
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                required
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nis} - {s.fullName} ({s.dormitoryRoom ? s.dormitoryRoom.split('/')[0] : 'Kamar Asrama'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Tanggal dan Waktu Observasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                placeholder="YYYY-MM-DD HH:mm (contoh: 2026-10-26 14:30)"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Row 2: Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1.5">
              Kategori Catatan <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c.label}
                  onClick={() => setCategory(c.label)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    category === c.label
                      ? `${c.color} ring-2 ring-emerald-500 font-bold shadow-xs`
                      : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <p className="text-xs font-semibold leading-tight">{c.label}</p>
                  <p className="text-[10px] opacity-75 mt-0.5 line-clamp-1">{c.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Aspect & Indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Aspek Perkembangan <span className="text-rose-500">*</span>
              </label>
              <select
                value={aspect}
                onChange={(e) => setAspect(e.target.value as AspectType)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                required
              >
                {ASPECTS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Indikator Teramati <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={indicator}
                onChange={(e) => setIndicator(e.target.value)}
                placeholder="Contoh: Partisipasi dalam diskusi / Ketertiban shalat jamaah"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Row 4: Observed Behavior */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-800">
                Peristiwa atau Perilaku yang Diamati <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-emerald-700 font-medium">Objektif & Bebas Label Negatif</span>
            </div>
            <textarea
              value={observedBehavior}
              onChange={(e) => setObservedBehavior(e.target.value)}
              rows={3}
              placeholder="Tuliskan fakta spesifik yang terjadi secara objektif. Contoh: 'Pada diskusi kelompok hari Selasa, siswa menyampaikan 2 usulan model perhitungan dan membantu kelompok menyelesaikan tugas tepat waktu.'"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 leading-relaxed"
              required
            />
          </div>

          {/* Row 5: Context & Evidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Konteks Kejadian
              </label>
              <input
                type="text"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Contoh: Di laboratorium fisika saat praktikum kelompok"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Bukti Observasi / Sumber Info
              </label>
              <input
                type="text"
                value={evidenceOrSource}
                onChange={(e) => setEvidenceOrSource(e.target.value)}
                placeholder="Contoh: Lembar kerja praktikum / Catatan musyrif asrama"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 6: Relevant Impact & Teacher Action */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Dampak yang Relevan
              </label>
              <input
                type="text"
                value={relevantImpact}
                onChange={(e) => setRelevantImpact(e.target.value)}
                placeholder="Contoh: Tugas kelompok selesai lebih awal dan akurat"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Tindakan Wali Kelas / Guru
              </label>
              <input
                type="text"
                value={teacherAction}
                onChange={(e) => setTeacherAction(e.target.value)}
                placeholder="Contoh: Memberikan apresiasi lisan dan dorongan berbagi metode"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 7: Initial Result & Follow Up Plan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Hasil Awal
              </label>
              <input
                type="text"
                value={initialResult}
                onChange={(e) => setInitialResult(e.target.value)}
                placeholder="Contoh: Siswa terlihat percaya diri dan rekan sekelompok termotivasi"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Rencana Tindak Lanjut
              </label>
              <input
                type="text"
                value={followUpPlan}
                onChange={(e) => setFollowUpPlan(e.target.value)}
                placeholder="Contoh: Mengikutsertakan siswa dalam seleksi awal OSN Fisika"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Row 8: Next Evaluation Date */}
          <div className="max-w-xs">
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Tanggal Evaluasi Berikutnya
            </label>
            <input
              type="date"
              value={nextEvaluationDate}
              onChange={(e) => setNextEvaluationDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Menyimpan...' : initialData ? 'Perbarui Jurnal' : 'Simpan Jurnal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
