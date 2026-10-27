import React, { useState } from 'react';
import {
  Menu,
  PlusCircle,
  Database,
  CloudCheck,
  CloudOff,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJPISData } from '../../context/JPISDataContext';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileSidebar: () => void;
  onOpenNewJournalModal: () => void;
  onOpenFirebaseModal: () => void;
  onOpenLoginModal: () => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Dashboard Perkembangan',
    subtitle: 'Ringkasan komprehensif perkembangan santri dan prioritas pendampingan',
  },
  students: {
    title: 'Data & Profil Siswa',
    subtitle: 'Direktori lengkap santri, kamar asrama, minat, bakat, dan potensi',
  },
  journal: {
    title: 'Jurnal Harian Siswa',
    subtitle: 'Pencatatan observasi perilaku objektif, adab Islami, dan capaian harian',
  },
  weekly_eval: {
    title: 'Evaluasi Mingguan',
    subtitle: 'Sintesis berkala progres santri dengan bantuan asisten AI & telaah guru',
  },
  monthly_eval: {
    title: 'Evaluasi Bulanan (Rubrik 6 Aspek)',
    subtitle: 'Penilaian terstandar berlandaskan bukti observasi nyata (Skala 1–4 & N/O)',
  },
  interventions: {
    title: 'Modul Pembinaan Siswa',
    subtitle: 'Program pendampingan terarah, target terukur, dan pengingat tenggat',
  },
  strengths: {
    title: 'Potensi & Prestasi Santri',
    subtitle: 'Dokumentasi karya, kepemimpinan, prestasi kompetisi, dan rekomendasi',
  },
  parent_contact: {
    title: 'Komunikasi Orang Tua',
    subtitle: 'Catatan konsultasi wali santri, kesepakatan pembinaan, dan laporan cetak',
  },
  semester_report: {
    title: 'Laporan Semester & Ekspor',
    subtitle: 'Rapor komprehensif individual & rekap kelas siap cetak pertemuan wali santri',
  },
  settings: {
    title: 'Pengaturan Sekolah & Sistem',
    subtitle: 'Konfigurasi identitas kelas, tahun ajaran, dan panduan deployment Vercel',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileSidebar,
  onOpenNewJournalModal,
  onOpenFirebaseModal,
  onOpenLoginModal,
}) => {
  const { currentUser, userProfile, logout, switchRole } = useAuth();
  const { syncStatus, settings } = useJPISData();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentTabInfo = TAB_TITLES[activeTab];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 transition-all no-print">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Titles */}
        <div className="flex items-center space-x-3.5 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-lg lg:text-xl font-bold text-slate-800 tracking-tight truncate">
              {currentTabInfo.title}
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block truncate">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
          {/* Quick Action: New Journal Entry */}
          <button
            onClick={onOpenNewJournalModal}
            className="flex items-center space-x-1.5 px-3 sm:px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm shadow-sm transition-all hover:shadow-md cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Tambah Jurnal</span>
            <span className="sm:hidden">Jurnal</span>
          </button>

          {/* Cloud Firestore Status Badge */}
          <button
            onClick={onOpenFirebaseModal}
            title={`Status Database: ${
              syncStatus === 'synced'
                ? 'Cloud Firestore Terhubung'
                : syncStatus === 'offline'
                ? 'Mode Lokal / Menunggu Koneksi'
                : 'Sinkronisasi'
            }`}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              syncStatus === 'synced'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                : syncStatus === 'syncing'
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden md:inline">
              {syncStatus === 'synced' ? 'Firestore Aktif' : 'Firestore Info'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </button>

          {/* User Profile / Auth Button */}
          <div className="relative">
            {userProfile ? (
              <div>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                    {userProfile.displayName ? userProfile.displayName.charAt(0) : 'U'}
                  </div>
                  <span className="text-xs font-semibold max-w-[110px] truncate hidden lg:inline">
                    {userProfile.displayName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-800 truncate">{userProfile.displayName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{userProfile.email}</p>
                      <span className="mt-1 inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        Peran: {userProfile.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="px-2 py-1.5 border-b border-slate-100">
                      <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                        Simulasi Ganti Peran
                      </p>
                      <button
                        onClick={() => {
                          switchRole('wali_kelas');
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                          userProfile.role === 'wali_kelas'
                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span>Wali Kelas</span>
                        {userProfile.role === 'wali_kelas' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          switchRole('pembina_asrama');
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                          userProfile.role === 'pembina_asrama'
                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span>Pembina Asrama (Musyrif)</span>
                        {userProfile.role === 'pembina_asrama' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          switchRole('admin');
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                          userProfile.role === 'admin'
                            ? 'bg-emerald-50 text-emerald-700 font-semibold'
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span>Administrator Sekolah</span>
                        {userProfile.role === 'admin' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </button>
                    </div>

                    <div className="p-1">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl flex items-center space-x-2 font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar Akun</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold shadow-xs"
              >
                <User className="w-3.5 h-3.5" />
                <span>Masuk</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
