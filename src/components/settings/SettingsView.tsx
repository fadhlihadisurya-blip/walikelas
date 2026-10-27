import React, { useState } from 'react';
import {
  Settings,
  Save,
  Database,
  Terminal,
  ShieldCheck,
  CheckCircle,
  Copy,
  RotateCcw,
  Trash2,
  Download,
  AlertTriangle,
  History,
  Info,
} from 'lucide-react';
import { useJPISData } from '../../context/JPISDataContext';
import { useAuth } from '../../context/AuthContext';
import { SemesterType } from '../../types';

export const SettingsView: React.FC = () => {
  const { settings, updateAppSettings, seedSampleClassData, clearAllData, auditLogs, syncStatus } =
    useJPISData();
  const { userProfile } = useAuth();

  // Form state
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [boardingName, setBoardingName] = useState(settings.boardingName);
  const [waliKelasName, setWaliKelasName] = useState(settings.waliKelasName);
  const [nip, setNip] = useState(settings.nip);
  const [className, setClassName] = useState(settings.className);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [semester, setSemester] = useState<SemesterType>(settings.semester);
  const [headmasterName, setHeadmasterName] = useState(settings.headmasterName);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await updateAppSettings({
        schoolName,
        boardingName,
        waliKelasName,
        nip,
        className,
        academicYear,
        semester,
        headmasterName,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    if (window.confirm('Sinkronkan / isi ulang 32 data siswa percontohan kelas XI-A Ibnu Sina ke database?')) {
      setSeeding(true);
      try {
        await seedSampleClassData();
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 3000);
      } finally {
        setSeeding(false);
      }
    }
  };

  const handleClear = async () => {
    if (
      window.confirm(
        'PERINGATAN: Anda yakin ingin mengosongkan seluruh data siswa, jurnal, dan evaluasi? Tindakan ini tidak dapat dibatalkan.'
      )
    ) {
      await clearAllData();
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const vercelEnvSnippet = `VITE_FIREBASE_API_KEY="AIzaSyAw1iJ5U2UD7GV6-q0zAnJS3Kdoe3r7TB8"
VITE_FIREBASE_AUTH_DOMAIN="walikelas.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="walikelas"
VITE_FIREBASE_STORAGE_BUCKET="walikelas.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="322561210567"
VITE_FIREBASE_APP_ID="1:322561210567:web:cb489142bf6d84c3e4e6e2"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="(default)"
GEMINI_API_KEY="AIzaSy..."`;

  return (
    <div className="space-y-6">
      {/* Settings Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              Identitas Sekolah & Rombel Kelas
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Parameter ini otomatis tercantum pada kop surat, laporan semester, dan lembar komunikasi orang tua.
            </p>
          </div>
          {saveSuccess && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Tersimpan!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 text-xs text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Nama Sekolah / Lembaga
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Nama Kompleks Asrama (Boarding School)
              </label>
              <input
                type="text"
                value={boardingName}
                onChange={(e) => setBoardingName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Nama Wali Kelas
              </label>
              <input
                type="text"
                value={waliKelasName}
                onChange={(e) => setWaliKelasName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                NIP / NIY Wali Kelas
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Nama Rombel / Kelas
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Tahun Ajaran
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as SemesterType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Nama Kepala Sekolah
            </label>
            <input
              type="text"
              value={headmasterName}
              onChange={(e) => setHeadmasterName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 max-w-md"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-2 shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Perbarui Pengaturan'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Deployment & Environment Variables Guide */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-600" />
              Panduan Deployment ke Vercel & Konfigurasi Lingkungan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Variabel lingkungan (Environment Variables) yang digunakan saat hosting aplikasi di platform Vercel.
            </p>
          </div>
          <button
            onClick={() => copyText(vercelEnvSnippet, 'snippet')}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center space-x-1.5 border border-emerald-200 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copiedKey === 'snippet' ? 'Tersalin!' : 'Salin Semua'}</span>
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-700">
          <p>
            Ketika Anda mendeploy repositori ini ke <strong>Vercel</strong>, tambahkan variabel berikut di menu <strong>Project Settings → Environment Variables</strong>:
          </p>
          <pre className="p-3.5 bg-slate-900 text-emerald-300 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed">
            {vercelEnvSnippet}
          </pre>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start space-x-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Keamanan Kredensial:</strong> File <code className="font-bold">firestore.rules</code> sudah terpasang untuk membatasi akses database hanya kepada wali kelas dan super admin. Jangan menyimpan service account private keys di sisi client.
            </span>
          </div>
        </div>
      </div>

      {/* Database Maintenance & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Database Controls */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            Pemeliharaan Database & Sampel Siswa
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Gunakan tombol berikut jika Anda ingin mengisi ulang data 32 siswa kelas XI-A Ibnu Sina beserta contoh jurnal dan pembinaan, atau mengosongkan data untuk tahun ajaran baru.
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="px-4 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs flex items-center space-x-2 border border-emerald-300 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-emerald-700" />
              <span>{seeding ? 'Mengisi...' : seedSuccess ? '✓ Terisi!' : 'Sinkronkan 32 Santri'}</span>
            </button>

            <button
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-xs flex items-center space-x-2 border border-rose-200 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>Kosongkan Seluruh Data</span>
            </button>
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              Audit Log Aktivitas ({auditLogs.length})
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Append-Only</span>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
            {auditLogs.length > 0 ? (
              auditLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="text-emerald-700">{log.action}</span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {log.timestamp ? log.timestamp.split('T')[1]?.slice(0, 5) : ''}
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5 truncate">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Oleh: {log.performedByName}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-center py-4 text-xs">Belum ada aktivitas tercatat.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
