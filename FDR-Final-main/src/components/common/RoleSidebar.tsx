import React from 'react';
import {
  Layers,
  Building2,
  FileText,
  PlusCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Unlock,
  Calendar,
  Bell,
  BarChart3,
  HelpCircle,
  ShieldCheck,
  History,
  UserCheck,
  Users,
  Settings,
  Activity,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Inbox,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Landmark,
  Key,
  ShieldAlert,
  FileClock
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';

export interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
  isAction?: boolean; // If clicking this triggers an action modal instead of a view
  onClick?: () => void;
}

export interface NavSectionConfig {
  title?: string;
  items: NavItemConfig[];
}

interface RoleSidebarProps {
  currentUser: UserProfile;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenNewFdrModal: () => void;
  onOpenAssistant: () => void;
  onOpenNotifications: () => void;
  onOpenVerifyModal: () => void;
  onOpenHelpSupport: () => void;
  onLogout: () => void;
  unreadNotificationsCount?: number;
  openDiscrepanciesCount?: number;
  pendingVerificationsCount?: number;
  awaitingRegionalReviewCount?: number;
}

export const RoleSidebar: React.FC<RoleSidebarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onOpenNewFdrModal,
  onOpenAssistant,
  onOpenNotifications,
  onOpenVerifyModal,
  onOpenHelpSupport,
  onLogout,
  unreadNotificationsCount = 0,
  openDiscrepanciesCount = 0,
  pendingVerificationsCount = 0,
  awaitingRegionalReviewCount = 0
}) => {
  // Build role-specific sidebar navigation structure
  const getNavSections = (): NavSectionConfig[] => {
    switch (currentUser.role) {
      case 'institution':
        return [
          {
            title: 'Overview',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'my_institution', label: 'My Institution', icon: Building2 }
            ]
          },
          {
            title: 'FDR Operations',
            items: [
              { id: 'repository', label: 'FDR Repository', icon: FileText },
              { 
                id: 'submit_new', 
                label: 'Submit New FDR', 
                icon: PlusCircle, 
                isAction: true, 
                onClick: onOpenNewFdrModal,
                badge: 'New',
                badgeColor: 'bg-emerald-100 text-emerald-800'
              },
              { id: 'my_submissions', label: 'My Submissions', icon: Inbox },
              { id: 'verification_status', label: 'Verification Status', icon: ShieldCheck },
              { 
                id: 'discrepancies', 
                label: 'Discrepancies & Corrections', 
                icon: AlertTriangle,
                badge: openDiscrepanciesCount > 0 ? openDiscrepanciesCount : undefined,
                badgeColor: 'bg-amber-100 text-amber-800'
              },
              { id: 'renewals', label: 'Renewal / Replacement', icon: RefreshCw },
              { id: 'release_requests', label: 'Release / Refund Requests', icon: Unlock }
            ]
          },
          {
            title: 'Monitoring & Tools',
            items: [
              { id: 'expiry_calendar', label: 'Expiry Calendar', icon: Calendar },
              { 
                id: 'notifications', 
                label: 'Notifications', 
                icon: Bell, 
                badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
                badgeColor: 'bg-red-100 text-red-800',
                isAction: true,
                onClick: onOpenNotifications
              },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { 
                id: 'help', 
                label: 'Help & Support', 
                icon: HelpCircle,
                isAction: true,
                onClick: onOpenHelpSupport
              }
            ]
          }
        ];

      case 'bank_representative':
        return [
          {
            title: 'Bank Partner Operations',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'verify_requests', label: 'Verification Requests', icon: ShieldCheck },
              { 
                id: 'pending_verifications', 
                label: 'Pending Verifications', 
                icon: Clock,
                badge: pendingVerificationsCount > 0 ? pendingVerificationsCount : undefined,
                badgeColor: 'bg-amber-100 text-amber-800'
              },
              { id: 'completed_verifications', label: 'Completed Verifications', icon: FileCheck },
              { 
                id: 'discrepancies', 
                label: 'Discrepancies', 
                icon: AlertTriangle,
                badge: openDiscrepanciesCount > 0 ? openDiscrepanciesCount : undefined,
                badgeColor: 'bg-red-100 text-red-800'
              },
              { id: 'verification_history', label: 'Verification History', icon: History },
              { 
                id: 'notifications', 
                label: 'Notifications', 
                icon: Bell, 
                badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
                badgeColor: 'bg-red-100 text-red-800',
                isAction: true,
                onClick: onOpenNotifications
              },
              { 
                id: 'help', 
                label: 'Help & Support', 
                icon: HelpCircle,
                isAction: true,
                onClick: onOpenHelpSupport
              }
            ]
          }
        ];

      case 'scrutiny_officer':
        return [
          {
            title: 'Scrutiny Operations',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'repository', label: 'FDR Repository', icon: FileText },
              { id: 'new_submissions', label: 'New Submissions', icon: Inbox },
              { id: 'pending_scrutiny', label: 'Pending Scrutiny', icon: FileClock },
              { id: 'bank_verifications', label: 'Bank Verification Results', icon: ShieldCheck },
              { 
                id: 'discrepancies', 
                label: 'Discrepancy Management', 
                icon: AlertTriangle,
                badge: openDiscrepanciesCount > 0 ? openDiscrepanciesCount : undefined,
                badgeColor: 'bg-amber-100 text-amber-800'
              },
              { id: 'correction_requests', label: 'Correction Requests', icon: RefreshCw }
            ]
          },
          {
            title: 'Compliance & Case Lifecycle',
            items: [
              { id: 'compliance_cases', label: 'Compliance Cases', icon: AlertCircle },
              { id: 'expiry_monitoring', label: 'Expiry Monitoring', icon: Calendar },
              { id: 'renewals', label: 'Renewal / Replacement', icon: RefreshCw },
              { id: 'release_cases', label: 'Release / Refund Cases', icon: Unlock },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'audit', label: 'Audit History', icon: History }
            ]
          }
        ];

      case 'regional_officer':
        return [
          {
            title: 'Regional Oversight',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { 
                id: 'regional_review_queue', 
                label: 'Regional Review Queue', 
                icon: Inbox, 
                badge: awaitingRegionalReviewCount > 0 ? awaitingRegionalReviewCount : undefined,
                badgeColor: 'bg-amber-100 text-amber-800'
              },
              { id: 'institutions', label: 'Institutions', icon: Building2 },
              { id: 'repository', label: 'FDR Monitoring', icon: FileText },
              { id: 'expiring', label: 'Expiring Instruments', icon: Calendar },
              { id: 'overdue', label: 'Overdue Cases', icon: AlertTriangle },
              { id: 'pending_verifications', label: 'Pending Verifications', icon: Clock },
              { id: 'compliance_monitoring', label: 'Compliance Monitoring', icon: ShieldCheck }
            ]
          },
          {
            title: 'Assignments & Actions',
            items: [
              { id: 'case_assignments', label: 'Case Assignments', icon: UserCheck },
              { id: 'escalations', label: 'Escalations', icon: ShieldAlert },
              { id: 'reports', label: 'Regional Reports', icon: BarChart3 },
              { 
                id: 'notifications', 
                label: 'Notifications', 
                icon: Bell, 
                badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
                badgeColor: 'bg-red-100 text-red-800',
                isAction: true,
                onClick: onOpenNotifications
              }
            ]
          }
        ];

      case 'headquarters':
        return [
          {
            title: 'Central Bureau Management',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'institutions', label: 'Institution Directory', icon: Building2 },
              { id: 'repository', label: 'Central FDR Repository', icon: FileText },
              { id: 'verifications', label: 'Verification Overview', icon: ShieldCheck },
              { 
                id: 'discrepancies', 
                label: 'Compliance Monitoring', 
                icon: AlertTriangle,
                badge: openDiscrepanciesCount > 0 ? openDiscrepanciesCount : undefined,
                badgeColor: 'bg-amber-100 text-amber-800'
              },
              { id: 'renewals', label: 'Expiry & Renewal Tracking', icon: Calendar },
              { id: 'cases', label: 'Pending Cases', icon: Clock },
              { id: 'release_overview', label: 'Release / Refund Overview', icon: Unlock },
              { id: 'regional_performance', label: 'Regional Performance', icon: BarChart3 },
              { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
              { id: 'audit', label: 'Audit Trail', icon: History }
            ]
          }
        ];

      case 'release_officer':
        return [
          {
            title: 'Release & Refund Administration',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'new_requests', label: 'New Requests', icon: Inbox },
              { id: 'pending_docs', label: 'Pending Document Review', icon: FileText },
              { id: 'eligibility', label: 'Eligibility Review', icon: ShieldCheck },
              { id: 'awaiting_approval', label: 'Awaiting Approval', icon: Clock },
              { id: 'approved', label: 'Approved Requests', icon: FileCheck },
              { id: 'release_tracking', label: 'Release Tracking', icon: Unlock },
              { id: 'rejected', label: 'Rejected / Returned Requests', icon: AlertTriangle },
              { id: 'completed', label: 'Completed Cases', icon: CheckCircle2 },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'audit', label: 'Audit History', icon: History }
            ]
          }
        ];

      case 'admin':
        return [
          {
            title: 'System Administration',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'users', label: 'User Management', icon: Users },
              { id: 'roles_permissions', label: 'Role & Permissions', icon: Key },
              { id: 'institution_accounts', label: 'Institution Accounts', icon: Building2 },
              { id: 'bank_accounts', label: 'Bank Partner Accounts', icon: Landmark },
              { id: 'workflow_config', label: 'Workflow Configuration', icon: Sliders },
              { id: 'notification_settings', label: 'Notification Settings', icon: Bell },
              { id: 'verification_settings', label: 'Verification Settings', icon: ShieldCheck },
              { id: 'integration_settings', label: 'Integration Settings', icon: Settings },
              { id: 'scheduled_jobs', label: 'Scheduled Jobs & System Health', icon: Activity },
              { id: 'security_events', label: 'Security Events', icon: ShieldAlert },
              { id: 'audit', label: 'Audit Logs', icon: History },
              { id: 'system_config', label: 'System Configuration', icon: Settings }
            ]
          }
        ];

      default:
        return [
          {
            title: 'Navigation',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: Layers },
              { id: 'repository', label: 'FDR Repository', icon: FileText }
            ]
          }
        ];
    }
  };

  const sections = getNavSections();

  const handleItemClick = (item: NavItemConfig) => {
    if (item.isAction && item.onClick) {
      item.onClick();
    } else {
      onSelectTab(item.id);
    }
    // Close mobile drawer on navigation
    if (mobileOpen) {
      onCloseMobile();
    }
  };

  // Helper to determine role badge label
  const getRoleBadgeLabel = (role: UserRole) => {
    switch (role) {
      case 'institution': return 'College / Trust';
      case 'bank_representative': return 'Bank Partner';
      case 'scrutiny_officer': return 'Scrutiny Bureau';
      case 'regional_officer': return 'Regional Office';
      case 'headquarters': return 'HQ Regulation';
      case 'release_officer': return 'Release Officer';
      case 'admin': return 'System Admin';
      default: return role;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Main Sidebar Element */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-[#E5E7EB] flex flex-col transition-all duration-200 ease-in-out shadow-xs ${
          /* Responsive visibility & width */
          mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${collapsed ? 'lg:w-[72px]' : 'lg:w-[256px]'}`}
      >
        {/* Sidebar Header: Brand & AICTE Identity */}
        <div className="h-[60px] border-b border-[#E5E7EB] px-4 flex items-center justify-between shrink-0 bg-[#F8F9FA]/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-xs border border-gray-200 shrink-0 overflow-hidden">
              <img
                src="/assets/aistudio/d720b06e-b5b5-451a-ab78-41e8f93ad1ec_d6af7bc0.png"
                alt="FDR Connect Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-xs text-[#24262B] truncate tracking-tight">
                  AICTE Regulation Bureau
                </span>
                <span className="text-[10px] text-[#737985] truncate font-medium">
                  Security Deposit Portal
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-[#737985] hover:text-[#24262B] hover:bg-[#EEF0F3] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-5 scrollbar-thin">
          {sections.map((sec, sIdx) => (
            <div key={sec.title || sIdx} className="space-y-1">
              {sec.title && !collapsed && (
                <div className="px-3 py-1 text-[10px] font-bold text-[#8C93A0] uppercase tracking-wider">
                  {sec.title}
                </div>
              )}
              {sec.title && collapsed && (
                <div className="w-6 h-px bg-gray-200 mx-auto my-2" />
              )}

              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = !item.isAction && activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all group relative text-left ${
                        isActive
                          ? 'bg-[#174B80]/10 text-[#174B80] font-semibold border-l-3 border-[#174B80]'
                          : 'text-[#4A505C] hover:text-[#24262B] hover:bg-[#F2F4F7]'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-[#174B80]' : 'text-[#737985] group-hover:text-[#24262B]'
                      }`} />

                      {!collapsed && (
                        <span className="truncate flex-1">
                          {item.label}
                        </span>
                      )}

                      {/* Item Badges */}
                      {item.badge !== undefined && (
                        collapsed ? (
                          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                        ) : (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                            item.badgeColor || 'bg-gray-100 text-gray-700'
                          }`}>
                            {item.badge}
                          </span>
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Current User Badge & Quick Logout */}
        <div className="p-3 border-t border-[#E5E7EB] bg-[#F8F9FA]/60 shrink-0">
          {!collapsed ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-white border border-[#E5E7EB]">
                <div className="w-8 h-8 rounded-full bg-[#174B80]/15 text-[#174B80] font-bold text-xs flex items-center justify-center shrink-0 border border-[#174B80]/30">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[#24262B] truncate leading-tight">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#737985] truncate">
                    {getRoleBadgeLabel(currentUser.role)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 text-[11px]">
                <span className="text-[10px] text-[#8C93A0]">AICTE Portal 2026</span>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium hover:underline text-[11px]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div 
                title={`${currentUser.name} (${getRoleBadgeLabel(currentUser.role)})`}
                className="w-8 h-8 rounded-full bg-[#174B80]/15 text-[#174B80] font-bold text-xs flex items-center justify-center cursor-default border border-[#174B80]/30"
              >
                {currentUser.name.charAt(0)}
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
