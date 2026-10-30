import React from 'react';
import { Building2, PlusCircle, MapPin, CheckCircle2 } from 'lucide-react';
import { Institution, FdrInstrument, UserProfile } from '../../types';

interface MyInstitutionViewProps {
  currentUser: UserProfile;
  institution?: Institution;
  fdrs: FdrInstrument[];
  onOpenNewFdr: () => void;
  onViewFdr: (fdr: FdrInstrument) => void;
}

export const MyInstitutionView: React.FC<MyInstitutionViewProps> = ({
  currentUser,
  institution,
  fdrs,
  onOpenNewFdr,
  onViewFdr
}) => {
  // Filter FDRs belonging to this institution
  const instFdrs = fdrs.filter(f => 
    currentUser.institutionId ? f.institutionId === currentUser.institutionId : true
  );

  const totalDeposited = instFdrs.reduce((acc, f) => acc + (f.principalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Institution Banner Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 pb-6 border-b border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#174B80] text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-[#24262B]">
                  {institution?.name || currentUser.institutionName || 'Delhi Institute of Engineering & Technology'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  AICTE Approved (EOA 2025-26)
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#737985]">
                <span className="font-mono font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Permanent ID: {institution?.aictePermanentId || '1-3324558911'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {institution?.region || 'Northern'} Region • {institution?.state || 'Delhi NCR'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onOpenNewFdr}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#174B80] hover:bg-[#123860] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit New FDR</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
            <div className="text-xs text-[#737985]">Active FDR Instruments</div>
            <div className="text-2xl font-bold text-[#24262B] mt-1 font-tabular">
              {instFdrs.length}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>Fully Lien-Marked</span>
            </div>
          </div>

          <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
            <div className="text-xs text-[#737985]">Total Deposit Face Value</div>
            <div className="text-2xl font-bold text-[#174B80] mt-1 font-tabular">
              ₹{(totalDeposited / 100000).toFixed(1)} Lakhs
            </div>
            <div className="text-[11px] text-[#737985] mt-1">
              ₹{totalDeposited.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
            <div className="text-xs text-[#737985]">Mandated APH Requirement</div>
            <div className="text-2xl font-bold text-[#24262B] mt-1 font-tabular">
              ₹35.0 Lakhs
            </div>
            <div className="text-[11px] text-emerald-700 mt-1 font-medium">
              100% Compliant
            </div>
          </div>

          <div className="p-4 bg-gray-50/70 rounded-xl border border-gray-100">
            <div className="text-xs text-[#737985]">Lock-in Maturity Period</div>
            <div className="text-2xl font-bold text-[#24262B] mt-1 font-tabular">
              8–10 Years
            </div>
            <div className="text-[11px] text-[#737985] mt-1">
              Joint A/C with AICTE RO
            </div>
          </div>
        </div>
      </div>

      {/* Sponsoring Body & Official Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs space-y-3">
          <h3 className="font-semibold text-sm text-[#24262B] pb-2 border-b border-gray-100">
            Sponsoring Trust / Society & Authorized Signatory
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-[#737985]">Sponsoring Trust</span>
              <strong className="text-gray-900">National Technical Education Trust</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-[#737985]">Trust Registration No.</span>
              <strong className="text-gray-900 font-mono">DL/TR/2012/88491</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-[#737985]">Authorized Principal</span>
              <strong className="text-gray-900">{currentUser.name}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-[#737985]">Official Email</span>
              <strong className="text-gray-900 font-mono">{currentUser.email}</strong>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs space-y-3">
          <h3 className="font-semibold text-sm text-[#24262B] pb-2 border-b border-gray-100">
            Designated Operating & Lien Bank Details
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-[#737985]">Issuing Commercial Bank</span>
              <strong className="text-gray-900">State Bank of India</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-[#737985]">Authorized Branch</span>
              <strong className="text-gray-900">Parliament Street Branch (00691)</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-[#737985]">Joint Account Title</span>
              <strong className="text-gray-900">National Technical Ed Trust & RO AICTE</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-[#737985]">Bank Nodal Officer</span>
              <strong className="text-gray-900">Chief Manager (Credit & Guarantees)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Associated Deposit Instruments */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-sm text-[#24262B]">Registered Deposit Instruments</h3>
            <p className="text-xs text-[#737985]">Current Fixed Deposit Receipts lodged with AICTE Regulation Bureau.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#24262B]">
            <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-[#737985] uppercase border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">FDR Number</th>
                <th className="px-4 py-3">Bank & Branch</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Maturity Date</th>
                <th className="px-4 py-3">Lifecycle Status</th>
                <th className="px-4 py-3">Bank Verification</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {instFdrs.map((fdr) => (
                <tr key={fdr.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-blue-900">{fdr.fdrNumber}</td>
                  <td className="px-4 py-3">{fdr.bankName}</td>
                  <td className="px-4 py-3 font-semibold font-tabular">₹{fdr.principalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">{fdr.maturityDate}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {fdr.lifecycleStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                      {fdr.verificationStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onViewFdr(fdr)}
                      className="px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-50 rounded font-medium"
                    >
                      View Details
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
