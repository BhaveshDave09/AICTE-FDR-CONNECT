import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  Upload, 
  CheckCircle2 
} from 'lucide-react';
import { FdrInstrument, UserProfile } from '../../types';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

interface ReleaseRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  fdr: FdrInstrument | null;
  currentUser: UserProfile;
  onReleaseSubmitted: () => void;
}

export const ReleaseRefundModal: React.FC<ReleaseRefundModalProps> = ({
  isOpen,
  onClose,
  fdr,
  currentUser,
  onReleaseSubmitted
}) => {
  if (!isOpen || !fdr) return null;

  const [requestType, setRequestType] = useState('FULL_RELEASE');
  const [reason, setReason] = useState('Completion of mandatory 10-year statutory lock-in period for Technical Institution Security Deposit. Institution maintains clean regulatory record and requests discharge of lien.');
  const [clearanceNo, setClearanceNo] = useState(`AICTE/${fdr.region}/CLEARANCE/2026/${Math.floor(100 + Math.random() * 900)}`);
  const [boardResolutionDate, setBoardResolutionDate] = useState('2026-10-10');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await api.submitReleaseRequest({
        fdrId: fdr.id,
        requestType,
        reason,
        regulatoryClearanceNo: clearanceNo,
        boardResolutionDate
      });

      onReleaseSubmitted();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit release application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Application for Security Deposit Lien Release / Refund"
      subtitle={`FDR Reference: ${fdr.fdrNumber} (INR ${fdr.principalAmount.toLocaleString('en-IN')})`}
      maxWidth="2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white shadow-2xs"
          >
            {submitting ? 'Submitting Application...' : 'Submit Application to Release Officer'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 leading-relaxed text-[11px]">
          <strong>Statutory Compliance Check:</strong> Security deposits can only be released upon completion of the mandatory lock-in period (e.g. 10 years for institution establishment), program closure without student liabilities, or upon grant of formal exemption by the Competent Authority.
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Application Release Category *
          </label>
          <select
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80] font-medium"
          >
            <option value="FULL_RELEASE">Full Lien Discharge (Tenure Completed)</option>
            <option value="CLOSURE_REFUND">Course / Program Discontinuation Refund</option>
            <option value="PARTIAL_RELEASE">Partial Release (Downscaled Intake)</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Justification & Ground for Release *
          </label>
          <textarea
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              AICTE Regional Office No-Dues Clearance Ref
            </label>
            <input
              type="text"
              value={clearanceNo}
              onChange={(e) => setClearanceNo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80] font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Governing Body / Board Resolution Date
            </label>
            <input
              type="date"
              value={boardResolutionDate}
              onChange={(e) => setBoardResolutionDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80]"
            />
          </div>
        </div>

        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <label className="block font-semibold text-gray-800 mb-1">
            Attach Governing Body Resolution & Clearance Certificate (PDF)
          </label>
          <input
            type="file"
            accept=".pdf"
            className="text-xs text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#174B80] file:text-white hover:file:bg-[#153f6c]"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            Once submitted, this application will be routed to the Release & Refund Bureau for eligibility vetting.
          </p>
        </div>
      </form>
    </Modal>
  );
};
