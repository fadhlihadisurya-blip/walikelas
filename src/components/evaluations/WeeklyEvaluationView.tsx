import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Sparkles,
  Save,
  Clock,
  BookOpen,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  User,
  History,
  Trash2,
} from 'lucide-react';
import { useJPISData } from '../../context/JPISDataContext';
import { useAuth } from '../../context/AuthContext';
import { WeeklyAssessment } from '../../types';
import { generateWeeklySummaryWithAi } from '../../services/aiEvaluationService';

export const WeeklyEvaluationView: React.FC = () => {
  const { students, observations, weeklyAssessments, saveWeeklyAssessment, deleteAssessment, settings } =
    useJPISData();
  const { userProfile } = useAuth();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Minggu ke-4, Oktober 2026');
  const [weekNumber, setWeekNumber] = useState<number>(4);

  // Form fields
  const [positiveDevelopments, setPositiveDevelopments] = useState('');
  const [visibleProgress, setVisibleProgress] = useState('');
  const [challenges, setChallenges] = useState('');
  const [supportingEvidence, setSupportingEvidence] = useState('');
  const [previousComparison, setPreviousComparison] = useState('');
  const [nextTargets, setNextTargets] = useState('');
  const [interventionPlan, setInterventionPlan] = useState('');

  const [generatingAi, setGeneratingAi] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveNotification, setSaveNotification] = useState('');

  // Find existing assessment if already created for this student and period
  const existingAssessment = weeklyAssessments.find(
    (w) => w.studentId === selectedStudentId && w.period === selectedPeriod
  );

  // Load existing or reset
  useEffect(() => {
    if (existingAssessment) {
      setPositiveDevelopments(existingAssessment.positiveDevelopments);
      setVisibleProgress(existingAssessment.visibleProgress);
      setChallenges(existingAssessment.challenges);
      setSupportingEvidence(existingAssessment.supportingEvidence);
      setPreviousComparison(existingAssessment.previousComparison);
      setNextTargets(existingAssessment.nextTargets);
      setInterventionPlan(existingAssessment.interventionPlan);
    } else {
      // Find observations for this student
      const studentObs = observations.filter((o) => o.studentId === selectedStudentId);
      const positiveObs = studentObs.filter(
        (o) => o.category === 'Catatan Positif' || o.category === 'Pencapaian'
      );
      const careObs = studentObs.filter(
        (o) => o.category === 'Kebutuhan Pendampingan' || o.category === 'Kejadian Penting'
      );

      setPositiveDevelopments(
        positiveObs.length > 0
          ? positiveObs.map((o) => `• [${o.aspect}] ${o.observedBehavior}`).join('\n')
          : ''
      );
      setVisibleProgress(
        positiveObs.length > 0
          ? `Kemajuan terlihat pada indikator: ${positiveObs.map((o) => o.indicator).join(', ')}`
          : ''
      );
      setChallenges(
        careObs.length > 0
          ? careObs.map((o) => `• [${o.aspect}] ${o.observedBehavior}`).join('\n')
          : ''
      );
      setSupportingEvidence(
        studentObs.length > 0
          ? studentObs.map((o) => `${o.dateTime.split(' ')[0]}: ${o.evidenceOrSource || 'Observasi guru'}`).join('; ')
          : ''
      );
      setPreviousComparison('');
      setNextTargets(
        careObs.length > 0
          ? `Tindak lanjut pendampingan pada aspek ${careObs[0].aspect}`
          : 'Mempertahankan konsistensi ibadah dan capaian belajar mandiri'
      );
      setInterventionPlan(
        careObs.length > 0 ? careObs[0].followUpPlan || 'Bimbingan personal 1-on-1' : ''
      );
    }
  }, [selectedStudentId, selectedPeriod, existingAssessment, observations]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const studentObservations = observations.filter((o) => o.studentId === selectedStudentId);

  // Trigger AI assistant
  const handleGenerateAi = async () => {
    if (!selectedStudent) return;
    setGeneratingAi(true);
    try {
      const prev = weeklyAssessments.find(
        (w) => w.studentId === selectedStudentId && w.period !== selectedPeriod
      );
      const result = await generateWeeklySummaryWithAi({
        studentName: selectedStudent.fullName,
        nis: selectedStudent.nis,
        period: selectedPeriod,
        observations: studentObservations,
        previousAssessment: prev,
      });

      setPositiveDevelopments(result.positiveDevelopments);
      setVisibleProgress(result.visibleProgress);
      setChallenges(result.challenges);
      setSupportingEvidence(result.supportingEvidence);
      setPreviousComparison(result.previousComparison);
      setNextTargets(result.nextTargets);
      setInterventionPlan(result.interventionPlan);

      setSaveNotification('Draf berhasil dirangkum dengan asisten cerdas. Silakan tinjau dan sesuaikan sebelum disimpan.');
      setTimeout(() => setSaveNotification(''), 4000);
    } catch (e: any) {
      console.error(e);
    } finally {
      setGeneratingAi(false);
    }
  };

  const handleSave = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    try {
      await saveWeeklyAssessment(
        {
          studentId: selectedStudent.id,
          studentName: selectedStudent.fullName,
          type: 'weekly',
          period: selectedPeriod,
          weekNumber,
          academicYear: settings.academicYear,
          semester: settings.semester,
          positiveDevelopments,
          visibleProgress,
          challenges,
          supportingEvidence,
          previousComparison,
          nextTargets,
          interventionPlan,
          isAiAssisted: true,
          evaluatorId: userProfile?.id || 'wali_kelas',
          evaluatorName: userProfile?.displayName || settings.waliKelasName,
        },
        existingAssessment?.id
      );

      setSaveNotification('Evaluasi mingguan berhasil disimpan ke database!');
      setTimeout(() => setSaveNotification(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selection Control Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {/* Student Picker */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Pilih Santri ({students.length} Siswa)
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.nis} - {st.fullName} ({st.dormitoryRoom ? st.dormitoryRoom.split('/')[0] : 'Asrama'})
                  </option>
                ))}
              </select>
            </div>

            {/* Period Picker */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Periode Mingguan
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) => {
                  setSelectedPeriod(e.target.value);
                  const m = e.target.value.match(/Minggu ke-(\d+)/);
                  if (m) setWeekNumber(parseInt(m[1]));
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Minggu ke-4, Oktober 2026">Minggu ke-4, Oktober 2026</option>
                <option value="Minggu ke-3, Oktober 2026">Minggu ke-3, Oktober 2026</option>
                <option value="Minggu ke-2, Oktober 2026">Minggu ke-2, Oktober 2026</option>
                <option value="Minggu ke-1, Oktober 2026">Minggu ke-1, Oktober 2026</option>
                <option value="Minggu ke-4, September 2026">Minggu ke-4, September 2026</option>
              </select>
            </div>
          </div>

          {/* AI Synthesis Button */}
          <div className="shrink-0 flex items-center space-x-2">
            <button
              onClick={handleGenerateAi}
              disabled={generatingAi}
              className="px-4 py-2.5 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
              title="Rangkum otomatis dari catatan jurnal nyata siswa"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '3s' }} />
              <span>{generatingAi ? 'Merangkum Catatan...' : 'Rangkum dengan AI'}</span>
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>
              Tersedia <strong>{studentObservations.length} catatan observasi</strong> untuk{' '}
              <strong className="text-slate-800">{selectedStudent?.fullName}</strong>.
            </span>
          </div>
          {existingAssessment && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
              ✓ Telah Dievaluasi
            </span>
          )}
        </div>
      </div>

      {saveNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Main 7 Sections Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Formulir Evaluasi Mingguan: {selectedStudent?.fullName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh ringkasan harus berlandaskan bukti observasi nyata dan tetap dapat disunting wali kelas.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Evaluasi'}</span>
          </button>
        </div>

        {/* 1. Perkembangan Positif & 2. Kemajuan yang Terlihat */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-emerald-900 mb-1.5 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              1. Perkembangan Positif
            </label>
            <textarea
              value={positiveDevelopments}
              onChange={(e) => setPositiveDevelopments(e.target.value)}
              rows={4}
              placeholder="Deskripsikan poin-poin perilaku positif yang muncul konsisten..."
              className="w-full p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 leading-relaxed bg-emerald-50/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-blue-900 mb-1.5 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              2. Kemajuan yang Terlihat
            </label>
            <textarea
              value={visibleProgress}
              onChange={(e) => setVisibleProgress(e.target.value)}
              rows={4}
              placeholder="Perubahan positif nyata dibandingkan kondisi awal observasi..."
              className="w-full p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 leading-relaxed bg-blue-50/20"
            />
          </div>
        </div>

        {/* 3. Tantangan yang Masih Muncul & 4. Bukti Pendukung */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-amber-900 mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              3. Tantangan yang Masih Muncul (Objektif)
            </label>
            <textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              rows={4}
              placeholder="Deskripsikan area yang masih membutuhkan bimbingan bertahap (hindari label negatif)..."
              className="w-full p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 leading-relaxed bg-amber-50/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-500" />
              4. Bukti Pendukung Observasi
            </label>
            <textarea
              value={supportingEvidence}
              onChange={(e) => setSupportingEvidence(e.target.value)}
              rows={4}
              placeholder="Catatan tanggal, dokumen tugas, presensi tahajud, laporan musyrif..."
              className="w-full p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 leading-relaxed"
            />
          </div>
        </div>

        {/* 5. Perbandingan dengan Minggu Sebelumnya */}
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-500" />
            5. Perbandingan dengan Minggu Sebelumnya
          </label>
          <textarea
            value={previousComparison}
            onChange={(e) => setPreviousComparison(e.target.value)}
            rows={2}
            placeholder="Evaluasi komparatif apakah target minggu lalu tercapai..."
            className="w-full p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 leading-relaxed"
          />
        </div>

        {/* 6. Target Minggu Berikutnya & 7. Rencana Pembinaan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-purple-900 mb-1.5 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-purple-600" />
              6. Target Minggu Berikutnya (Spesifik & Terukur)
            </label>
            <textarea
              value={nextTargets}
              onChange={(e) => setNextTargets(e.target.value)}
              rows={3}
              placeholder="Contoh: 'Siswa hadir tepat waktu pada seluruh sesi halaqah pagi selama 5 hari berturut-turut'..."
              className="w-full p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 leading-relaxed bg-purple-50/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-900 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-600" />
              7. Rencana Pembinaan Wali Kelas & Musyrif
            </label>
            <textarea
              value={interventionPlan}
              onChange={(e) => setInterventionPlan(e.target.value)}
              rows={3}
              placeholder="Langkah pendampingan personal, koordinasi dengan pembina asrama..."
              className="w-full p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 leading-relaxed bg-emerald-50/20"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Penilai: <strong>{userProfile?.displayName || settings.waliKelasName}</strong>
          </span>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Simpan Evaluasi Mingguan'}
          </button>
        </div>
      </div>

      {/* Historical List of Saved Weekly Assessments */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600" />
          Riwayat Evaluasi Mingguan Tersimpan ({weeklyAssessments.length})
        </h3>

        {weeklyAssessments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {weeklyAssessments.map((item) => (
              <div key={item.id} className="py-3.5 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {item.period}
                    </span>
                    <strong className="text-slate-800 text-xs">{item.studentName}</strong>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    <strong>Target:</strong> {item.nextTargets}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Dievaluasi oleh: {item.evaluatorName} • {item.updatedAt ? item.updatedAt.split('T')[0] : 'Hari ini'}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedStudentId(item.studentId);
                      setSelectedPeriod(item.period);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                  >
                    Buka Draf
                  </button>
                  <button
                    onClick={() => deleteAssessment(item.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">
            Belum ada rekap evaluasi mingguan yang disimpan.
          </p>
        )}
      </div>
    </div>
  );
};
