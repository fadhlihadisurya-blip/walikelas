import React, { useState } from 'react';
import { X, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';
import { Student, StudentStatus, Gender } from '../../types';
import { useJPISData } from '../../context/JPISDataContext';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStudent?: Student | null;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  isOpen,
  onClose,
  initialStudent,
}) => {
  const { addStudent, updateStudent, settings } = useJPISData();

  const [nis, setNis] = useState(initialStudent?.nis || '');
  const [fullName, setFullName] = useState(initialStudent?.fullName || '');
  const [nickname, setNickname] = useState(initialStudent?.nickname || '');
  const [gender, setGender] = useState<Gender>(initialStudent?.gender || 'L');
  const [className, setClassName] = useState(initialStudent?.className || settings.className);
  const [academicYear, setAcademicYear] = useState(initialStudent?.academicYear || settings.academicYear);
  const [status, setStatus] = useState<StudentStatus>(initialStudent?.status || 'aktif');
  const [dormitoryRoom, setDormitoryRoom] = useState(initialStudent?.dormitoryRoom || '');
  const [interestsAndTalents, setInterestsAndTalents] = useState(initialStudent?.interestsAndTalents || '');
  const [academicPotential, setAcademicPotential] = useState(initialStudent?.academicPotential || '');
  const [nonAcademicPotential, setNonAcademicPotential] = useState(initialStudent?.nonAcademicPotential || '');
  const [parentName, setParentName] = useState(initialStudent?.parentName || '');
  const [parentPhone, setParentPhone] = useState(initialStudent?.parentPhone || '');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nis.trim() || !fullName.trim()) {
      setErrorMsg('NIS dan Nama Lengkap santri wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      if (initialStudent) {
        await updateStudent(initialStudent.id, {
          nis,
          fullName,
          nickname,
          gender,
          className,
          academicYear,
          status,
          dormitoryRoom,
          interestsAndTalents,
          academicPotential,
          nonAcademicPotential,
          parentName,
          parentPhone,
        });
      } else {
        await addStudent({
          nis,
          fullName,
          nickname,
          gender,
          className,
          academicYear,
          status,
          dormitoryRoom,
          interestsAndTalents,
          academicPotential,
          nonAcademicPotential,
          parentName,
          parentPhone,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan data santri.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center text-emerald-200 border border-emerald-700">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {initialStudent ? 'Ubah Data Siswa / Santri' : 'Tambah Siswa / Santri Baru'}
              </h2>
              <p className="text-xs text-emerald-300">
                Pencatatan profil individual peserta didik Islamic Boarding School
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-emerald-300 hover:text-white rounded-lg hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs text-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                NIS <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="260101"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Nama Lengkap Siswa <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Muhammad Al-Fatih"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Nama Panggilan
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Fatih"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="L">Laki-laki (Ikhwan / Santri)</option>
                <option value="P">Perempuan (Akhwat / Santriwati)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Status Keaktifan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StudentStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
                <option value="mutasi">Mutasi</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Kamar / Gedung Asrama
            </label>
            <input
              type="text"
              value={dormitoryRoom}
              onChange={(e) => setDormitoryRoom(e.target.value)}
              placeholder="Asrama Al-Fatih Lt. 2 / Kamar 204"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              Minat dan Bakat
            </label>
            <input
              type="text"
              value={interestsAndTalents}
              onChange={(e) => setInterestsAndTalents(e.target.value)}
              placeholder="Robotika, Kaligrafi Tsuluts, Futsal, Tahfidz"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Potensi Akademik
              </label>
              <textarea
                value={academicPotential}
                onChange={(e) => setAcademicPotential(e.target.value)}
                rows={2}
                placeholder="Fisika Terapan, Matematika Diskrit, Bahasa Arab"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Potensi Non-Akademik
              </label>
              <textarea
                value={nonAcademicPotential}
                onChange={(e) => setNonAcademicPotential(e.target.value)}
                rows={2}
                placeholder="Tahfidz Qur'an mutqin, Kepemimpinan regu, Desain poster dakwah"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Nama Orang Tua / Wali
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Ir. H. Farhan Al-Farisi"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                No. Telepon / WhatsApp Orang Tua
              </label>
              <input
                type="text"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{submitting ? 'Menyimpan...' : initialStudent ? 'Perbarui Data' : 'Tambah Siswa'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
