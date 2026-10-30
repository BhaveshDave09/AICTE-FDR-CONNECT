import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { AuditEvent } from '../../types';

interface AuditTrailViewProps {
  auditLogs: AuditEvent[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ auditLogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter(log => {
    if (categoryFilter !== 'ALL' && log.category !== categoryFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match = 
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        (log.fdrNumber && log.fdrNumber.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const getCategoryBadge = (category: AuditEvent['category']) => {
    switch (category) {
      case 'BANK_VERIFICATION':
        return 'bg-blue-50 text-[#174B80] border-blue-200';
      case 'SCRUTINY':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DISCREPANCY':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'RENEWAL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'RELEASE_REFUND':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#24262B]">
              Immutable Regulatory Audit Trail
            </h1>
            <span className="text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-300 px-2.5 py-0.5 rounded-full font-mono">
              Append-Only Ledger
            </span>
          </div>
          <p className="text-xs text-[#737985] mt-1">
            Complete cryptographic audit trail of all FDR submissions, OCR scans, bank endorsements, and scrutiny observations.
          </p>
        </div>

        <div className="text-xs font-semibold text-gray-500 font-tabular">
          {filteredLogs.length} Total Audit Records
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by action, actor name, FDR number, or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#174B80]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none w-full sm:w-auto"
        >
          <option value="ALL">All Event Categories</option>
          <option value="FDR_SUBMISSION">FDR Submission</option>
          <option value="BANK_VERIFICATION">Bank Verification</option>
          <option value="SCRUTINY">Regulatory Scrutiny</option>
          <option value="DISCREPANCY">Discrepancy</option>
          <option value="RENEWAL">Renewal & Replacement</option>
          <option value="RELEASE_REFUND">Release & Refund</option>
          <option value="AUTH">Authentication & Roles</option>
          <option value="SYSTEM_SETTINGS">System Settings</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#24262B]">
            <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor & Role</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Affected FDR</th>
                <th className="px-4 py-3">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 text-[#737985] font-tabular whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-semibold text-gray-900">{log.actorName}</div>
                    <div className="text-[10px] text-gray-400 font-mono uppercase">{log.actorRole}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryBadge(log.category)}`}>
                      {log.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold font-mono text-gray-900 whitespace-nowrap">
                    {log.action}
                  </td>
                  <td className="px-4 py-3 font-mono text-blue-900 font-semibold whitespace-nowrap">
                    {log.fdrNumber || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-md">
                    <div>{log.details}</div>
                    {(log.previousValue || log.newValue) && (
                      <div className="text-[10.5px] text-gray-500 mt-0.5 font-mono">
                        {log.previousValue && <span>Old: {log.previousValue} </span>}
                        {log.newValue && <span>→ New: {log.newValue}</span>}
                      </div>
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
