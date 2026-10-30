import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Building2,
  Landmark,
  FileCheck2,
  MapPin,
  Layers,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  KeyRound,
  Shield
} from 'lucide-react';
import { UserRole, UserProfile } from '../../types';
import { api } from '../../services/api';
import { INITIAL_USERS } from '../../mock/initialData';

interface RoleLoginPageProps {
  selectedRole: UserRole;
  onLoginSuccess: (user: UserProfile) => void;
  onBackToDashboardSelection: () => void;
  onOpenForgotPassword: () => void;
}

const ROLE_METADATA: Record<UserRole, {
  title: string;
  category: string;
  description: string;
  authorizedScope: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  defaultEmail: string;
  sampleIdentifierLabel: string;
}> = {
  institution: {
    title: 'Institution Dashboard Login',
    category: 'Technical Institution / College Signatory',
    description: 'Authorized workspace for approved engineering, management, and pharmacy colleges with active deposit mandates.',
    authorizedScope: 'Submit new FDRs, upload scanned certificates, track bank verification, respond to discrepancies, lodge renewal advices, and apply for deposit release.',
    icon: Building2,
    defaultEmail: 'registrar@rvce.edu.in',
    sampleIdentifierLabel: 'College Registrar / Principal AICTE Email'
  },
  bank_representative: {
    title: 'Bank Partner Dashboard Login',
    category: 'Scheduled Commercial Bank Officer',
    description: 'Secure gateway for authorized scheduled commercial bank branch managers and verification officers.',
    authorizedScope: 'Inspect assigned verification requests, verify Core Banking (CBS) deposit balances, confirm AICTE joint lien endorsements, and record authorized confirmations.',
    icon: Landmark,
    defaultEmail: 'chiefmgr.verif@sbi.co.in',
    sampleIdentifierLabel: 'Bank Officer Domain Email (e.g., sbi.co.in)'
  },
  scrutiny_officer: {
    title: 'AICTE Scrutiny Dashboard Login',
    category: 'Regulatory Scrutiny Bureau Examiner',
    description: 'Regulatory workspace for AICTE document scrutiny officers and regulatory examiners.',
    authorizedScope: 'Review original scanned documents side-by-side with OCR extractions, assess discrepancy flags, examine bank responses, and recommend approval or correction.',
    icon: FileCheck2,
    defaultEmail: 'priya.sundaram@aicte-india.org',
    sampleIdentifierLabel: 'AICTE Official Officer Email'
  },
  regional_officer: {
    title: 'Regional Officer Dashboard Login',
    category: 'AICTE Regional Directorate Leadership',
    description: 'Jurisdiction dashboard for Regional Officers supervising approved technical institutions.',
    authorizedScope: 'Monitor regional FDR compliance, upcoming maturities, overdue renewals, manage case assignments, and export regional compliance summaries.',
    icon: MapPin,
    defaultEmail: 'ro.western@aicte-india.org',
    sampleIdentifierLabel: 'Regional Officer AICTE Email'
  },
  headquarters: {
    title: 'Regulation Bureau Dashboard Login',
    category: 'AICTE Headquarters / Member Secretary',
    description: 'Executive portal for Regulation Bureau leadership, Advisors, and Member Secretary office.',
    authorizedScope: 'Full nationwide FDR inventory oversight, lifecycle distribution metrics, verification velocity trends, and regulatory supervision.',
    icon: Layers,
    defaultEmail: 'ramesh.chandra@aicte-india.org',
    sampleIdentifierLabel: 'AICTE Headquarters Officer Email'
  },
  release_officer: {
    title: 'Release / Refund Dashboard Login',
    category: 'Deposit Discharge Cell Officer',
    description: 'Authorized workspace for processing FDR lien discharge and security deposit releases.',
    authorizedScope: 'Verify 10-year statutory lock-in compliance, review governing body resolutions, check no-dues clearance, and issue formal AICTE Bank Discharge Orders.',
    icon: ShieldCheck,
    defaultEmail: 'refund.reg@aicte-india.org',
    sampleIdentifierLabel: 'Discharge Cell Officer Email'
  },
  admin: {
    title: 'System Administrator Dashboard Login',
    category: 'IT & Infrastructure Cell Administrator',
    description: 'Restricted technical administration workspace for IT & Infrastructure cell.',
    authorizedScope: 'Configure verification token TTL, reminder schedules (90/60/30 days), user accounts, and review security audit logs. (Separated from regulatory approvals).',
    icon: UserCheck,
    defaultEmail: 'admin.egov@aicte-india.org',
    sampleIdentifierLabel: 'System Administrator Email'
  }
};

export const RoleLoginPage: React.FC<RoleLoginPageProps> = ({
  selectedRole,
  onLoginSuccess,
  onBackToDashboardSelection,
  onOpenForgotPassword
}) => {
  const meta = ROLE_METADATA[selectedRole] || ROLE_METADATA.institution;
  const RoleIcon = meta.icon;

  const [email, setEmail] = useState(meta.defaultEmail);
  const [password, setPassword] = useState('aicte@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [accessDeniedUser, setAccessDeniedUser] = useState<UserProfile | null>(null);

  // Sync default email when selectedRole changes
  useEffect(() => {
    setEmail(meta.defaultEmail);
    setPassword('aicte@2026');
    setErrorMessage('');
    setAccessDeniedUser(null);
  }, [selectedRole, meta.defaultEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide your authorized organizational identifier and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setAccessDeniedUser(null);

    try {
      // Authenticate via backend API
      const res = await api.login({
        email,
        password,
        role: selectedRole
      });

      const authenticatedUser = res.user;

      // Backend role verification: ensure authenticated account has requested permissions
      // Note: headquarters corresponds to regulation bureau dashboard
      const isRoleMatched = authenticatedUser.role === selectedRole;

      if (!isRoleMatched) {
        // Access Denied: The account has a different role than the selected dashboard
        setAccessDeniedUser(authenticatedUser);
        setErrorMessage(
          `Access Denied: The authenticated account '${authenticatedUser.email}' holds the role '${authenticatedUser.role}', which does not have permission for the '${meta.title}'. System security strictly prevents role impersonation.`
        );
      } else {
        // Success
        onLoginSuccess(authenticatedUser);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedWithActualRole = () => {
    if (accessDeniedUser) {
      onLoginSuccess(accessDeniedUser);
    }
  };

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
                  {meta.title}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5 hidden sm:block">
                All India Council for Technical Education • Regulation Bureau
              </p>
            </div>
          </div>

          <button
            onClick={onBackToDashboardSelection}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 text-gray-200 hover:bg-white/5 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={13} />
            <span>Change Dashboard Role</span>
          </button>
        </div>
      </header>

      {/* Main Login Viewport */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#737985] mb-4">
          <button onClick={onBackToDashboardSelection} className="hover:text-blue-900 transition-colors">
            Access Portal
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{meta.title}</span>
        </div>

        {/* Central Auth Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
          {/* Header Banner */}
          <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[#174B80] text-white flex items-center justify-center shadow-xs">
                <RoleIcon size={24} />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider block">
                  {meta.category}
                </span>
                <h1 className="text-lg sm:text-xl font-bold text-white">
                  {meta.title}
                </h1>
              </div>
            </div>

            <div className="text-xs text-gray-300 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              Context: <span className="font-mono text-blue-300">{selectedRole}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Scope description */}
            <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-3.5 leading-relaxed">
              <span className="font-semibold text-slate-900">Authorized Scope: </span>
              {meta.authorizedScope}
            </div>

            {/* Access Denied Warning if role mismatch */}
            {accessDeniedUser && (
              <div className="p-4 bg-red-50 border border-red-300 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert size={18} className="text-red-700 shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-xs font-bold text-red-900">Access Denied: Role Authorization Mismatch</h2>
                    <p className="text-xs text-red-800 mt-1 leading-relaxed">
                      You successfully authenticated as <strong>{accessDeniedUser.name}</strong>, but your assigned authority is <strong>{accessDeniedUser.role}</strong>. You are attempting to enter the <strong>{meta.title}</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-red-200">
                  <button
                    type="button"
                    onClick={handleProceedWithActualRole}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-red-800 hover:bg-red-900 text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>Proceed to Authorized {accessDeniedUser.role} Workspace</span>
                    <ArrowRight size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccessDeniedUser(null);
                      setErrorMessage('');
                    }}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-300 bg-white text-red-900 hover:bg-red-100 transition-colors"
                  >
                    Try Different Credentials
                  </button>
                </div>
              </div>
            )}

            {/* Standard Error Message */}
            {errorMessage && !accessDeniedUser && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-800">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#24262B] mb-1.5">
                  Email or Organizational Identifier
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={meta.defaultEmail}
                    className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#174B80] focus:border-[#174B80] bg-white text-gray-900"
                  />
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Example: {meta.sampleIdentifierLabel}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#24262B]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={onOpenForgotPassword}
                    className="text-xs text-[#174B80] hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#174B80] focus:border-[#174B80] bg-white text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 py-2.5 px-4 text-xs font-semibold rounded-xl bg-[#174B80] hover:bg-[#153f6c] text-white shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to {meta.title.replace(' Login', '')}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onBackToDashboardSelection}
                  className="w-full sm:w-auto py-2.5 px-4 text-xs font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back to Dashboard Selection
                </button>
              </div>
            </form>

            {/* Quick Demo Credential Helper for Evaluators */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  Evaluator Demo Credentials (Default Role Pre-fill)
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Password: aicte@2026</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {INITIAL_USERS.map((u) => {
                  const isCurrentRoleMatch = u.role === selectedRole;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setEmail(u.email);
                        setPassword('aicte@2026');
                        setErrorMessage('');
                        setAccessDeniedUser(null);
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border text-left transition-colors ${
                        isCurrentRoleMatch
                          ? 'bg-blue-50 border-blue-300 text-blue-900 font-medium'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span>{u.name.split(' (')[0]}</span>
                      <span className="text-[10px] text-gray-400 ml-1 font-mono">({u.role})</span>
                    </button>
                  );
                })}
              </div>
            </div>
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
