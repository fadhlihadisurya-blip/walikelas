import React, { useState } from 'react';
import { X, HeartHandshake, CheckCircle, AlertCircle } from 'lucide-react';
import { useJPISData } from '../../context/JPISDataContext';
import { useAuth } from '../../context/AuthContext';
import { Intervention, InterventionStatus } from '../../types';

interface NewInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Intervention | null;
}

const STATUSES: InterventionStatus[] = [
  'Direncanakan',
  'Berjalan',
  'Tercapai',
  'Perlu Penyesuaian',
  'Ditutup',
];

export const NewInterventionModal: React.FC<NewInterventionModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { students, addIntervention, updateIntervention, settings } = useJPISData();
  const { userProfile } = useAuth();

  const [studentId, setStudentId] = useState(initialData?.studentId || (students[0]?.id || ''));
  const [identifiedNeed, setIdentifiedNeed] = useState(initialData?.identifiedNeed || '');
  const [initialConditionAndEvidence, setInitialConditionAndEvidence] = useState(
    initialData?.initialConditionAndEvidence || ''
  );
  const [studentStrengths, setStudentStrengths] = useState(initialData?.studentStrengths || '');
  const [specificTarget, setSpecificTarget] = useState(initialData?.specificTarget || '');
  const [coachingStrategy, setCoachingStrategy] = useState(initialData?.coachingStrategy || '');
  const [targetSchedule, setTargetSchedule] = useState(initialData?.targetSchedule || '');
  const [personInCharge, setPersonInCharge] = useState(
    initialData?.personInCharge || `${userProfile?.displayName || settings.waliKelasName} (Wali Kelas)`
  );
  const [successIndicator, setSuccessIndicator] = useState(initialData?.successIndicator || '');
  const [evaluationResult, setEvaluationResult] = useState(initialData?.evaluationResult || '');
  const [status, setStatus] = useState<InterventionStatus>(initialData?.status || 'Direncanakan');
  const [nextFollowUp, setNextFollowUp] = useState(initialData?.nextFollowUp || '');
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  );

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!studentId) {
      setErrorMsg('Pilih santri terlebih dahulu.');
      return;
    }
    if (!identifiedNeed.trim() || !specificTarget.trim()) {
      setErrorMsg('Kebutuhan teridentifikasi dan target perubahan spesifik wajib diisi.');
      return;
    }

    const selStudent = students.find((s) => s.id === studentId);
    setSubmitting(true);

    try {
      if (initialData) {
        await updateIntervention(initialData.id, {
          studentId,
          studentName: selStudent ? selStudent.fullName : initialData.studentName,
          identifiedNeed,
          initialConditionAndEvidence,
          studentStrengths,
          specificTarget,
          coachingStrategy,
          targetSchedule,
          personInCharge,
          successIndicator,
          evaluationResult,
          status,
          nextFollowUp,
          dueDate,
        });
      } else {
        await addIntervention({
          studentId,
          studentName: selStudent ? selStudent.fullName : 'Siswa',
          identifiedNeed,
          initialConditionAndEvidence,
          studentStrengths,
          specificTarget,
          coachingStrategy,
          targetSchedule,
          personInCharge,
          successIndicator,
          evaluationResult,
          status,
          nextFollowUp,
          dueDate,
          coachId: userProfile?.id || 'wali_kelas',
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan modul pembinaan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-purple-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-800 flex items-center justify-center text-purple-200 border border-purple-700">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialData ? 'Ubah Rencana Pembinaan Siswa' : 'Buat Rencana Pembinaan Siswa'}
              </h2>
              <p className="text-xs text-purple-200">
                Pendampingan individual berorientasi solusi, target realistis, dan penguatan potensi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-purple-300 hover:text-white rounded-lg hover:bg-purple-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Pilih Santri <span className="text-rose-500">*</span>
              </label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-white"
                required
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nis} - {s.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Status Pembinaan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as InterventionStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 bg-white"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Permasalahan atau Kebutuhan yang Teridentifikasi <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={identifiedNeed}
              onChange={(e) => setIdentifiedNeed(e.target.value)}
              rows={2}
              placeholder="Contoh: Manajemen ritme waktu istirahat malam dan penuntasan tugas tepat waktu..."
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Bukti & Kondisi Awal
              </label>
              <textarea
                value={initialConditionAndEvidence}
                onChange={(e) => setInitialConditionAndEvidence(e.target.value)}
                rows={2}
                placeholder="Catatan observasi, presensi tahajud, keterlambatan tugas..."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Kekuatan Siswa yang Dapat Dikembangkan
              </label>
              <textarea
                value={studentStrengths}
                onChange={(e) => setStudentStrengths(e.target.value)}
                rows={2}
                placeholder="Kemampuan silat tinggi, terbuka terhadap nasihat, suka membantu rekan..."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100">
            <label className="block text-xs font-bold text-purple-950 mb-1">
              Target Perubahan yang Spesifik & Realistis <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-purple-800 mb-1.5">
              Contoh: "Siswa menyelesaikan tugas sesuai tenggat pada empat dari lima kesempatan selama dua minggu."
            </p>
            <textarea
              value={specificTarget}
              onChange={(e) => setSpecificTarget(e.target.value)}
              rows={2}
              placeholder="Tuliskan target perilaku yang terukur dan dapat diamati..."
              className="w-full p-2.5 rounded-xl border border-purple-200 bg-white focus:ring-2 focus:ring-purple-500 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Strategi Pembinaan
              </label>
              <textarea
                value={coachingStrategy}
                onChange={(e) => setCoachingStrategy(e.target.value)}
                rows={2}
                placeholder="Checklist mandiri, kolaborasi musyrif kamar, peer support..."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Indikator Keberhasilan
              </label>
              <textarea
                value={successIndicator}
                onChange={(e) => setSuccessIndicator(e.target.value)}
                rows={2}
                placeholder="Tercapainya jam istirahat teratur dan tidak mengantuk saat pembelajaran..."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Jadwal / Rentang Waktu
              </label>
              <input
                type="text"
                value={targetSchedule}
                onChange={(e) => setTargetSchedule(e.target.value)}
                placeholder="Pekan 4 Okt - Pekan 2 Nov"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Tenggat Evaluasi (Due Date)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Penanggung Jawab (PIC)
              </label>
              <input
                type="text"
                value={personInCharge}
                onChange={(e) => setPersonInCharge(e.target.value)}
                placeholder="Ustadz Wali Kelas & Musyrif"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Hasil Evaluasi Sementara
              </label>
              <input
                type="text"
                value={evaluationResult}
                onChange={(e) => setEvaluationResult(e.target.value)}
                placeholder="Catatan perkembangan setelah 1 pekan berjalan..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Tindak Lanjut Berikutnya
              </label>
              <input
                type="text"
                value={nextFollowUp}
                onChange={(e) => setNextFollowUp(e.target.value)}
                placeholder="Review berkala Ahad malam bersama musyrif..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
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
              className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition-all shadow-md flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Menyimpan...' : initialData ? 'Perbarui Pembinaan' : 'Simpan Pembinaan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
