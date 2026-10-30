import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  RotateCcw, 
  ShieldCheck, 
  ArrowUpDown,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { FdrInstrument, UserProfile, RegionalZone } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface FdrRepositoryTableProps {
  fdrs: FdrInstrument[];
  currentUser: UserProfile;
  onViewFdr: (fdr: FdrInstrument) => void;
  onExamineFdr?: (fdrId: string, fdr: FdrInstrument) => void;
  onOpenNewFdr: () => void;
  onOpenVerifyModal: (fdr: FdrInstrument) => void;
  onOpenRenewModal: (fdr: FdrInstrument) => void;
  onOpenReleaseModal: (fdr: FdrInstrument) => void;
  onExportCsv: () => void;
}

export const FdrRepositoryTable: React.FC<FdrRepositoryTableProps> = ({
  fdrs,
  currentUser,
  onViewFdr,
  onExamineFdr,
  onOpenNewFdr,
  onOpenVerifyModal,
  onOpenRenewModal,
  onOpenReleaseModal,
  onExportCsv
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('ALL');
  const [lifecycleFilter, setLifecycleFilter] = useState('ALL');
  const [verificationFilter, setVerificationFilter] = useState('ALL');
  const [caseFilter, setCaseFilter] = useState('ALL');
  const [sortField, setSortField] = useState<'maturityDate' | 'principalAmount' | 'submissionDate'>('maturityDate');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filtered & Sorted FDRs
  const filteredFdrs = useMemo(() => {
    return fdrs.filter(f => {
      // Role scope filter: Institutions strictly see their own records
      if (currentUser.role === 'institution' && currentUser.institutionId && f.institutionId !== currentUser.institutionId) {
        return false;
      }

      // Dropdown filters
      if (regionFilter !== 'ALL' && f.region !== regionFilter) return false;
      if (lifecycleFilter !== 'ALL' && f.lifecycleStatus !== lifecycleFilter) return false;
      if (verificationFilter !== 'ALL' && f.verificationStatus !== verificationFilter) return false;
      if (caseFilter !== 'ALL' && f.caseStatus !== caseFilter) return false;

      // Text search
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matches = 
          f.fdrNumber.toLowerCase().includes(q) ||
          f.institutionName.toLowerCase().includes(q) ||
          f.bankName.toLowerCase().includes(q) ||
          f.purpose.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'principalAmount') {
        comparison = a.principalAmount - b.principalAmount;
      } else if (sortField === 'maturityDate') {
        comparison = new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime();
      } else {
        comparison = new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime();
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [fdrs, currentUser, regionFilter, lifecycleFilter, verificationFilter, caseFilter, searchTerm, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredFdrs.length / pageSize));
  const paginatedFdrs = filteredFdrs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: 'maturityDate' | 'principalAmount' | 'submissionDate') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Title & Top Action Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#24262B]">
            AICTE Central FDR & Security Deposit Repository
          </h2>
          <p className="text-xs text-[#737985] mt-0.5">
            Comprehensive audit registry of all verified fixed deposit receipts, endorsements, and renewals.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors shadow-2xs"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>

          {(currentUser.role === 'institution' || currentUser.role === 'headquarters' || currentUser.role === 'admin') && (
            <button
              onClick={onOpenNewFdr}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white transition-colors shadow-2xs"
            >
              <PlusCircle size={14} />
              <span>Submit New FDR</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by FDR number, institution name, bank, or program..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#174B80]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={regionFilter}
            onChange={(e) => { setRegionFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Regions</option>
            <option value="Northern">Northern</option>
            <option value="Western">Western</option>
            <option value="Southern">Southern</option>
            <option value="South-Western">South-Western</option>
            <option value="Eastern">Eastern</option>
            <option value="Central">Central</option>
          </select>

          <select
            value={lifecycleFilter}
            onChange={(e) => { setLifecycleFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Lifecycles</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRING_SOON">Expiring Soon (&lt;90d)</option>
            <option value="MATURED">Matured</option>
            <option value="RENEWED_REPLACED">Renewed / Replaced</option>
            <option value="RELEASED">Released</option>
          </select>

          <select
            value={verificationFilter}
            onChange={(e) => { setVerificationFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Verifications</option>
            <option value="CONFIRMED">Bank Confirmed</option>
            <option value="PENDING_BANK_VERIFICATION">Pending Bank</option>
            <option value="DISCREPANCY_FOUND">Discrepancy</option>
            <option value="NOT_REQUESTED">Not Dispatched</option>
          </select>

          <select
            value={caseFilter}
            onChange={(e) => { setCaseFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none"
          >
            <option value="ALL">All Administrative Status</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_SCRUTINY">Under Scrutiny</option>
            <option value="AWAITING_COMPETENT_AUTHORITY">Awaiting Regional Review</option>
            <option value="AWAITING_INSTITUTION_CORRECTION">Correction Needed</option>
            <option value="AWAITING_BANK_RESPONSE">Awaiting Bank Response</option>
            <option value="APPROVED">Approved & Registered</option>
            <option value="REJECTED">Rejected</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#24262B]">
            <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-[#737985] uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">FDR Reference</th>
                <th className="px-4 py-3">Institution & Region</th>
                <th className="px-4 py-3">Bank & Branch</th>
                <th 
                  className="px-4 py-3 cursor-pointer hover:text-gray-900 select-none"
                  onClick={() => toggleSort('principalAmount')}
                >
                  <div className="flex items-center gap-1">
                    <span>Principal (INR)</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th 
                  className="px-4 py-3 cursor-pointer hover:text-gray-900 select-none"
                  onClick={() => toggleSort('maturityDate')}
                >
                  <div className="flex items-center gap-1">
                    <span>Maturity Date</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="px-4 py-3">Lien Status</th>
                <th className="px-4 py-3">Bank Verification</th>
                <th className="px-4 py-3">Case Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedFdrs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">
                    No instruments match the current search and filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedFdrs.map((fdr) => (
                  <tr key={fdr.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-semibold text-blue-900 font-mono block">{fdr.fdrNumber}</span>
                      {fdr.registrationNumber && (
                        <span className="text-[10px] text-emerald-800 font-medium block font-sans">
                          Reg: {fdr.registrationNumber}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 font-tabular block">Submitted: {fdr.submissionDate}</span>
                      {fdr.predecessorFdrNumber && (
                        <span className="text-[10px] text-blue-700 block font-sans">
                          Rolls over from: {fdr.predecessorFdrNumber}
                        </span>
                      )}
                      {fdr.replacementFdrNumber && (
                        <span className="text-[10px] text-purple-700 block font-sans">
                          Replaced by: {fdr.replacementFdrNumber}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="font-medium text-[#24262B] truncate">{fdr.institutionName}</div>
                      <div className="text-[11px] text-[#737985]">{fdr.region} Region</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{fdr.bankName}</div>
                      <div className="text-[11px] text-[#737985]">{fdr.branchIfsc}</div>
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
                        {fdr.lienStatus === 'LIEN_MARKED_AICTE' ? 'AICTE Endorsed' : 'Not Marked'}
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
                      {currentUser.role === 'scrutiny_officer' && onExamineFdr ? (
                        <button
                          onClick={() => onExamineFdr(fdr.id, fdr)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#174B80] hover:bg-[#153f6c] text-white transition-colors"
                          title="Examine submission and OCR extraction"
                        >
                          Examine
                        </button>
                      ) : null}

                      {currentUser.role === 'regional_officer' && fdr.caseStatus === 'AWAITING_COMPETENT_AUTHORITY' ? (
                        <button
                          onClick={() => onViewFdr(fdr)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#174B80] hover:bg-[#153f6c] text-white transition-colors shadow-2xs"
                          title="Review & Endorse"
                        >
                          Endorse
                        </button>
                      ) : null}

                      <button
                        onClick={() => onViewFdr(fdr)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
                        title="View Full Instrument Audit Detail"
                      >
                        Details
                      </button>
                      
                      {currentUser.role === 'bank_representative' && fdr.verificationStatus === 'PENDING_BANK_VERIFICATION' && (
                        <button
                          onClick={() => onOpenVerifyModal(fdr)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#174B80] hover:bg-[#153f6c] text-white transition-colors"
                        >
                          Verify
                        </button>
                      )}

                      {currentUser.role === 'institution' && (fdr.lifecycleStatus === 'EXPIRING_SOON' || fdr.lifecycleStatus === 'MATURED') && (
                        <button
                          onClick={() => onOpenRenewModal(fdr)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#174B80] hover:bg-[#153f6c] text-white transition-colors"
                        >
                          Renew
                        </button>
                      )}

                      {currentUser.role === 'institution' && fdr.lifecycleStatus === 'MATURED' && fdr.releaseStatus === 'NONE' && (
                        <button
                          onClick={() => onOpenReleaseModal(fdr)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md border border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                        >
                          Release
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#737985]">
          <div>
            Showing <span className="font-semibold text-gray-900">{filteredFdrs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> to{' '}
            <span className="font-semibold text-gray-900">{Math.min(currentPage * pageSize, filteredFdrs.length)}</span> of{' '}
            <span className="font-semibold text-gray-900">{filteredFdrs.length}</span> instruments
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="px-3 py-1 font-semibold text-gray-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
