import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Users,
  User,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Calendar,
  Sparkles,
  Award,
  HeartHandshake,
  BookOpen,
} from 'lucide-react';
import { useJPISData } from '../../context/JPISDataContext';
import { Student } from '../../types';

export const SemesterReportView: React.FC = () => {
  const { students, observations, weeklyAssessments, monthlyAssessments, interventions, strengths, parentContacts, settings } =
    useJPISData();

  const [reportType, setReportType] = useState<'individual' | 'class_summary'>('individual');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Student specific data
  const studentObs = observations.filter((o) => o.studentId === selectedStudent?.id);
  const studentWeeklies = weeklyAssessments.filter((w) => w.studentId === selectedStudent?.id);
  const studentMonthlies = monthlyAssessments.filter((m) => m.studentId === selectedStudent?.id);
  const studentInterventions = interventions.filter((i) => i.studentId === selectedStudent?.id);
  const studentStrengths = strengths.filter((s) => s.studentId === selectedStudent?.id);
  const studentContacts = parentContacts.filter((p) => p.studentId === selectedStudent?.id);

  const positiveObs = studentObs.filter(
    (o) => o.category === 'Catatan Positif' || o.category === 'Pencapaian'
  );
  const careObs = studentObs.filter(
    (o) => o.category === 'Kebutuhan Pendampingan' || o.category === 'Kejadian Penting'
  );

  const handlePrint = () => {
    window.print();
  };

  const exportClassSummaryCsv = () => {
    const headers = [
      'NIS',
      'Nama Santri',
      'Kelas',
      'Kamar Asrama',
      'Total Catatan Jurnal',
      'Catatan Positif',
      'Kebutuhan Pendampingan',
      'Program Pembinaan Aktif',
      'Jumlah Prestasi',
      'Kontak Wali Santri',
    ];

    const rows = students.map((st) => {
      const stObs = observations.filter((o) => o.studentId === st.id);
      const pos = stObs.filter((o) => o.category === 'Catatan Positif' || o.category === 'Pencapaian').length;
      const care = stObs.filter((o) => o.category === 'Kebutuhan Pendampingan').length;
      const ints = interventions.filter((i) => i.studentId === st.id && (i.status === 'Berjalan' || i.status === 'Direncanakan')).length;
      const str = strengths.filter((s) => s.studentId === st.id).length;
      const pc = parentContacts.filter((p) => p.studentId === st.id).length;

      return [
        `"${st.nis}"`,
        `"${st.fullName}"`,
        `"${st.className}"`,
        `"${st.dormitoryRoom || ''}"`,
        stObs.length,
        pos,
        care,
        ints,
        str,
        pc,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_Semester_${settings.className.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar (Hidden on print) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4 no-print">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setReportType('individual')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                reportType === 'individual'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Rapor Perkembangan Individual
            </button>
            <button
              onClick={() => setReportType('class_summary')}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                reportType === 'class_summary'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Rekap Perkembangan Kelas ({students.length} Santri)
            </button>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {reportType === 'individual' && (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.nis} - {st.fullName}
                  </option>
                ))}
              </select>
            )}

            {reportType === 'class_summary' && (
              <button
                onClick={exportClassSummaryCsv}
                className="px-3.5 py-2 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh Rekap CSV</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Cetak PDF</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-3">
          <span>
            {reportType === 'individual'
              ? `Menampilkan Rapor Individual: ${selectedStudent?.fullName}`
              : `Menampilkan Rekap Kelas: ${settings.className}`}
          </span>
          <span className="text-emerald-700 font-medium">
            Format Resmi Pertemuan Wali Santri Semester {settings.semester}
          </span>
        </div>
      </div>

      {/* Printable Report Container */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xs space-y-6">
        {/* Letterhead */}
        <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
          <h2 className="text-lg font-black tracking-wider uppercase text-slate-900">
            {settings.schoolName}
          </h2>
          <p className="text-xs text-slate-600 font-medium">
            {settings.boardingName} • Program Pengembangan Karakter & Asrama
          </p>
          <div className="text-[11px] text-slate-500 flex items-center justify-center space-x-4 pt-1">
            <span>Kelas: <strong>{settings.className}</strong></span>
            <span>•</span>
            <span>Tahun Ajaran: <strong>{settings.academicYear}</strong></span>
            <span>•</span>
            <span>Semester: <strong>{settings.semester}</strong></span>
          </div>
        </div>

        {reportType === 'individual' && selectedStudent ? (
          /* Individual Student Semester Report */
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-base font-extrabold uppercase tracking-wide text-slate-900 inline-block border-b border-slate-400 pb-1">
                Laporan Perkembangan Individu Siswa (JPIS)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Rekapitulasi Perkembangan Adab, Ibadah, Kemandirian, dan Potensi
              </p>
            </div>

            {/* Identitas Santri Box */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-slate-300 bg-slate-50/60 text-xs">
              <div className="space-y-1">
                <p>
                  <span className="text-slate-500 inline-block w-28">Nama Santri:</span>
                  <strong className="text-slate-900 text-sm">{selectedStudent.fullName}</strong>
                </p>
                <p>
                  <span className="text-slate-500 inline-block w-28">NIS:</span>
                  <span className="font-mono">{selectedStudent.nis}</span>
                </p>
                <p>
                  <span className="text-slate-500 inline-block w-28">Kamar Asrama:</span>
                  <span>{selectedStudent.dormitoryRoom || '-'}</span>
                </p>
              </div>
              <div className="space-y-1">
                <p>
                  <span className="text-slate-500 inline-block w-28">Wali Kelas:</span>
                  <strong className="text-slate-900">{settings.waliKelasName}</strong>
                </p>
                <p>
                  <span className="text-slate-500 inline-block w-28">Nama Orang Tua:</span>
                  <span>{selectedStudent.parentName || '-'}</span>
                </p>
                <p>
                  <span className="text-slate-500 inline-block w-28">Status:</span>
                  <span className="capitalize">{selectedStudent.status}</span>
                </p>
              </div>
            </div>

            {/* Section 1: Perkembangan Positif & Indikator Berkembang */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 border-b border-emerald-200 pb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                1. Perkembangan Positif & Indikator yang Berkembang Baik
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {positiveObs.length > 0 ? (
                  positiveObs.map((o) => `• [${o.aspect}] ${o.observedBehavior}`).join(' ')
                ) : (
                  'Santri senantiasa menunjukkan ketaatan terhadap norma asrama dan keikutsertaan stabil dalam kegiatan harian.'
                )}
              </p>
            </div>

            {/* Section 2: Aspek yang Perlu Diperhatikan & Bukti Observasi */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 border-b border-amber-200 pb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                2. Aspek yang Memerlukan Perhatian & Pendampingan Bersama
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                {careObs.length > 0 ? (
                  careObs.map((o) => `• [${o.aspect}] ${o.observedBehavior} (Bukti: ${o.evidenceOrSource || 'Pengamatan guru'})`).join(' ')
                ) : (
                  'Tidak ditemukan hambatan kedisiplinan yang signifikan selama periode semester ini.'
                )}
              </p>
            </div>

            {/* Section 3: Riwayat Pembinaan & Tindak Lanjut */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5 border-b border-purple-200 pb-1">
                <HeartHandshake className="w-4 h-4 text-purple-600" />
                3. Program Pembinaan yang Dilakukan & Hasil Tindak Lanjut
              </h4>
              {studentInterventions.length > 0 ? (
                <div className="space-y-2 text-xs">
                  {studentInterventions.map((int) => (
                    <div key={int.id} className="p-3 bg-purple-50/50 rounded-xl border border-purple-200 text-slate-700">
                      <p><strong>Target Spesifik:</strong> {int.specificTarget} ({int.status})</p>
                      <p className="mt-1"><strong>Strategi:</strong> {int.coachingStrategy}</p>
                      <p className="mt-1 text-emerald-800"><strong>Hasil Evaluasi:</strong> {int.evaluationResult || 'Dalam proses'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600 italic">
                  Belum ada intervensi pembinaan khusus yang dijadwalkan; santri berkembang sesuai tahap kemandirian.
                </p>
              )}
            </div>

            {/* Section 4: Karya, Bakat, & Rekomendasi Kegiatan */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 border-b border-amber-200 pb-1">
                <Award className="w-4 h-4 text-amber-600" />
                4. Potensi, Minat, Prestasi & Rekomendasi Pengembangan
              </h4>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <p><strong>Minat & Bakat:</strong> {selectedStudent.interestsAndTalents || '-'}</p>
                <p><strong>Potensi Akademik:</strong> {selectedStudent.academicPotential || '-'}</p>
                <p><strong>Potensi Non-Akademik:</strong> {selectedStudent.nonAcademicPotential || '-'}</p>
                {studentStrengths.length > 0 && (
                  <p className="pt-1 text-emerald-800">
                    <strong>Prestasi Tercatat:</strong> {studentStrengths.map((s) => `${s.title} (${s.category})`).join(', ')}
                  </p>
                )}
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 text-center text-xs mt-12 pt-6">
              <div>
                <p className="text-slate-500">Mengetahui,</p>
                <p className="font-semibold text-slate-800 mt-0.5">Kepala Sekolah</p>
                <div className="h-16"></div>
                <p className="font-bold border-b border-slate-400 inline-block px-8 pb-0.5">
                  {settings.headmasterName}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Wali Kelas,</p>
                <p className="font-semibold text-slate-800 mt-0.5">{settings.className}</p>
                <div className="h-16"></div>
                <p className="font-bold border-b border-slate-400 inline-block px-8 pb-0.5">
                  {settings.waliKelasName}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">NIP: {settings.nip}</p>
              </div>
            </div>
          </div>
        ) : (
          /* Class Summary Table */
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-base font-extrabold uppercase tracking-wide text-slate-900 inline-block border-b border-slate-400 pb-1">
                Rekapitulasi Perkembangan Seluruh Santri ({settings.className})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Pemantauan Objektif Tanpa Pemeringkatan Ibadah atau Karakter
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-700 font-bold text-[11px] border-b border-slate-300">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center w-10">No</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">NIS & Nama Santri</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Kamar Asrama</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">Catatan Jurnal</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">Perkembangan Positif</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">Pendampingan</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">Pembinaan Aktif</th>
                    <th className="py-2.5 px-3 text-center">Prestasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {students.map((st, idx) => {
                    const stObs = observations.filter((o) => o.studentId === st.id);
                    const posCount = stObs.filter((o) => o.category === 'Catatan Positif' || o.category === 'Pencapaian').length;
                    const careCount = stObs.filter((o) => o.category === 'Kebutuhan Pendampingan').length;
                    const intCount = interventions.filter((i) => i.studentId === st.id && (i.status === 'Berjalan' || i.status === 'Direncanakan')).length;
                    const strCount = strengths.filter((s) => s.studentId === st.id).length;

                    return (
                      <tr key={st.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono">{idx + 1}</td>
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <strong className="text-slate-900 block">{st.fullName}</strong>
                          <span className="font-mono text-[10px] text-slate-400">NIS: {st.nis}</span>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-slate-600 text-[11px]">
                          {st.dormitoryRoom ? st.dormitoryRoom.split('/')[0] : '-'}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-mono font-bold">
                          {stObs.length}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center text-emerald-700 font-bold">
                          {posCount}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center text-amber-700 font-bold">
                          {careCount}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200 text-center font-bold text-purple-700">
                          {intCount}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                          {strCount}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-8 text-center text-xs mt-12 pt-6">
              <div>
                <p className="text-slate-500">Mengetahui,</p>
                <p className="font-semibold text-slate-800 mt-0.5">Kepala Sekolah</p>
                <div className="h-16"></div>
                <p className="font-bold border-b border-slate-400 inline-block px-8 pb-0.5">
                  {settings.headmasterName}
                </p>
              </div>

              <div>
                <p className="text-slate-500">Wali Kelas,</p>
                <p className="font-semibold text-slate-800 mt-0.5">{settings.className}</p>
                <div className="h-16"></div>
                <p className="font-bold border-b border-slate-400 inline-block px-8 pb-0.5">
                  {settings.waliKelasName}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">NIP: {settings.nip}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
