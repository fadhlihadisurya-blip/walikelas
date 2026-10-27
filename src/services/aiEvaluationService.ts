import { GoogleGenAI } from '@google/genai';
import { Observation, WeeklyAssessment } from '../types';

interface AiSummaryInput {
  studentName: string;
  nis: string;
  period: string;
  observations: Observation[];
  previousAssessment?: WeeklyAssessment | null;
}

export interface AiSummaryResult {
  positiveDevelopments: string;
  visibleProgress: string;
  challenges: string;
  supportingEvidence: string;
  previousComparison: string;
  nextTargets: string;
  interventionPlan: string;
}

export async function generateWeeklySummaryWithAi(input: AiSummaryInput): Promise<AiSummaryResult> {
  const apiKey = import.meta.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : '');

  // Filter and format actual observation records
  const obsText = input.observations.length > 0
    ? input.observations.map((obs, idx) => `
Catatan #${idx + 1}:
- Tanggal/Waktu: ${obs.dateTime}
- Aspek: ${obs.aspect} (${obs.category})
- Indikator: ${obs.indicator}
- Perilaku Teramati (Objektif): ${obs.observedBehavior}
- Konteks Kejadian: ${obs.context}
- Bukti Observasi: ${obs.evidenceOrSource}
- Tindakan Guru: ${obs.teacherAction}
- Hasil Awal: ${obs.initialResult}
- Rencana Tindak Lanjut: ${obs.followUpPlan}
`).join('\n')
    : 'Belum ada catatan observasi harian pada periode minggu ini.';

  const prevText = input.previousAssessment
    ? `Ringkasan Minggu Sebelumnya:
- Perkembangan Positif: ${input.previousAssessment.positiveDevelopments}
- Target Sebelumnya: ${input.previousAssessment.nextTargets}
- Rencana Sebelumnya: ${input.previousAssessment.interventionPlan}`
    : 'Tidak ada data evaluasi minggu sebelumnya.';

  // If Gemini API Key is available, invoke Gemini 2.5 Flash
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
Anda adalah asisten cerdas bagi Wali Kelas SMA Islamic Boarding School untuk menyusun draf Evaluasi Mingguan Siswa berdasarkan jurnal observasi nyata.

ATURAN KETAT:
1. Bersikaplah objektif, santun, mendidik, dan penuh hikmah.
2. DILARANG menggunakan label destruktif seperti "malas", "nakal", "bodoh", atau "buruk".
3. DILARANG mendiagnosis kondisi psikologis/medis dan DILARANG membuat keputusan hukuman.
4. Gunakan HANYA bukti dan fakta yang tertera dalam catatan observasi berikut. Jangan mengarang insiden yang tidak tercatat.
5. Hasil draf ini akan ditinjau dan diedit sepenuhnya oleh Wali Kelas.

Data Siswa:
Nama: ${input.studentName} (NIS: ${input.nis})
Periode: ${input.period}

Catatan Observasi Jurnal:
${obsText}

${prevText}

Format output HARUS berupa JSON murni dengan struktur berikut:
{
  "positiveDevelopments": "ringkasan perkembangan positif...",
  "visibleProgress": "kemajuan nyata yang terlihat dibanding kondisi awal...",
  "challenges": "tantangan atau hal yang masih membutuhkan pendampingan objektif...",
  "supportingEvidence": "rangkuman bukti observasi konkret dari catatan...",
  "previousComparison": "perbandingan dengan target minggu sebelumnya jika ada...",
  "nextTargets": "rekomendasi target terukur yang spesifik dan realistis untuk minggu berikutnya...",
  "interventionPlan": "usulan rencana pembinaan edukatif bagi wali kelas dan musyrif asrama..."
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.text?.trim() || '';
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return {
          positiveDevelopments: parsed.positiveDevelopments || '',
          visibleProgress: parsed.visibleProgress || '',
          challenges: parsed.challenges || '',
          supportingEvidence: parsed.supportingEvidence || '',
          previousComparison: parsed.previousComparison || '',
          nextTargets: parsed.nextTargets || '',
          interventionPlan: parsed.interventionPlan || '',
        };
      }
    } catch (err) {
      console.warn('Gemini API call warning, falling back to rule-based synthesis:', err);
    }
  }

  // Deterministic Rule-Based Fallback Synthesis (Fully functional without API key)
  const positiveNotes = input.observations.filter(
    (o) => o.category === 'Catatan Positif' || o.category === 'Pencapaian'
  );
  const careNotes = input.observations.filter(
    (o) => o.category === 'Kebutuhan Pendampingan' || o.category === 'Kejadian Penting'
  );

  const posDev = positiveNotes.length > 0
    ? positiveNotes.map((o) => `• [${o.aspect}] ${o.observedBehavior} (${o.context})`).join('\n')
    : 'Siswa mengikuti seluruh rutinitas asrama dan pembelajaran kelas secara stabil.';

  const visProg = positiveNotes.length > 0
    ? `Terlihat konsistensi positif pada ${positiveNotes.length} observasi, khususnya indikator: ${positiveNotes.map((o) => o.indicator).slice(0, 2).join(', ')}.`
    : 'Menjaga keteraturan kehadiran dan ketertiban umum di lingkungan asrama.';

  const chal = careNotes.length > 0
    ? careNotes.map((o) => `• [${o.aspect}] ${o.observedBehavior} — Perlu pendampingan pada: ${o.indicator}`).join('\n')
    : 'Tidak teridentifikasi hambatan kedisiplinan atau adab yang menonjol pada periode ini.';

  const evid = input.observations.length > 0
    ? input.observations.map((o) => `[${o.dateTime.split(' ')[0]}] ${o.evidenceOrSource || 'Pengamatan langsung guru/musyrif'}`).join('; ')
    : 'Berdasarkan rekap presensi dan pantauan harian.';

  const comp = input.previousAssessment
    ? `Dibandingkan minggu sebelumnya, siswa menunjukkan keberlanjutan fokus pada target pembinaan sebelumnya (${input.previousAssessment.nextTargets || 'peningkatan disiplin'}).`
    : 'Periode baseline pemantauan awal.';

  const targets = careNotes.length > 0
    ? `Mempertahankan keteraturan jadwal harian dan menindaklanjuti perbaikan pada aspek ${careNotes[0].aspect} secara konsisten.`
    : 'Mempertahankan kebiasaan positif dan meningkatkan inisiatif keteladanan bagi rekan santri sekamar.';

  const interPlan = careNotes.length > 0
    ? `Melanjutkan pendampingan dialogis personal 1-on-1 dengan wali kelas serta koordinasi berkala bersama musyrif asrama.`
    : 'Memberikan apresiasi dan penugasan peran kepemimpinan ringan (misal: koordinator piket atau tadarus kamar).';

  return {
    positiveDevelopments: posDev,
    visibleProgress: visProg,
    challenges: chal,
    supportingEvidence: evid,
    previousComparison: comp,
    nextTargets: targets,
    interventionPlan: interPlan,
  };
}
