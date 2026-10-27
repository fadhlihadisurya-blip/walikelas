import React from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  BarChart3,
  HeartHandshake,
  Award,
  MessageCircle,
  FileSpreadsheet,
  Settings,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useJPISData } from '../../context/JPISDataContext';

export type ActiveTab =
  | 'dashboard'
  | 'students'
  | 'journal'
  | 'weekly_eval'
  | 'monthly_eval'
  | 'interventions'
  | 'strengths'
  | 'parent_contact'
  | 'semester_report'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { userProfile } = useAuth();
  const { settings, interventions } = useJPISData();

  // Active interventions counter
  const pendingInterventions = interventions.filter(
    (i) => i.status === 'Direncanakan' || i.status === 'Berjalan'
  ).length;

  const menuItems: { id: ActiveTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Data Siswa', icon: Users },
    { id: 'journal', label: 'Jurnal Harian', icon: BookOpen },
    { id: 'weekly_eval', label: 'Evaluasi Mingguan', icon: CalendarCheck },
    { id: 'monthly_eval', label: 'Evaluasi Bulanan', icon: BarChart3 },
    {
      id: 'interventions',
      label: 'Pembinaan Siswa',
      icon: HeartHandshake,
      badge: pendingInterventions > 0 ? pendingInterventions : undefined,
    },
    { id: 'strengths', label: 'Potensi & Prestasi', icon: Award },
    { id: 'parent_contact', label: 'Komunikasi Ortu', icon: MessageCircle },
    { id: 'semester_report', label: 'Laporan Semester', icon: FileSpreadsheet },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-emerald-950 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } border-r border-emerald-900/60 shadow-xl no-print`}
      >
        {/* Branding Header */}
        <div className="p-5 border-b border-emerald-900/80 bg-linear-to-b from-emerald-900/50 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-linear-to-br from-amber-400 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-lg text-white">JPIS</span>
                <span className="text-[10px] font-semibold bg-emerald-800/80 text-emerald-200 px-1.5 py-0.5 rounded-sm border border-emerald-700/50">
                  SMA IBS
                </span>
              </div>
              <p className="text-xs text-emerald-300/80 truncate max-w-[170px]" title={settings.schoolName}>
                {settings.schoolName}
              </p>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-emerald-900/60 flex items-center justify-between text-xs text-emerald-200/90">
            <span className="font-medium text-amber-300">{settings.className}</span>
            <span className="text-[11px] text-emerald-400/80 font-mono">
              Sem {settings.semester} • {settings.academicYear}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-emerald-400/70 uppercase">
            Menu Utama
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50 font-semibold'
                    : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-emerald-400/90'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="ml-2 px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500 text-emerald-950">
                    {item.badge}
                  </span>
                )}
                {isActive && !item.badge && (
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Role Card */}
        <div className="p-4 border-t border-emerald-900/80 bg-emerald-950/90">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-emerald-800 text-emerald-200 flex items-center justify-center font-bold text-sm border border-emerald-700">
              {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {userProfile?.displayName || settings.waliKelasName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] text-emerald-300 capitalize font-medium">
                  {userProfile?.role === 'admin'
                    ? 'Super Admin'
                    : userProfile?.role === 'pembina_asrama'
                    ? 'Pembina Asrama'
                    : 'Wali Kelas'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
