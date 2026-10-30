import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { FdrInstrument, UserProfile, ReleaseRefundRequest } from '../../types';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';

interface ReleaseOfficerDashboardProps {
  currentUser: UserProfile;
  fdrs: FdrInstrument[];
  onReviewRelease: (fdrId: string, decision: 'APPROVE' | 'REQUEST_DOCS' | 'DISCHARGE' | 'REJECT', notes?: string) => Promise<void>;
  onViewFdr: (fdr: FdrInstrument) => void;
}

export const ReleaseOfficerDashboard: React.FC<ReleaseOfficerDashboardProps> = ({
  currentUser,
  fdrs,
  onReviewRelease,
  onViewFdr
}) => {
  const [selectedFdr, setSelectedFdr] = useState<FdrInstrument | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [decision, setDecision] = useState<'APPROVE' | 'REQUEST_DOCS' | 'DISCHARGE' | 'REJECT'>('APPROVE');
  const [officerNotes, setOfficerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // All instruments with a release/refund request
  const releaseFdrs = fdrs.filter(f => 
    f.releaseStatus !== 'NONE' || 
    Boolean(f.releaseRequest) || 
    f.lifecycleStatus === 'RELEASED'
  );

  const pendingReview = releaseFdrs.filter(f => f.releaseStatus === 'REQUESTED' || f.releaseStatus === 'UNDER_ELIGIBILITY_REVIEW' || f.releaseStatus === 'AWAITING_APPROVAL');
  const approvedAwaitingDischarge = releaseFdrs.filter(f => f.releaseStatus === 'APPROVED');
  const dischargedCount = releaseFdrs.filter(f => f.releaseStatus === 'DISCHARGED' || f.lifecycleStatus === 'RELEASED');
  const docsPendingCount = releaseFdrs.filter(f => f.releaseStatus === 'DOCS_PENDING');

  const handleOpenReview = (fdr: FdrInstrument) => {
    setSelectedFdr(fdr);
    setOfficerNotes(fdr.releaseRequest?.officerNotes || '');
    setReviewModalOpen(true);
  };

  const handleExecuteDecision = async () => {
    if (!selectedFdr) return;
    setSubmitting(true);
    try {
      await onReviewRelease(selectedFdr.id, decision, officerNotes);
      setReviewModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#24262B]">
              Deposit Discharge & Refund Bureau
            </h1>
            <span className="text-[11px] font-semibold bg-emerald-50 text-[#2A674E] border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Release Officer Workspace
            </span>
          </div>
          <p className="text-xs text-[#737985] mt-1">
            Vet lock-in compliance, institutional closure documentation, and generate AICTE Official Discharge Orders.
          </p>
        </div>
      </div>

      {/* Regulatory Reminder Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="text-[#174B80] shrink-0 mt-0.5" size={20} />
        <div className="text-xs">
          <h4 className="font-semibold text-blue-900">
            Statutory Principle: Maturity Alone Does Not Grant Release
          </h4>
          <p className="text-blue-800 mt-0.5">
            As per AICTE Approval Process Handbook Clause 7.1, security deposits remain pledged with AICTE until the institution satisfies statutory tenure (typically 8 to 10 years for institution establishment), clear of all regulatory/student liabilities, and obtains approval from the Competent Authority.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Under Eligibility Review"
          value={pendingReview.length}
          subtitle="Awaiting officer vetting"
          icon={Clock}
          accentColor="#174B80"
          badge={{ text: 'Queue', variant: 'warning' }}
        />
        <StatCard
          title="Approved (Pending Discharge)"
          value={approvedAwaitingDischarge.length}
          subtitle="Ready for Bank NOC issuance"
          icon={ShieldCheck}
          accentColor="#3F9876"
          badge={{ text: 'Approved', variant: 'success' }}
        />
        <StatCard
          title="Discharged & Closed"
          value={dischargedCount.length}
          subtitle="Lien officially removed"
          icon={CheckCircle2}
          accentColor="#10B981"
          badge={{ text: 'Discharged', variant: 'neutral' }}
        />
        <StatCard
          title="Documentation Pending"
          value={docsPendingCount.length}
          subtitle="Awaiting college resolution"
          icon={FileText}
          accentColor="#E5A548"
          badge={{ text: 'Pending', variant: 'info' }}
        />
      </div>

      {/* Release Requests Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#24262B]">
              Deposit Release & Refund Applications
            </h3>
            <p className="text-xs text-[#737985] mt-0.5">
              Review justification documents, regulatory clearance references, and record discharge orders.
            </p>
          </div>
          <span className="text-xs text-[#737985] font-medium font-tabular">
            {releaseFdrs.length} Application(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#24262B]">
            <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-[#737985] uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">FDR Reference</th>
                <th className="px-4 py-3">Institution Name</th>
                <th className="px-4 py-3">Deposit Amount</th>
                <th className="px-4 py-3">Maturity Date</th>
                <th className="px-4 py-3">Reason / Justification</th>
                <th className="px-4 py-3">Release Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {releaseFdrs.map((fdr) => (
                <tr key={fdr.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-blue-900 font-mono">
                    {fdr.fdrNumber}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate font-medium text-[#24262B]">
                    {fdr.institutionName}
                  </td>
                  <td className="px-4 py-3 font-semibold font-tabular">
                    ₹{fdr.principalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 font-tabular text-[#737985]">
                    {fdr.maturityDate}
                  </td>
                  <td className="px-4 py-3 max-w-[240px] truncate text-[#737985]">
                    {fdr.releaseRequest?.reason || 'Lock-in period completion'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge type="release" value={fdr.releaseStatus} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onViewFdr(fdr)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      Audit Record
                    </button>
                    <button
                      onClick={() => handleOpenReview(fdr)}
                      className="px-3 py-1 bg-[#174B80] hover:bg-[#153f6c] text-white text-xs font-semibold rounded-md shadow-2xs transition-colors"
                    >
                      Process Release
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Release Decision Modal */}
      {selectedFdr && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Process Release Request: ${selectedFdr.fdrNumber}`}
          subtitle={`${selectedFdr.institutionName} • Face Value: INR ${selectedFdr.principalAmount.toLocaleString('en-IN')}`}
          maxWidth="lg"
          footer={
            <>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDecision}
                disabled={submitting}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white shadow-2xs"
              >
                {submitting ? 'Recording...' : 'Record Regulatory Decision'}
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Issuing Bank:</span>
                <span className="font-semibold text-gray-900">{selectedFdr.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Maturity Date:</span>
                <span className="font-semibold text-gray-900">{selectedFdr.maturityDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Clearance Ref:</span>
                <span className="font-mono text-gray-900">{selectedFdr.releaseRequest?.regulatoryClearanceNo || 'Submitted'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Board Resolution:</span>
                <span className="text-gray-900 font-tabular">{selectedFdr.releaseRequest?.boardResolutionDate || 'Attached'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Official Regulatory Decision
              </label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value as any)}
                className="w-full text-xs p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#174B80] font-medium"
              >
                <option value="APPROVE">Approve Release (Route to Competent Authority)</option>
                <option value="DISCHARGE">Issue Formal Bank Lien Discharge Order (Final Release)</option>
                <option value="REQUEST_DOCS">Request Additional Institutional Documents</option>
                <option value="REJECT">Reject Application for Release</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Scrutiny Observations & Conditions
              </label>
              <textarea
                rows={3}
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="Enter eligibility findings, verification of 10-year lock-in period, no-dues verification, and discharge conditions..."
                className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#174B80]"
              />
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
