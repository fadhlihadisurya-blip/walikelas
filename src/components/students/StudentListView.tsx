import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  PlusCircle,
  Eye,
  Edit,
  Download,
  Home,
  CheckCircle,
  Phone,
  LayoutGrid,
  List,
} from 'lucide-react';
import { useJPISData } from '../../context/JPISDataContext';
import { Student } from '../../types';
import { StudentFormModal } from './StudentFormModal';
import { StudentProfileModal } from './StudentProfileModal';

interface StudentListViewProps {
  onOpenNewJournal: (studentId: string) => void;
  selectedStudentId?: string | null;
  onClearSelectedStudent?: () => void;
}

export const StudentListView: React.FC<StudentListViewProps> = ({
  onOpenNewJournal,
  selectedStudentId,
  onClearSelectedStudent,
}) => {
  const { students, updateStudent, settings } = useJPISData();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('semua');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // If a student was requested via props (e.g. from Dashboard click)
  React.useEffect(() => {
    if (selectedStudentId) {
      const found = students.find((s) => s.id === selectedStudentId);
      if (found) {
        setViewingStudent(found);
        setProfileModalOpen(true);
      }
    }
  }, [selectedStudentId, students]);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nickname && s.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.dormitoryRoom && s.dormitoryRoom.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = statusFilter === 'semua' ? true : s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const exportStudentsToCsv = () => {
    const headers = [
      'NIS',
      'Nama Lengkap',
      'Panggilan',
      'Gender',
      'Kelas',
      'Status',
      'Kamar Asrama',
      'Minat & Bakat',
      'Potensi Akademik',
      'Potensi Non-Akademik',
      'Nama Wali',
      'No Telepon Wali',
    ];
    const rows = filteredStudents.map((s) => [
      `"${s.nis}"`,
      `"${s.fullName}"`,
      `"${s.nickname || ''}"`,
      `"${s.gender}"`,
      `"${s.className}"`,
      `"${s.status}"`,
      `"${s.dormitoryRoom || ''}"`,
      `"${(s.interestsAndTalents || '').replace(/"/g, '""')}"`,
      `"${(s.academicPotential || '').replace(/"/g, '""')}"`,
      `"${(s.nonAcademicPotential || '').replace(/"/g, '""')}"`,
      `"${s.parentName || ''}"`,
      `"${s.parentPhone || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Siswa_${settings.className.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari santri berdasarkan nama, NIS, panggilan, atau kamar asrama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs text-slate-800 transition-all"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Status Filter */}
            <div className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-hidden"
              >
                <option value="semua">Semua Status ({students.length})</option>
                <option value="aktif">Aktif ({students.filter((s) => s.status === 'aktif').length})</option>
                <option value="nonaktif">Nonaktif</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl transition-colors ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-emerald-800' : 'text-slate-500'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-xl transition-colors ${
                  viewMode === 'cards' ? 'bg-white shadow-2xs text-emerald-800' : 'text-slate-500'
                }`}
                title="Tampilan Kartu"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Export CSV */}
            <button
              onClick={exportStudentsToCsv}
              className="px-3 py-2 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Unduh Data CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden md:inline">Ekspor CSV</span>
            </button>

            {/* Add Student */}
            <button
              onClick={() => {
                setEditingStudent(null);
                setFormModalOpen(true);
              }}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Siswa</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span>
            Menampilkan <strong>{filteredStudents.length}</strong> dari {students.length} santri ({settings.className})
          </span>
          <span className="font-medium text-emerald-700">
            Islamic Boarding School Academic Year {settings.academicYear}
          </span>
        </div>
      </div>

      {/* Main Table View */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-600 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">NIS & Identitas</th>
                  <th className="py-3.5 px-4">Kamar Asrama</th>
                  <th className="py-3.5 px-4">Minat & Bakat</th>
                  <th className="py-3.5 px-4">Potensi Utama</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((st, idx) => (
                    <tr
                      key={st.id}
                      className="hover:bg-emerald-50/40 transition-colors group"
                    >
                      <td className="py-3 px-4 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {st.nickname ? st.nickname.charAt(0) : st.fullName.charAt(0)}
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                setViewingStudent(st);
                                setProfileModalOpen(true);
                              }}
                              className="font-bold text-slate-800 hover:text-emerald-700 text-left transition-colors cursor-pointer"
                            >
                              {st.fullName}
                            </button>
                            <p className="text-[11px] text-slate-400 font-mono">
                              NIS: {st.nis} {st.nickname ? `• "${st.nickname}"` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center space-x-1.5 text-[11px]">
                          <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]" title={st.dormitoryRoom}>
                            {st.dormitoryRoom || 'Asrama'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[200px]">
                        <p className="truncate" title={st.interestsAndTalents}>
                          {st.interestsAndTalents || '-'}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-[200px]">
                        <p className="truncate text-emerald-800 font-medium" title={st.academicPotential}>
                          {st.academicPotential || st.nonAcademicPotential || '-'}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            st.status === 'aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setViewingStudent(st);
                              setProfileModalOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs flex items-center space-x-1 transition-colors cursor-pointer"
                            title="Buka Profil Lengkap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Profil</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingStudent(st);
                              setFormModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                            title="Ubah Data"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Tidak ditemukan data santri yang cocok dengan pencarian.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((st) => (
            <div
              key={st.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-extrabold text-sm">
                      {st.nickname ? st.nickname.charAt(0) : st.fullName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{st.fullName}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">NIS: {st.nis}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      st.status === 'aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {st.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-2 text-[11px]">
                    <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{st.dormitoryRoom || 'Kamar Asrama'}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px]">
                    <span className="font-semibold text-slate-700">Minat & Potensi:</span>
                    <p className="text-slate-600 line-clamp-2 mt-0.5">
                      {st.interestsAndTalents || st.academicPotential || 'Belum diisi'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onOpenNewJournal(st.id)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  + Catat Jurnal
                </button>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => {
                      setEditingStudent(st);
                      setFormModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setViewingStudent(st);
                      setProfileModalOpen(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors"
                  >
                    Profil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <StudentFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setEditingStudent(null);
        }}
        initialStudent={editingStudent}
      />

      <StudentProfileModal
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setViewingStudent(null);
          if (onClearSelectedStudent) onClearSelectedStudent();
        }}
        student={viewingStudent}
        onOpenNewJournal={onOpenNewJournal}
        onEditStudent={(st) => {
          setProfileModalOpen(false);
          setEditingStudent(st);
          setFormModalOpen(true);
        }}
      />
    </div>
  );
};
