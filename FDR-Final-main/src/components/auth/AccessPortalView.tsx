import React, { useState } from 'react';
import {
  Building2,
  Landmark,
  FileCheck2,
  MapPin,
  Layers,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  HelpCircle
} from 'lucide-react';
import { UserRole } from '../../types';

interface AccessPortalViewProps {
  onSelectRole: (role: UserRole) => void;
  onBackToLanding: () => void;
  onOpenHelpModal?: () => void;
}

interface RoleCardMeta {
  role: UserRole;
  num: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  tags: string[];
}

const DASHBOARD_ROLES: RoleCardMeta[] = [
  {
    role: 'institution',
    num: 1,
    title: 'Institution Dashboard',
    subtitle: 'Technical Institutions & Colleges',
    description: 'Submit FDR instruments, track bank verification status, address discrepancies, manage renewals, and submit security deposit release applications.',
    icon: Building2,
    tags: ['FDR Lodgement', 'OCR Status', 'Renewal Chain', 'Release Requests']
  },
  {
    role: 'bank_representative',
    num: 2,
    title: 'Bank Partner Dashboard',
    subtitle: 'Scheduled Commercial Banks',
    description: 'Review assigned verification requests, verify Core Banking (CBS) deposit balances, confirm AICTE joint lien endorsements, and record authorized confirmations.',
    icon: Landmark,
    tags: ['CBS Verification', 'QR & Token Gateway', 'Lien Endorsement', 'Official Endorsements']
  },
  {
    role: 'scrutiny_officer',
    num: 3,
    title: 'AICTE Scrutiny Dashboard',
    subtitle: 'Regulatory Scrutiny Bureau',
    description: 'Review scanned FDR receipts, inspect automated OCR extractions, assess discrepancy alerts, manage institution corrections, and prepare recommendations.',
    icon: FileCheck2,
    tags: ['Side-by-Side Review', 'Discrepancy Audit', 'Correction Requests', 'Compliance Vetting']
  },
  {
    role: 'regional_officer',
    num: 4,
    title: 'Regional Officer Dashboard',
    subtitle: 'AICTE Regional Directorates',
    description: 'Monitor regional institutional compliance, upcoming maturities, overdue cases, track pending verifications, and supervise regional escalations.',
    icon: MapPin,
    tags: ['Regional Monitoring', 'Expiring Instruments', 'Overdue Tracking', 'Escalations']
  },
  {
    role: 'headquarters',
    num: 5,
    title: 'Regulation Bureau Dashboard',
    subtitle: 'AICTE HQ / Member Secretary',
    description: 'Nationwide FDR inventory surveillance, centralized repository, compliance tracking, regional performance benchmarking, and executive analytics.',
    icon: Layers,
    tags: ['Central Repository', 'Nationwide KPIs', 'Velocity Analytics', 'Bank Distribution']
  },
  {
    role: 'release_officer',
    num: 6,
    title: 'Release / Refund Dashboard',
    subtitle: 'Deposit Discharge Cell',
    description: 'Vet 10-year statutory lock-in compliance, inspect board resolutions and no-dues clearance, process approvals, and issue Bank Discharge Orders.',
    icon: ShieldCheck,
    tags: ['Statutory Lock-in Audit', 'Eligibility Review', 'Discharge Approval', 'Bank Discharge Order']
  },
  {
    role: 'admin',
    num: 7,
    title: 'System Administrator Dashboard',
    subtitle: 'IT & Infrastructure Cell',
    description: 'Manage user accounts, role permissions, scheduled expiry jobs, token configurations, notification schedules, and system security logs.',
    icon: UserCheck,
    tags: ['User Management', 'RBAC Configuration', 'Scheduler Health', 'Security Audit Trail']
  }
];

export const AccessPortalView: React.FC<AccessPortalViewProps> = ({
  onSelectRole,
  onBackToLanding,
  onOpenHelpModal
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleContinue = () => {
    if (selectedRole) {
      onSelectRole(selectedRole);
    }
  };

  const currentMeta = DASHBOARD_ROLES.find(r => r.role === selectedRole);

  return (
    <div className="min-h-screen bg-[#EEF0F3] text-[#24262B] flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-[#25252A] text-white border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[58px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm border border-white/20 shrink-0 overflow-hidden">
              <img
                src="/assets/aistudio/d720b06e-b5b5-451a-ab78-41e8f93ad1ec_d6af7bc0.png"
                alt="FDR Connect Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base tracking-tight text-white">
                  AICTE FDR PORTAL
                </span>
                <span className="text-gray-400 text-xs hidden sm:inline">/</span>
                <span className="text-xs text-gray-300 hidden sm:inline font-medium">
                  Access Portal
                </span>
              </div>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5 hidden sm:block">
                All India Council for Technical Education • Regulation Bureau
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onOpenHelpModal && (
              <button
                onClick={onOpenHelpModal}
                className="text-xs text-gray-300 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors flex items-center gap-1.5"
              >
                <HelpCircle size={14} />
                <span className="hidden sm:inline">Help & Support</span>
              </button>
            )}
            <button
              onClick={onBackToLanding}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-200 hover:bg-white/5 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft size={13} />
              <span>Back to Overview</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        {/* Breadcrumb & Section Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#737985]">
            <button onClick={onBackToLanding} className="hover:text-blue-900 transition-colors">Home</button>
            <span>/</span>
            <span className="text-gray-900 font-medium">Access Portal</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-gray-300">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#24262B]">
                Select Dashboard Role
              </h1>
              <p className="text-xs sm:text-sm text-[#737985] mt-1 max-w-2xl">
                Choose your authorized stakeholder category to proceed to role-specific authentication. 
                Each workspace provides partitioned access and features tailored to your regulatory remit.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shrink-0 self-start sm:self-auto">
              <Shield size={14} className="text-[#174B80]" />
              <span>Role-Based Access Control Enforced</span>
            </div>
          </div>
        </div>

        {/* 7 Dashboard Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DASHBOARD_ROLES.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedRole === item.role;

            return (
              <div
                key={item.role}
                onClick={() => setSelectedRole(item.role)}
                onDoubleClick={() => {
                  setSelectedRole(item.role);
                  onSelectRole(item.role);
                }}
                className={`relative cursor-pointer rounded-2xl p-5 border transition-all duration-150 flex flex-col justify-between select-none ${
                  isSelected
                    ? 'bg-white border-[#174B80] ring-2 ring-[#174B80]/20 shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-xs'
                }`}
              >
                {/* Header row: Icon & Selection indicator */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#174B80] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-medium text-slate-400">
                        0{item.num}
                      </span>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-[#174B80] text-white flex items-center justify-center shadow-2xs">
                          <CheckCircle2 size={13} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-300 bg-transparent" />
                      )}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-semibold text-sm sm:text-base text-gray-900 leading-snug">
                      {item.title}
                    </h2>
                    <p className="text-[11px] font-medium text-[#174B80] mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed min-h-[54px]">
                    {item.description}
                  </p>
                </div>

                {/* Footer: Tags & Selection hint */}
                <div className="pt-4 border-t border-gray-100 mt-4 space-y-2.5">
                  <div className="flex flex-wrap gap-1 text-[10px] text-slate-500">
                    {item.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRole(item.role);
                      onSelectRole(item.role);
                    }}
                    className={`w-full py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'bg-[#174B80] hover:bg-[#153f6c] text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span>{isSelected ? 'Continue to Login' : 'Select Workspace'}</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Role Action Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Selected Dashboard Context
            </div>
            {currentMeta ? (
              <div className="flex items-center gap-2 justify-center md:justify-start">
                <span className="font-bold text-base text-[#174B80]">{currentMeta.title}</span>
                <span className="text-xs text-gray-400">·</span>
                <span className="text-xs text-gray-600">{currentMeta.subtitle}</span>
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                Please click on any of the 7 dashboard cards above to select your authorized role.
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onBackToLanding}
              className="px-4 py-2 text-xs font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Overview
            </button>

            <button
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs ${
                selectedRole
                  ? 'bg-[#174B80] hover:bg-[#153f6c] text-white cursor-pointer'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>{selectedRole ? `Continue to ${currentMeta?.title}` : 'Select a Role to Continue'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Informative Note: AI Assistant & RBAC Policy */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start gap-3">
          <Shield size={16} className="text-[#174B80] shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-semibold text-slate-900">Notice on Role Authentication & Authorization:</span>
            <p>
              Selecting a dashboard above sets your requested login context. Upon sign-in, the system verifies your account’s actual role in the AICTE directory. Accounts cannot access workspaces outside their assigned jurisdiction. The <strong>AI Compliance Assistant</strong> is available as a persistent assistant at the bottom-right of your screen across all portal views.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-500">
        <p>© 2026 All India Council for Technical Education (AICTE), New Delhi. Security Deposit & FDR Management Portal.</p>
      </footer>
    </div>
  );
};
