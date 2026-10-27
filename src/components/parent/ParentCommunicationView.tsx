import React, { useState } from 'react';
import {
  MessageCircle,
  Search,
  Filter,
  PlusCircle,
  Printer,
  Calendar,
  CheckCircle,
  Phone,
  Edit,
  Trash2,
  X,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useJPISData } from '../../context/JPISDataContext';
import { useAuth } from '../../context/AuthContext';
import { ParentContact, ContactMedia, ParentFollowUpStatus } from '../../types';
import { PrintParentReportModal } from './PrintParentReportModal';

const MEDIA_OPTIONS: ContactMedia[] = [
  'Tatap Muka',
  'WhatsApp',
  'Telepon',
  'Zoom/Meet',
  'Surat Resmi',
];

const STATUS_OPTIONS: ParentFollowUpStatus[] = [
  'Menunggu Tindak Lanjut',
  'Dalam Proses',
  'Selesai',
  'Perlu Pertemuan Lanjutan',
];

export const ParentCommunicationView: React.FC = () => {
  const { parentContacts, students, observations, strengths, addParentContact, updateParentContact, deleteParentContact, settings } =
    useJPISData();
  const { userProfile } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [studentFilter, setStudentFilter] = useState('semua');
  const [statusFilter, setStatusFilter] = useState('semua');

  // Modal State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ParentContact | null>(null);

  // Print Report Modal State
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [printStudentId, setPrintStudentId] = useState<string>(students[0]?.id || '');
  const [activePrintContact, setActivePrintContact] = useState<ParentContact | null>(null);

  // Form Fields
  const [studentId, setStudentId] = useState(students[0]?.id || '');
  const [contactDate, setContactDate] = useState(new Date().toISOString().slice(0, 10));
  const [media, setMedia] = useState<ContactMedia>('WhatsApp');
  const [mainDiscussion, setMainDiscussion] = useState('');
  const [positiveDevelopments, setPositiveDevelopments] = useState('');
  const [pointsToNote, setPointsToNote] = useState('');
  const [schoolParentAgreement, setSchoolParentAgreement] = useState('');
  const [personInCharge, setPersonInCharge] = useState(
    `${userProfile?.displayName || settings.waliKelasName} (Wali Kelas)`
  );
  const [evaluationSchedule, setEvaluationSchedule] = useState('');
  const [followUpStatus, setFollowUpStatus] = useState<ParentFollowUpStatus>('Dalam Proses');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const openFormModal = (item?: ParentContact) => {
    if (item) {
      setEditingContact(item);
      setStudentId(item.studentId);
      setContactDate(item.contactDate);
      setMedia(item.media);
      setMainDiscussion(item.mainDiscussion);
      setPositiveDevelopments(item.positiveDevelopments || '');
      setPointsToNote(item.pointsToNote || '');
      setSchoolParentAgreement(item.schoolParentAgreement || '');
      setPersonInCharge(item.personInCharge);
      setEvaluationSchedule(item.evaluationSchedule || '');
      setFollowUpStatus(item.followUpStatus);
    } else {
      setEditingContact(null);
      setStudentId(students[0]?.id || '');
      setContactDate(new Date().toISOString().slice(0, 10));
      setMedia('WhatsApp');
      setMainDiscussion('');
      setPositiveDevelopments('');
      setPointsToNote('');
      setSchoolParentAgreement('');
      setPersonInCharge(`${userProfile?.displayName || settings.waliKelasName} (Wali Kelas)`);
      setEvaluationSchedule('');
      setFollowUpStatus('Dalam Proses');
    }
    setFormError('');
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!studentId || !mainDiscussion.trim()) {
      setFormError('Pilih santri dan isi pokok pembahasan komunikasi.');
      return;
    }

    const selStudent = students.find((s) => s.id === studentId);
    setSubmitting(true);

    try {
      if (editingContact) {
        await updateParentContact(editingContact.id, {
          studentId,
          studentName: selStudent ? selStudent.fullName : editingContact.studentName,
          contactDate,
          media,
          mainDiscussion,
          positiveDevelopments,
          pointsToNote,
          schoolParentAgreement,
          personInCharge,
          evaluationSchedule,
          followUpStatus,
        });
      } else {
        await addParentContact({
          studentId,
          studentName: selStudent ? selStudent.fullName : 'Siswa',
          contactDate,
          media,
          mainDiscussion,
          positiveDevelopments,
          pointsToNote,
          schoolParentAgreement,
          personInCharge,
          evaluationSchedule,
          followUpStatus,
          approvedByWaliKelas: true,
          waliKelasId: userProfile?.id || 'wali_kelas',
        });
      }
      setFormModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Gagal menyimpan catatan komunikasi orang tua.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Hapus catatan komunikasi orang tua untuk ${name}?`)) {
      await deleteParentContact(id);
    }
  };

  const handleOpenPrintReport = (contact?: ParentContact) => {
    if (contact) {
      setPrintStudentId(contact.studentId);
      setActivePrintContact(contact);
    } else {
      setPrintStudentId(students[0]?.id || '');
      setActivePrintContact(null);
    }
    setPrintModalOpen(true);
  };

  const filtered = parentContacts.filter((item) => {
    const matchSearch =
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.mainDiscussion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.schoolParentAgreement &&
        item.schoolParentAgreement.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStudent = studentFilter === 'semua' || item.studentId === studentFilter;
    const matchStatus = statusFilter === 'semua' || item.followUpStatus === statusFilter;

    return matchSearch && matchStudent && matchStatus;
  });

  const selectedPrintStudent = students.find((s) => s.id === printStudentId) || students[0];

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari catatan komunikasi, kesepakatan, atau nama santri..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-xs text-slate-800"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0">
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

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-medium"
            >
              <option value="semua">Semua Status</option>
              {STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleOpenPrintReport()}
              className="px-3.5 py-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Cetak Laporan Ortu</span>
            </button>

            <button
              onClick={() => openFormModal()}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Komunikasi</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
          <span>
            Total: <strong>{filtered.length}</strong> catatan komunikasi orang tua
          </span>
          <span className="font-semibold text-emerald-800">
            Kerahasiaan Terjaga • Sinergi Sekolah & Keluarga
          </span>
        </div>
      </div>

      {/* Communications List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs hover:shadow-md transition-all space-y-3"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-xs shrink-0">
                    <MessageCircle className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.studentName}</h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      Tanggal: {item.contactDate} • Media: <strong>{item.media}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                      item.followUpStatus === 'Selesai'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : item.followUpStatus === 'Dalam Proses'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}
                  >
                    {item.followUpStatus}
                  </span>
                </div>
              </div>

              {/* Main discussion */}
              <div className="space-y-2.5 text-xs text-slate-700">
                <div>
                  <strong className="text-slate-800 block text-xs">Pokok Pembahasan:</strong>
                  <p className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mt-1 leading-relaxed">
                    {item.mainDiscussion}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                    <strong className="text-emerald-900 block uppercase text-[10px]">Perkembangan Positif:</strong>
                    <p className="text-emerald-800 mt-1">{item.positiveDevelopments || '-'}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                    <strong className="text-amber-900 block uppercase text-[10px]">Hal yang Perlu Diperhatikan:</strong>
                    <p className="text-amber-800 mt-1">{item.pointsToNote || '-'}</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="text-slate-800 block text-[10px] uppercase">Kesepakatan Sekolah dan Orang Tua:</strong>
                  <p className="text-slate-800 mt-1 font-medium">{item.schoolParentAgreement || '-'}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                  <p><strong>Penanggung Jawab:</strong> {item.personInCharge}</p>
                  <p><strong>Jadwal Evaluasi:</strong> {item.evaluationSchedule || '-'}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleOpenPrintReport(item)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Laporan Pertemuan</span>
                </button>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => openFormModal(item)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800"
                    title="Ubah"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.studentName)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 space-y-2">
            <MessageCircle className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">
              Belum ada riwayat komunikasi orang tua yang sesuai
            </p>
            <p className="text-xs">Klik "Catat Komunikasi" untuk mendokumentasikan koordinasi dengan wali santri.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs no-print">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden p-6 space-y-4 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingContact ? 'Ubah Catatan Komunikasi Ortu' : 'Catat Komunikasi dengan Orang Tua'}
              </h3>
              <button
                onClick={() => setFormModalOpen(false)}
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold focus:ring-2 focus:ring-emerald-500"
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
                    Tanggal Komunikasi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={contactDate}
                    onChange={(e) => setContactDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Media Komunikasi</label>
                  <select
                    value={media}
                    onChange={(e) => setMedia(e.target.value as ContactMedia)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold"
                  >
                    {MEDIA_OPTIONS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Status Tindak Lanjut</label>
                  <select
                    value={followUpStatus}
                    onChange={(e) => setFollowUpStatus(e.target.value as ParentFollowUpStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-semibold"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Pokok Pembahasan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={mainDiscussion}
                  onChange={(e) => setMainDiscussion(e.target.value)}
                  rows={2}
                  placeholder="Ringkasan topik konsultasi..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Perkembangan Positif yang Disampaikan
                  </label>
                  <textarea
                    value={positiveDevelopments}
                    onChange={(e) => setPositiveDevelopments(e.target.value)}
                    rows={2}
                    placeholder="Poin kemajuan adab, hafalan, atau belajar..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Hal yang Perlu Diperhatikan Bersama
                  </label>
                  <textarea
                    value={pointsToNote}
                    onChange={(e) => setPointsToNote(e.target.value)}
                    rows={2}
                    placeholder="Dukungan yang diharapkan dari orang tua di rumah..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Kesepakatan Sinergi Sekolah dan Orang Tua
                </label>
                <textarea
                  value={schoolParentAgreement}
                  onChange={(e) => setSchoolParentAgreement(e.target.value)}
                  rows={2}
                  placeholder="Komitmen bersama antara wali kelas dan wali santri..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Penanggung Jawab (PIC)</label>
                  <input
                    type="text"
                    value={personInCharge}
                    onChange={(e) => setPersonInCharge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Jadwal Evaluasi Berikutnya</label>
                  <input
                    type="text"
                    value={evaluationSchedule}
                    onChange={(e) => setEvaluationSchedule(e.target.value)}
                    placeholder="Contoh: Saat bagi raport bayangan (15 Nov 2026)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs cursor-pointer"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Catatan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Report Modal */}
      {selectedPrintStudent && (
        <PrintParentReportModal
          isOpen={printModalOpen}
          onClose={() => setPrintModalOpen(false)}
          student={selectedPrintStudent}
          parentContact={activePrintContact}
          positiveObservations={observations.filter(
            (o) =>
              o.studentId === selectedPrintStudent.id &&
              (o.category === 'Catatan Positif' || o.category === 'Pencapaian')
          )}
          strengths={strengths.filter((s) => s.studentId === selectedPrintStudent.id)}
          settings={settings}
        />
      )}
    </div>
  );
};
