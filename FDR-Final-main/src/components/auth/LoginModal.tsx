import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  Building2,
  Landmark,
  FileCheck2,
  MapPin,
  Layers,
  AlertCircle,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { UserRole, UserProfile } from '../../types';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';
import { INITIAL_USERS } from '../../mock/initialData';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: UserRole | 'assistant' | null;
  onLoginSuccess: (user: UserProfile) => void;
  onOpenForgotPassword: () => void;
  onOpenRegistration: () => void;
  onSelectAnotherRole: () => void;
}

const ROLE_INFO: Record<string, {
  title: string;
  badge: string;
  description: string;
  authorizedScope: string;
  icon: any;
  defaultEmail: string;
}> = {
  institution: {
    title: 'Institution / College Portal',
    badge: 'Technical Institution',
    description: 'Authorized workspace for approved technical institutions, universities, and polytechnics.',
    authorizedScope: 'Submit new FDRs, upload documents, track bank verification, respond to discrepancies, renew instruments, and apply for security deposit release.',
    icon: Building2,
    defaultEmail: 'registrar@rvce.edu.in'
  },
  bank_representative: {
    title: 'Bank Representative Portal',
    badge: 'Issuing Bank Branch',
    description: 'Secure gateway for authorized scheduled commercial bank branch managers.',
    authorizedScope: 'Access assigned verification requests via token or QR code, verify balances in Finacle/CBS, confirm AICTE joint lien endorsement, and record official verification findings.',
    icon: Landmark,
    defaultEmail: 'chiefmgr.verif@sbi.co.in'
  },
  scrutiny_officer: {
    title: 'AICTE Scrutiny Officer Portal',
    badge: 'Regulation Bureau',
    description: 'Regulatory workspace for AICTE document scrutiny officers and regulatory examiners.',
    authorizedScope: 'Review original scanned documents side-by-side with OCR extractions, assess discrepancy flags, examine bank responses, and recommend approval or correction.',
    icon: FileCheck2,
    defaultEmail: 'priya.sundaram@aicte-india.org'
  },
  regional_officer: {
    title: 'Regional Officer Portal',
    badge: 'AICTE Regional Office',
    description: 'Jurisdiction dashboard for Regional Officers supervising approved technical institutions.',
    authorizedScope: 'Monitor regional FDR compliance, upcoming maturities, overdue renewals, and export regional compliance summaries.',
    icon: MapPin,
    defaultEmail: 'ro.western@aicte-india.org'
  },
  headquarters: {
    title: 'Regulation Bureau / HQ Portal',
    badge: 'AICTE Headquarters',
    description: 'Executive portal for Regulation Bureau leadership, Advisors, and Member Secretary office.',
    authorizedScope: 'Full nationwide FDR inventory oversight, lifecycle distribution metrics, verification velocity trends, and regulatory supervision.',
    icon: Layers,
    defaultEmail: 'ramesh.chandra@aicte-india.org'
  },
  release_officer: {
    title: 'Release & Refund Officer Portal',
    badge: 'Deposit Discharge Cell',
    description: 'Authorized workspace for processing FDR lien discharge and security deposit releases.',
    authorizedScope: 'Verify 10-year statutory lock-in compliance, review governing body resolutions, check no-dues clearance, and issue formal AICTE Bank Discharge Orders.',
    icon: ShieldCheck,
    defaultEmail: 'refund.reg@aicte-india.org'
  },
  admin: {
    title: 'System Administrator Portal',
    badge: 'e-Governance Infrastructure',
    description: 'Restricted technical administration workspace for IT & Infrastructure cell.',
    authorizedScope: 'Configure verification token TTL, reminder schedules (90/60/30 days), user accounts, and review security audit logs. (Separated from regulatory approvals).',
    icon: UserCheck,
    defaultEmail: 'admin.egov@aicte-india.org'
  },
  assistant: {
    title: 'AI Compliance Assistant Access',
    badge: 'Conversational Regulatory AI',
    description: 'Authentication required prior to accessing AI assistant to ensure record security.',
    authorizedScope: 'Query case status, missing documentation, recorded discrepancy explanations, and AICTE Approval Process Handbook regulations strictly for authorized records.',
    icon: Sparkles,
    defaultEmail: 'ramesh.chandra@aicte-india.org'
  }
};

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  onLoginSuccess,
  onOpenForgotPassword,
  onOpenRegistration,
  onSelectAnotherRole
}) => {
  const roleKey = targetRole || 'institution';
  const roleMeta = ROLE_INFO[roleKey] || ROLE_INFO.institution;
  const RoleIcon = roleMeta.icon;

  const [email, setEmail] = useState(roleMeta.defaultEmail);
  const [password, setPassword] = useState('aicte@2026');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Update email default when role changes
  useEffect(() => {
    if (targetRole && ROLE_INFO[targetRole]) {
      setEmail(ROLE_INFO[targetRole].defaultEmail);
      setPassword('aicte@2026');
      setErrorMessage('');
    }
  }, [targetRole]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both authorized email/identifier and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const actualRole = targetRole === 'assistant' ? 'headquarters' : targetRole;
      const res = await api.login({
        email,
        password,
        role: actualRole || undefined
      });

      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    // Look up default seed user for this role
    const actualRole = targetRole === 'assistant' ? 'headquarters' : targetRole;
    const seedUser = INITIAL_USERS.find(u => u.role === actualRole) || INITIAL_USERS[0];
    
    setEmail(seedUser.email);
    setPassword('aicte@2026');
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.login({
        email: seedUser.email,
        password: 'aicte@2026',
        role: actualRole || undefined
      });
      onLoginSuccess(res.user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={roleMeta.title}
      subtitle={`Secure Authentication • ${roleMeta.badge}`}
      maxWidth="md"
      footer={
        <div className="w-full flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onSelectAnotherRole}
            className="text-gray-500 hover:text-gray-800 underline font-medium"
          >
            ← Select Different Role
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300"
          >
            Cancel
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Role Authorization Scope Card */}
        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
            <RoleIcon size={16} className="text-[#174B80]" />
            <span>Authorized Scope of Access</span>
          </div>
          <p className="text-[11.5px] text-gray-600 leading-relaxed">
            {roleMeta.authorizedScope}
          </p>
        </div>

        {/* Error Feedback */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1-Click Demo Evaluation Shortcut */}
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-2">
          <div>
            <div className="font-semibold text-blue-900 flex items-center gap-1">
              <Sparkles size={13} className="text-blue-600" />
              <span>Reviewer / Evaluation Demo Mode</span>
            </div>
            <div className="text-[11px] text-blue-800">
              One-click entry pre-loaded with official seed credentials for this role.
            </div>
          </div>
          <button
            type="button"
            onClick={handleQuickDemoLogin}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold bg-[#174B80] hover:bg-[#153f6c] text-white rounded-lg transition-colors shrink-0 shadow-2xs"
          >
            1-Click Demo Login
          </button>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              {targetRole === 'institution' ? 'Institutional Email or AICTE Permanent ID (PID) *' : 'Authorized Official Email *'}
            </label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter authorized credential..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80] text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-gray-700">Password *</label>
              <button
                type="button"
                onClick={onOpenForgotPassword}
                className="text-[11px] text-[#174B80] hover:underline font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <KeyRound size={14} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80] text-xs font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#174B80] hover:bg-[#153f6c] text-white font-semibold rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <Lock size={13} />
            <span>{loading ? 'Authenticating & Loading Permissions...' : `Sign In to ${roleMeta.badge}`}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Registration link for institutions */}
        {targetRole === 'institution' && (
          <div className="pt-2 text-center text-[11.5px] text-gray-500 border-t border-gray-100">
            Has your institution not registered on the FDR Portal yet?{' '}
            <button
              type="button"
              onClick={onOpenRegistration}
              className="text-[#174B80] font-semibold hover:underline"
            >
              Submit Registration Request
            </button>
          </div>
        )}

      </div>
    </Modal>
  );
};
