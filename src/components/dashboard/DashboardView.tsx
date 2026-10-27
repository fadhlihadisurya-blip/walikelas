import React, { useState } from 'react';
import {
  Users,
  BookOpen,
  CalendarCheck,
  HeartHandshake,
  TrendingUp,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Search,
  Filter,
} from 'lucide-react';
import { useJPISData } from '../../context/JPISDataContext';
import { ActiveTab } from '../layout/Sidebar';
import { AspectType, Student } from '../../types';

interface DashboardViewProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onSelectStudentProfile: (studentId: string) => void;
  onOpenNewJournalModal: (studentId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onSelectStudentProfile,
  onOpenNewJournalModal,
}) => {
  const { students, observations, weeklyAssessments, interventions, settings } = useJPISData();
  const [aspectFilter, setAspectFilter] = useState<string>('Semua');

  // 1. Jumlah siswa aktif
  const activeStudents = students.filter((s) => s.status === 'aktif');

  // 2. Jumlah catatan perkembangan terbaru (misal 30 hari terakhir)
  const recentObservations = observations.slice(0, 10);

  // 3. Ringkasan evaluasi yang belum selesai
  // Berapa siswa aktif yang belum memiliki evaluasi mingguan periode saat ini?
  const currentWeek = 'Minggu ke-4, Oktober 2026';
  const evaluatedStudentIds = new Set(
    weeklyAssessments.filter((w) => w.period === currentWeek).map((w) => w.studentId)
  );
  const pendingEvaluationStudents = activeStudents.filter((s) => !evaluatedStudentIds.has(s.id));

  // 4. Target pembinaan yang belum ditindaklanjuti / aktif
  const pendingInterventions = interventions.filter(
    (i) => i.status === 'Direncanakan' || i.status === 'Berjalan'
  );

  // 5. Daftar siswa yang membutuhkan pendampingan objektif
  // Mengambil siswa dengan catatan kategori 'Kebutuhan Pendampingan' atau ada pembinaan aktif
  const studentCareNeedsMap = new Map<string, { student: Student; count: number; latestIssue: string }>();

  observations
    .filter((o) => o.category === 'Kebutuhan Pendampingan')
    .forEach((o) => {
      const s = students.find((item) => item.id === o.studentId);
      if (s) {
        const existing = studentCareNeedsMap.get(s.id);
        if (existing) {
          existing.count += 1;
        } else {
          studentCareNeedsMap.set(s.id, {
            student: s,
            count: 1,
            latestIssue: o.observedBehavior,
          });
        }
      }
    });

  const studentsNeedingSupport = Array.from(studentCareNeedsMap.values());

  // 6. Agenda evaluasi berikutnya (dari target pembinaan dan tanggal evaluasi jurnal)
  const upcomingAgendas = [
    ...interventions
      .filter((i) => i.status === 'Berjalan' && i.dueDate)
      .map((i) => ({
        id: i.id,
        title: `Evaluasi Target Pembinaan: ${i.studentName}`,
        date: i.dueDate,
        type: 'Pembinaan' as const,
        detail: i.specificTarget,
      })),
    ...observations
      .filter((o) => o.nextEvaluationDate)
      .slice(0, 4)
      .map((o) => ({
        id: o.id,
        title: `Tindak Lanjut Observasi: ${o.studentName}`,
        date: o.nextEvaluationDate,
        type: 'Jurnal' as const,
        detail: o.followUpPlan || o.indicator,
      })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);

  // 7. Grafik distribusi perkembangan siswa berdasarkan aspek observasi
  const aspectCounts: Record<string, number> = {
    'Akademik': 0,
    'Ibadah': 0,
    'Karakter dan Adab Islami': 0,
    'Kedisiplinan': 0,
    'Kemandirian': 0,
    'Sosial dan Emosional': 0,
    'Minat & Bakat': 0,
    'Prestasi': 0,
  };

  observations.forEach((o) => {
    if (o.aspect === 'Minat, Bakat, dan Potensi') {
      aspectCounts['Minat & Bakat'] = (aspectCounts['Minat & Bakat'] || 0) + 1;
    } else if (aspectCounts[o.aspect] !== undefined) {
      aspectCounts[o.aspect] += 1;
    }
  });

  const maxAspectCount = Math.max(...Object.values(aspectCounts), 1);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-950 rounded-3xl p-6 lg:p-8 text-white shadow-lg border border-emerald-800/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-800/70 text-emerald-200 text-xs font-semibold mb-3 border border-emerald-700/60">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Tahun Ajaran {settings.academicYear} • Semester {settings.semester}</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            Ahlan wa Sahlan, {settings.waliKelasName}
          </h2>
          <p className="text-emerald-200/90 text-xs sm:text-sm mt-2 leading-relaxed">
            Sistem Pemantauan Perkembangan Individu Siswa {settings.className}. Pantau kemajuan adab, ibadah, dan potensi akademik santri secara objektif, berkesinambungan, dan penuh hikmah.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => onOpenNewJournalModal()}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Jurnal Harian</span>
            </button>
            <button
              onClick={() => onNavigateTab('students')}
              className="px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 border border-emerald-700/80 transition-all cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Buka Data 32 Siswa</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Siswa Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{activeStudents.length}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <span>Kapasitas Rombel Kelas</span>
          </p>
        </div>

        {/* Stat 2 */}
        <div
          onClick={() => onNavigateTab('journal')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Catatan Jurnal</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 mt-2">{observations.length}</p>
          <p className="text-[11px] text-blue-600 font-medium mt-1">
            {recentObservations.length} observasi terbaru
          </p>
        </div>

        {/* Stat 3 */}
        <div
          onClick={() => onNavigateTab('weekly_eval')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Evaluasi Belum Selesai</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{pendingEvaluationStudents.length}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Perlu ditinjau pekan ini
          </p>
        </div>

        {/* Stat 4 */}
        <div
          onClick={() => onNavigateTab('interventions')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Target Pembinaan Aktif</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-700 mt-2">{pendingInterventions.length}</p>
          <p className="text-[11px] text-purple-600 font-medium mt-1">
            Sedang dalam pendampingan
          </p>
        </div>
      </div>

      {/* Main Grid: Observation Chart & Priority Care List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Aspect Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Distribusi Observasi Perkembangan Siswa per Aspek
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Frekuensi pencatatan perilaku nyata di kelas dan asrama (Bukan sistem pemeringkatan)
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('journal')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Lihat Jurnal →
            </button>
          </div>

          <div className="mt-5 space-y-3.5">
            {Object.entries(aspectCounts).map(([asp, count]) => {
              const percent = Math.round((count / maxAspectCount) * 100);
              return (
                <div key={asp} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{asp}</span>
                    <span className="font-mono text-slate-500 font-bold">{count} Catatan</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.max(percent, count > 0 ? 8 : 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Total: {observations.length} observasi tervalidasi</span>
            <span className="text-emerald-700 font-medium">
              Objektif • Faktual • Terverifikasi
            </span>
          </div>
        </div>

        {/* Right (1 col): Siswa yang Membutuhkan Pendampingan */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Fokus Pendampingan Santri
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Santri yang memerlukan tindak lanjut suportif
              </p>
            </div>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800">
              {studentsNeedingSupport.length} Santri
            </span>
          </div>

          <div className="mt-4 flex-1 space-y-3 overflow-y-auto max-h-[380px]">
            {studentsNeedingSupport.length > 0 ? (
              studentsNeedingSupport.map(({ student, count, latestIssue }) => (
                <div
                  key={student.id}
                  className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 hover:bg-amber-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{student.fullName}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        NIS: {student.nis} • {student.dormitoryRoom ? student.dormitoryRoom.split('/')[0] : 'Asrama'}
                      </p>
                    </div>
                    <button
                      onClick={() => onSelectStudentProfile(student.id)}
                      className="px-2 py-1 text-[11px] font-semibold text-emerald-800 bg-white rounded-lg border border-slate-200 hover:bg-emerald-50 transition-colors shrink-0 shadow-2xs cursor-pointer"
                    >
                      Profil →
                    </button>
                  </div>
                  <p className="text-[11px] text-amber-900 mt-2 line-clamp-2 bg-white/70 p-2 rounded-xl border border-amber-200/50">
                    "{latestIssue}"
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-amber-700">
                      {count} catatan pendampingan
                    </span>
                    <button
                      onClick={() => onOpenNewJournalModal(student.id)}
                      className="text-emerald-700 hover:underline font-bold"
                    >
                      + Tambah Jurnal
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-400 text-xs">
                Seluruh santri saat ini dalam perkembangan stabil dan belum memerlukan pendampingan khusus.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Agenda Evaluasi Berikutnya & Catatan Jurnal Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agenda Evaluasi Berikutnya */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Agenda Evaluasi & Tindak Lanjut Berikutnya
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Jadwal evaluasi pembinaan dan review berkala wali kelas
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('interventions')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Semua Agenda →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {upcomingAgendas.length > 0 ? (
              upcomingAgendas.map((ag) => (
                <div
                  key={ag.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {ag.type}
                      </span>
                      <p className="text-xs font-bold text-slate-800 truncate">{ag.title}</p>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 line-clamp-1">{ag.detail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-700">{ag.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Belum ada agenda terdekat.</p>
            )}
          </div>
        </div>

        {/* Quick Student Directory Navigation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                Akses Cepat Profil Siswa ({settings.className})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pilih santri untuk membuka riwayat jurnal dan rekap perkembangan
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('students')}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Kelola Roster →
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
            {students.slice(0, 15).map((st) => (
              <button
                key={st.id}
                onClick={() => onSelectStudentProfile(st.id)}
                className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50 hover:border-emerald-300 text-left transition-all text-xs group cursor-pointer"
              >
                <p className="font-bold text-slate-800 group-hover:text-emerald-900 truncate">
                  {st.nickname || st.fullName.split(' ')[0]}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{st.nis}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
