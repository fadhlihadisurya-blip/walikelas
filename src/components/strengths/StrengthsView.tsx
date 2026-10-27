import React, { useState } from 'react';
import {
  Award,
  Search,
  Filter,
  PlusCircle,
  Sparkles,
  Edit,
  Trash2,
  CheckCircle,
  BookOpen,
  X,
  AlertCircle,
} from 'lucide-react';
import { useJPISData } from '../../context/JPISDataContext';
import { useAuth } from '../../context/AuthContext';
import { StrengthRecord, StrengthCategory } from '../../types';

const CATEGORIES: StrengthCategory[] = [
  'Minat & Bakat',
  'Karya',
  'Prestasi',
  'Kreativitas',
  'Kepemimpinan',
  'Kemampuan Khusus',
  'Bidang Pengembangan',
];

export const StrengthsView: React.FC = () => {
  const { strengths, students, addStrength, updateStrength, deleteStrength } = useJPISData();
  const { userProfile } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('semua');
  const [studentFilter, setStudentFilter] = useState<string>('semua');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StrengthRecord | null>(null);

  // Form State
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<StrengthCategory>('Prestasi');
  const [level, setLevel] = useState('Sekolah');
  const [year, setYear] = useState('2026');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState('');
  const [recommendedDevelopment, setRecommendedDevelopment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const openFormModal = (item?: StrengthRecord) => {
    if (item) {
      setEditingItem(item);
      setStudentId(item.studentId);
      setTitle(item.title);
      setCategory(item.category);
      setLevel(item.level || 'Sekolah');
      setYear(item.year || '2026');
      setDescription(item.description);
      setEvidence(item.evidence || '');
      setRecommendedDevelopment(item.recommendedDevelopment || '');
    } else {
      setEditingItem(null);
      setStudentId(students[0]?.id || '');
      setTitle('');
      setCategory('Prestasi');
      setLevel('Sekolah');
      setYear('2026');
      setDescription('');
      setEvidence('');
      setRecommendedDevelopment('');
    }
    setFormError('');
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!studentId || !title.trim()) {
      setFormError('Pilih santri dan isi judul capaian/prestasi.');
      return;
    }

    const selStudent = students.find((s) => s.id === studentId);
    setSubmitting(true);

    try {
      if (editingItem) {
        await updateStrength(editingItem.id, {
          studentId,
          studentName: selStudent ? selStudent.fullName : editingItem.studentName,
          title,
          category,
          level,
          year,
          description,
          evidence,
          recommendedDevelopment,
        });
      } else {
        await addStrength({
          studentId,
          studentName: selStudent ? selStudent.fullName : 'Siswa',
          title,
          category,
          level,
          year,
          description,
          evidence,
          recommendedDevelopment,
          recorderId: userProfile?.id || 'wali_kelas',
        });
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan data prestasi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, titleStr: string) => {
    if (window.confirm(`Hapus catatan potensi/prestasi "${titleStr}"?`)) {
      await deleteStrength(id);
    }
  };

  const filtered = strengths.filter((item) => {
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.studentName && item.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory = categoryFilter === 'semua' || item.category === categoryFilter;
    const matchStudent = studentFilter === 'semua' || item.studentId === studentFilter;

    return matchSearch && matchCategory && matchStudent;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari karya, prestasi, kepemimpinan, atau nama santri..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-amber-500 text-xs text-slate-800"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium"
            >
              <option value="semua">Semua Kategori ({strengths.length})</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Student Filter */}
            <select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              className="px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium"
            >
              <option value="semua">Semua Santri</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName}
                </option>
              ))}
            </select>

            <button
              onClick={() => openFormModal()}
              className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-emerald-950 text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Prestasi</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span>
            Total: <strong>{filtered.length}</strong> catatan potensi & prestasi
          </span>
          <span className="font-semibold text-amber-700">
            Fokus: Dokumentasi Bukti Nyata & Rekomendasi Kegiatan
          </span>
        </div>
      </div>

      {/* Grid of Strengths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0">
                      <Award className="w-4 h-4 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{item.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Santri: <strong>{item.studentName}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                    {item.category}
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-xs text-slate-600">
                  <p className="leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {item.description}
                  </p>
                  {item.evidence && (
                    <p className="text-[11px] text-slate-500">
                      <strong>Bukti/Sertifikat:</strong> {item.evidence}
                    </p>
                  )}
                  {item.recommendedDevelopment && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-900 text-[11px]">
                      <strong>Rekomendasi Pengembangan:</strong>
                      <p className="mt-0.5">{item.recommendedDevelopment}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  Tingkat {item.level || 'Sekolah'} • Tahun {item.year || '2026'}
                </span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => openFormModal(item)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                    title="Ubah"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                    title="Hapus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
            <Award className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">
              Belum ada rekaman karya atau prestasi yang sesuai
            </p>
            <p className="text-xs">Klik "Catat Prestasi" untuk mendata pencapaian santri.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingItem ? 'Ubah Catatan Potensi & Prestasi' : 'Catat Potensi & Prestasi Santri'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Pilih Santri <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500"
                    required
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.nis} - {st.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as StrengthCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-amber-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Judul Karya / Prestasi / Kepemimpinan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Juara 1 Lomba Kaligrafi Khat Tsuluts Tingkat Wilayah"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Tingkat</label>
                  <input
                    type="text"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    placeholder="Sekolah / Kabupaten / Provinsi / Nasional"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Tahun</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Deskripsi Karya / Pencapaian
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Ceritakan proses pembuatan karya atau pencapaian..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Bukti / Sumber Bukti
                </label>
                <input
                  type="text"
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  placeholder="Contoh: Piagam No. 12/FSI/2026 atau kanvas fisik di galeri"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Rekomendasi Kegiatan Pengembangan
                </label>
                <textarea
                  value={recommendedDevelopment}
                  onChange={(e) => setRecommendedDevelopment(e.target.value)}
                  rows={2}
                  placeholder="Rekomendasi tindak lanjut bagi sekolah dan orang tua..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-emerald-950 font-bold transition-all shadow-xs cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
