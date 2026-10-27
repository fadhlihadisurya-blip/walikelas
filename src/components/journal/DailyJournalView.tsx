import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  PlusCircle,
  Calendar,
  User,
  Edit,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle,
  Eye,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useJPISData } from '../../context/JPISDataContext';
import { Observation, AspectType, JournalCategory } from '../../types';
import { NewJournalModal } from './NewJournalModal';

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

export const DailyJournalView: React.FC = () => {
  const { observations, students, deleteObservation, settings } = useJPISData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('semua');
  const [selectedAspectFilter, setSelectedAspectFilter] = useState<string>('semua');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('semua');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingObs, setEditingObs] = useState<Observation | null>(null);
  const [viewDetailObs, setViewDetailObs] = useState<Observation | null>(null);

  // Filter observations
  const filteredObservations = observations.filter((obs) => {
    const matchSearch =
      obs.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.indicator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obs.observedBehavior.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (obs.context && obs.context.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStudent =
      selectedStudentFilter === 'semua' || obs.studentId === selectedStudentFilter;
    const matchAspect = selectedAspectFilter === 'semua' || obs.aspect === selectedAspectFilter;
    const matchCategory =
      selectedCategoryFilter === 'semua' || obs.category === selectedCategoryFilter;

    let matchDate = true;
    if (startDate) {
      matchDate = matchDate && obs.dateTime.split(' ')[0] >= startDate;
    }
    if (endDate) {
      matchDate = matchDate && obs.dateTime.split(' ')[0] <= endDate;
    }

    return matchSearch && matchStudent && matchAspect && matchCategory && matchDate;
  });

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Hapus catatan observasi untuk ${name}? Tindakan ini dicatat dalam log sistem.`)) {
      await deleteObservation(id);
    }
  };

  const exportJournalCsv = () => {
    const headers = [
      'Tanggal/Waktu',
      'Nama Siswa',
      'Aspek',
      'Kategori',
      'Indikator',
      'Perilaku Teramati (Objektif)',
      'Konteks Kejadian',
      'Bukti/Sumber',
      'Dampak Relevan',
      'Tindakan Wali Kelas',
      'Hasil Awal',
      'Rencana Tindak Lanjut',
      'Tgl Evaluasi Berikutnya',
      'Pencatat',
    ];
    const rows = filteredObservations.map((o) => [
      `"${o.dateTime}"`,
      `"${o.studentName}"`,
      `"${o.aspect}"`,
      `"${o.category}"`,
      `"${o.indicator.replace(/"/g, '""')}"`,
      `"${o.observedBehavior.replace(/"/g, '""')}"`,
      `"${(o.context || '').replace(/"/g, '""')}"`,
      `"${(o.evidenceOrSource || '').replace(/"/g, '""')}"`,
      `"${(o.relevantImpact || '').replace(/"/g, '""')}"`,
      `"${(o.teacherAction || '').replace(/"/g, '""')}"`,
      `"${(o.initialResult || '').replace(/"/g, '""')}"`,
      `"${(o.followUpPlan || '').replace(/"/g, '""')}"`,
      `"${o.nextEvaluationDate || ''}"`,
      `"${o.authorName}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Jurnal_Harian_${settings.className.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Control Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        {/* Row 1: Search & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari catatan jurnal berdasarkan perilaku, indikator, nama santri, atau konteks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={exportJournalCsv}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Ekspor Jurnal CSV</span>
            </button>
            <button
              onClick={() => {
                setEditingObs(null);
                setModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Jurnal</span>
            </button>
          </div>
        </div>

        {/* Row 2: Deep Filters (Student, Aspect, Category, Date range) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Filter Siswa */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Filter Santri
            </label>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="semua">Semua Santri ({students.length})</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Aspek */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Filter Aspek
            </label>
            <select
              value={selectedAspectFilter}
              onChange={(e) => setSelectedAspectFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="semua">Semua 9 Aspek</option>
              {ASPECTS.map((asp) => (
                <option key={asp} value={asp}>
                  {asp}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kategori */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Kategori Catatan
            </label>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
            >
              <option value="semua">Semua Kategori</option>
              <option value="Catatan Positif">Catatan Positif</option>
              <option value="Pencapaian">Pencapaian</option>
              <option value="Kejadian Penting">Kejadian Penting</option>
              <option value="Kebutuhan Pendampingan">Kebutuhan Pendampingan</option>
            </select>
          </div>

          {/* Date range picker */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium"
            />
          </div>
        </div>

        {/* Counter & Clear Filters */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            Menemukan <strong>{filteredObservations.length}</strong> catatan observasi jurnal
          </span>
          {(selectedStudentFilter !== 'semua' ||
            selectedAspectFilter !== 'semua' ||
            selectedCategoryFilter !== 'semua' ||
            startDate) && (
            <button
              onClick={() => {
                setSelectedStudentFilter('semua');
                setSelectedAspectFilter('semua');
                setSelectedCategoryFilter('semua');
                setStartDate('');
                setEndDate('');
                setSearchQuery('');
              }}
              className="text-emerald-700 hover:underline font-bold text-[11px]"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Observation Cards List */}
      <div className="space-y-4">
        {filteredObservations.length > 0 ? (
          filteredObservations.map((obs) => (
            <div
              key={obs.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all group"
            >
              {/* Header row: student, category, aspect, date */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs shrink-0">
                    {obs.studentName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{obs.studentName}</h4>
                    <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{obs.dateTime}</span>
                      <span>•</span>
                      <span>Wali Kelas: {obs.authorName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                      obs.category === 'Catatan Positif'
                        ? 'bg-emerald-100 text-emerald-800'
                        : obs.category === 'Pencapaian'
                        ? 'bg-blue-100 text-blue-800'
                        : obs.category === 'Kebutuhan Pendampingan'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {obs.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-100 text-slate-700">
                    {obs.aspect}
                  </span>
                </div>
              </div>

              {/* Main Body */}
              <div className="mt-3.5 space-y-2.5 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 uppercase text-[10px]">Indikator:</span>
                  <p className="font-bold text-slate-800 text-xs mt-0.5">{obs.indicator}</p>
                </div>

                {/* Objective behavior description */}
                <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Peristiwa / Perilaku yang Diamati (Objektif)
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    "{obs.observedBehavior}"
                  </p>
                </div>

                {/* Context, evidence & action details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-600 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-800 block text-[10px] uppercase">Konteks & Bukti</strong>
                    <p className="mt-0.5 truncate">{obs.context || '-'}</p>
                    <p className="text-slate-400 truncate mt-0.5">Bukti: {obs.evidenceOrSource || '-'}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-800 block text-[10px] uppercase">Tindakan Wali Kelas</strong>
                    <p className="mt-0.5 truncate">{obs.teacherAction || '-'}</p>
                    <p className="text-emerald-700 truncate mt-0.5">Hasil: {obs.initialResult || '-'}</p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <strong className="text-slate-800 block text-[10px] uppercase">Rencana Tindak Lanjut</strong>
                    <p className="mt-0.5 truncate">{obs.followUpPlan || '-'}</p>
                    <p className="text-amber-700 font-mono text-[10px] mt-0.5">
                      Evaluasi: {obs.nextEvaluationDate || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400">
                  ID: <span className="font-mono">{obs.id}</span>
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewDetailObs(obs)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detail Lengkap</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingObs(obs);
                      setModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Ubah Jurnal"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(obs.id, obs.studentName)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Hapus Jurnal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Tidak ada catatan jurnal yang sesuai filter</p>
            <p className="text-xs">Klik tombol "Tambah Jurnal" di atas untuk mencatat observasi perkembangan santri baru.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Journal Modal */}
      <NewJournalModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingObs(null);
        }}
        initialData={editingObs}
      />

      {/* Detail Full Modal */}
      {viewDetailObs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{viewDetailObs.studentName}</h3>
                <p className="text-xs text-slate-500 font-mono">{viewDetailObs.dateTime}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {viewDetailObs.aspect}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p><strong>Indikator:</strong> {viewDetailObs.indicator}</p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <strong className="block text-slate-500 text-[10px] uppercase">Perilaku Teramati (Objektif)</strong>
                <p className="mt-1 leading-relaxed text-slate-800 font-medium">{viewDetailObs.observedBehavior}</p>
              </div>
              <p><strong>Konteks:</strong> {viewDetailObs.context || '-'}</p>
              <p><strong>Bukti Observasi:</strong> {viewDetailObs.evidenceOrSource || '-'}</p>
              <p><strong>Dampak Relevan:</strong> {viewDetailObs.relevantImpact || '-'}</p>
              <p><strong>Tindakan Wali Kelas:</strong> {viewDetailObs.teacherAction || '-'}</p>
              <p><strong>Hasil Awal:</strong> {viewDetailObs.initialResult || '-'}</p>
              <p><strong>Rencana Lanjut:</strong> {viewDetailObs.followUpPlan || '-'}</p>
              <p><strong>Tanggal Evaluasi Berikutnya:</strong> {viewDetailObs.nextEvaluationDate || '-'}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewDetailObs(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
