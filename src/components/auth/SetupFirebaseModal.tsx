import React, { useState } from 'react';
import { X, Database, CheckCircle, Copy, ExternalLink, ShieldCheck, Terminal, AlertTriangle } from 'lucide-react';
import { useJPISData } from '../../context/JPISDataContext';

interface SetupFirebaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupFirebaseModal: React.FC<SetupFirebaseModalProps> = ({ isOpen, onClose }) => {
  const { syncStatus, seedSampleClassData } = useJPISData();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSeedData = async () => {
    setSeeding(true);
    setSeedSuccess(false);
    try {
      await seedSampleClassData();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  const envSample = `# Masukkan ke .env.local atau Vercel Environment Variables:
VITE_FIREBASE_API_KEY="AIzaSyAw1iJ5U2UD7GV6-q0zAnJS3Kdoe3r7TB8"
VITE_FIREBASE_AUTH_DOMAIN="walikelas.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="walikelas"
VITE_FIREBASE_STORAGE_BUCKET="walikelas.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="322561210567"
VITE_FIREBASE_APP_ID="1:322561210567:web:cb489142bf6d84c3e4e6e2"
VITE_FIREBASE_FIRESTORE_DATABASE_ID="(default)"

# Opsional untuk Asisten Ringkasan AI
GEMINI_API_KEY="AIzaSy..."`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Status Database & Panduan Setup Vercel
              </h2>
              <p className="text-xs text-slate-300">
                Konektivitas Cloud Firestore dan konfigurasi environment variables
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* Status Box */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              syncStatus === 'synced'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  syncStatus === 'synced' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <div>
                <p className="font-bold text-sm">
                  {syncStatus === 'synced'
                    ? 'Cloud Firestore Aktif & Tersinkronisasi'
                    : 'Penyimpanan Lokal Aktif (Data Tersimpan Aman)'}
                </p>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {syncStatus === 'synced'
                    ? 'Proyek Firebase walikelas telah terhubung dengan Cloud Firestore.'
                    : 'Aplikasi menyimpan perubahan secara persisten di peramban dan siap disinkronkan ke Firebase.'}
                </p>
              </div>
            </div>

            {/* Re-seed button */}
            <button
              onClick={handleSeedData}
              disabled={seeding}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 font-semibold hover:bg-slate-50 transition-colors shrink-0 shadow-2xs"
            >
              {seeding ? 'Mengisi...' : seedSuccess ? '✓ Terisi!' : 'Sinkronkan 32 Siswa'}
            </button>
          </div>

          {/* Vercel Deployment Step by Step */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600" />
              Panduan Deployment ke Vercel
            </h3>
            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-800">1. Hubungkan Repository Git ke Vercel</p>
                <p className="text-slate-600 mt-0.5">
                  Push kode proyek ke GitHub/GitLab, lalu buat proyek baru di dashboard Vercel dengan framework preset <strong>Vite</strong>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-semibold text-slate-800">2. Masukkan Environment Variables di Vercel</p>
                  <button
                    onClick={() => copyToClipboard(envSample, 'env')}
                    className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-[10px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedKey === 'env' ? 'Tersalin!' : 'Salin Contoh'}</span>
                  </button>
                </div>
                <pre className="p-2.5 bg-slate-900 text-emerald-300 rounded-lg font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {envSample}
                </pre>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-800">3. Pastikan Aturan Keamanan Firestore Terpasang</p>
                <p className="text-slate-600 mt-0.5">
                  File <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900 font-mono">firestore.rules</code> telah disediakan di repositori untuk menjaga integritas data dan hak akses wali kelas/admin.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
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
