import React, { useState } from 'react';
import { 
  RotateCcw, 
  Upload, 
  Calendar, 
  Building2, 
  FileText, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import { FdrInstrument, UserProfile } from '../../types';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

interface RenewalModalProps {
  isOpen: boolean;
  onClose: () => void;
  fdr: FdrInstrument | null;
  currentUser: UserProfile;
  onRenewalCompleted: () => void;
}

export const RenewalModal: React.FC<RenewalModalProps> = ({
  isOpen,
  onClose,
  fdr,
  currentUser,
  onRenewalCompleted
}) => {
  if (!isOpen || !fdr) return null;

  const [newFdrNumber, setNewFdrNumber] = useState(`${fdr.bankName.substring(0, 3).toUpperCase()}-REN-${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [newAmount, setNewAmount] = useState(String(fdr.principalAmount));
  const [newInterestRate, setNewInterestRate] = useState(String(fdr.interestRate || 7.2));
  const [newIssueDate, setNewIssueDate] = useState(fdr.maturityDate);
  
  // Calculate 5 years ahead from maturity date
  const initialMaturity = new Date(fdr.maturityDate);
  initialMaturity.setFullYear(initialMaturity.getFullYear() + 5);
  const [newMaturityDate, setNewMaturityDate] = useState(initialMaturity.toISOString().split('T')[0]);
  
  const [renewalNotes, setRenewalNotes] = useState(`Statutory rollover / replacement for maturing instrument ${fdr.fdrNumber} as per AICTE Approval Process Handbook Clause 1.4.`);
  const [uploadedDocName, setUploadedDocName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await api.renewFdr(fdr.id, {
        newFdrNumber,
        newAmount: Number(newAmount),
        newInterestRate: Number(newInterestRate),
        newIssueDate,
        newMaturityDate,
        renewalNotes,
        uploadedDocName: uploadedDocName || `Renewal_Advice_${newFdrNumber}.pdf`
      });

      onRenewalCompleted();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit renewal instrument');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Statutory FDR Renewal & Replacement Lodgement"
      subtitle={`Rolling over maturing instrument ${fdr.fdrNumber} into replacement FDR`}
      maxWidth="3xl"
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
            {submitting ? 'Lodging Renewal...' : 'Lodge Replacement Instrument'}
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

        {/* Predecessor Snapshot Banner */}
        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
            <span className="font-semibold text-gray-800">Predecessor Instrument (Maturing)</span>
            <span className="font-mono text-blue-900 font-bold">{fdr.fdrNumber}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
            <div>Current Value: <strong className="font-tabular text-gray-900">₹{fdr.principalAmount.toLocaleString('en-IN')}</strong></div>
            <div>Maturity Date: <strong className="font-tabular text-gray-900">{fdr.maturityDate}</strong></div>
            <div>Issuing Bank: <strong className="text-gray-900">{fdr.bankName}</strong></div>
          </div>
        </div>

        {/* Replacement Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              New / Rolled-Over FDR Number *
            </label>
            <input
              type="text"
              value={newFdrNumber}
              onChange={(e) => setNewFdrNumber(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80] font-mono font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Renewed Principal Amount (INR) *
            </label>
            <input
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80] font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              New Effective Issue Date *
            </label>
            <input
              type="date"
              value={newIssueDate}
              onChange={(e) => setNewIssueDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              New Maturity Date (Minimum 5 Years) *
            </label>
            <input
              type="date"
              value={newMaturityDate}
              onChange={(e) => setNewMaturityDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80]"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-700 mb-1">
            Renewal Justification / Notes
          </label>
          <textarea
            rows={2}
            value={renewalNotes}
            onChange={(e) => setRenewalNotes(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80]"
          />
        </div>

        {/* Document Upload */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <label className="block font-semibold text-gray-800 mb-1">
            Attach Bank Renewal Advice / Deposit Certificate *
          </label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setUploadedDocName(e.target.files?.[0]?.name || '')}
            className="text-xs text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#174B80] file:text-white hover:file:bg-[#153f6c]"
          />
          <p className="text-[11px] text-gray-500 mt-1">
            The previous FDR record will remain permanently preserved in the immutable audit registry and marked as RENEWED_REPLACED.
          </p>
        </div>
      </form>
    </Modal>
  );
};
