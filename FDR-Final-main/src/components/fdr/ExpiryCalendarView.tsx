import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  Landmark, 
  RefreshCw, 
  Unlock, 
  Eye, 
  Play, 
  Filter,
  FileText
} from 'lucide-react';
import { FdrInstrument, UserProfile } from '../../types';

interface ExpiryCalendarViewProps {
  fdrs: FdrInstrument[];
  currentUser: UserProfile;
  onViewFdr: (fdr: FdrInstrument) => void;
  onOpenRenewModal: (fdr: FdrInstrument) => void;
  onOpenReleaseModal: (fdr: FdrInstrument) => void;
  onRunExpiryScan?: () => void;
  expiryScanRunning?: boolean;
}

export const ExpiryCalendarView: React.FC<ExpiryCalendarViewProps> = ({
  fdrs,
  currentUser,
  onViewFdr,
  onOpenRenewModal,
  onOpenReleaseModal,
  onRunExpiryScan,
  expiryScanRunning = false
}) => {
  const [filterBucket, setFilterBucket] = useState<'all' | 'critical' | 'urgent' | 'warning' | 'matured'>('all');

  const today = new Date();

  // Helper to calculate days remaining until maturity
  const getDaysRemaining = (maturityDateStr: string) => {
    const mat = new Date(maturityDateStr);
    const diffMs = mat.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Group FDRs into buckets
  const fdrItemsWithDays = fdrs.map(f => ({
    fdr: f,
    days: getDaysRemaining(f.maturityDate)
  })).sort((a, b) => a.days - b.days);

  const maturedItems = fdrItemsWithDays.filter(i => i.days <= 0 || i.fdr.lifecycleStatus === 'MATURED');
  const criticalItems = fdrItemsWithDays.filter(i => i.days > 0 && i.days <= 30);
  const urgentItems = fdrItemsWithDays.filter(i => i.days > 30 && i.days <= 60);
  const warningItems = fdrItemsWithDays.filter(i => i.days > 60 && i.days <= 90);

  const filteredItems = fdrItemsWithDays.filter(i => {
    if (filterBucket === 'all') return true;
    if (filterBucket === 'matured') return i.days <= 0 || i.fdr.lifecycleStatus === 'MATURED';
    if (filterBucket === 'critical') return i.days > 0 && i.days <= 30;
    if (filterBucket === 'urgent') return i.days > 30 && i.days <= 60;
    if (filterBucket === 'warning') return i.days > 60 && i.days <= 90;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-[#174B80] rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#24262B]">Deposit Maturity & Expiry Calendar</h2>
              <p className="text-xs text-[#737985]">
                Automated 90-day, 60-day, 30-day, and 15-day reminder schedules per AICTE Regulation Bureau norms.
              </p>
            </div>
          </div>
        </div>

        {onRunExpiryScan && (
          <button
            onClick={onRunExpiryScan}
            disabled={expiryScanRunning}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#174B80] hover:bg-[#123860] disabled:bg-gray-400 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start md:self-auto"
          >
            <Play className={`w-3.5 h-3.5 ${expiryScanRunning ? 'animate-spin' : ''}`} />
            {expiryScanRunning ? 'Running Surveillance...' : 'Run Scheduled Expiry Scan'}
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilterBucket('critical')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterBucket === 'critical' ? 'bg-red-50/80 border-red-300 ring-2 ring-red-400' : 'bg-white border-[#E5E7EB] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#737985] mb-1">
            <span>≤ 30 Days (Critical)</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600 font-tabular">{criticalItems.length}</div>
          <p className="text-[11px] text-[#737985] mt-1">Requires urgent renewal or release</p>
        </button>

        <button
          onClick={() => setFilterBucket('urgent')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterBucket === 'urgent' ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400' : 'bg-white border-[#E5E7EB] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#737985] mb-1">
            <span>31–60 Days (Urgent)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 font-tabular">{urgentItems.length}</div>
          <p className="text-[11px] text-[#737985] mt-1">Automated 60-day notices sent</p>
        </button>

        <button
          onClick={() => setFilterBucket('warning')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterBucket === 'warning' ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-400' : 'bg-white border-[#E5E7EB] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#737985] mb-1">
            <span>61–90 Days (Warning)</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600 font-tabular">{warningItems.length}</div>
          <p className="text-[11px] text-[#737985] mt-1">Upcoming maturity horizon</p>
        </button>

        <button
          onClick={() => setFilterBucket('matured')}
          className={`p-4 rounded-xl border text-left transition-all ${
            filterBucket === 'matured' ? 'bg-purple-50/80 border-purple-300 ring-2 ring-purple-400' : 'bg-white border-[#E5E7EB] hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#737985] mb-1">
            <span>Matured / Lapsed</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-600 font-tabular">{maturedItems.length}</div>
          <p className="text-[11px] text-[#737985] mt-1">Tenure lock-in completed</p>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs font-medium">
        <div className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] p-1 rounded-xl">
          <button
            onClick={() => setFilterBucket('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterBucket === 'all' ? 'bg-[#174B80] text-white font-semibold' : 'text-[#737985] hover:text-[#24262B]'
            }`}
          >
            All Instruments ({fdrs.length})
          </button>
          <button
            onClick={() => setFilterBucket('critical')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterBucket === 'critical' ? 'bg-red-600 text-white font-semibold' : 'text-[#737985] hover:text-[#24262B]'
            }`}
          >
            ≤ 30 Days ({criticalItems.length})
          </button>
          <button
            onClick={() => setFilterBucket('urgent')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterBucket === 'urgent' ? 'bg-amber-600 text-white font-semibold' : 'text-[#737985] hover:text-[#24262B]'
            }`}
          >
            31–60 Days ({urgentItems.length})
          </button>
          <button
            onClick={() => setFilterBucket('warning')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterBucket === 'warning' ? 'bg-blue-600 text-white font-semibold' : 'text-[#737985] hover:text-[#24262B]'
            }`}
          >
            61–90 Days ({warningItems.length})
          </button>
          <button
            onClick={() => setFilterBucket('matured')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              filterBucket === 'matured' ? 'bg-purple-600 text-white font-semibold' : 'text-[#737985] hover:text-[#24262B]'
            }`}
          >
            Matured ({maturedItems.length})
          </button>
        </div>
      </div>

      {/* List of Expiry Cards */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 text-center text-xs text-[#737985]">
            No deposit instruments found matching this maturity filter.
          </div>
        ) : (
          filteredItems.map(({ fdr, days }) => {
            const isMatured = days <= 0 || fdr.lifecycleStatus === 'MATURED';
            const isCritical = days > 0 && days <= 30;
            const isUrgent = days > 30 && days <= 60;

            let badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
            let badgeText = `${days} Days Remaining`;

            if (isMatured) {
              badgeBg = 'bg-purple-50 text-purple-700 border-purple-200';
              badgeText = days < 0 ? `Matured ${Math.abs(days)} Days Ago` : 'Matured Today';
            } else if (isCritical) {
              badgeBg = 'bg-red-50 text-red-700 border-red-200';
              badgeText = `${days} Days Left (CRITICAL)`;
            } else if (isUrgent) {
              badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
              badgeText = `${days} Days Left (URGENT)`;
            }

            return (
              <div
                key={fdr.id}
                className="bg-white rounded-xl border border-[#E5E7EB] p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {fdr.fdrNumber}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeBg}`}>
                      {badgeText}
                    </span>
                    <span className="text-[11px] text-[#737985] font-medium">
                      Maturity: <strong className="text-gray-900">{fdr.maturityDate}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 truncate">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{fdr.institutionName}</span>
                    <span className="text-gray-400 font-normal">({fdr.region} Region)</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#737985]">
                    <span className="flex items-center gap-1">
                      <Landmark className="w-3 h-3 text-gray-400" />
                      {fdr.bankName} ({fdr.branchName})
                    </span>
                    <span>•</span>
                    <span>Principal: <strong className="text-gray-900 font-tabular">₹{fdr.principalAmount.toLocaleString('en-IN')}</strong></span>
                    <span>•</span>
                    <span>Issued: <strong className="text-gray-900">{fdr.issueDate}</strong></span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  <button
                    onClick={() => onViewFdr(fdr)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors font-medium"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>

                  {(currentUser.role === 'institution' || currentUser.role === 'scrutiny_officer' || currentUser.role === 'headquarters') && (
                    <button
                      onClick={() => onOpenRenewModal(fdr)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors font-medium"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Renew / Replace</span>
                    </button>
                  )}

                  {(currentUser.role === 'institution' || currentUser.role === 'release_officer' || currentUser.role === 'headquarters') && (
                    <button
                      onClick={() => onOpenReleaseModal(fdr)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors font-medium"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Request Release</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
