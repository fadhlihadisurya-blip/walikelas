import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  CheckCircle,
  HelpCircle,
  Save,
  BookOpen,
  Calendar,
  AlertCircle,
  FileText,
  User,
  Sparkles,
} from 'lucide-react';
import { useJPISData } from '../../context/JPISDataContext';
import { useAuth } from '../../context/AuthContext';
import { MonthlyAssessment, MonthlyScore, AspectRubricRating } from '../../types';

const SIX_ASPECTS = [
  {
    name: 'Akademik',
    desc: 'Pemahaman konsep pelajaran, ketuntasan tugas mandiri, dan keaktifan intelektual.',
  },
  {
    name: 'Ibadah',
    desc: 'Kekhusyukan shalat fardhu berjamaah, tilawah harian, tahfidz, dan qiyamullail.',
  },
  {
    name: 'Karakter dan Adab Islami',
    desc: 'Kesantunan tutur kata, amanah, kejujuran muamalah, birrul walidain, dan ta’zhim asatidz.',
  },
  {
    name: 'Kedisiplinan dan Kemandirian',
    desc: 'Kerapian kamar asrama, ketepatan waktu jam tidur & bangun, serta pengelolaan pakaian.',
  },
  {
    name: 'Sosial dan Emosional',
    desc: 'Empati terhadap rekan sekamar, resolusi konflik damai, dan partisipasi kebersihan bersama.',
  },
  {
    name: 'Minat, Bakat, dan Potensi',
    desc: 'Pengembangan talenta khusus, karya kreatif, ekstrakurikuler, dan inisiatif kepemimpinan.',
  },
];

const RUBRIC_SCALE: Record<
  MonthlyScore,
  { label: string; badgeColor: string; description: string }
> = {
  1: {
    label: 'Skala 1 (Belum Berkembang)',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Belum berkembang, membutuhkan pendampingan intensif dan pemantauan harian.',
  },
  2: {
    label: 'Skala 2 (Mulai Berkembang)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Mulai berkembang, membutuhkan arahan dan pengingat berulang.',
  },
  3: {
    label: 'Skala 3 (Berkembang Baik)',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Berkembang baik, umumnya konsisten menjalankan adab secara mandiri.',
  },
  4: {
    label: 'Skala 4 (Berkembang Sangat Baik)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Berkembang sangat baik, konsisten, mandiri, dan mampu menjadi teladan bagi rekan.',
  },
  'N/O': {
    label: 'N/O (Belum Cukup Observasi)',
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'Belum cukup data/bukti observasi konkret untuk dinilai secara adil pada bulan ini.',
  },
};

export const MonthlyEvaluationView: React.FC = () => {
  const { students, observations, monthlyAssessments, saveMonthlyAssessment, settings } = useJPISData();
  const { userProfile } = useAuth();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedMonth, setSelectedMonth] = useState<string>('Oktober 2026');

  // Ratings for all 6 aspects
  const [ratings, setRatings] = useState<Record<string, AspectRubricRating>>({});
  const [overallSummary, setOverallSummary] = useState('');
  const [growthNotes, setGrowthNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const existingAssessment = monthlyAssessments.find(
    (m) => m.studentId === selectedStudentId && m.month === selectedMonth
  );

  // Initialize or load ratings
  useEffect(() => {
    if (existingAssessment) {
      setRatings(existingAssessment.ratings || {});
      setOverallSummary(existingAssessment.overallSummary || '');
      setGrowthNotes(existingAssessment.growthNotes || '');
    } else {
      // Find relevant student observations
      const studentObs = observations.filter((o) => o.studentId === selectedStudentId);

      const initial: Record<string, AspectRubricRating> = {};
      SIX_ASPECTS.forEach((asp) => {
        const matchingObs = studentObs.filter(
          (o) =>
            o.aspect === asp.name ||
            (asp.name.includes('Kedisiplinan') &&
              (o.aspect === 'Kedisiplinan' || o.aspect === 'Kemandirian')) ||
            (asp.name.includes('Minat') && o.aspect === 'Minat, Bakat, dan Potensi')
        );

        initial[asp.name] = {
          aspect: asp.name,
          score: matchingObs.length > 0 ? 3 : 'N/O',
          evidence:
            matchingObs.length > 0
              ? matchingObs.map((o) => o.observedBehavior).join('; ')
              : 'Belum ada catatan observasi spesifik pada aspek ini.',
          evaluatorNotes:
            matchingObs.length > 0
              ? `Tercatat ${matchingObs.length} perilaku teramati.`
              : 'Memerlukan pemantauan lebih lanjut oleh musyrif dan guru bidang.',
        };
      });

      setRatings(initial);
      setOverallSummary('Santri menunjukkan perkembangan adab dan ibadah yang stabil di lingkungan asrama.');
      setGrowthNotes('Fokus bulan depan adalah konsistensi ketertiban istirahat malam dan pendampingan tahfidz.');
    }
  }, [selectedStudentId, selectedMonth, existingAssessment, observations]);

  const handleScoreChange = (aspectName: string, score: MonthlyScore) => {
    setRatings((prev) => ({
      ...prev,
      [aspectName]: {
        ...prev[aspectName],
        score,
      },
    }));
  };

  const handleEvidenceChange = (aspectName: string, evidence: string) => {
    setRatings((prev) => ({
      ...prev,
      [aspectName]: {
        ...prev[aspectName],
        evidence,
      },
    }));
  };

  const handleNotesChange = (aspectName: string, evaluatorNotes: string) => {
    setRatings((prev) => ({
      ...prev,
      [aspectName]: {
        ...prev[aspectName],
        evaluatorNotes,
      },
    }));
  };

  const handleSave = async () => {
    if (!selectedStudent) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      await saveMonthlyAssessment(
        {
          studentId: selectedStudent.id,
          studentName: selectedStudent.fullName,
          type: 'monthly',
          period: selectedMonth,
          month: selectedMonth,
          academicYear: settings.academicYear,
          semester: settings.semester,
          ratings,
          overallSummary,
          growthNotes,
          evaluatorId: userProfile?.id || 'wali_kelas',
          evaluatorName: userProfile?.displayName || settings.waliKelasName,
        },
        existingAssessment?.id
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Control Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {/* Student Picker */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Pilih Santri
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

            {/* Month Picker */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                Bulan Evaluasi
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Oktober 2026">Oktober 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="Agustus 2026">Agustus 2026</option>
                <option value="Juli 2026">Juli 2026</option>
              </select>
            </div>
          </div>

          <div className="shrink-0 flex items-center space-x-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Rubrik Bulanan'}</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Rubrik evaluasi bulanan berhasil disimpan ke database!</span>
          </div>
        )}

        {/* Scoring Scale Legend */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <p className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            Panduan Skala Penilaian Objektif (Bukan Angka Tanpa Bukti)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
            {Object.entries(RUBRIC_SCALE).map(([key, val]) => (
              <div key={key} className="p-2 rounded-xl bg-white border border-slate-200">
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] block w-fit mb-1 ${val.badgeColor}`}>
                  {key === 'N/O' ? 'N/O' : `Skala ${key}`}
                </span>
                <p className="text-slate-600 text-[10px] leading-tight">{val.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6 Rubric Aspect Cards */}
      <div className="space-y-4">
        {SIX_ASPECTS.map((asp, idx) => {
          const currentRating = ratings[asp.name] || {
            aspect: asp.name,
            score: 'N/O' as MonthlyScore,
            evidence: '',
            evaluatorNotes: '',
          };

          return (
            <div
              key={asp.name}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4"
            >
              {/* Card Header: Aspect Name and Description */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {idx + 1}. Aspek {asp.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{asp.desc}</p>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">Skor Terpilih:</span>
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                      RUBRIC_SCALE[currentRating.score]?.badgeColor
                    }`}
                  >
                    {currentRating.score === 'N/O' ? 'N/O (Belum Dinilai)' : `Skala ${currentRating.score}`}
                  </span>
                </div>
              </div>

              {/* Score Button Selector */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">
                  Tentukan Nilai Rubrik
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  {([1, 2, 3, 4, 'N/O'] as MonthlyScore[]).map((sc) => {
                    const isSelected = currentRating.score === sc;
                    return (
                      <button
                        type="button"
                        key={String(sc)}
                        onClick={() => handleScoreChange(asp.name, sc)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? `${RUBRIC_SCALE[sc].badgeColor} ring-2 ring-emerald-500 font-bold shadow-xs`
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <p className="font-bold">{sc === 'N/O' ? 'N/O' : `Skor ${sc}`}</p>
                        <p className="text-[10px] opacity-75 mt-0.5 line-clamp-1">
                          {sc === 1
                            ? 'Belum berkembang'
                            : sc === 2
                            ? 'Mulai berkembang'
                            : sc === 3
                            ? 'Berkembang baik'
                            : sc === 4
                            ? 'Sangat baik'
                            : 'Cari bukti tambahan'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Evidence & Evaluator Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bukti Observasi / Dasar Penilaian <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={currentRating.evidence}
                    onChange={(e) => handleEvidenceChange(asp.name, e.target.value)}
                    rows={3}
                    placeholder="Wajib menyertakan bukti nyata (misal: lembar setoran, catatan musyrif, atau hasil tugas)..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-slate-800 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Catatan Penilai / Rekomendasi Khusus
                  </label>
                  <textarea
                    value={currentRating.evaluatorNotes}
                    onChange={(e) => handleNotesChange(asp.name, e.target.value)}
                    rows={3}
                    placeholder="Catatan pendampingan wali kelas untuk penguatan indikator..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-slate-800 leading-relaxed"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Summary Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
        <h4 className="font-bold text-slate-900 text-sm">Kesimpulan & Catatan Pertumbuhan Bulanan</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ringkasan Perkembangan Menyeluruh
            </label>
            <textarea
              value={overallSummary}
              onChange={(e) => setOverallSummary(e.target.value)}
              rows={3}
              placeholder="Rangkuman naratif karakter dan kemajuan santri bulan ini..."
              className="w-full p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-slate-800 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Fokus Pendampingan Bulan Berikutnya
            </label>
            <textarea
              value={growthNotes}
              onChange={(e) => setGrowthNotes(e.target.value)}
              rows={3}
              placeholder="Sasaran prioritas pembinaan bulan selanjutnya..."
              className="w-full p-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-slate-800 leading-relaxed"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            {saving ? 'Menyimpan...' : 'Simpan Seluruh Evaluasi Bulanan'}
          </button>
        </div>
      </div>
    </div>
  );
};
