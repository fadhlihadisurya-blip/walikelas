# JPIS (Jurnal Perkembangan Individu Siswa)
### Sistem Informasi Pemantauan & Perkembangan Individu Siswa SMA Islamic Boarding School

Aplikasi web full-stack modern, aman, dan responsif yang dirancang khusus untuk Wali Kelas SMA Islamic Boarding School guna memantau 30–40 santri secara objektif, berkelanjutan, dan penuh hikmah.

---

## 🌟 Fitur Utama

1. **Dashboard Perkembangan**
   - Ringkasan santri aktif (32 santri percontohan kelas XI-A Ibnu Sina).
   - Statistik catatan jurnal terbaru, evaluasi mingguan yang belum selesai, dan program pembinaan aktif.
   - Grafik distribusi observasi perkembangan per aspek (tanpa pemeringkatan ibadah/karakter).
   - Fokus pendampingan santri & agenda evaluasi berikutnya.
   - Tombol cepat tambah jurnal & jalan pintas ke profil santri.

2. **Data & Profil Siswa**
   - Direktori lengkap 32 santri: NIS, nama, panggilan, gender, kamar asrama, minat/bakat, potensi akademik & non-akademik.
   - Pencarian real-time, filter status (aktif/nonaktif/mutasi/alumni), dan ekspor CSV.
   - Halaman profil individual lengkap: identitas, riwayat jurnal, catatan positif, kebutuhan pendampingan, riwayat pembinaan, karya/prestasi, dan tautan WhatsApp langsung ke wali santri.

3. **Jurnal Harian Objektif (12 Bidang Lengkap)**
   - Form pencatatan komprehensif: Nama Siswa, Waktu/Tanggal, 9 Aspek Perkembangan, Kategori (Catatan Positif, Pencapaian, Kejadian Penting, Kebutuhan Pendampingan), Indikator, Perilaku Teramati (Objektif), Konteks Kejadian, Bukti/Sumber, Dampak Relevan, Tindakan Guru, Hasil Awal, Rencana Tindak Lanjut, dan Tanggal Evaluasi.
   - Kebijakan anti-labeling: Validasi otomatis yang melarang kata subjektif peyoratif (*malas, nakal, buruk, bodoh*).
   - Filter berdasarkan siswa, aspek, kategori, dan rentang tanggal serta ekspor CSV.

4. **Evaluasi Mingguan & Asisten Cerdas AI (Gemini 2.5 Flash)**
   - Merangkum jurnal harian menjadi 7 bagian: Perkembangan positif, kemajuan terlihat, tantangan masih muncul, bukti pendukung, perbandingan minggu lalu, target minggu berikutnya, dan rencana pembinaan.
   - Integrasi asisten AI berbasis `@google/genai` yang hanya mengolah catatan nyata tanpa halusinasi dan tetap dapat diedit wali kelas.

5. **Evaluasi Bulanan (Rubrik 6 Aspek)**
   - Pemantauan 6 aspek utama: Akademik, Ibadah, Karakter & Adab Islami, Kedisiplinan & Kemandirian, Sosial & Emosional, serta Minat/Bakat.
   - Skala objektif: 1 (Belum berkembang), 2 (Mulai berkembang), 3 (Berkembang baik), 4 (Berkembang sangat baik), dan **N/O (Belum cukup observasi)**.

6. **Modul Pembinaan Siswa (Intervensi)**
   - Kebutuhan teridentifikasi, kondisi awal & bukti, kekuatan siswa, target spesifik & realistis, strategi pembinaan, jadwal, penanggung jawab (PIC), indikator keberhasilan, dan hasil evaluasi.
   - Status: *Direncanakan, Berjalan, Tercapai, Perlu Penyesuaian, Ditutup*.
   - Peringatan otomatis untuk target yang mendekati tenggat atau terlambat dievaluasi.

7. **Potensi dan Prestasi**
   - Dokumentasi karya, prestasi kompetisi, kepemimpinan, dan bakat santri dilengkapi bukti sertifikat dan rekomendasi pembinaan.

8. **Komunikasi Orang Tua**
   - Pencatatan log konsultasi orang tua (Tatap Muka, Telepon, WhatsApp, Zoom, Surat Resmi).
   - Kesepakatan sekolah & orang tua serta tindak lanjut.
   - **Pratinjau Cetak Laporan Khusus Orang Tua** siap cetak/PDF tanpa mengekspos catatan internal atau data santri lain.

9. **Laporan Semester & Ekspor**
   - Rapor individual semester komprehensif siap cetak untuk pertemuan wali santri.
   - Rekapitulasi kelas lengkap dengan ekspor CSV.

10. **Pengaturan Sekolah & Hak Akses Berjenjang**
    - Konfigurasi nama sekolah, asrama, wali kelas, NIP, kelas, tahun ajaran, semester, dan kepala sekolah.
    - Role-Based Access Control (RBAC): Super Admin (`Fadhlihadisurya@gmail.com`), Wali Kelas, dan Pembina Asrama (Musyrif).
    - Panduan deployment Vercel dan cadangan data lokal.

---

## 📁 Struktur Direktori

```
├── .env.example                     # Contoh variabel lingkungan
├── index.html                       # Entry HTML dengan Plus Jakarta Sans
├── metadata.json                    # Metadata aplikasi
├── package.json                     # Dependensi proyek
├── firestore.rules                  # Aturan keamanan database Firestore Zero-Trust
├── firebase-blueprint.json          # Arsitektur skema entitas Firestore
├── src/
│   ├── main.tsx                     # Entry point React
│   ├── App.tsx                      # Master layout & modul navigasi
│   ├── index.css                    # Tailwind CSS & konfigurasi cetak rapor
│   ├── types/
│   │   └── index.ts                 # Kontrak tipe TypeScript lengkap
│   ├── firebase/
│   │   └── config.ts                # Inisialisasi Firebase & error handler
│   ├── context/
│   │   ├── AuthContext.tsx          # Autentikasi Google, profil, & peran
│   │   └── JPISDataContext.tsx      # State management, real-time sync, & CRUD
│   ├── services/
│   │   └── aiEvaluationService.ts   # Integrasi Gemini 2.5 Flash untuk ringkasan mingguan
│   ├── data/
│   │   └── initialData.ts           # Dataset 32 santri SMA Islamic Boarding School
│   └── components/
│       ├── layout/
│       │   ├── Sidebar.tsx          # Navigasi sidebar responsif
│       │   └── Header.tsx           # Header, aksi cepat, & status sinkronisasi
│       ├── dashboard/
│       │   └── DashboardView.tsx    # Dashboard metrik & grafik aspek
│       ├── students/
│       │   ├── StudentListView.tsx  # Tabel/kartu santri & filter
│       │   ├── StudentFormModal.tsx # Form tambah/ubah siswa
│       │   └── StudentProfileModal.tsx # Profil individual multi-tab santri
│       ├── journal/
│       │   ├── DailyJournalView.tsx # Daftar jurnal harian & filter
│       │   └── NewJournalModal.tsx  # Form 12 bidang jurnal objektif
│       ├── evaluations/
│       │   ├── WeeklyEvaluationView.tsx # Evaluasi mingguan + AI
│       │   └── MonthlyEvaluationView.tsx # Rubrik bulanan 6 aspek
│       ├── interventions/
│       │   ├── InterventionsView.tsx   # Modul pembinaan & pengingat
│       │   └── NewInterventionModal.tsx # Form target pembinaan spesifik
│       ├── strengths/
│       │   └── StrengthsView.tsx       # Potensi, karya, & prestasi
│       ├── parent/
│       │   ├── ParentCommunicationView.tsx # Log komunikasi orang tua
│       │   └── PrintParentReportModal.tsx # Lembar cetak laporan orang tua
│       ├── reports/
│       │   └── SemesterReportView.tsx  # Rapor semester & rekap kelas
│       ├── settings/
│       │   └── SettingsView.tsx        # Pengaturan & panduan Vercel
│       └── auth/
│           ├── LoginModal.tsx          # Dialog login & mode peran
│           └── SetupFirebaseModal.tsx  # Dialog panduan database
```

---

## 🚀 Menjalankan Secara Lokal

1. **Clone repository dan install dependensi**:
   ```bash
   npm install
   ```

2. **Jalankan development server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan terbuka di port `http://localhost:3000`.

3. **Verifikasi Build & Tipe**:
   ```bash
   npm run lint
   npm run build
   ```

---

## 🌐 Panduan Deployment ke Vercel

1. Hubungkan repository Git Anda ke akun **Vercel** (`https://vercel.com`).
2. Pilih preset framework: **Vite**.
3. Di bagian **Environment Variables**, masukkan konfigurasi berikut:

| Nama Variabel | Keterangan |
|---|---|
| `VITE_FIREBASE_API_KEY` | API Key project Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domain Auth Firebase (cth: `project-id.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Project ID Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket Firebase |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Web App ID Firebase |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | Database ID (gunakan `(default)` atau ID kustom) |
| `GEMINI_API_KEY` | *(Opsional)* API key Google AI untuk fitur ringkasan evaluasi mingguan |

4. Klik **Deploy**.
5. Salin aturan dari file `firestore.rules` ke menu **Cloud Firestore > Rules** di Firebase Console untuk keamanan data optimal.
