import React from 'react';
import { X, Printer, ShieldCheck, GraduationCap, CheckCircle, Heart, Calendar } from 'lucide-react';
import { Student, ParentContact, Observation, StrengthRecord, AppSettings } from '../../types';

interface PrintParentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  parentContact?: ParentContact | null;
  positiveObservations: Observation[];
  strengths: StrengthRecord[];
  settings: AppSettings;
}

export const PrintParentReportModal: React.FC<PrintParentReportModalProps> = ({
  isOpen,
  onClose,
  student,
  parentContact,
  positiveObservations,
  strengths,
  settings,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Not Printed) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">
              Pratinjau Lembar Komunikasi & Laporan Wali Santri
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 bg-white text-slate-800 font-sans leading-normal">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
            <h1 className="text-lg font-black tracking-wider uppercase text-slate-900">
              {settings.schoolName}
            </h1>
            <p className="text-xs text-slate-600 font-medium">
              {settings.boardingName} • Program Pendidikan Menengah Atas
            </p>
            <div className="text-[11px] text-slate-500 flex items-center justify-center space-x-4 pt-1">
              <span>Kelas: <strong>{settings.className}</strong></span>
              <span>•</span>
              <span>Tahun Ajaran: <strong>{settings.academicYear}</strong></span>
              <span>•</span>
              <span>Semester: <strong>{settings.semester}</strong></span>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center my-6">
            <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900 inline-block border-b border-slate-400 pb-1">
              Lembar Komunikasi & Laporan Perkembangan Santri
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Dokumen Resmi Konsultasi Bersama Wali Santri
            </p>
          </div>

          {/* Student & Parent Info Box */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl border border-slate-300 bg-slate-50/60 text-xs mb-6">
            <div className="space-y-1">
              <p>
                <span className="text-slate-500 inline-block w-28">Nama Santri:</span>
                <strong className="text-slate-900">{student.fullName}</strong>
              </p>
              <p>
                <span className="text-slate-500 inline-block w-28">NIS:</span>
                <span className="font-mono">{student.nis}</span>
              </p>
              <p>
                <span className="text-slate-500 inline-block w-28">Kamar Asrama:</span>
                <span>{student.dormitoryRoom || '-'}</span>
              </p>
            </div>
            <div className="space-y-1">
              <p>
                <span className="text-slate-500 inline-block w-28">Nama Wali Santri:</span>
                <strong className="text-slate-900">{student.parentName || '-'}</strong>
              </p>
              <p>
                <span className="text-slate-500 inline-block w-28">Wali Kelas:</span>
                <span>{settings.waliKelasName}</span>
              </p>
              <p>
                <span className="text-slate-500 inline-block w-28">Tanggal Catatan:</span>
                <span>{parentContact?.contactDate || new Date().toISOString().slice(0, 10)}</span>
              </p>
            </div>
          </div>

          {/* Section 1: Perkembangan Positif & Keteladanan */}
          <div className="space-y-3 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5 border-b border-emerald-200 pb-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              1. Perkembangan Positif & Kemajuan Terpantau
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {parentContact?.positiveDevelopments ||
                (positiveObservations.length > 0
                  ? positiveObservations.map((o) => o.observedBehavior).join(' ')
                  : 'Santri mengikuti rutinitas ibadah harian dan kegiatan belajar asrama dengan baik dan teratur.')}
            </p>
          </div>

          {/* Section 2: Prestasi & Potensi */}
          {strengths.length > 0 && (
            <div className="space-y-3 mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 border-b border-amber-200 pb-1">
                <GraduationCap className="w-4 h-4 text-amber-600" />
                2. Karya, Bakat, & Prestasi Santri
              </h3>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                {strengths.map((str) => (
                  <li key={str.id}>
                    <strong>{str.title}</strong> ({str.category} - Tingkat {str.level}): {str.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 3: Hal yang Perlu Diperhatikan Bersama */}
          <div className="space-y-3 mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-300 pb-1">
              <Heart className="w-4 h-4 text-rose-500" />
              3. Hal yang Memerlukan Dukungan Bersama di Rumah & Asrama
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              {parentContact?.pointsToNote ||
                'Mendorong penjagaan stamina saat libur, pembatasan gawai mandiri, serta istirahat malam yang teratur.'}
            </p>
          </div>

          {/* Section 4: Kesepakatan Sekolah dan Orang Tua */}
          <div className="space-y-3 mb-8 p-4 rounded-xl border border-slate-300 bg-slate-50/50">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
              4. Kesepakatan Sinergi Sekolah dan Orang Tua
            </h3>
            <p className="text-xs text-slate-800 leading-relaxed">
              {parentContact?.schoolParentAgreement ||
                'Orang tua dan pihak sekolah sepakat menjaga komunikasi berkala setiap pekan untuk memantau kemajuan santri secara sinergis dan berkelanjutan.'}
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs mt-12 pt-6">
            <div>
              <p className="text-slate-500">Mengetahui,</p>
              <p className="font-semibold text-slate-800 mt-0.5">Orang Tua / Wali Santri</p>
              <div className="h-16"></div>
              <p className="font-bold border-b border-slate-400 inline-block px-8 pb-0.5">
                {student.parentName || '...........................................'}
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
      </div>
    </div>
  );
};
