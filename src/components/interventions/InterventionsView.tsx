import React, { useState } from 'react';
import {
  HeartHandshake,
  Search,
  Filter,
  PlusCircle,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Calendar,
  User,
  Sparkles,
} from 'lucide-react';
import { useJPISData } from '../../context/JPISDataContext';
import { Intervention, InterventionStatus } from '../../types';
import { NewInterventionModal } from './NewInterventionModal';

const STATUS_CONFIG: Record<
  InterventionStatus,
  { bg: string; text: string; border: string }
> = {
  Direncanakan: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  Berjalan: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  Tercapai: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  'Perlu Penyesuaian': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  Ditutup: { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-400' },
};

export const InterventionsView: React.FC = () => {
  const { interventions, updateIntervention, deleteIntervention } = useJPISData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState<Intervention | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  // Filter interventions
  const filtered = interventions.filter((item) => {
    const matchSearch =
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.identifiedNeed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.specificTarget.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.personInCharge && item.personInCharge.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = statusFilter === 'semua' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const isOverdue = (dueDate?: string, status?: InterventionStatus) => {
    if (!dueDate || status === 'Tercapai' || status === 'Ditutup') return false;
    return dueDate < today;
  };

  const isDueSoon = (dueDate?: string, status?: InterventionStatus) => {
    if (!dueDate || status === 'Tercapai' || status === 'Ditutup') return false;
    const diff = (new Date(dueDate).getTime() - new Date(today).getTime()) / 86400000;
    return diff >= 0 && diff <= 3;
  };

  const handleQuickStatus = async (id: string, newStatus: InterventionStatus) => {
    await updateIntervention(id, { status: newStatus });
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Hapus program pembinaan untuk ${name}?`)) {
      await deleteIntervention(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Control Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari program pembinaan berdasarkan nama santri, target spesifik, atau kebutuhan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-purple-500 text-xs text-slate-800 transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Status Filter */}
            <div className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-hidden"
              >
                <option value="semua">Semua Status ({interventions.length})</option>
                <option value="Direncanakan">Direncanakan</option>
                <option value="Berjalan">Berjalan</option>
                <option value="Tercapai">Tercapai</option>
                <option value="Perlu Penyesuaian">Perlu Penyesuaian</option>
                <option value="Ditutup">Ditutup</option>
              </select>
            </div>

            <button
              onClick={() => {
                setEditingIntervention(null);
                setModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Program Baru</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span>
            Total: <strong>{filtered.length}</strong> program pembinaan terdata
          </span>
          <span className="font-semibold text-purple-800">
            Fokus: Target Perubahan Spesifik & Berkesinambungan
          </span>
        </div>
      </div>

      {/* Interventions List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((item) => {
            const overdue = isOverdue(item.dueDate, item.status);
            const dueSoon = isDueSoon(item.dueDate, item.status);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-6 border transition-all ${
                  overdue
                    ? 'border-rose-300 shadow-md ring-1 ring-rose-200'
                    : dueSoon
                    ? 'border-amber-300 shadow-sm'
                    : 'border-slate-200 shadow-2xs hover:shadow-md'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-900 font-bold flex items-center justify-center text-xs shrink-0">
                      {item.studentName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.studentName}</h4>
                      <p className="text-[11px] text-slate-400">
                        Penanggung Jawab (PIC): <strong className="text-slate-600">{item.personInCharge}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                        STATUS_CONFIG[item.status]?.bg
                      } ${STATUS_CONFIG[item.status]?.text} ${
                        STATUS_CONFIG[item.status]?.border
                      }`}
                    >
                      {item.status}
                    </span>

                    {/* Deadline warning */}
                    {overdue && (
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 animate-pulse">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Terlambat Dievaluasi</span>
                      </span>
                    )}
                    {dueSoon && (
                      <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Mendekati Tenggat</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Target & Details */}
                <div className="mt-4 space-y-3 text-xs">
                  {/* Specific Target Highlight */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-100">
                    <span className="text-[10px] font-bold uppercase text-purple-800 block mb-1">
                      Target Perubahan yang Spesifik & Realistis
                    </span>
                    <p className="text-purple-950 font-bold text-xs leading-relaxed">
                      "{item.specificTarget}"
                    </p>
                  </div>

                  {/* 2 Cols: Need vs Strengths */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <strong className="text-slate-700 block text-[10px] uppercase">
                        Kebutuhan / Masalah Teridentifikasi
                      </strong>
                      <p className="text-slate-600 mt-1">{item.identifiedNeed}</p>
                      {item.initialConditionAndEvidence && (
                        <p className="text-slate-400 mt-1 italic">
                          Kondisi awal: {item.initialConditionAndEvidence}
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <strong className="text-slate-700 block text-[10px] uppercase">
                        Kekuatan Santri & Strategi
                      </strong>
                      <p className="text-slate-600 mt-1">
                        <strong>Kekuatan:</strong> {item.studentStrengths || '-'}
                      </p>
                      <p className="text-slate-600 mt-1">
                        <strong>Strategi:</strong> {item.coachingStrategy || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Indicators & Evaluation Results */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-600 pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <span className="font-bold text-[10px] uppercase text-slate-400 block">Indikator Keberhasilan</span>
                      <p className="text-slate-700 mt-0.5">{item.successIndicator || '-'}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <span className="font-bold text-[10px] uppercase text-slate-400 block">Hasil Evaluasi</span>
                      <p className="text-emerald-700 font-medium mt-0.5">{item.evaluationResult || 'Dalam proses pelaksanaan'}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50">
                      <span className="font-bold text-[10px] uppercase text-slate-400 block">Tenggat Waktu</span>
                      <p className="font-mono text-slate-800 font-bold mt-0.5">{item.dueDate || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Status Bar & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] text-slate-400 font-medium">Ubah Status Cepat:</span>
                    {(['Direncanakan', 'Berjalan', 'Tercapai', 'Perlu Penyesuaian'] as InterventionStatus[]).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => handleQuickStatus(item.id, st)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                            item.status === st
                              ? 'bg-purple-700 text-white border-purple-700'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingIntervention(item);
                        setModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center space-x-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Ubah</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.studentName)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-3">
            <HeartHandshake className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">
              Tidak ada program pembinaan yang sesuai dengan filter
            </p>
            <p className="text-xs">Klik tombol "Program Baru" di atas untuk merumuskan target pembinaan santri.</p>
          </div>
        )}
      </div>

      <NewInterventionModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingIntervention(null);
        }}
        initialData={editingIntervention}
      />
    </div>
  );
};
