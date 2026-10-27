export type UserRole = 'admin' | 'wali_kelas' | 'pembina_asrama';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export type StudentStatus = 'aktif' | 'nonaktif' | 'alumni' | 'mutasi';
export type Gender = 'L' | 'P';

export interface Student {
  id: string;
  nis: string;
  fullName: string;
  nickname: string;
  gender: Gender;
  className: string;
  academicYear: string;
  status: StudentStatus;
  dormitoryRoom: string;
  interestsAndTalents: string;
  academicPotential: string;
  nonAcademicPotential: string;
  parentName: string;
  parentPhone: string;
  waliKelasId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AspectType =
  | 'Akademik'
  | 'Ibadah'
  | 'Karakter dan Adab Islami'
  | 'Kedisiplinan'
  | 'Kemandirian'
  | 'Sosial dan Emosional'
  | 'Minat, Bakat, dan Potensi'
  | 'Prestasi'
  | 'Kebutuhan Pembinaan';

export type JournalCategory =
  | 'Catatan Positif'
  | 'Pencapaian'
  | 'Kejadian Penting'
  | 'Kebutuhan Pendampingan';

export interface Observation {
  id: string;
  studentId: string;
  studentName: string;
  dateTime: string;
  aspect: AspectType;
  category: JournalCategory;
  indicator: string;
  observedBehavior: string; // Objective description without labels like "nakal/malas"
  context: string; // Location or circumstance (kelas, asrama, masjid, dll)
  evidenceOrSource: string; // Bukti observasi / sumber info
  relevantImpact: string; // Dampak yang relevan
  teacherAction: string; // Tindakan wali kelas
  initialResult: string; // Hasil awal
  followUpPlan: string; // Rencana tindak lanjut
  nextEvaluationDate: string; // Tanggal evaluasi berikutnya
  authorId: string;
  authorName: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AssessmentType = 'weekly' | 'monthly' | 'semester';
export type SemesterType = 'Ganjil' | 'Genap';

export interface WeeklyAssessment {
  id: string;
  studentId: string;
  studentName?: string;
  type: 'weekly';
  period: string; // e.g. "Minggu ke-3, Oktober 2026"
  weekNumber: number;
  academicYear: string;
  semester: SemesterType;
  positiveDevelopments: string; // Perkembangan positif
  visibleProgress: string; // Kemajuan yang terlihat
  challenges: string; // Tantangan yang masih muncul
  supportingEvidence: string; // Bukti pendukung
  previousComparison: string; // Perbandingan dengan minggu sebelumnya
  nextTargets: string; // Target minggu berikutnya
  interventionPlan: string; // Rencana pembinaan
  isAiAssisted?: boolean;
  evaluatorId: string;
  evaluatorName: string;
  createdAt?: string;
  updatedAt?: string;
}

export type MonthlyScore = 1 | 2 | 3 | 4 | 'N/O';

export interface AspectRubricRating {
  aspect: string;
  score: MonthlyScore;
  evidence: string;
  evaluatorNotes: string;
}

export interface MonthlyAssessment {
  id: string;
  studentId: string;
  studentName?: string;
  type: 'monthly';
  period: string; // e.g. "Oktober 2026"
  month: string;
  academicYear: string;
  semester: SemesterType;
  ratings: Record<string, AspectRubricRating>;
  overallSummary: string;
  growthNotes: string;
  evaluatorId: string;
  evaluatorName: string;
  createdAt?: string;
  updatedAt?: string;
}

export type InterventionStatus =
  | 'Direncanakan'
  | 'Berjalan'
  | 'Tercapai'
  | 'Perlu Penyesuaian'
  | 'Ditutup';

export interface Intervention {
  id: string;
  studentId: string;
  studentName: string;
  identifiedNeed: string; // Permasalahan atau kebutuhan yang teridentifikasi
  initialConditionAndEvidence: string; // Bukti dan kondisi awal
  studentStrengths: string; // Kekuatan siswa yang dapat dikembangkan
  specificTarget: string; // Target perubahan yang spesifik & realistis
  coachingStrategy: string; // Strategi pembinaan
  targetSchedule: string; // Jadwal pembinaan
  personInCharge: string; // Penanggung jawab
  successIndicator: string; // Indikator keberhasilan
  evaluationResult: string; // Hasil evaluasi
  status: InterventionStatus;
  nextFollowUp: string; // Tindak lanjut berikutnya
  dueDate: string; // Tenggat waktu
  coachId: string;
  createdAt?: string;
  updatedAt?: string;
}

export type StrengthCategory =
  | 'Minat & Bakat'
  | 'Karya'
  | 'Prestasi'
  | 'Kreativitas'
  | 'Kepemimpinan'
  | 'Kemampuan Khusus'
  | 'Bidang Pengembangan';

export interface StrengthRecord {
  id: string;
  studentId: string;
  studentName?: string;
  title: string;
  category: StrengthCategory;
  level: string; // Sekolah, Kabupaten, Provinsi, Nasional, Asrama
  year: string;
  description: string;
  evidence: string;
  recommendedDevelopment: string;
  recorderId: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ContactMedia = 'Tatap Muka' | 'Telepon' | 'WhatsApp' | 'Zoom/Meet' | 'Surat Resmi';
export type ParentFollowUpStatus =
  | 'Menunggu Tindak Lanjut'
  | 'Dalam Proses'
  | 'Selesai'
  | 'Perlu Pertemuan Lanjutan';

export interface ParentContact {
  id: string;
  studentId: string;
  studentName: string;
  contactDate: string;
  media: ContactMedia;
  mainDiscussion: string;
  positiveDevelopments: string;
  pointsToNote: string;
  schoolParentAgreement: string;
  personInCharge: string;
  evaluationSchedule: string;
  followUpStatus: ParentFollowUpStatus;
  approvedByWaliKelas: boolean;
  waliKelasId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppSettings {
  id: string;
  schoolName: string;
  boardingName: string;
  schoolLogo: string;
  waliKelasName: string;
  nip: string;
  className: string;
  academicYear: string;
  semester: SemesterType;
  headmasterName: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  targetEntity: string;
  targetId: string;
  details: string;
  performedBy: string;
  performedByName: string;
  timestamp: string;
}
