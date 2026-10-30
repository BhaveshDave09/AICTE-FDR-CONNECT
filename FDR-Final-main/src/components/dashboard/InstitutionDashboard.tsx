import React from 'react';
import {
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  ShieldAlert,
  Bot
} from 'lucide-react';
import { FdrInstrument, UserProfile } from '../../types';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';

interface InstitutionDashboardProps {
  currentUser: UserProfile;
  fdrs: FdrInstrument[];
  onOpenNewFdr: () => void;
  onOpenRenewModal: (fdr: FdrInstrument) => void;
  onOpenReleaseModal: (fdr: FdrInstrument) => void;
  onViewFdr: (fdr: FdrInstrument) => void;
  onOpenAssistant: () => void;
}

export const InstitutionDashboard: React.FC<InstitutionDashboardProps> = ({
  currentUser,
  fdrs,
  onOpenNewFdr,
  onOpenRenewModal,
  onOpenReleaseModal,
  onViewFdr,
  onOpenAssistant
}) => {
  const institutionFdrs = fdrs.filter(f => f.institutionId === currentUser.institutionId || !currentUser.institutionId);

  const totalValue = institutionFdrs.reduce((sum, f) => sum + f.principalAmount, 0);
  const activeCount = institutionFdrs.filter(f => f.lifecycleStatus === 'ACTIVE').length;
  const expiringCount = institutionFdrs.filter(f => f.lifecycleStatus === 'EXPIRING_SOON').length;
  const maturedCount = institutionFdrs.filter(f => f.lifecycleStatus === 'MATURED').length;
  const discrepanciesCount = institutionFdrs.filter(f => f.discrepancies.some(d => d.status === 'OPEN')).length;

  // Open discrepancy items requiring correction
  const actionRequiredFdrs = institutionFdrs.filter(f => 
    f.caseStatus === 'AWAITING_INSTITUTION_CORRECTION' || 
    f.discrepancies.some(d => d.status === 'OPEN') ||
    f.lifecycleStatus === 'MATURED' ||
    f.lifecycleStatus === 'EXPIRING_SOON'
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* College Welcome Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#24262B]">
              {currentUser.institutionName || 'Technical Institution Portal'}
            </h1>
            <span className="text-[11px] font-semibold bg-emerald-50 text-[#2A674E] border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Approved Institution
            </span>
          </div>
          <p className="text-xs text-[#737985] mt-1">
            Official Institution Workspace for AICTE Security Deposit / FDR Submission, Endorsement & Renewal Compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenAssistant}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-50 border border-blue-200 text-[#174B80] hover:bg-blue-100 transition-colors"
          >
            <Bot size={14} />
            <span>Ask Compliance AI</span>
          </button>

          <button
            onClick={onOpenNewFdr}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white transition-colors shadow-2xs"
          >
            <PlusCircle size={14} />
            <span>Submit New FDR</span>
          </button>
        </div>
      </div>

      {/* Action Required Banner if Discrepancies exist */}
      {discrepanciesCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <ShieldAlert className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div className="text-xs">
            <h4 className="font-semibold text-amber-900">
              Regulatory Discrepancy Found ({discrepanciesCount} Instrument Requires Correction)
            </h4>
            <p className="text-amber-800 mt-0.5">
              AICTE Scrutiny Officer or OCR document extraction detected field mismatches (e.g., face value discrepancy or missing joint AICTE lien notation). Please review the observations and upload corrected deposit receipts.
            </p>
          </div>
        </div>
      )}

      {/* Regional Endorsement & Approval Status Banner */}
      {institutionFdrs.some(f => f.caseStatus === 'ENDORSED_BY_REGIONAL_OFFICER' || f.caseStatus === 'APPROVED' || f.endorsedBy) && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="text-teal-700 shrink-0 mt-0.5" size={20} />
          <div className="text-xs space-y-1">
            <h4 className="font-semibold text-teal-950">
              Regional Bureau Endorsements & Master Registration Updates
            </h4>
            <p className="text-teal-800">
              Your fixed deposit security instruments are evaluated by the AICTE Regional Bureau. Check individual record details to view Regional Officer endorsement notes, registration credentials, and statutory validity.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Active Security Deposits"
          value={activeCount}
          subtitle={`Total Pledged: ₹${(totalValue / 100000).toFixed(1)} Lakhs`}
          icon={CheckCircle2}
          accentColor="#3F9876"
          badge={{ text: 'Compliant', variant: 'success' }}
        />
        <StatCard
          title="Expiring (<90 Days)"
          value={expiringCount}
          subtitle="Prepare replacement/renewal"
          icon={Clock}
          accentColor="#E5A548"
          badge={{ text: 'Action Due', variant: 'warning' }}
        />
        <StatCard
          title="Matured Instruments"
          value={maturedCount}
          subtitle="Apply for refund or renewal"
          icon={AlertTriangle}
          accentColor="#D9534F"
          badge={{ text: 'Matured', variant: 'error' }}
        />
        <StatCard
          title="Discrepancies"
          value={discrepanciesCount}
          subtitle="Requires correction"
          icon={FileText}
          accentColor="#174B80"
          badge={{ text: discrepanciesCount > 0 ? 'Needs Fix' : 'Clean', variant: discrepanciesCount > 0 ? 'error' : 'neutral' }}
        />
      </div>

      {/* Institution FDR Instruments Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#24262B]">
              Registered Security Deposits & FDR Records
            </h3>
            <p className="text-xs text-[#737985] mt-0.5">
              Complete repository of your institution's instruments submitted to the AICTE Regulation Bureau.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#24262B]">
            <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-[#737985] uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">FDR Reference</th>
                <th className="px-4 py-3">Bank Name & Branch</th>
                <th className="px-4 py-3">Principal Amount</th>
                <th className="px-4 py-3">Maturity Date</th>
                <th className="px-4 py-3">Lien Status</th>
                <th className="px-4 py-3">Bank Verification</th>
                <th className="px-4 py-3">Case Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {institutionFdrs.map((fdr) => (
                <tr key={fdr.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-semibold text-blue-900 font-mono">{fdr.fdrNumber}</span>
                    {fdr.registrationNumber && (
                      <div className="text-[10px] text-emerald-800 font-medium font-sans">
                        Reg: {fdr.registrationNumber}
                      </div>
                    )}
                    {fdr.predecessorFdrNumber && (
                      <div className="text-[10px] text-gray-500 font-sans">
                        Rolls over from: {fdr.predecessorFdrNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{fdr.bankName}</div>
                    <div className="text-[11px] text-[#737985]">{fdr.branchName || fdr.branchIfsc}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold font-tabular">
                    ₹{fdr.principalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 font-tabular text-[#737985]">
                    {fdr.maturityDate}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      fdr.lienStatus === 'LIEN_MARKED_AICTE' 
                        ? 'bg-[#E8F5EE] text-[#2A674E]' 
                        : 'bg-[#FDF2F2] text-[#B91C1C]'
                    }`}>
                      {fdr.lienStatus === 'LIEN_MARKED_AICTE' ? 'AICTE Endorsed' : 'Lien Not Marked'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge type="verification" value={fdr.verificationStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge type="case" value={fdr.caseStatus} />
                    {fdr.endorsedBy && (
                      <div className="text-[10px] text-teal-800 truncate mt-0.5 max-w-[140px]" title={fdr.endorsementNotes}>
                        RO: {fdr.endorsedBy.split('(')[0].trim()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onViewFdr(fdr)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      View Details
                    </button>
                    {(fdr.lifecycleStatus === 'EXPIRING_SOON' || fdr.lifecycleStatus === 'MATURED') && (
                      <button
                        onClick={() => onOpenRenewModal(fdr)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#174B80] hover:bg-[#143d67] text-white transition-colors"
                      >
                        Renew / Replace
                      </button>
                    )}
                    {fdr.lifecycleStatus === 'MATURED' && fdr.releaseStatus === 'NONE' && (
                      <button
                        onClick={() => onOpenReleaseModal(fdr)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md border border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                      >
                        Request Release
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
