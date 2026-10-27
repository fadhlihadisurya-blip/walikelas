import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, isFirebaseConfigured } from '../firebase/config';
import { useAuth } from './AuthContext';
import {
  Student,
  Observation,
  WeeklyAssessment,
  MonthlyAssessment,
  Intervention,
  StrengthRecord,
  ParentContact,
  AppSettings,
  AuditLog,
} from '../types';
import {
  defaultSettings,
  sampleStudents,
  sampleObservations,
  sampleInterventions,
  sampleStrengths,
  sampleParentContacts,
} from '../data/initialData';

interface JPISDataContextType {
  students: Student[];
  observations: Observation[];
  weeklyAssessments: WeeklyAssessment[];
  monthlyAssessments: MonthlyAssessment[];
  interventions: Intervention[];
  strengths: StrengthRecord[];
  parentContacts: ParentContact[];
  settings: AppSettings;
  auditLogs: AuditLog[];
  loading: boolean;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  // Student CRUD
  addStudent: (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  // Observation CRUD
  addObservation: (data: Omit<Observation, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateObservation: (id: string, data: Partial<Observation>) => Promise<void>;
  deleteObservation: (id: string) => Promise<void>;
  // Assessment CRUD
  saveWeeklyAssessment: (data: Omit<WeeklyAssessment, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => Promise<string>;
  saveMonthlyAssessment: (data: Omit<MonthlyAssessment, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => Promise<string>;
  deleteAssessment: (id: string) => Promise<void>;
  // Intervention CRUD
  addIntervention: (data: Omit<Intervention, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateIntervention: (id: string, data: Partial<Intervention>) => Promise<void>;
  deleteIntervention: (id: string) => Promise<void>;
  // Strengths & Potentials CRUD
  addStrength: (data: Omit<StrengthRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateStrength: (id: string, data: Partial<StrengthRecord>) => Promise<void>;
  deleteStrength: (id: string) => Promise<void>;
  // Parent Communication CRUD
  addParentContact: (data: Omit<ParentContact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateParentContact: (id: string, data: Partial<ParentContact>) => Promise<void>;
  deleteParentContact: (id: string) => Promise<void>;
  // Settings
  updateAppSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  // Database utilities
  seedSampleClassData: () => Promise<void>;
  clearAllData: () => Promise<void>;
  logAudit: (action: string, targetEntity: string, targetId: string, details: string) => Promise<void>;
}

const JPISDataContext = createContext<JPISDataContextType | undefined>(undefined);

export const JPISDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile } = useAuth();
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('jpis_local_students');
    return saved ? JSON.parse(saved) : sampleStudents;
  });
  const [observations, setObservations] = useState<Observation[]>(() => {
    const saved = localStorage.getItem('jpis_local_observations');
    return saved ? JSON.parse(saved) : sampleObservations;
  });
  const [weeklyAssessments, setWeeklyAssessments] = useState<WeeklyAssessment[]>(() => {
    const saved = localStorage.getItem('jpis_local_weekly_assessments');
    return saved ? JSON.parse(saved) : [];
  });
  const [monthlyAssessments, setMonthlyAssessments] = useState<MonthlyAssessment[]>(() => {
    const saved = localStorage.getItem('jpis_local_monthly_assessments');
    return saved ? JSON.parse(saved) : [];
  });
  const [interventions, setInterventions] = useState<Intervention[]>(() => {
    const saved = localStorage.getItem('jpis_local_interventions');
    return saved ? JSON.parse(saved) : sampleInterventions;
  });
  const [strengths, setStrengths] = useState<StrengthRecord[]>(() => {
    const saved = localStorage.getItem('jpis_local_strengths');
    return saved ? JSON.parse(saved) : sampleStrengths;
  });
  const [parentContacts, setParentContacts] = useState<ParentContact[]>(() => {
    const saved = localStorage.getItem('jpis_local_parent_contacts');
    return saved ? JSON.parse(saved) : sampleParentContacts;
  });
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('jpis_local_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('jpis_local_audit_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('syncing');

  // Sync to local storage mirrors
  useEffect(() => {
    localStorage.setItem('jpis_local_students', JSON.stringify(students));
  }, [students]);
  useEffect(() => {
    localStorage.setItem('jpis_local_observations', JSON.stringify(observations));
  }, [observations]);
  useEffect(() => {
    localStorage.setItem('jpis_local_weekly_assessments', JSON.stringify(weeklyAssessments));
  }, [weeklyAssessments]);
  useEffect(() => {
    localStorage.setItem('jpis_local_monthly_assessments', JSON.stringify(monthlyAssessments));
  }, [monthlyAssessments]);
  useEffect(() => {
    localStorage.setItem('jpis_local_interventions', JSON.stringify(interventions));
  }, [interventions]);
  useEffect(() => {
    localStorage.setItem('jpis_local_strengths', JSON.stringify(strengths));
  }, [strengths]);
  useEffect(() => {
    localStorage.setItem('jpis_local_parent_contacts', JSON.stringify(parentContacts));
  }, [parentContacts]);
  useEffect(() => {
    localStorage.setItem('jpis_local_settings', JSON.stringify(settings));
  }, [settings]);
  useEffect(() => {
    localStorage.setItem('jpis_local_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Firestore real-time listeners
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setSyncStatus('offline');
      setLoading(false);
      return;
    }

    const unsubs: (() => void)[] = [];

    try {
      // 1. Settings listener
      const unsubSettings = onSnapshot(
        doc(db, 'settings', 'current_setting'),
        (snapshot) => {
          if (snapshot.exists()) {
            setSettings(snapshot.data() as AppSettings);
          }
        },
        (error) => {
          console.warn('Settings firestore sync fallback:', error.message);
        }
      );
      unsubs.push(unsubSettings);

      // 2. Students listener
      const unsubStudents = onSnapshot(
        collection(db, 'students'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Student[] = [];
            snapshot.forEach((d) => list.push(d.data() as Student));
            setStudents(list);
          }
          setSyncStatus('synced');
          setLoading(false);
        },
        (error) => {
          console.warn('Students firestore sync fallback:', error.message);
          setSyncStatus('offline');
          setLoading(false);
        }
      );
      unsubs.push(unsubStudents);

      // 3. Observations listener
      const unsubObs = onSnapshot(
        collection(db, 'observations'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Observation[] = [];
            snapshot.forEach((d) => list.push(d.data() as Observation));
            list.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
            setObservations(list);
          }
        },
        (error) => console.warn('Observations sync fallback:', error.message)
      );
      unsubs.push(unsubObs);

      // 4. Assessments listener
      const unsubAssessments = onSnapshot(
        collection(db, 'assessments'),
        (snapshot) => {
          if (!snapshot.empty) {
            const weeklies: WeeklyAssessment[] = [];
            const monthlies: MonthlyAssessment[] = [];
            snapshot.forEach((d) => {
              const data = d.data();
              if (data.type === 'weekly') {
                weeklies.push(data as WeeklyAssessment);
              } else if (data.type === 'monthly') {
                monthlies.push(data as MonthlyAssessment);
              }
            });
            setWeeklyAssessments(weeklies);
            setMonthlyAssessments(monthlies);
          }
        },
        (error) => console.warn('Assessments sync fallback:', error.message)
      );
      unsubs.push(unsubAssessments);

      // 5. Interventions listener
      const unsubInterventions = onSnapshot(
        collection(db, 'interventions'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Intervention[] = [];
            snapshot.forEach((d) => list.push(d.data() as Intervention));
            setInterventions(list);
          }
        },
        (error) => console.warn('Interventions sync fallback:', error.message)
      );
      unsubs.push(unsubInterventions);

      // 6. Strengths listener
      const unsubStrengths = onSnapshot(
        collection(db, 'strengths'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: StrengthRecord[] = [];
            snapshot.forEach((d) => list.push(d.data() as StrengthRecord));
            setStrengths(list);
          }
        },
        (error) => console.warn('Strengths sync fallback:', error.message)
      );
      unsubs.push(unsubStrengths);

      // 7. Parent Contacts listener
      const unsubParent = onSnapshot(
        collection(db, 'parentContacts'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: ParentContact[] = [];
            snapshot.forEach((d) => list.push(d.data() as ParentContact));
            setParentContacts(list);
          }
        },
        (error) => console.warn('ParentContacts sync fallback:', error.message)
      );
      unsubs.push(unsubParent);

      // 8. Audit logs listener
      const unsubAudit = onSnapshot(
        collection(db, 'auditLogs'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AuditLog[] = [];
            snapshot.forEach((d) => list.push(d.data() as AuditLog));
            list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setAuditLogs(list.slice(0, 100));
          }
        },
        (error) => console.warn('Audit logs sync fallback:', error.message)
      );
      unsubs.push(unsubAudit);
    } catch (e) {
      console.error('Failed to attach listeners:', e);
      setSyncStatus('error');
      setLoading(false);
    }

    return () => {
      unsubs.forEach((u) => u());
    };
  }, []);

  const logAudit = async (action: string, targetEntity: string, targetId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action,
      targetEntity,
      targetId,
      details,
      performedBy: userProfile?.id || 'system',
      performedByName: userProfile?.displayName || 'Wali Kelas',
      timestamp: new Date().toISOString(),
    };

    setAuditLogs((prev) => [newLog, ...prev]);

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'auditLogs', newLog.id), newLog);
      } catch (err) {
        console.warn('Audit log firestore write warning:', err);
      }
    }
  };

  // Student CRUD
  const addStudent = async (data: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `std_${Date.now()}`;
    const newStudent: Student = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStudents((prev) => [...prev, newStudent]);
    await logAudit('TAMBAH_SISWA', 'Student', id, `Menambahkan siswa baru: ${data.fullName} (NIS: ${data.nis})`);

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'students', id), newStudent);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `students/${id}`);
      }
    }
    return id;
  };

  const updateStudent = async (id: string, data: Partial<Student>) => {
    const updatedFields = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s)));
    await logAudit('UBAH_SISWA', 'Student', id, `Memperbarui data profil siswa ID: ${id}`);

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'students', id), updatedFields);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `students/${id}`);
      }
    }
  };

  const deleteStudent = async (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    await logAudit('HAPUS_SISWA', 'Student', id, `Menghapus siswa ID: ${id}`);

    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'students', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `students/${id}`);
      }
    }
  };

  // Observation CRUD
  const addObservation = async (data: Omit<Observation, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `obs_${Date.now()}`;
    const newObs: Observation = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setObservations((prev) => [newObs, ...prev]);
    await logAudit(
      'TAMBAH_JURNAL',
      'Observation',
      id,
      `Mencatat jurnal [${data.aspect}] untuk siswa ${data.studentName}: ${data.indicator}`
    );

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'observations', id), newObs);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `observations/${id}`);
      }
    }
    return id;
  };

  const updateObservation = async (id: string, data: Partial<Observation>) => {
    const updated = { ...data, updatedAt: new Date().toISOString() };
    setObservations((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
    await logAudit('UBAH_JURNAL', 'Observation', id, `Memperbarui catatan jurnal harian ID: ${id}`);

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'observations', id), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `observations/${id}`);
      }
    }
  };

  const deleteObservation = async (id: string) => {
    setObservations((prev) => prev.filter((o) => o.id !== id));
    await logAudit('HAPUS_JURNAL', 'Observation', id, `Menghapus catatan jurnal ID: ${id}`);

    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'observations', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `observations/${id}`);
      }
    }
  };

  // Assessment CRUD
  const saveWeeklyAssessment = async (
    data: Omit<WeeklyAssessment, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ): Promise<string> => {
    const id = existingId || `w_eval_${Date.now()}`;
    const newAss: WeeklyAssessment = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setWeeklyAssessments((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newAss;
        return copy;
      }
      return [newAss, ...prev];
    });

    await logAudit('SIMPAN_EVALUASI_MINGGUAN', 'WeeklyAssessment', id, `Menyimpan evaluasi mingguan siswa: ${data.period}`);

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'assessments', id), newAss);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `assessments/${id}`);
      }
    }
    return id;
  };

  const saveMonthlyAssessment = async (
    data: Omit<MonthlyAssessment, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ): Promise<string> => {
    const id = existingId || `m_eval_${Date.now()}`;
    const newAss: MonthlyAssessment = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setMonthlyAssessments((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newAss;
        return copy;
      }
      return [newAss, ...prev];
    });

    await logAudit('SIMPAN_EVALUASI_BULANAN', 'MonthlyAssessment', id, `Menyimpan rubrik evaluasi bulanan: ${data.period}`);

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'assessments', id), newAss);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `assessments/${id}`);
      }
    }
    return id;
  };

  const deleteAssessment = async (id: string) => {
    setWeeklyAssessments((prev) => prev.filter((a) => a.id !== id));
    setMonthlyAssessments((prev) => prev.filter((a) => a.id !== id));
    await logAudit('HAPUS_EVALUASI', 'Assessment', id, `Menghapus evaluasi ID: ${id}`);

    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'assessments', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `assessments/${id}`);
      }
    }
  };

  // Intervention CRUD
  const addIntervention = async (data: Omit<Intervention, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `int_${Date.now()}`;
    const newInt: Intervention = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInterventions((prev) => [newInt, ...prev]);
    await logAudit(
      'TAMBAH_PEMBINAAN',
      'Intervention',
      id,
      `Merumuskan program pembinaan untuk ${data.studentName}: ${data.specificTarget}`
    );

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'interventions', id), newInt);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `interventions/${id}`);
      }
    }
    return id;
  };

  const updateIntervention = async (id: string, data: Partial<Intervention>) => {
    const updated = { ...data, updatedAt: new Date().toISOString() };
    setInterventions((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
    await logAudit('UBAH_PEMBINAAN', 'Intervention', id, `Memperbarui progres pembinaan ID: ${id} status: ${data.status || 'diperbarui'}`);

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'interventions', id), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `interventions/${id}`);
      }
    }
  };

  const deleteIntervention = async (id: string) => {
    setInterventions((prev) => prev.filter((i) => i.id !== id));
    await logAudit('HAPUS_PEMBINAAN', 'Intervention', id, `Menghapus pembinaan ID: ${id}`);

    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'interventions', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `interventions/${id}`);
      }
    }
  };

  // Strengths & Potentials CRUD
  const addStrength = async (data: Omit<StrengthRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `str_${Date.now()}`;
    const newStr: StrengthRecord = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setStrengths((prev) => [newStr, ...prev]);
    await logAudit(
      'TAMBAH_POTENSI_PRESTASI',
      'Strength',
      id,
      `Mencatat potensi/prestasi [${data.category}] untuk siswa: ${data.title}`
    );

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'strengths', id), newStr);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `strengths/${id}`);
      }
    }
    return id;
  };

  const updateStrength = async (id: string, data: Partial<StrengthRecord>) => {
    const updated = { ...data, updatedAt: new Date().toISOString() };
    setStrengths((prev) => prev.map((s) => (s.id === id ? { ...s, ...updated } : s)));
    await logAudit('UBAH_POTENSI_PRESTASI', 'Strength', id, `Memperbarui catatan potensi/prestasi ID: ${id}`);

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'strengths', id), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `strengths/${id}`);
      }
    }
  };

  const deleteStrength = async (id: string) => {
    setStrengths((prev) => prev.filter((s) => s.id !== id));
    await logAudit('HAPUS_POTENSI_PRESTASI', 'Strength', id, `Menghapus catatan potensi/prestasi ID: ${id}`);

    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'strengths', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `strengths/${id}`);
      }
    }
  };

  // Parent Contact CRUD
  const addParentContact = async (data: Omit<ParentContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `pc_${Date.now()}`;
    const newPc: ParentContact = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setParentContacts((prev) => [newPc, ...prev]);
    await logAudit(
      'TAMBAH_KOMUNIKASI_ORTU',
      'ParentContact',
      id,
      `Mencatat komunikasi orang tua untuk siswa ${data.studentName} via ${data.media}`
    );

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'parentContacts', id), newPc);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `parentContacts/${id}`);
      }
    }
    return id;
  };

  const updateParentContact = async (id: string, data: Partial<ParentContact>) => {
    const updated = { ...data, updatedAt: new Date().toISOString() };
    setParentContacts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
    await logAudit('UBAH_KOMUNIKASI_ORTU', 'ParentContact', id, `Memperbarui komunikasi orang tua ID: ${id}`);

    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, 'parentContacts', id), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `parentContacts/${id}`);
      }
    }
  };

  const deleteParentContact = async (id: string) => {
    setParentContacts((prev) => prev.filter((p) => p.id !== id));
    await logAudit('HAPUS_KOMUNIKASI_ORTU', 'ParentContact', id, `Menghapus komunikasi orang tua ID: ${id}`);

    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, 'parentContacts', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `parentContacts/${id}`);
      }
    }
  };

  // Settings
  const updateAppSettings = async (newSettings: Partial<AppSettings>) => {
    const updated: AppSettings = {
      ...settings,
      ...newSettings,
      updatedAt: new Date().toISOString(),
      updatedBy: userProfile?.displayName || 'Wali Kelas',
    };
    setSettings(updated);
    await logAudit('UBAH_PENGATURAN', 'Setting', 'current_setting', 'Memperbarui konfigurasi sekolah / kelas');

    if (isFirebaseConfigured) {
      try {
        await setDoc(doc(db, 'settings', 'current_setting'), updated);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'settings/current_setting');
      }
    }
  };

  // Seed sample data to Firestore and state
  const seedSampleClassData = async () => {
    setLoading(true);
    try {
      setStudents(sampleStudents);
      setObservations(sampleObservations);
      setInterventions(sampleInterventions);
      setStrengths(sampleStrengths);
      setParentContacts(sampleParentContacts);
      setSettings(defaultSettings);

      if (isFirebaseConfigured) {
        const batch = writeBatch(db);

        // Settings
        batch.set(doc(db, 'settings', 'current_setting'), defaultSettings);

        // Students
        sampleStudents.forEach((st) => {
          batch.set(doc(db, 'students', st.id), st);
        });

        // Observations
        sampleObservations.forEach((obs) => {
          batch.set(doc(db, 'observations', obs.id), obs);
        });

        // Interventions
        sampleInterventions.forEach((int) => {
          batch.set(doc(db, 'interventions', int.id), int);
        });

        // Strengths
        sampleStrengths.forEach((str) => {
          batch.set(doc(db, 'strengths', str.id), str);
        });

        // Parent contacts
        sampleParentContacts.forEach((pc) => {
          batch.set(doc(db, 'parentContacts', pc.id), pc);
        });

        await batch.commit();
      }

      await logAudit('SEED_DATABASE', 'Database', 'all', 'Menginisialisasi data kelas percontohan 32 siswa SMA Boarding School');
    } catch (e) {
      console.error('Error seeding data:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    setLoading(true);
    try {
      setStudents([]);
      setObservations([]);
      setWeeklyAssessments([]);
      setMonthlyAssessments([]);
      setInterventions([]);
      setStrengths([]);
      setParentContacts([]);
      setAuditLogs([]);

      localStorage.removeItem('jpis_local_students');
      localStorage.removeItem('jpis_local_observations');
      localStorage.removeItem('jpis_local_weekly_assessments');
      localStorage.removeItem('jpis_local_monthly_assessments');
      localStorage.removeItem('jpis_local_interventions');
      localStorage.removeItem('jpis_local_strengths');
      localStorage.removeItem('jpis_local_parent_contacts');
      localStorage.removeItem('jpis_local_audit_logs');

      await logAudit('BERSIHKAN_DATA', 'Database', 'all', 'Mengosongkan semua data lokal dan database');
    } finally {
      setLoading(false);
    }
  };

  return (
    <JPISDataContext.Provider
      value={{
        students,
        observations,
        weeklyAssessments,
        monthlyAssessments,
        interventions,
        strengths,
        parentContacts,
        settings,
        auditLogs,
        loading,
        syncStatus,
        addStudent,
        updateStudent,
        deleteStudent,
        addObservation,
        updateObservation,
        deleteObservation,
        saveWeeklyAssessment,
        saveMonthlyAssessment,
        deleteAssessment,
        addIntervention,
        updateIntervention,
        deleteIntervention,
        addStrength,
        updateStrength,
        deleteStrength,
        addParentContact,
        updateParentContact,
        deleteParentContact,
        updateAppSettings,
        seedSampleClassData,
        clearAllData,
        logAudit,
      }}
    >
      {children}
    </JPISDataContext.Provider>
  );
};

export const useJPISData = () => {
  const context = useContext(JPISDataContext);
  if (!context) {
    throw new Error('useJPISData must be used within a JPISDataProvider');
  }
  return context;
};
