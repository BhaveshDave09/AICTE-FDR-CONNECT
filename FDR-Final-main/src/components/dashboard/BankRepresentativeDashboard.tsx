import React, { useState } from 'react';
import {
  Landmark,
  Clock,
  AlertTriangle,
  QrCode,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { FdrInstrument, UserProfile } from '../../types';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';

interface BankRepresentativeDashboardProps {
  currentUser: UserProfile;
  fdrs: FdrInstrument[];
  onOpenVerifyModal: (fdr: FdrInstrument) => void;
  onOpenTokenDirectVerify: (token: string) => void;
}

export const BankRepresentativeDashboard: React.FC<BankRepresentativeDashboardProps> = ({
  currentUser,
  fdrs,
  onOpenVerifyModal,
  onOpenTokenDirectVerify
}) => {
  const [tokenInput, setTokenInput] = useState('');

  // Filter instruments belonging to this bank
  const bankFdrs = fdrs.filter(f => 
    !currentUser.bankName || f.bankName.toLowerCase().includes(currentUser.bankName.toLowerCase())
  );

  const pendingRequests = bankFdrs.filter(f => f.verificationStatus === 'PENDING_BANK_VERIFICATION');
  const confirmedRequests = bankFdrs.filter(f => f.verificationStatus === 'CONFIRMED');
  const discrepancyRequests = bankFdrs.filter(f => f.verificationStatus === 'DISCREPANCY_FOUND');

  const handleManualTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      onOpenTokenDirectVerify(tokenInput.trim());
      setTokenInput('');
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Welcome Card & Bank Info */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#24262B]">
              Bank Verification Portal
            </h1>
            <span className="text-[11px] font-semibold bg-blue-50 text-[#174B80] border border-blue-200 px-2.5 py-0.5 rounded-full">
              {currentUser.bankName || 'Scheduled Commercial Bank'}
            </span>
          </div>
          <p className="text-xs text-[#737985] mt-1">
            Authorized portal for verifying Fixed Deposit Receipts against Core Banking System (CBS) records and AICTE lien endorsements.
            <span className="ml-2 font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Simulated CBS Reconciliation Mode
            </span>
          </p>
        </div>

        {/* Quick Token / QR lookup form */}
        <div className="space-y-1.5 self-start sm:self-auto">
          <form onSubmit={handleManualTokenSubmit} className="flex items-center gap-2">
            <div className="relative">
              <KeyRound size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Paste verification token or scan..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#174B80] w-64 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-[#174B80] hover:bg-[#153f6c] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 shrink-0 shadow-2xs"
            >
              <QrCode size={13} />
              <span>Verify Token</span>
            </button>
          </form>

          {/* Evaluator Test Quick Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
            <span className="font-semibold text-gray-700">Test Tokens:</span>
            <button
              type="button"
              onClick={() => onOpenTokenDirectVerify('tok_sbi_verif_11029384_pending')}
              className="px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono transition-colors"
              title="Active Valid SBI Token (Pending)"
            >
              Valid SBI
            </button>
            <button
              type="button"
              onClick={() => onOpenTokenDirectVerify('tok_bob_verif_77291034_active')}
              className="px-1.5 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-mono transition-colors"
              title="Active Bank of Baroda Token"
            >
              Valid BOB
            </button>
            <button
              type="button"
              onClick={() => onOpenTokenDirectVerify('tok_test_expired_fdr_sample')}
              className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-mono transition-colors"
              title="Expired Token Sample"
            >
              Expired
            </button>
            <button
              type="button"
              onClick={() => onOpenTokenDirectVerify('tok_test_revoked_fdr_sample')}
              className="px-1.5 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-mono transition-colors"
              title="Revoked Token Sample"
            >
              Revoked
            </button>
            <button
              type="button"
              onClick={() => onOpenTokenDirectVerify('tok_nonexistent_999999')}
              className="px-1.5 py-0.5 rounded bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 font-mono transition-colors"
              title="Nonexistent Token Sample"
            >
              Non-existent
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Awaiting Verification"
          value={pendingRequests.length}
          subtitle="Action required by branch"
          icon={Clock}
          accentColor="#E5A548"
          badge={{ text: 'Pending', variant: 'warning' }}
        />
        <StatCard
          title="Confirmed Genuine"
          value={confirmedRequests.length}
          subtitle="CBS and lien confirmed"
          icon={CheckCircle2}
          accentColor="#3F9876"
          badge={{ text: 'Verified', variant: 'success' }}
        />
        <StatCard
          title="Reported Discrepancies"
          value={discrepancyRequests.length}
          subtitle="Mismatch in amount or lien"
          icon={AlertTriangle}
          accentColor="#D9534F"
          badge={{ text: 'Discrepancy', variant: 'error' }}
        />
        <StatCard
          title="Total Bank Instruments"
          value={bankFdrs.length}
          subtitle={`Issued by ${currentUser.bankName || 'Bank'}`}
          icon={Landmark}
          accentColor="#174B80"
          badge={{ text: 'Total', variant: 'neutral' }}
        />
      </div>

      {/* Verification Queue Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#24262B]">
              Bank Verification Requests Queue
            </h3>
            <p className="text-xs text-[#737985] mt-0.5">
              Review deposited receipts, cross-verify with your Finacle / CBS records, and endorse confirmation.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#24262B]">
            <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-[#737985] uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">FDR Number</th>
                <th className="px-4 py-3">Institution Name</th>
                <th className="px-4 py-3">Deposit Face Value</th>
                <th className="px-4 py-3">Maturity Date</th>
                <th className="px-4 py-3">Verification Token</th>
                <th className="px-4 py-3">Verification Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bankFdrs.map((fdr) => (
                <tr key={fdr.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-blue-900 font-mono">
                    {fdr.fdrNumber}
                  </td>
                  <td className="px-4 py-3 max-w-[200px] truncate">
                    {fdr.institutionName}
                  </td>
                  <td className="px-4 py-3 font-semibold font-tabular">
                    ₹{fdr.principalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 font-tabular text-[#737985]">
                    {fdr.maturityDate}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-gray-500">
                    {fdr.verificationRequest ? (
                      <span className="truncate block max-w-[140px]" title={fdr.verificationRequest.token}>
                        {fdr.verificationRequest.token}
                      </span>
                    ) : (
                      'Direct Entry'
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge type="verification" value={fdr.verificationStatus} />
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => onOpenVerifyModal(fdr)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        fdr.verificationStatus === 'PENDING_BANK_VERIFICATION'
                          ? 'bg-[#174B80] hover:bg-[#153f6c] text-white shadow-2xs'
                          : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {fdr.verificationStatus === 'PENDING_BANK_VERIFICATION' ? 'Verify Now' : 'View Verification'}
                    </button>
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
