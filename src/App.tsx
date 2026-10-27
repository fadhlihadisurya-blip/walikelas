/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { JPISDataProvider, useJPISData } from './context/JPISDataContext';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentListView } from './components/students/StudentListView';
import { DailyJournalView } from './components/journal/DailyJournalView';
import { WeeklyEvaluationView } from './components/evaluations/WeeklyEvaluationView';
import { MonthlyEvaluationView } from './components/evaluations/MonthlyEvaluationView';
import { InterventionsView } from './components/interventions/InterventionsView';
import { StrengthsView } from './components/strengths/StrengthsView';
import { ParentCommunicationView } from './components/parent/ParentCommunicationView';
import { SemesterReportView } from './components/reports/SemesterReportView';
import { SettingsView } from './components/settings/SettingsView';
import { NewJournalModal } from './components/journal/NewJournalModal';
import { SetupFirebaseModal } from './components/auth/SetupFirebaseModal';
import { LoginModal } from './components/auth/LoginModal';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [newJournalModalOpen, setNewJournalModalOpen] = useState(false);
  const [selectedStudentForJournal, setSelectedStudentForJournal] = useState<string | undefined>(undefined);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<string | null>(null);
  const [firebaseModalOpen, setFirebaseModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleOpenJournalWithStudent = (studentId?: string) => {
    setSelectedStudentForJournal(studentId);
    setNewJournalModalOpen(true);
  };

  const handleSelectStudentProfile = (studentId: string) => {
    setSelectedStudentForProfile(studentId);
    setActiveTab('students');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Container shifted on Desktop */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Sticky Header */}
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenNewJournalModal={() => handleOpenJournalWithStudent()}
          onOpenFirebaseModal={() => setFirebaseModalOpen(true)}
          onOpenLoginModal={() => setLoginModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateTab={setActiveTab}
              onSelectStudentProfile={handleSelectStudentProfile}
              onOpenNewJournalModal={handleOpenJournalWithStudent}
            />
          )}

          {activeTab === 'students' && (
            <StudentListView
              onOpenNewJournal={handleOpenJournalWithStudent}
              selectedStudentId={selectedStudentForProfile}
              onClearSelectedStudent={() => setSelectedStudentForProfile(null)}
            />
          )}

          {activeTab === 'journal' && <DailyJournalView />}

          {activeTab === 'weekly_eval' && <WeeklyEvaluationView />}

          {activeTab === 'monthly_eval' && <MonthlyEvaluationView />}

          {activeTab === 'interventions' && <InterventionsView />}

          {activeTab === 'strengths' && <StrengthsView />}

          {activeTab === 'parent_contact' && <ParentCommunicationView />}

          {activeTab === 'semester_report' && <SemesterReportView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <NewJournalModal
        isOpen={newJournalModalOpen}
        onClose={() => {
          setNewJournalModalOpen(false);
          setSelectedStudentForJournal(undefined);
        }}
        preselectedStudentId={selectedStudentForJournal}
      />

      <SetupFirebaseModal
        isOpen={firebaseModalOpen}
        onClose={() => setFirebaseModalOpen(false)}
      />

      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <JPISDataProvider>
        <AppContent />
      </JPISDataProvider>
    </AuthProvider>
  );
}
