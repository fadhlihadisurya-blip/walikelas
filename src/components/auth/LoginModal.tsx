import React, { useState } from 'react';
import { X, GraduationCap, ShieldCheck, UserCheck, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginDemo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk dengan Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await loginDemo(role);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-linear-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-emerald-300 hover:text-white rounded-xl hover:bg-emerald-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-emerald-700/80 border border-emerald-500/30 flex items-center justify-center text-amber-300 shadow-lg mb-3">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Masuk ke JPIS
          </h2>
          <p className="text-xs text-emerald-200/90 mt-1">
            Jurnal Perkembangan Individu Siswa Islamic Boarding School
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Primary: Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm flex items-center justify-center space-x-3 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Masuk dengan Akun Google</span>
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-3 text-slate-400 font-semibold">
                Atau Mode Akses Instan (Pratinjau)
              </span>
            </div>
          </div>

          {/* Quick Demo Access Roles */}
          <div className="space-y-2">
            <button
              onClick={() => handleDemoLogin('wali_kelas')}
              disabled={loading}
              className="w-full p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <UserCheck className="w-5 h-5 text-emerald-700" />
                <div>
                  <p className="text-xs font-bold">Masuk sebagai Wali Kelas</p>
                  <p className="text-[11px] text-emerald-700/80">
                    Akses penuh jurnal, evaluasi 32 santri, dan laporan
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700">Pilih →</span>
            </button>

            <button
              onClick={() => handleDemoLogin('pembina_asrama')}
              disabled={loading}
              className="w-full p-3 rounded-xl border border-teal-200 bg-teal-50/70 hover:bg-teal-100/80 text-teal-900 text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
                <div>
                  <p className="text-xs font-bold">Masuk sebagai Pembina Asrama</p>
                  <p className="text-[11px] text-teal-700/80">
                    Fokus pemantauan adab malam, ibadah, & kedisiplinan
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-teal-700">Pilih →</span>
            </button>

            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="text-xs font-bold">Masuk sebagai Super Admin</p>
                  <p className="text-[11px] text-slate-500">
                    Hak kelola sistem, audit logs, dan konfigurasi sekolah
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-600">Pilih →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
