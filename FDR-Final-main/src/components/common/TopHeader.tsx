import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  ExternalLink,
  UserCheck,
  Bot,
  HelpCircle,
  X
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';

interface TopHeaderProps {
  currentUser: UserProfile;
  roles: UserProfile[];
  onSwitchRole: (userId: string) => void;
  activeTab: string;
  onOpenMobileMenu: () => void;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenAssistant: () => void;
  onOpenHelpSupport: () => void;
  onLogout: () => void;
  onViewLandingPage: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentUser,
  roles,
  onSwitchRole,
  activeTab,
  onOpenMobileMenu,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenAssistant,
  onOpenHelpSupport,
  onLogout,
  onViewLandingPage,
  searchQuery,
  onSearchChange
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Friendly title based on active tab
  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Operational Dashboard';
      case 'examine': return 'Regulatory Document Examination & Decision Workspace';
      case 'repository': return 'FDR Repository & Deposit Registry';
      case 'my_institution': return 'Institution Master Record';
      case 'my_submissions': return 'Submission Tracking';
      case 'verification_status': return 'Bank Verification Status';
      case 'discrepancies': return 'Discrepancy Resolution & Audit';
      case 'renewals': return 'Renewals & Deposit Replacements';
      case 'release_requests': return 'Deposit Release & Refund';
      case 'expiry_calendar': return 'Maturity & Expiry Calendar';
      case 'reports': return 'Compliance Analytics & Reports';
      case 'verify_requests': return 'Bank Verification Requests';
      case 'pending_verifications': return 'Pending Bank Clearances';
      case 'completed_verifications': return 'Confirmed Bank Verifications';
      case 'verification_history': return 'Verification Stamp Log';
      case 'new_submissions': return 'Fresh Application Submissions';
      case 'pending_scrutiny': return 'Regulatory Scrutiny Queue';
      case 'bank_verifications': return 'Bank Verification Confirmation Registry';
      case 'correction_requests': return 'College Correction Submissions';
      case 'compliance_cases': return 'Regulatory Compliance Cases';
      case 'expiry_monitoring': return 'Maturity Surveillance';
      case 'release_cases': return 'Release Scrutiny Pipeline';
      case 'institutions': return 'Institutions Registry';
      case 'expiring': return 'Expiring Guarantee Instruments';
      case 'overdue': return 'Overdue Deposit Cases';
      case 'compliance_monitoring': return 'Regional Compliance Monitoring';
      case 'case_assignments': return 'Regional Scrutiny Assignments';
      case 'escalations': return 'Bureau Escalations';
      case 'verifications': return 'National Bank Verification Overview';
      case 'cases': return 'Pending Administrative Cases';
      case 'release_overview': return 'National Release & Refund Overview';
      case 'regional_performance': return 'Regional Office Performance';
      case 'audit': return 'Regulatory Audit Trail & Event Log';
      case 'new_requests': return 'New Release Requests';
      case 'pending_docs': return 'Release Document Verification';
      case 'eligibility': return '8-Year Lock-in Eligibility Scrutiny';
      case 'awaiting_approval': return 'Release Awaiting Competent Authority';
      case 'approved': return 'Approved Release Discharges';
      case 'release_tracking': return 'Disbursement & Lien Release Tracking';
      case 'rejected': return 'Returned / Deficient Applications';
      case 'completed': return 'Closed & Refunded Instruments';
      case 'users': return 'User Directory & Access Control';
      case 'roles_permissions': return 'Role-Based Access Permissions';
      case 'institution_accounts': return 'College Login Credentials';
      case 'bank_accounts': return 'Bank Partner Portals';
      case 'workflow_config': return 'Workflow & SLA Configuration';
      case 'notification_settings': return 'Notification & Reminder Policies';
      case 'verification_settings': return 'Verification Security Settings';
      case 'integration_settings': return 'System Integrations & APIs';
      case 'scheduled_jobs': return 'Scheduled Jobs & Health Monitor';
      case 'security_events': return 'Security Events & Anomaly Log';
      case 'system_config': return 'System Core Configuration';
      default: return 'Portal Workspace';
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'institution': return { label: 'College', bg: 'bg-indigo-900/60 text-indigo-300' };
      case 'bank_representative': return { label: 'Bank Partner', bg: 'bg-emerald-900/60 text-emerald-300' };
      case 'scrutiny_officer': return { label: 'Scrutiny Officer', bg: 'bg-amber-900/60 text-amber-300' };
      case 'regional_officer': return { label: 'Regional Officer', bg: 'bg-purple-900/60 text-purple-300' };
      case 'headquarters': return { label: 'HQ Bureau', bg: 'bg-blue-900/60 text-blue-300' };
      case 'release_officer': return { label: 'Release Officer', bg: 'bg-rose-900/60 text-rose-300' };
      case 'admin': return { label: 'System Admin', bg: 'bg-cyan-900/60 text-cyan-300' };
      default: return { label: role, bg: 'bg-gray-800 text-gray-300' };
    }
  };

  const roleMeta = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-30 bg-[#25252A] text-white h-[60px] px-4 sm:px-6 flex items-center justify-between gap-4 border-b border-gray-800/80 shadow-xs">
      
      {/* Left: Mobile hamburger & Active Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open navigation sidebar"
          className="lg:hidden p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
            <span className="hidden sm:inline">AICTE Regulation Bureau</span>
            <span className="hidden sm:inline">•</span>
            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${roleMeta.bg}`}>
              {roleMeta.label}
            </span>
          </div>
          <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight truncate leading-tight">
            {getTabTitle(activeTab)}
          </h1>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search FDR No., College ID, Bank, Status..."
            className="w-full bg-[#1A1A1E] text-xs text-white placeholder-gray-400 rounded-lg pl-9 pr-8 py-2 border border-gray-700/60 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Quick actions, Role Switcher, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        
        {/* Evaluator Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setRoleMenuOpen(!roleMenuOpen);
              setProfileMenuOpen(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#1E1E22] hover:bg-[#2F2F36] text-xs border border-gray-700 text-gray-200 transition-colors"
            title="Switch authenticated role for evaluation"
          >
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden xl:inline text-gray-300 text-[11px]">Role Switcher:</span>
            <span className="font-semibold text-white truncate max-w-[120px]">
              {roleMeta.label}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1E1E22] border border-gray-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-3 py-1.5 border-b border-gray-700/60 text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>Select Evaluator Persona</span>
                <span className="text-[10px] text-blue-400 normal-case font-normal">7 RBAC Roles</span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-800">
                {roles.map((r) => {
                  const isCurrent = r.id === currentUser.id;
                  const badge = getRoleBadge(r.role);

                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSwitchRole(r.id);
                        setRoleMenuOpen(false);
                      }}
                      className={`w-full px-3 py-2.5 flex items-start gap-2.5 text-left transition-colors ${
                        isCurrent ? 'bg-blue-900/30 text-white' : 'hover:bg-white/5 text-gray-300'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0 mt-0.5">
                        {r.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-white truncate text-xs">{r.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${badge.bg}`}>
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{r.designation}</p>
                        {r.institutionName && (
                          <p className="text-[10px] text-blue-300 truncate">{r.institutionName}</p>
                        )}
                        {r.bankName && (
                          <p className="text-[10px] text-emerald-300 truncate">{r.bankName}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* AI Assistant Quick Trigger */}
        <button
          onClick={onOpenAssistant}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-900/60 border border-blue-500/40 text-blue-200 text-xs font-medium transition-colors"
          title="Open AI Compliance Assistant"
        >
          <Bot className="w-3.5 h-3.5 text-blue-300" />
          <span className="hidden md:inline">AI Assistant</span>
        </button>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          title="Notifications & Expiry Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#25252A]">
              {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Public Landing Link */}
        <button
          onClick={onViewLandingPage}
          className="hidden lg:flex items-center gap-1.5 text-xs text-gray-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-gray-700"
          title="Return to Public Landing Page"
        >
          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          <span>Public Portal</span>
        </button>

        {/* User Profile Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setProfileMenuOpen(!profileMenuOpen);
              setRoleMenuOpen(false);
            }}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#174B80] text-white font-bold text-xs flex items-center justify-center border border-blue-400/40 shadow-xs">
              {currentUser.name.charAt(0)}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          {profileMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[#1E1E22] border border-gray-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-gray-700/60">
                <div className="font-semibold text-white truncate text-xs">{currentUser.name}</div>
                <div className="text-[11px] text-gray-400 truncate">{currentUser.email}</div>
                <div className="text-[10px] text-blue-300 mt-1">{currentUser.designation}</div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onViewLandingPage();
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2.5 text-left text-gray-300 hover:text-white hover:bg-white/5"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  <span>Public Landing Page</span>
                </button>

                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onOpenHelpSupport();
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2.5 text-left text-gray-300 hover:text-white hover:bg-white/5"
                >
                  <HelpCircle className="w-4 h-4 text-gray-400" />
                  <span>Help & Compliance Guide</span>
                </button>
              </div>

              <div className="border-t border-gray-700/60 pt-1 mt-1">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2.5 text-left text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>Sign Out (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
