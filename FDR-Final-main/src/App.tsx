import React, { useState, useEffect, useMemo } from 'react';
import { 
  FdrInstrument, 
  UserProfile, 
  Institution, 
  PortalKpiSummary, 
  AuditEvent, 
  ExpiryReminderNotification,
  UserRole 
} from './types';
import { api } from './services/api';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { HqDashboard } from './components/dashboard/HqDashboard';
import { InstitutionDashboard } from './components/dashboard/InstitutionDashboard';
import { BankRepresentativeDashboard } from './components/dashboard/BankRepresentativeDashboard';
import { ScrutinyOfficerDashboard } from './components/dashboard/ScrutinyOfficerDashboard';
import { RegionalOfficerDashboard } from './components/dashboard/RegionalOfficerDashboard';
import { ReleaseOfficerDashboard } from './components/dashboard/ReleaseOfficerDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { MyInstitutionView } from './components/dashboard/MyInstitutionView';
import { FdrRepositoryTable } from './components/fdr/FdrRepositoryTable';
import { ExpiryCalendarView } from './components/fdr/ExpiryCalendarView';
import { NewFdrModal } from './components/fdr/NewFdrModal';
import { FdrDetailModal } from './components/fdr/FdrDetailModal';
import { RenewalModal } from './components/fdr/RenewalModal';
import { ReleaseRefundModal } from './components/fdr/ReleaseRefundModal';
import { BankVerifyModal } from './components/verification/BankVerifyModal';
import { AiAssistantDrawer } from './components/assistant/AiAssistantDrawer';
import { FloatingAiAssistant } from './components/assistant/FloatingAiAssistant';
import { NotificationsModal } from './components/notifications/NotificationsModal';
import { ReportsView } from './components/reports/ReportsView';
import { AuditTrailView } from './components/audit/AuditTrailView';
import { LandingPage } from './components/landing/LandingPage';
import { AccessPortalView } from './components/auth/AccessPortalView';
import { RoleLoginPage } from './components/auth/RoleLoginPage';
import { LoginModal } from './components/auth/LoginModal';
import { ForgotPasswordModal } from './components/auth/ForgotPasswordModal';
import { PolicyModal } from './components/auth/PolicyModals';
import { HelpSupportModal } from './components/common/HelpSupportModal';
import { ExaminationPage } from './components/scrutiny/ExaminationPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { INITIAL_USERS } from './mock/initialData';

export default function App() {
  // Global User and Role state
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);
  const [roles, setRoles] = useState<UserProfile[]>(INITIAL_USERS);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Navigation Journey: 'landing' -> 'access_portal' -> 'login' -> 'dashboard'
  const [viewMode, setViewMode] = useState<'landing' | 'access_portal' | 'login' | 'dashboard'>('landing');
  const [selectedRole, setSelectedRole] = useState<UserRole>('institution');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Auth Modals & Secondary Dialogs
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [selectedLoginRole, setSelectedLoginRole] = useState<UserRole | 'assistant' | null>(null);
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const [policyModalType, setPolicyModalType] = useState<'privacy' | 'terms' | null>(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Data state
  const [fdrs, setFdrs] = useState<FdrInstrument[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [kpis, setKpis] = useState<PortalKpiSummary>({
    totalFdrCount: 0,
    totalDepositValue: 0,
    activeFdrCount: 0,
    verifiedCount: 0,
    pendingVerificationCount: 0,
    discrepancyCount: 0,
    expiringIn90DaysCount: 0,
    maturedCount: 0,
    pendingScrutinyCount: 0,
    releaseRequestsCount: 0,
    avgTurnaroundDays: 4.2
  });
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [notifications, setNotifications] = useState<ExpiryReminderNotification[]>([]);
  const [settings, setSettings] = useState<any>({});
  
  // Modals & Drawers state
  const [newFdrModalOpen, setNewFdrModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedFdr, setSelectedFdr] = useState<FdrInstrument | null>(null);
  const [examiningFdrId, setExaminingFdrId] = useState<string | null>(null);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [directVerifyToken, setDirectVerifyToken] = useState<string | undefined>(undefined);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);

  // Loading & Background Jobs
  const [loading, setLoading] = useState(true);
  const [expiryScanRunning, setExpiryScanRunning] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load
  const loadInitialData = async () => {
    try {
      const [u, r, fList, insts, repSummary, logs, notifs, cfg] = await Promise.all([
        api.getCurrentUser(),
        api.getAllRoles(),
        api.getFdrs(),
        api.getInstitutions(),
        api.getReportsSummary(),
        api.getAuditLogs(),
        api.getNotifications(),
        api.getSettings()
      ]);

      setCurrentUser(u);
      setRoles(r);
      setFdrs(fList.fdrs);
      setInstitutions(insts);
      setKpis(repSummary.kpis);
      setAuditLogs(logs);
      setNotifications(notifs);
      setSettings(cfg);
    } catch (err: any) {
      console.error('Failed to load portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Check initial URL parameters once on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    const idParam = params.get('id');

    if (tabParam === 'examine' && idParam) {
      setExaminingFdrId(idParam);
      setActiveTab('examine');
    }
  }, []);

  // Browser navigation sync for examination page & back/forward history
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const idParam = params.get('id');

      if (tabParam === 'examine' && idParam) {
        setExaminingFdrId(idParam);
        setActiveTab('examine');
      } else {
        setExaminingFdrId(null);
        setActiveTab(prev => (prev === 'examine' ? 'dashboard' : prev));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Open role login modal
  const handleOpenRoleLogin = (role: UserRole | 'assistant') => {
    setSelectedLoginRole(role);
    setLoginModalOpen(true);
  };

  // Handle successful login
  const handleLoginSuccess = async (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setViewMode('dashboard');
    setActiveTab('dashboard');

    // Refresh scoped FDR list for this user
    try {
      const fList = await api.getFdrs();
      setFdrs(fList.fdrs);
    } catch (err) {
      console.error(err);
    }

    showToast(`Authenticated as ${user.name} (${user.designation})`);

    // If logging in through the AI Assistant card, open the assistant directly
    if (selectedLoginRole === 'assistant') {
      setTimeout(() => setAssistantOpen(true), 300);
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error(err);
    }
    setIsAuthenticated(false);
    setViewMode('landing');
    showToast('Signed out of AICTE Security Deposit Portal');
  };

  // Role switching within authenticated dashboard (for evaluators)
  const handleSwitchRole = async (userId: string) => {
    setLoading(true);
    try {
      const updated = await api.switchRole(userId);
      setCurrentUser(updated);
      setActiveTab('dashboard');
      // Refresh fdrs according to new role scope
      const fList = await api.getFdrs();
      setFdrs(fList.fdrs);
      showToast(`Switched workspace to ${updated.name} (${updated.role})`);
    } catch (err: any) {
      showToast(err.message || 'Error switching role');
    } finally {
      setLoading(false);
    }
  };

  // Background expiry scan
  const handleRunExpiryScan = async () => {
    setExpiryScanRunning(true);
    try {
      const result = await api.runExpiryCheck();
      const [fList, notifs, repSummary, logs] = await Promise.all([
        api.getFdrs(),
        api.getNotifications(),
        api.getReportsSummary(),
        api.getAuditLogs()
      ]);
      setFdrs(fList.fdrs);
      setNotifications(notifs);
      setKpis(repSummary.kpis);
      setAuditLogs(logs);
      showToast(`Expiry scan complete: ${result.remindersGenerated} new alerts generated`);
    } catch (err: any) {
      showToast('Expiry scan failed');
    } finally {
      setExpiryScanRunning(false);
    }
  };

  const handleExportCsv = () => {
    window.location.href = api.getExportCsvUrl();
  };

  // FDR Action Handlers
  const handleViewFdr = (fdr: FdrInstrument) => {
    setSelectedFdr(fdr);
    setDetailModalOpen(true);
  };

  const handleSelectTab = (tab: string) => {
    if (tab !== 'examine') {
      setExaminingFdrId(null);
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('tab') || url.searchParams.has('id')) {
          url.searchParams.delete('tab');
          url.searchParams.delete('id');
          window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
        }
      } catch (e) {
        console.error(e);
      }
    }
    setActiveTab(tab);
  };

  const handleExamineFdr = (fdrId: string, fdr?: FdrInstrument) => {
    if (!fdrId) return;
    setExaminingFdrId(fdrId);
    const targetFdr = fdr || fdrs.find(f => f.id === fdrId || f.fdrNumber.toLowerCase() === fdrId.toLowerCase());
    if (targetFdr) {
      setSelectedFdr(targetFdr);
    }
    setActiveTab('examine');
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', 'examine');
      url.searchParams.set('id', fdrId);
      window.history.pushState({ tab: 'examine', fdrId }, '', url.pathname + '?' + url.searchParams.toString());
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenVerifyModal = (fdr?: FdrInstrument) => {
    if (fdr) {
      setSelectedFdr(fdr);
    } else {
      setSelectedFdr(null);
    }
    setDirectVerifyToken(undefined);
    setVerifyModalOpen(true);
  };

  const handleOpenTokenDirectVerify = (token: string) => {
    setDirectVerifyToken(token);
    setSelectedFdr(null);
    setVerifyModalOpen(true);
  };

  const handleOpenRenewModal = (fdr: FdrInstrument) => {
    setSelectedFdr(fdr);
    setRenewModalOpen(true);
  };

  const handleOpenReleaseModal = (fdr: FdrInstrument) => {
    setSelectedFdr(fdr);
    setReleaseModalOpen(true);
  };

  const refreshAllData = async () => {
    const [fList, repSummary, logs, notifs, insts] = await Promise.all([
      api.getFdrs(),
      api.getReportsSummary(),
      api.getAuditLogs(),
      api.getNotifications(),
      api.getInstitutions()
    ]);
    setFdrs(fList.fdrs);
    setKpis(repSummary.kpis);
    setAuditLogs(logs);
    setNotifications(notifs);
    setInstitutions(insts);

    // Keep selectedFdr in sync with authoritative record
    setSelectedFdr(prev => {
      if (!prev) return null;
      return fList.fdrs.find(f => f.id === prev.id || f.fdrNumber.toLowerCase() === prev.fdrNumber.toLowerCase()) || prev;
    });
  };

  const handleReviewRelease = async (fdrId: string, decision: 'APPROVE' | 'REQUEST_DOCS' | 'DISCHARGE' | 'REJECT', notes?: string) => {
    await api.reviewReleaseRequest(fdrId, decision, notes);
    await refreshAllData();
    showToast(`Release application updated to ${decision}`);
  };

  // Filter FDRs by global search query if present
  const searchedFdrs = useMemo(() => {
    if (!searchQuery.trim()) return fdrs;
    const q = searchQuery.toLowerCase().trim();
    return fdrs.filter(f => 
      f.fdrNumber.toLowerCase().includes(q) ||
      f.institutionName.toLowerCase().includes(q) ||
      f.bankName.toLowerCase().includes(q) ||
      f.region.toLowerCase().includes(q) ||
      f.branchName.toLowerCase().includes(q) ||
      f.lifecycleStatus.toLowerCase().includes(q) ||
      f.verificationStatus.toLowerCase().includes(q)
    );
  }, [fdrs, searchQuery]);

  // Counts for sidebar badges
  const unreadCount = notifications.filter(n => n.status === 'DELIVERED').length;
  const openDiscrepanciesCount = fdrs.filter(f => f.discrepancies.some(d => d.status === 'OPEN')).length;
  const pendingVerificationsCount = fdrs.filter(f => f.verificationStatus === 'PENDING_BANK_VERIFICATION').length;
  const awaitingRegionalReviewCount = fdrs.filter(f => f.caseStatus === 'AWAITING_COMPETENT_AUTHORITY').length;

  // Institution object if current user is an institution
  const currentInstitution = institutions.find(i => i.id === currentUser.institutionId) || institutions[0];

  return (
    <div className="min-h-screen bg-[#EEF0F3] text-[#24262B] flex flex-col font-sans">
      
      {/* View Mode 1: Public Landing Page */}
      {viewMode === 'landing' && (
        <LandingPage
          onOpenAccessPortal={() => setViewMode('access_portal')}
          onSelectRoleLogin={(role) => {
            setSelectedRole(role);
            setViewMode('login');
          }}
          onOpenAssistant={() => setAssistantOpen(true)}
          onInstitutionRegistered={refreshAllData}
          onOpenPrivacyPolicy={() => setPolicyModalType('privacy')}
          onOpenTermsOfUse={() => setPolicyModalType('terms')}
        />
      )}

      {/* View Mode 2: Access Portal (Select 1 of 7 Dashboard Roles) */}
      {viewMode === 'access_portal' && (
        <AccessPortalView
          onSelectRole={(role) => {
            setSelectedRole(role);
            setViewMode('login');
          }}
          onBackToLanding={() => setViewMode('landing')}
          onOpenHelpModal={() => setHelpModalOpen(true)}
        />
      )}

      {/* View Mode 3: Role-Specific Authentication Screen */}
      {viewMode === 'login' && (
        <RoleLoginPage
          selectedRole={selectedRole}
          onLoginSuccess={handleLoginSuccess}
          onBackToDashboardSelection={() => setViewMode('access_portal')}
          onOpenForgotPassword={() => setForgotPasswordModalOpen(true)}
        />
      )}

      {/* View Mode 4: Authenticated Regulatory Workspace with Persistent Left Sidebar & Charcoal Header */}
      {viewMode === 'dashboard' && (
        <DashboardLayout
          currentUser={currentUser}
          roles={roles}
          onSwitchRole={handleSwitchRole}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          unreadNotificationsCount={unreadCount}
          openDiscrepanciesCount={openDiscrepanciesCount}
          pendingVerificationsCount={pendingVerificationsCount}
          awaitingRegionalReviewCount={awaitingRegionalReviewCount}
          onOpenNotifications={() => setNotificationsModalOpen(true)}
          onOpenAssistant={() => setAssistantOpen(true)}
          onOpenNewFdrModal={() => setNewFdrModalOpen(true)}
          onOpenVerifyModal={() => handleOpenVerifyModal()}
          onLogout={handleLogout}
          onViewLandingPage={() => setViewMode('landing')}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        >
          <ErrorBoundary fallbackTitle="Unable to load this workspace view" onReset={refreshAllData}>
            {/* ---------------------------------------------------- */}
            {/* Dynamic Tab Views based on Role and Selection        */}
            {/* ---------------------------------------------------- */}

          {/* 1. Main Dashboard Views by Role */}
          {activeTab === 'dashboard' && (
            <>
              {currentUser.role === 'headquarters' && (
                <HqDashboard
                  currentUser={currentUser}
                  fdrs={searchedFdrs}
                  kpis={kpis}
                  onOpenNewFdr={() => setNewFdrModalOpen(true)}
                  onViewFdr={handleViewFdr}
                  onOpenVerifyModal={handleOpenVerifyModal}
                  onOpenAssistant={() => setAssistantOpen(true)}
                  onRunExpiryCheck={handleRunExpiryScan}
                  onExportCsv={handleExportCsv}
                  expiryScanRunning={expiryScanRunning}
                  onRefreshAll={refreshAllData}
                  showToast={showToast}
                  onReviewRelease={handleReviewRelease}
                  onOpenReleaseModal={handleOpenReleaseModal}
                />
              )}

              {currentUser.role === 'institution' && (
                <InstitutionDashboard
                  currentUser={currentUser}
                  fdrs={searchedFdrs}
                  onOpenNewFdr={() => setNewFdrModalOpen(true)}
                  onOpenRenewModal={handleOpenRenewModal}
                  onOpenReleaseModal={handleOpenReleaseModal}
                  onViewFdr={handleViewFdr}
                  onOpenAssistant={() => setAssistantOpen(true)}
                />
              )}

              {currentUser.role === 'bank_representative' && (
                <BankRepresentativeDashboard
                  currentUser={currentUser}
                  fdrs={searchedFdrs}
                  onOpenVerifyModal={handleOpenVerifyModal}
                  onOpenTokenDirectVerify={handleOpenTokenDirectVerify}
                />
              )}

              {currentUser.role === 'scrutiny_officer' && (
                <ScrutinyOfficerDashboard
                  currentUser={currentUser}
                  fdrs={searchedFdrs}
                  onViewFdr={handleViewFdr}
                  onExamineFdr={handleExamineFdr}
                  onOpenAssistant={() => setAssistantOpen(true)}
                />
              )}

              {currentUser.role === 'regional_officer' && (
                <RegionalOfficerDashboard
                  currentUser={currentUser}
                  fdrs={searchedFdrs}
                  institutions={institutions}
                  onViewFdr={handleViewFdr}
                  onExportCsv={handleExportCsv}
                  onRefreshAll={refreshAllData}
                  showToast={showToast}
                  initialTab="queue"
                />
              )}

              {currentUser.role === 'release_officer' && (
                <ReleaseOfficerDashboard
                  currentUser={currentUser}
                  fdrs={searchedFdrs}
                  onReviewRelease={handleReviewRelease}
                  onViewFdr={handleViewFdr}
                />
              )}

              {currentUser.role === 'admin' && (
                <AdminDashboard
                  currentUser={currentUser}
                  users={roles}
                  auditLogs={auditLogs}
                  settings={settings}
                  onUpdateSettings={async (newCfg) => {
                    await api.updateSettings(newCfg);
                    setSettings(newCfg);
                    showToast('System configuration saved successfully');
                  }}
                  onRunExpiryScan={handleRunExpiryScan}
                  expiryScanRunning={expiryScanRunning}
                />
              )}
            </>
          )}

          {/* Regional Review Queue, Registered Deposits, Regional Institutions */}
          {(activeTab === 'regional_review_queue' || activeTab === 'registered_deposits' || activeTab === 'regional_institutions') && (
            <RegionalOfficerDashboard
              currentUser={currentUser}
              fdrs={searchedFdrs}
              institutions={institutions}
              onViewFdr={handleViewFdr}
              onExportCsv={handleExportCsv}
              onRefreshAll={refreshAllData}
              showToast={showToast}
              initialTab={activeTab === 'regional_review_queue' ? 'queue' : activeTab === 'registered_deposits' ? 'registered' : 'all'}
            />
          )}

          {/* Regulatory Document Examination Workspace (Scrutiny Officer) */}
          {activeTab === 'examine' && (
            <ExaminationPage
              fdrId={examiningFdrId}
              initialFdr={
                (selectedFdr && (selectedFdr.id === examiningFdrId || selectedFdr.fdrNumber.toLowerCase() === (examiningFdrId || '').toLowerCase()))
                  ? selectedFdr
                  : fdrs.find(f => f.id === examiningFdrId || f.fdrNumber.toLowerCase() === (examiningFdrId || '').toLowerCase()) || null
              }
              currentUser={currentUser}
              onBack={() => {
                setActiveTab('dashboard');
                setExaminingFdrId(null);
                try {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('tab');
                  url.searchParams.delete('id');
                  window.history.pushState({}, '', url.pathname + (url.search ? url.search : ''));
                } catch (e) {
                  console.error(e);
                }
              }}
              onRefreshAll={refreshAllData}
              onOpenVerifyModal={handleOpenVerifyModal}
              onOpenRenewModal={handleOpenRenewModal}
              onOpenReleaseModal={handleOpenReleaseModal}
              showToast={showToast}
              onSwitchToRegionalQueue={async (fdr) => {
                // If not currently logged in as Regional Officer, switch role
                if (currentUser.role !== 'regional_officer') {
                  const roUser = roles.find(r => r.role === 'regional_officer');
                  if (roUser) {
                    await handleSwitchRole(roUser.id);
                  }
                }
                setActiveTab('regional_review_queue');
                showToast(`Viewing ${fdr.fdrNumber} in Regional Review & Registration Queue`);
              }}
            />
          )}

          {/* 2. My Institution View (Institution Role) */}
          {activeTab === 'my_institution' && (
            <MyInstitutionView
              currentUser={currentUser}
              institution={currentInstitution}
              fdrs={searchedFdrs}
              onOpenNewFdr={() => setNewFdrModalOpen(true)}
              onViewFdr={handleViewFdr}
            />
          )}

          {/* 3. FDR Repository (Complete or Filtered by Role) */}
          {(activeTab === 'repository' || activeTab === 'central_repository' || activeTab === 'my_submissions' || activeTab === 'cases') && (
            <FdrRepositoryTable
              fdrs={searchedFdrs}
              currentUser={currentUser}
              onViewFdr={handleViewFdr}
              onExamineFdr={handleExamineFdr}
              onOpenNewFdr={() => setNewFdrModalOpen(true)}
              onOpenVerifyModal={handleOpenVerifyModal}
              onOpenRenewModal={handleOpenRenewModal}
              onOpenReleaseModal={handleOpenReleaseModal}
              onExportCsv={handleExportCsv}
            />
          )}

          {/* 4. Verification Views (Bank or Scrutiny) */}
          {(activeTab === 'verification_status' || activeTab === 'verifications' || activeTab === 'verify_requests' || activeTab === 'bank_verifications') && (
            <FdrRepositoryTable
              fdrs={searchedFdrs.filter(f => f.verificationStatus === 'PENDING_BANK_VERIFICATION' || f.verificationStatus === 'CONFIRMED' || f.verificationStatus === 'DISCREPANCY_FOUND')}
              currentUser={currentUser}
              onViewFdr={handleViewFdr}
              onExamineFdr={handleExamineFdr}
              onOpenNewFdr={() => setNewFdrModalOpen(true)}
              onOpenVerifyModal={handleOpenVerifyModal}
              onOpenRenewModal={handleOpenRenewModal}
              onOpenReleaseModal={handleOpenReleaseModal}
              onExportCsv={handleExportCsv}
            />
          )}

          {activeTab === 'pending_verifications' && (
            <FdrRepositoryTable
              fdrs={searchedFdrs.filter(f => f.verificationStatus === 'PENDING_BANK_VERIFICATION')}
              currentUser={currentUser}
              onViewFdr={handleViewFdr}
              onExamineFdr={handleExamineFdr}
              onOpenNewFdr={() => setNewFdrModalOpen(true)}
              onOpenVerifyModal={handleOpenVerifyModal}
              onOpenRenewModal={handleOpenRenewModal}
              onOpenReleaseModal={handleOpenReleaseModal}
              onExportCsv={handleExportCsv}
            />
          )}

          {activeTab === 'completed_verifications' && (
            <FdrRepositoryTable
              fdrs={searchedFdrs.filter(f => f.verificationStatus === 'CONFIRMED')}
              currentUser={currentUser}
              onViewFdr={handleViewFdr}
              onExamineFdr={handleExamineFdr}
              onOpenNewFdr={() => setNewFdrModalOpen(true)}
              onOpenVerifyModal={handleOpenVerifyModal}
              onOpenRenewModal={handleOpenRenewModal}
              onOpenReleaseModal={handleOpenReleaseModal}
              onExportCsv={handleExportCsv}
            />
          )}

          {/* 5. Scrutiny Workflow Specific Tabs */}
          {activeTab === 'new_submissions' && (
            <FdrRepositoryTable
              fdrs={searchedFdrs.filter(f => f.caseStatus === 'SUBMITTED' || f.caseStatus === 'UNDER_SCRUTINY')}
              currentUser={currentUser}
              onViewFdr={handleViewFdr}
              onExamineFdr={handleExamineFdr}
              onOpenNewFdr={() => setNewFdrModalOpen(true)}
              onOpenVerifyModal={handleOpenVerifyModal}
              onOpenRenewModal={handleOpenRenewModal}
              onOpenReleaseModal={handleOpenReleaseModal}
              onExportCsv={handleExportCsv}
            />
          )}

          {activeTab === 'pending_scrutiny' && (
            <ScrutinyOfficerDashboard
              currentUser={currentUser}
              fdrs={searchedFdrs}
              onViewFdr={handleViewFdr}
              onExamineFdr={handleExamineFdr}
              onOpenAssistant={() => setAssistantOpen(true)}
            />
          )}

          {activeTab === 'correction_requests' && (
            <FdrRepositoryTable
              fdrs={searchedFdrs.filter(f => f.caseStatus === 'AWAITING_INSTITUTION_CORRECTION')}
              currentUser={currentUser}
              onViewFdr={handleViewFdr}
              onExamineFdr={handleExamineFdr}
              onOpenNewFdr={() => setNewFdrModalOpen(true)}
              onOpenVerifyModal={handleOpenVerifyModal}
              onOpenRenewModal={handleOpenRenewModal}
              onOpenReleaseModal={handleOpenReleaseModal}
              onExportCsv={handleExportCsv}
            />
          )}

          {activeTab === 'compliance_cases' && (
            <FdrRepositoryTable
              fdrs={searchedFdrs.filter(f => f.caseStatus === 'AWAITING_ADDITIONAL_EVIDENCE' || (f.discrepancies || []).length > 0)}
              currentUser={currentUser}
              onViewFdr={handleViewFdr}
              onExamineFdr={handleExamineFdr}
              onOpenNewFdr={() => setNewFdrModalOpen(true)}
              onOpenVerifyModal={handleOpenVerifyModal}
              onOpenRenewModal={handleOpenRenewModal}
              onOpenReleaseModal={handleOpenReleaseModal}
              onExportCsv={handleExportCsv}
            />
          )}

          {/* 6. Discrepancies & Flagged Mismatches */}
          {(activeTab === 'discrepancies' || activeTab === 'compliance_monitoring') && (
            <FdrRepositoryTable
              fdrs={searchedFdrs.filter(f => f.discrepancies.some(d => d.status === 'OPEN'))}
              currentUser={currentUser}
              onViewFdr={handleViewFdr}
              onOpenNewFdr={() => setNewFdrModalOpen(true)}
              onOpenVerifyModal={handleOpenVerifyModal}
              onOpenRenewModal={handleOpenRenewModal}
              onOpenReleaseModal={handleOpenReleaseModal}
              onExportCsv={handleExportCsv}
            />
          )}

          {/* 7. Renewals & Deposit Replacements */}
          {(activeTab === 'renewals' || activeTab === 'overdue') && (
            <FdrRepositoryTable
              fdrs={searchedFdrs.filter(f => f.lifecycleStatus === 'EXPIRING_SOON' || f.lifecycleStatus === 'MATURED' || f.lifecycleStatus === 'RENEWED_REPLACED')}
              currentUser={currentUser}
              onViewFdr={handleViewFdr}
              onOpenNewFdr={() => setNewFdrModalOpen(true)}
              onOpenVerifyModal={handleOpenVerifyModal}
              onOpenRenewModal={handleOpenRenewModal}
              onOpenReleaseModal={handleOpenReleaseModal}
              onExportCsv={handleExportCsv}
            />
          )}

          {/* 8. Expiry Calendar / Monitoring */}
          {(activeTab === 'expiry_calendar' || activeTab === 'calendar' || activeTab === 'expiring' || activeTab === 'expiry_monitoring') && (
            <ExpiryCalendarView
              fdrs={searchedFdrs}
              currentUser={currentUser}
              onViewFdr={handleViewFdr}
              onOpenRenewModal={handleOpenRenewModal}
              onOpenReleaseModal={handleOpenReleaseModal}
              onRunExpiryScan={handleRunExpiryScan}
              expiryScanRunning={expiryScanRunning}
            />
          )}

          {/* 9. Release / Refund Workflows */}
          {(activeTab === 'release_requests' || activeTab === 'release_cases' || activeTab === 'release_overview' || activeTab === 'new_requests' || activeTab === 'pending_docs' || activeTab === 'eligibility' || activeTab === 'awaiting_approval' || activeTab === 'approved' || activeTab === 'release_tracking' || activeTab === 'rejected' || activeTab === 'completed') && (
            <ReleaseOfficerDashboard
              currentUser={currentUser}
              fdrs={searchedFdrs}
              onReviewRelease={handleReviewRelease}
              onViewFdr={handleViewFdr}
            />
          )}

          {/* 10. Regional Priority & Escalations */}
          {(activeTab === 'case_assignments' || activeTab === 'escalations') && (
            <FdrRepositoryTable
              fdrs={searchedFdrs.filter(f => f.discrepancies.length > 0 || f.lifecycleStatus === 'EXPIRING_SOON')}
              currentUser={currentUser}
              onViewFdr={handleViewFdr}
              onOpenNewFdr={() => setNewFdrModalOpen(true)}
              onOpenVerifyModal={handleOpenVerifyModal}
              onOpenRenewModal={handleOpenRenewModal}
              onOpenReleaseModal={handleOpenReleaseModal}
              onExportCsv={handleExportCsv}
            />
          )}

          {/* 11. Reports & Analytics */}
          {(activeTab === 'reports' || activeTab === 'regional_performance') && (
            <ReportsView
              fdrs={searchedFdrs}
              kpis={kpis}
              onExportCsv={handleExportCsv}
            />
          )}

          {/* 12. Audit Trail & Verification Logs */}
          {(activeTab === 'audit' || activeTab === 'verification_history') && (
            <AuditTrailView auditLogs={auditLogs} />
          )}

          {/* 13. System Administration & Configuration */}
          {(activeTab === 'users' || 
            activeTab === 'roles_permissions' || 
            activeTab === 'institution_accounts' || 
            activeTab === 'bank_accounts' || 
            activeTab === 'workflow_config' || 
            activeTab === 'notification_settings' || 
            activeTab === 'verification_settings' || 
            activeTab === 'integration_settings' || 
            activeTab === 'scheduled_jobs' || 
            activeTab === 'security_events' || 
            activeTab === 'system_config' || 
            activeTab === 'settings') && (
            <AdminDashboard
              currentUser={currentUser}
              users={roles}
              auditLogs={auditLogs}
              settings={settings}
              onUpdateSettings={async (newCfg) => {
                await api.updateSettings(newCfg);
                setSettings(newCfg);
                showToast('System configuration saved successfully');
              }}
              onRunExpiryScan={handleRunExpiryScan}
              expiryScanRunning={expiryScanRunning}
            />
          )}

          {/* 14. Institutions Directory */}
          {activeTab === 'institutions' && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="font-semibold text-base text-[#24262B]">Technical Institutions Master Registry</h3>
                  <p className="text-xs text-[#737985]">Registered engineering, management, and pharmacy colleges with active deposit mandates.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#24262B]">
                  <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-[#737985] uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3">AICTE Permanent ID</th>
                      <th className="px-4 py-3">Institution Name</th>
                      <th className="px-4 py-3">Region & State</th>
                      <th className="px-4 py-3">Approval Status</th>
                      <th className="px-4 py-3">Active FDRs</th>
                      <th className="px-4 py-3">Total Deposit Face Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {institutions.map((inst) => (
                      <tr key={inst.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-semibold text-blue-900">{inst.aictePermanentId}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">{inst.name}</td>
                        <td className="px-4 py-3">{inst.region} ({inst.state})</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {inst.approvalStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold font-tabular">{inst.activeFdrCount}</td>
                        <td className="px-4 py-3 font-semibold font-tabular">₹{inst.totalDepositAmount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          </ErrorBoundary>
        </DashboardLayout>
      )}

      {/* ---------------------------------------------------- */}
      {/* Global Authentication & Policy Modals                */}
      {/* ---------------------------------------------------- */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        targetRole={selectedLoginRole}
        onLoginSuccess={handleLoginSuccess}
        onOpenForgotPassword={() => {
          setLoginModalOpen(false);
          setForgotPasswordModalOpen(true);
        }}
        onOpenRegistration={() => {
          setLoginModalOpen(false);
        }}
        onSelectAnotherRole={() => {
          setLoginModalOpen(false);
          const el = document.getElementById('roles');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <ForgotPasswordModal
        isOpen={forgotPasswordModalOpen}
        onClose={() => setForgotPasswordModalOpen(false)}
        onBackToLogin={() => {
          setForgotPasswordModalOpen(false);
          setLoginModalOpen(true);
        }}
      />

      <PolicyModal
        isOpen={policyModalType !== null}
        onClose={() => setPolicyModalType(null)}
        type={policyModalType || 'privacy'}
      />

      {/* ---------------------------------------------------- */}
      {/* FDR Management Modals & Drawers                      */}
      {/* ---------------------------------------------------- */}
      <NewFdrModal
        isOpen={newFdrModalOpen}
        onClose={() => setNewFdrModalOpen(false)}
        institutions={institutions}
        currentUser={currentUser}
        onFdrCreated={async () => {
          await refreshAllData();
          showToast('FDR instrument submitted successfully. OCR analysis complete.');
        }}
      />

      <FdrDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        fdr={selectedFdr}
        currentUser={currentUser}
        onRefreshFdr={refreshAllData}
        onOpenVerifyModal={handleOpenVerifyModal}
        onOpenRenewModal={handleOpenRenewModal}
        onOpenReleaseModal={handleOpenReleaseModal}
      />

      <RenewalModal
        isOpen={renewModalOpen}
        onClose={() => setRenewModalOpen(false)}
        fdr={selectedFdr}
        currentUser={currentUser}
        onRenewalCompleted={async () => {
          await refreshAllData();
          showToast('Replacement FDR lodged successfully. Predecessor record linked.');
        }}
      />

      <ReleaseRefundModal
        isOpen={releaseModalOpen}
        onClose={() => setReleaseModalOpen(false)}
        fdr={selectedFdr}
        currentUser={currentUser}
        onReleaseSubmitted={async () => {
          await refreshAllData();
          showToast('Release application submitted to Release Officer.');
        }}
      />

      <BankVerifyModal
        isOpen={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        fdr={selectedFdr}
        directToken={directVerifyToken}
        currentUser={currentUser}
        onVerificationCompleted={async () => {
          await refreshAllData();
          showToast('Bank verification recorded and endorsed.');
        }}
      />

      <NotificationsModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
        notifications={notifications}
        currentUser={currentUser}
        onRunExpiryScan={handleRunExpiryScan}
        expiryScanRunning={expiryScanRunning}
        onSelectFdrNumber={(fdrNum) => {
          const match = fdrs.find(f => f.fdrNumber === fdrNum);
          if (match) handleViewFdr(match);
        }}
      />

      {/* Persistent Floating AI Compliance Assistant fixed to bottom-right across entire portal */}
      <FloatingAiAssistant
        currentUser={currentUser}
        isAuthenticated={isAuthenticated}
        currentPageContext={viewMode}
        activeTab={activeTab}
        onNavigateToAccessPortal={() => setViewMode('access_portal')}
        isOpenExternal={assistantOpen}
        onToggleExternal={setAssistantOpen}
      />

      {/* Global Help & Support Regulatory Handbook Modal */}
      <HelpSupportModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#25252A] text-white px-4 py-2.5 rounded-xl shadow-lg border border-gray-700 text-xs flex items-center gap-2 animate-in slide-in-from-bottom duration-150">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
