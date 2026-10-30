import React, { useState } from 'react';
import { RoleSidebar } from '../common/RoleSidebar';
import { TopHeader } from '../common/TopHeader';
import { HelpSupportModal } from '../common/HelpSupportModal';
import { UserProfile, FdrInstrument } from '../../types';

interface DashboardLayoutProps {
  currentUser: UserProfile;
  roles: UserProfile[];
  onSwitchRole: (userId: string) => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  unreadNotificationsCount: number;
  openDiscrepanciesCount: number;
  pendingVerificationsCount: number;
  awaitingRegionalReviewCount?: number;
  onOpenNotifications: () => void;
  onOpenAssistant: () => void;
  onOpenNewFdrModal: () => void;
  onOpenVerifyModal: () => void;
  onLogout: () => void;
  onViewLandingPage: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentUser,
  roles,
  onSwitchRole,
  activeTab,
  onSelectTab,
  unreadNotificationsCount,
  openDiscrepanciesCount,
  pendingVerificationsCount,
  awaitingRegionalReviewCount = 0,
  onOpenNotifications,
  onOpenAssistant,
  onOpenNewFdrModal,
  onOpenVerifyModal,
  onLogout,
  onViewLandingPage,
  searchQuery,
  onSearchChange,
  children
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#EEF0F3] text-[#24262B] flex font-sans">
      
      {/* 1. Persistent Left Sidebar Navigation */}
      <RoleSidebar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenNewFdrModal={onOpenNewFdrModal}
        onOpenAssistant={onOpenAssistant}
        onOpenNotifications={onOpenNotifications}
        onOpenVerifyModal={onOpenVerifyModal}
        onOpenHelpSupport={() => setHelpModalOpen(true)}
        onLogout={onLogout}
        unreadNotificationsCount={unreadNotificationsCount}
        openDiscrepanciesCount={openDiscrepanciesCount}
        pendingVerificationsCount={pendingVerificationsCount}
        awaitingRegionalReviewCount={awaitingRegionalReviewCount}
      />

      {/* 2. Main Wrapper with Left Margin for Sidebar */}
      <div 
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-[256px]'
        }`}
      >
        {/* 3. Compact Charcoal Top Header (No main modules in top header) */}
        <TopHeader
          currentUser={currentUser}
          roles={roles}
          onSwitchRole={onSwitchRole}
          activeTab={activeTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          unreadNotificationsCount={unreadNotificationsCount}
          onOpenNotifications={onOpenNotifications}
          onOpenAssistant={onOpenAssistant}
          onOpenHelpSupport={() => setHelpModalOpen(true)}
          onLogout={onLogout}
          onViewLandingPage={onViewLandingPage}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />

        {/* 4. Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1600px] w-full mx-auto space-y-6">
          {children}
        </main>

        {/* 5. Clean Enterprise Footer */}
        <footer className="bg-white border-t border-[#E5E7EB] py-4 px-6 text-xs text-[#737985] text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
          <div>
            All India Council for Technical Education (AICTE) • Regulation Bureau • Problem Statement ID: 26265
          </div>
          <div className="text-[11px] text-gray-500">
            Smart Automation FDR Portal • AICTE Approval Process Handbook (Clause 1.4 & 7.1)
          </div>
        </footer>
      </div>

      {/* Help & Support Guidance Modal */}
      <HelpSupportModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </div>
  );
};
