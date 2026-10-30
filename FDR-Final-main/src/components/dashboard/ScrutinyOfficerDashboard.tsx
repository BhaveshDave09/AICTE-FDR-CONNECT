import React from 'react';
import {
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Sparkles
} from 'lucide-react';
import { FdrInstrument, UserProfile } from '../../types';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';

interface ScrutinyOfficerDashboardProps {
  currentUser: UserProfile;
  fdrs: FdrInstrument[];
  onViewFdr: (fdr: FdrInstrument) => void;
  onExamineFdr?: (fdrId: string, fdr: FdrInstrument) => void;
  onOpenAssistant: () => void;
}

export const ScrutinyOfficerDashboard: React.FC<ScrutinyOfficerDashboardProps> = ({
  currentUser,
  fdrs,
  onViewFdr,
  onExamineFdr,
  onOpenAssistant
}) => {
  const safeFdrs = Array.isArray(fdrs) ? fdrs : [];
  const scrutinyQueue = safeFdrs.filter(f => 
    f && (
      f.caseStatus === 'SUBMITTED' || 
      f.caseStatus === 'UNDER_SCRUTINY' || 
      f.caseStatus === 'AWAITING_INSTITUTION_CORRECTION'
    )
  );

  const pendingCount = safeFdrs.filter(f => f && (f.caseStatus === 'UNDER_SCRUTINY' || f.caseStatus === 'SUBMITTED')).length;
  const discrepanciesCount = safeFdrs.filter(f => (f?.discrepancies || []).some(d => d.status === 'OPEN')).length;
  const bankAwaitingCount = safeFdrs.filter(f => f?.verificationStatus === 'PENDING_BANK_VERIFICATION').length;
  const approvedCount = safeFdrs.filter(f => f?.caseStatus === 'APPROVED').length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#24262B]">
              Regulatory Scrutiny Bureau
            </h1>
            <span className="text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-0.5 rounded-full">
              Scrutiny Officer Workspace
            </span>
          </div>
          <p className="text-xs text-[#737985] mt-1">
            Examine submitted FDR documents, compare OCR field extractions, resolve discrepancies, and recommend administrative decisions.
          </p>
        </div>

        <button
          onClick={onOpenAssistant}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-[#174B80] hover:from-blue-100 hover:to-indigo-100 transition-colors shadow-2xs"
        >
          <Sparkles size={14} className="text-blue-600" />
          <span>Ask AI Assistant for Policy Precedents</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Cases In Scrutiny Queue"
          value={pendingCount}
          subtitle="Ready for document vetting"
          icon={Clock}
          accentColor="#174B80"
          badge={{ text: 'Action Needed', variant: 'warning' }}
        />
        <StatCard
          title="Flagged Discrepancies"
          value={discrepanciesCount}
          subtitle="OCR mismatch or missing lien"
          icon={AlertTriangle}
          accentColor="#D9534F"
          badge={{ text: 'Discrepancies', variant: 'error' }}
        />
        <StatCard
          title="Awaiting Bank"
          value={bankAwaitingCount}
          subtitle="Dispatched to bank branch"
          icon={ShieldCheck}
          accentColor="#E5A548"
          badge={{ text: 'Bank Pending', variant: 'info' }}
        />
        <StatCard
          title="Approved Instruments"
          value={approvedCount}
          subtitle="Satisfied all regulations"
          icon={CheckCircle2}
          accentColor="#3F9876"
          badge={{ text: 'Approved', variant: 'success' }}
        />
      </div>

      {/* Scrutiny Queue */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#24262B]">
              Active Scrutiny & Vetting Queue
            </h3>
            <p className="text-xs text-[#737985] mt-0.5">
              Side-by-side comparison of submitted metadata vs extracted document fields.
            </p>
          </div>
          <span className="text-xs text-[#737985] font-medium">
            {scrutinyQueue.length} Pending Review
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#24262B]">
            <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-[#737985] uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">FDR Number</th>
                <th className="px-4 py-3">Institution & Region</th>
                <th className="px-4 py-3">Deposit Face Value</th>
                <th className="px-4 py-3">OCR Confidence</th>
                <th className="px-4 py-3">Bank Status</th>
                <th className="px-4 py-3">Discrepancy Flags</th>
                <th className="px-4 py-3">Case Status</th>
                <th className="px-4 py-3 text-right">Scrutiny Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scrutinyQueue.map((fdr) => {
                const openDisc = (fdr.discrepancies || []).filter(d => d.status === 'OPEN').length;
                const ocrConf = fdr.documents?.[0]?.ocrConfidence ?? 95;
                return (
                  <tr key={fdr.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 font-semibold text-blue-900 font-mono">
                      {fdr.fdrNumber}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="font-medium text-[#24262B] truncate">{fdr.institutionName}</div>
                      <div className="text-[11px] text-[#737985]">{fdr.region}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold font-tabular">
                      ₹{Number(fdr.principalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full font-tabular ${
                        ocrConf >= 95 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {ocrConf}% Confidence
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge type="verification" value={fdr.verificationStatus} />
                    </td>
                    <td className="px-4 py-3">
                      {openDisc > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          <AlertTriangle size={11} />
                          {openDisc} Flagged
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Clean
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge type="case" value={fdr.caseStatus} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onExamineFdr) {
                            onExamineFdr(fdr.id, fdr);
                          } else {
                            onViewFdr(fdr);
                          }
                        }}
                        className="px-3 py-1.5 bg-[#174B80] hover:bg-[#153f6c] text-white text-xs font-semibold rounded-md shadow-2xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        title={`Examine and review submission ${fdr.fdrNumber}`}
                      >
                        <Eye size={13} />
                        <span>Examine</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
