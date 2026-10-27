import React, { useState } from 'react';
import {
  X,
  User,
  BookOpen,
  HeartHandshake,
  Award,
  Sparkles,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  Phone,
  Home,
  CheckCircle,
  Calendar,
  Tag,
  Edit,
  Printer,
} from 'lucide-react';
import { Student } from '../../types';
import { useJPISData } from '../../context/JPISDataContext';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onOpenNewJournal: (studentId: string) => void;
  onEditStudent: (student: Student) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
  onOpenNewJournal,
  onEditStudent,
}) => {
  const { observations, interventions, strengths, parentContacts, settings } = useJPISData();
  const [activeTab, setActiveTab] = useState<'ringkasan' | 'jurnal' | 'pembinaan' | 'prestasi' | 'ortu'>('ringkasan');

  if (!isOpen || !student) return null;

  // Filter student-specific records
  const studentObs = observations.filter((o) => o.studentId === student.id);
  const studentInterventions = interventions.filter((i) => i.studentId === student.id);
  const studentStrengths = strengths.filter((s) => s.studentId === student.id);
  const studentContacts = parentContacts.filter((p) => p.studentId === student.id);

  const positiveNotes = studentObs.filter(
    (o) => o.category === 'Catatan Positif' || o.category === 'Pencapaian'
  );
  const careNotes = studentObs.filter(
    (o) => o.category === 'Kebutuhan Pendampingan' || o.category === 'Kejadian Penting'
  );

  // Aspect breakdown for this individual
  const aspectStats: Record<string, number> = {
    'Akademik': 0,
    'Ibadah': 0,
    'Karakter dan Adab Islami': 0,
    'Kedisiplinan': 0,
    'Kemandirian': 0,
    'Sosial dan Emosional': 0,
  };
  studentObs.forEach((o) => {
    if (aspectStats[o.aspect] !== undefined) {
      aspectStats[o.aspect] += 1;
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header Profile Banner */}
        <div className="p-6 bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-800 text-amber-300 border-2 border-emerald-600/60 flex items-center justify-center font-extrabold text-2xl shadow-md">
                {student.nickname ? student.nickname.charAt(0) : student.fullName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold tracking-tight text-white">{student.fullName}</h2>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      student.status === 'aktif' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {student.status}
                  </span>
                </div>
                <p className="text-xs text-emerald-200/90 mt-1 flex flex-wrap items-center gap-3">
                  <span>NIS: <strong className="font-mono text-white">{student.nis}</strong></span>
                  <span>•</span>
                  <span>{student.className}</span>
                  <span>•</span>
                  <span>{student.gender === 'L' ? 'Ikhwan' : 'Akhwat'}</span>
                </p>
                <p className="text-xs text-emerald-300/80 mt-1 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 shrink-0" />
                  <span>{student.dormitoryRoom || 'Kamar Asrama'}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEditStudent(student)}
                className="p-2 text-emerald-300 hover:text-white rounded-xl hover:bg-emerald-800 transition-colors"
                title="Ubah Profil Siswa"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-emerald-300 hover:text-white rounded-xl hover:bg-emerald-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Action in Header */}
          <div className="mt-5 pt-4 border-t border-emerald-900/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex space-x-1.5 overflow-x-auto text-xs">
              {[
                { id: 'ringkasan', label: 'Ringkasan & Potensi' },
                { id: 'jurnal', label: `Riwayat Jurnal (${studentObs.length})` },
                { id: 'pembinaan', label: `Pembinaan (${studentInterventions.length})` },
                { id: 'prestasi', label: `Prestasi (${studentStrengths.length})` },
                { id: 'ortu', label: `Komunikasi Ortu (${studentContacts.length})` },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                    activeTab === t.id
                      ? 'bg-amber-400 text-emerald-950 shadow-xs'
                      : 'text-emerald-200 hover:bg-emerald-900/70 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenNewJournal(student.id);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Catat Jurnal</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-slate-700 space-y-6">
          {activeTab === 'ringkasan' && (
            <div className="space-y-6">
              {/* Row: Strengths and Care Needs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Positive Milestones */}
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <h4 className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs mb-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Catatan Positif & Kemajuan Terkini ({positiveNotes.length})
                  </h4>
                  {positiveNotes.length > 0 ? (
                    <ul className="space-y-2">
                      {positiveNotes.slice(0, 3).map((p) => (
                        <li key={p.id} className="p-2.5 bg-white rounded-xl border border-emerald-100">
                          <div className="flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                            <span>{p.aspect}</span>
                            <span className="font-mono text-slate-400">{p.dateTime.split(' ')[0]}</span>
                          </div>
                          <p className="text-slate-700 mt-1">{p.observedBehavior}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">Belum ada catatan positif khusus.</p>
                  )}
                </div>

                {/* Care Needs */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
                  <h4 className="font-bold text-amber-900 flex items-center gap-1.5 text-xs mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Kebutuhan Pendampingan Objektif ({careNotes.length})
                  </h4>
                  {careNotes.length > 0 ? (
                    <ul className="space-y-2">
                      {careNotes.slice(0, 3).map((c) => (
                        <li key={c.id} className="p-2.5 bg-white rounded-xl border border-amber-100">
                          <div className="flex items-center justify-between text-[11px] text-amber-800 font-semibold">
                            <span>{c.aspect}</span>
                            <span className="font-mono text-slate-400">{c.dateTime.split(' ')[0]}</span>
                          </div>
                          <p className="text-slate-700 mt-1">{c.observedBehavior}</p>
                          {c.followUpPlan && (
                            <p className="text-emerald-700 text-[10px] font-semibold mt-1">
                              Rencana: {c.followUpPlan}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-500 italic">Tidak ada catatan pendampingan khusus.</p>
                  )}
                </div>
              </div>

              {/* Potentials & Interests Breakdown */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Pemetaan Minat, Bakat, dan Potensi Santri
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Minat & Hobi</span>
                    <p className="text-slate-800 font-medium mt-1">
                      {student.interestsAndTalents || 'Belum diisi'}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Potensi Akademik</span>
                    <p className="text-slate-800 font-medium mt-1">
                      {student.academicPotential || 'Belum diisi'}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Potensi Non-Akademik</span>
                    <p className="text-slate-800 font-medium mt-1">
                      {student.nonAcademicPotential || 'Belum diisi'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Kontak Orang Tua / Wali</span>
                    <p className="text-slate-800 font-semibold mt-0.5">
                      {student.parentName || 'Nama Wali Belum Terdata'} ({student.parentPhone || 'No. Telp Belum Ada'})
                    </p>
                  </div>
                  {student.parentPhone && (
                    <a
                      href={`https://wa.me/${student.parentPhone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] flex items-center space-x-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>WhatsApp Ortu</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Aspect Frequency Overview */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white">
                <h4 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  Frekuensi Observasi Aspek Perkembangan Santri
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(aspectStats).map(([asp, count]) => (
                    <div key={asp} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <p className="text-[11px] text-slate-500 truncate">{asp}</p>
                      <p className="text-base font-bold text-slate-800 mt-1">{count} Catatan</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jurnal' && (
            <div className="space-y-3">
              {studentObs.length > 0 ? (
                studentObs.map((obs) => (
                  <div key={obs.id} className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            obs.category === 'Catatan Positif' || obs.category === 'Pencapaian'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {obs.category}
                        </span>
                        <span className="font-bold text-slate-800">{obs.aspect}</span>
                      </div>
                      <span className="font-mono text-slate-500 text-[11px]">{obs.dateTime}</span>
                    </div>

                    <div className="mt-2.5 space-y-1.5">
                      <p className="font-semibold text-slate-800">Indikator: {obs.indicator}</p>
                      <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {obs.observedBehavior}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                        <p><strong>Konteks:</strong> {obs.context || '-'}</p>
                        <p><strong>Bukti:</strong> {obs.evidenceOrSource || '-'}</p>
                        <p><strong>Tindakan Guru:</strong> {obs.teacherAction || '-'}</p>
                        <p><strong>Rencana Lanjut:</strong> {obs.followUpPlan || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">
                  Belum ada catatan jurnal observasi untuk santri ini.
                </div>
              )}
            </div>
          )}

          {activeTab === 'pembinaan' && (
            <div className="space-y-3">
              {studentInterventions.length > 0 ? (
                studentInterventions.map((int) => (
                  <div key={int.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                        Status: {int.status}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">Tenggat: {int.dueDate || '-'}</span>
                    </div>
                    <p className="font-bold text-slate-800 text-xs">Target Perubahan Spesifik:</p>
                    <p className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-100 text-purple-950 font-medium">
                      {int.specificTarget}
                    </p>
                    <div className="text-[11px] text-slate-600 space-y-1 pt-1">
                      <p><strong>Kondisi Awal:</strong> {int.initialConditionAndEvidence}</p>
                      <p><strong>Strategi Pembinaan:</strong> {int.coachingStrategy}</p>
                      <p><strong>Penanggung Jawab:</strong> {int.personInCharge}</p>
                      <p><strong>Hasil Evaluasi:</strong> {int.evaluationResult || 'Sedang proses'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">
                  Belum ada program pembinaan aktif untuk santri ini.
                </div>
              )}
            </div>
          )}

          {activeTab === 'prestasi' && (
            <div className="space-y-3">
              {studentStrengths.length > 0 ? (
                studentStrengths.map((str) => (
                  <div key={str.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {str.category} • Tingkat {str.level}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">{str.year}</span>
                    </div>
                    <h5 className="font-bold text-slate-800 text-xs">{str.title}</h5>
                    <p className="text-slate-600">{str.description}</p>
                    <p className="text-emerald-700 text-[11px] pt-1">
                      <strong>Rekomendasi Pengembangan:</strong> {str.recommendedDevelopment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">
                  Belum ada rekaman prestasi atau karya khusus.
                </div>
              )}
            </div>
          )}

          {activeTab === 'ortu' && (
            <div className="space-y-3">
              {studentContacts.length > 0 ? (
                studentContacts.map((pc) => (
                  <div key={pc.id} className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">
                        Media: {pc.media}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">{pc.contactDate}</span>
                    </div>
                    <p className="font-bold text-slate-800">{pc.mainDiscussion}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 bg-emerald-50 rounded-lg">
                        <strong className="text-emerald-900">Perkembangan Positif:</strong>
                        <p className="text-emerald-800 mt-0.5">{pc.positiveDevelopments}</p>
                      </div>
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <strong className="text-amber-900">Kesepakatan Sekolah & Ortu:</strong>
                        <p className="text-amber-800 mt-0.5">{pc.schoolParentAgreement}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400">
                  Belum ada catatan komunikasi dengan orang tua santri ini.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Terakhir diperbarui: {student.updatedAt ? student.updatedAt.split('T')[0] : 'Hari ini'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
