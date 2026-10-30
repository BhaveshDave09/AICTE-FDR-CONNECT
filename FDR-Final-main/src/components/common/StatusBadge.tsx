import React from 'react';
import { InstrumentLifecycle, VerificationStatus, AdministrativeCaseStatus, ReleaseRefundStatus } from '../../types';

interface StatusBadgeProps {
  type: 'lifecycle' | 'verification' | 'case' | 'release';
  value: InstrumentLifecycle | VerificationStatus | AdministrativeCaseStatus | ReleaseRefundStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let bgClass = 'bg-gray-100 text-gray-700 border-gray-200';
  let label = String(value).replace(/_/g, ' ');

  if (type === 'lifecycle') {
    switch (value) {
      case 'ACTIVE':
        bgClass = 'bg-[#E8F5EE] text-[#2A674E] border-[#C3E8D5]';
        label = 'Active';
        break;
      case 'EXPIRING_SOON':
        bgClass = 'bg-[#FEF7ED] text-[#B45309] border-[#FDE68A]';
        label = 'Expiring Soon';
        break;
      case 'MATURED':
        bgClass = 'bg-[#FDF2F2] text-[#B91C1C] border-[#FECACA]';
        label = 'Matured';
        break;
      case 'RENEWED_REPLACED':
        bgClass = 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
        label = 'Renewed / Replaced';
        break;
      case 'RELEASED':
        bgClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
        label = 'Released / Discharged';
        break;
      case 'CLOSED':
        bgClass = 'bg-gray-100 text-gray-600 border-gray-300';
        label = 'Closed';
        break;
    }
  } else if (type === 'verification') {
    switch (value) {
      case 'CONFIRMED':
        bgClass = 'bg-[#E8F5EE] text-[#2A674E] border-[#C3E8D5]';
        label = 'Bank Confirmed';
        break;
      case 'PENDING_BANK_VERIFICATION':
        bgClass = 'bg-[#FEF7ED] text-[#B45309] border-[#FDE68A]';
        label = 'Pending Bank Verification';
        break;
      case 'DISCREPANCY_FOUND':
        bgClass = 'bg-[#FDF2F2] text-[#B91C1C] border-[#FECACA]';
        label = 'Discrepancy Found';
        break;
      case 'UNABLE_TO_VERIFY':
        bgClass = 'bg-amber-50 text-amber-800 border-amber-300';
        label = 'Unable to Verify';
        break;
      case 'EXPIRED_REQUEST':
        bgClass = 'bg-red-50 text-red-700 border-red-200';
        label = 'Link Expired';
        break;
      case 'NOT_REQUESTED':
        bgClass = 'bg-gray-100 text-gray-500 border-gray-200';
        label = 'Not Dispatched';
        break;
    }
  } else if (type === 'case') {
    switch (value) {
      case 'APPROVED':
        bgClass = 'bg-[#E8F5EE] text-[#2A674E] border-[#C3E8D5]';
        label = 'Approved & Registered';
        break;
      case 'ENDORSED_BY_REGIONAL_OFFICER':
        bgClass = 'bg-teal-50 text-teal-800 border-teal-300';
        label = 'Endorsed by Regional Officer';
        break;
      case 'AWAITING_HQ_APPROVAL':
        bgClass = 'bg-indigo-50 text-indigo-800 border-indigo-300';
        label = 'Awaiting HQ Approval';
        break;
      case 'AWAITING_COMPETENT_AUTHORITY':
        bgClass = 'bg-blue-50 text-blue-800 border-blue-300';
        label = 'Awaiting Regional Endorsement';
        break;
      case 'SUBMITTED':
      case 'UNDER_SCRUTINY':
        bgClass = 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]';
        label = value === 'SUBMITTED' ? 'Submitted' : 'Under Scrutiny';
        break;
      case 'AWAITING_BANK_RESPONSE':
        bgClass = 'bg-purple-50 text-purple-700 border-purple-200';
        label = 'Awaiting Bank Response';
        break;
      case 'AWAITING_INSTITUTION_CORRECTION':
        bgClass = 'bg-[#FEF7ED] text-[#C2410C] border-[#FDBA74]';
        label = 'Correction Requested';
        break;
      case 'REJECTED':
        bgClass = 'bg-[#FDF2F2] text-[#B91C1C] border-[#FECACA]';
        label = 'Rejected';
        break;
      case 'DRAFT':
        bgClass = 'bg-gray-100 text-gray-600 border-gray-200';
        label = 'Draft';
        break;
      default:
        bgClass = 'bg-gray-100 text-gray-700 border-gray-200';
        label = String(value).replace(/_/g, ' ');
    }
  } else if (type === 'release') {
    switch (value) {
      case 'APPROVED':
      case 'DISCHARGED':
        bgClass = 'bg-[#E8F5EE] text-[#2A674E] border-[#C3E8D5]';
        label = value === 'APPROVED' ? 'Release Approved' : 'Lien Discharged';
        break;
      case 'REQUESTED':
      case 'UNDER_ELIGIBILITY_REVIEW':
        bgClass = 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]';
        label = value === 'REQUESTED' ? 'Release Requested' : 'Eligibility Review';
        break;
      case 'DOCS_PENDING':
        bgClass = 'bg-[#FEF7ED] text-[#B45309] border-[#FDE68A]';
        label = 'Docs Pending';
        break;
      case 'REJECTED':
        bgClass = 'bg-[#FDF2F2] text-[#B91C1C] border-[#FECACA]';
        label = 'Release Rejected';
        break;
      default:
        return null;
    }
  }

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${bgClass} whitespace-nowrap`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {label}
    </span>
  );
};
