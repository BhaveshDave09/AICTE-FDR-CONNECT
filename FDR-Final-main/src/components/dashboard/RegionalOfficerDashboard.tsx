import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  Download,
  Filter,
  Inbox,
  ShieldCheck,
  Check,
  Info,
  Forward
} from 'lucide-react';
import { FdrInstrument, UserProfile, RegionalZone, Institution } from '../../types';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

interface RegionalOfficerDashboardProps {
  currentUser: UserProfile;
  fdrs: FdrInstrument[];
  institutions?: Institution[];
  onViewFdr: (fdr: FdrInstrument) => void;
  onExportCsv: () => void;
  onRefreshAll?: () => Promise<void> | void;
  showToast?: (msg: string) => void;
  initialTab?: 'queue' | 'registered' | 'all';
}

export const RegionalOfficerDashboard: React.FC<RegionalOfficerDashboardProps> = ({
  currentUser,
  fdrs,
  institutions = [],
  onViewFdr,
  onExportCsv,
  onRefreshAll,
  showToast,
  initialTab
}) => {
  // Check total awaiting review across all zones
  const totalAwaitingCompetentAuthority = fdrs.filter(f => f.caseStatus === 'AWAITING_COMPETENT_AUTHORITY');

  // Initialize selectedZone smartly:
  // If currentUser.region has pending cases, start with that; if other regions have pending cases, default to 'ALL' so nothing is hidden!
  const [selectedZone, setSelectedZone] = useState<string>(() => {
    if (currentUser.region) {
      const inMyRegion = fdrs.filter(f => f.region.toLowerCase() === currentUser.region?.toLowerCase() && f.caseStatus === 'AWAITING_COMPETENT_AUTHORITY');
      if (inMyRegion.length > 0) return currentUser.region;
    }
    if (totalAwaitingCompetentAuthority.length > 0) return 'ALL';
    return currentUser.region || 'ALL';
  });

  const [activeSection, setActiveSection] = useState<'queue' | 'scrutiny_decisions' | 'endorsed_hq' | 'registered' | 'all'>(
    initialTab === 'registered' ? 'registered' : initialTab === 'all' ? 'all' : 'queue'
  );

  // Sync activeSection with initialTab prop updates
  React.useEffect(() => {
    if (initialTab) {
      setActiveSection(initialTab as any);
    }
  }, [initialTab]);

  // Keep selectedZone intelligent when FDRs or currentUser change
  React.useEffect(() => {
    if (selectedZone !== 'ALL') {
      const currentZonePending = fdrs.filter(f => f.region.toLowerCase() === selectedZone.toLowerCase() && f.caseStatus === 'AWAITING_COMPETENT_AUTHORITY').length;
      if (currentZonePending === 0 && totalAwaitingCompetentAuthority.length > 0) {
        setSelectedZone('ALL');
      }
    }
  }, [fdrs, currentUser]);

  // Review & Approval Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedFdr, setSelectedFdr] = useState<FdrInstrument | null>(null);
  const [decision, setDecision] = useState<'APPROVE' | 'ENDORSE_FORWARD_HQ' | 'REQUEST_CORRECTION' | 'ESCALATE' | 'REJECT'>('ENDORSE_FORWARD_HQ');
  const [observations, setObservations] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Regional filtering
  const regionalFdrs = selectedZone === 'ALL' 
    ? fdrs 
    : fdrs.filter(f => f.region.toLowerCase() === selectedZone.toLowerCase());

  // Scrutinized cases awaiting Competent Authority (Regional Officer) review & registration
  const awaitingReviewFdrs = regionalFdrs.filter(f => f.caseStatus === 'AWAITING_COMPETENT_AUTHORITY');

  // Cases endorsed by Regional Officer and forwarded to HQ for central review
  const endorsedHqFdrs = regionalFdrs.filter(f => 
    f.caseStatus === 'ENDORSED_BY_REGIONAL_OFFICER' || 
    f.caseStatus === 'AWAITING_HQ_APPROVAL'
  );

  // All instruments with recorded scrutiny reviews
  const scrutinizedFdrs = regionalFdrs.filter(f => (f.scrutinyReviews || []).length > 0);

  // Officially registered & approved FDRs
  const registeredFdrs = regionalFdrs.filter(f => f.caseStatus === 'APPROVED');

  const totalRegionalAmount = regionalFdrs.reduce((sum, f) => sum + (f.principalAmount || 0), 0);
  const totalApprovedAmount = registeredFdrs.reduce((sum, f) => sum + (f.principalAmount || 0), 0);
  const expiringCount = regionalFdrs.filter(f => f.lifecycleStatus === 'EXPIRING_SOON').length;
  const maturedCount = regionalFdrs.filter(f => f.lifecycleStatus === 'MATURED').length;
  const discrepanciesCount = regionalFdrs.filter(f => f.discrepancies.some(d => d.status === 'OPEN')).length;

  const zones: (RegionalZone | 'ALL')[] = [
    'ALL',
    'Western',
    'Northern',
    'South-Western',
    'Central',
    'Eastern',
    'North-Western',
    'Southern'
  ];

  const getZonePendingCount = (z: RegionalZone | 'ALL') => {
    if (z === 'ALL') return totalAwaitingCompetentAuthority.length;
    return fdrs.filter(f => f.region.toLowerCase() === z.toLowerCase() && f.caseStatus === 'AWAITING_COMPETENT_AUTHORITY').length;
  };

  // Regions with pending cases
  const regionsWithPending = Array.from(new Set(totalAwaitingCompetentAuthority.map(f => f.region)));

  const handleOpenReview = (fdr: FdrInstrument) => {
    setSelectedFdr(fdr);
    setDecision('ENDORSE_FORWARD_HQ');
    setObservations(`Statutory endorsement granted by Regional Officer ${currentUser.name} (${fdr.region} Regional Office). Deposit complies with AICTE Approval Process Handbook mandates. Forwarded to HQ Regulation Bureau for final central review & registration.`);
    setActionError(null);
    setReviewModalOpen(true);
  };

  const handleExecuteRegionalReview = async () => {
    if (!selectedFdr || submittingReview) return;
    setSubmittingReview(true);
    setActionError(null);

    try {
      await api.submitRegionalReview({
        fdrId: selectedFdr.id,
        decision,
        observations: observations.trim() || `Regional decision ${decision} endorsed by ${currentUser.name}.`,
        requiresHqReview: decision === 'ENDORSE_FORWARD_HQ' || decision === 'APPROVE' || decision === 'ESCALATE'
      });

      if (onRefreshAll) {
        await onRefreshAll();
      }

      setReviewModalOpen(false);
      if (showToast) {
        if (decision === 'APPROVE' || decision === 'ENDORSE_FORWARD_HQ') {
          showToast(`FDR ${selectedFdr.fdrNumber} endorsed and forwarded to HQ Regulation Bureau central review queue!`);
        } else {
          showToast(`FDR ${selectedFdr.fdrNumber} status updated to ${decision.replace(/_/g, ' ')}.`);
        }
      }
    } catch (err: any) {
      console.error('Regional review submission failed:', err);
      setActionError(err.message || 'Failed to record regional review decision.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Find linked institution metadata
  const selectedFdrInstitution = selectedFdr 
    ? institutions.find(i => i.id === selectedFdr.institutionId || i.name.toLowerCase() === selectedFdr.institutionName.toLowerCase())
    : null;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header with Zone Filter & Review Queue Counter */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#24262B]">
              AICTE Regional Bureau: {selectedZone === 'ALL' ? 'All Regional Jurisdictions' : `${selectedZone} Region`}
            </h1>
            <span className="text-[11px] font-semibold bg-blue-50 text-[#174B80] border border-blue-200 px-2.5 py-0.5 rounded-full">
              Jurisdiction Office
            </span>
            {awaitingReviewFdrs.length > 0 && (
              <span className="text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Clock size={11} />
                <span>{awaitingReviewFdrs.length} Awaiting Formal Registration</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#737985] mt-1">
            Supervise compliance, record final regional endorsement & registration for scrutinized instruments, and monitor renewals.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs">
            <MapPin size={13} className="text-[#174B80]" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-transparent text-gray-800 font-semibold focus:outline-none cursor-pointer"
            >
              {zones.map((z) => {
                const count = getZonePendingCount(z);
                return (
                  <option key={z} value={z}>
                    {z === 'ALL' ? 'All Regional Jurisdictions' : `${z} Region`} {count > 0 ? `(${count} Awaiting)` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors shadow-2xs"
          >
            <Download size={13} />
            <span>Regional Report</span>
          </button>
        </div>
      </div>

      {/* Quick Zone Selection Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mr-1">Jurisdiction:</span>
        {zones.map((z) => {
          const isSelected = selectedZone === z;
          const pending = getZonePendingCount(z);
          return (
            <button
              key={z}
              onClick={() => setSelectedZone(z)}
              className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 shrink-0 ${
                isSelected
                  ? 'bg-[#174B80] text-white shadow-2xs font-semibold'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 font-medium'
              }`}
            >
              <span>{z === 'ALL' ? 'All Jurisdictions' : z}</span>
              {pending > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-amber-400 text-amber-950' : 'bg-amber-100 text-amber-800'
                }`}>
                  {pending}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Informative Cross-Region Alert Banner when selected zone has 0 cases but other zones have awaiting cases */}
      {selectedZone !== 'ALL' && awaitingReviewFdrs.length === 0 && totalAwaitingCompetentAuthority.length > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center shrink-0">
              <Clock size={16} />
            </div>
            <div>
              <p className="font-semibold text-amber-950">
                0 cases pending in {selectedZone} Region, but {totalAwaitingCompetentAuthority.length} scrutinized instrument(s) are awaiting Competent Authority endorsement in {regionsWithPending.join(', ')} Region{regionsWithPending.length > 1 ? 's' : ''}!
              </p>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Instruments recently scrutinized by the Regulatory Scrutiny Bureau require formal regional endorsement and registration.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => setSelectedZone('ALL')}
              className="px-3 py-1.5 bg-[#174B80] hover:bg-[#153f6c] text-white font-semibold rounded-lg text-xs shadow-2xs transition-colors"
            >
              View All Jurisdictions ({totalAwaitingCompetentAuthority.length})
            </button>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div 
          onClick={() => setActiveSection('queue')}
          className={`cursor-pointer transition-transform hover:scale-[1.01] ${activeSection === 'queue' ? 'ring-2 ring-amber-500 rounded-2xl' : ''}`}
        >
          <StatCard
            title="Awaiting Regional Review"
            value={awaitingReviewFdrs.length}
            subtitle="Scrutinized & Recommended"
            icon={Inbox}
            accentColor="#E5A548"
            badge={{ 
              text: awaitingReviewFdrs.length > 0 ? `${awaitingReviewFdrs.length} Pending` : 'Up to Date', 
              variant: awaitingReviewFdrs.length > 0 ? 'warning' : 'success' 
            }}
          />
        </div>

        <div 
          onClick={() => setActiveSection('scrutiny_decisions')}
          className={`cursor-pointer transition-transform hover:scale-[1.01] ${activeSection === 'scrutiny_decisions' ? 'ring-2 ring-blue-500 rounded-2xl' : ''}`}
        >
          <StatCard
            title="Scrutiny Decisions Log"
            value={scrutinizedFdrs.length}
            subtitle="Scrutiny Bureau Outcomes"
            icon={ShieldCheck}
            accentColor="#174B80"
            badge={{ text: `${scrutinizedFdrs.length} Logged`, variant: 'info' }}
          />
        </div>

        <div 
          onClick={() => setActiveSection('registered')}
          className={`cursor-pointer transition-transform hover:scale-[1.01] ${activeSection === 'registered' ? 'ring-2 ring-emerald-500 rounded-2xl' : ''}`}
        >
          <StatCard
            title="Registered Deposits"
            value={registeredFdrs.length}
            subtitle={`₹${(totalApprovedAmount / 10000000).toFixed(2)} Cr Approved`}
            icon={CheckCircle2}
            accentColor="#3F9876"
            badge={{ text: 'Officially Registered', variant: 'success' }}
          />
        </div>

        <div 
          onClick={() => setActiveSection('all')}
          className={`cursor-pointer transition-transform hover:scale-[1.01] ${activeSection === 'all' ? 'ring-2 ring-purple-500 rounded-2xl' : ''}`}
        >
          <StatCard
            title="Expiring Within 90 Days"
            value={expiringCount}
            subtitle="Renewal surveillance"
            icon={Clock}
            accentColor="#8B5CF6"
            badge={{ text: expiringCount > 0 ? `${expiringCount} Due` : 'None', variant: expiringCount > 0 ? 'warning' : 'neutral' }}
          />
        </div>
      </div>

      {/* Sub-View Navigation Tabs */}
      <div className="flex border-b border-gray-200 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveSection('queue')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeSection === 'queue'
              ? 'border-[#174B80] text-[#174B80] bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Inbox size={14} />
          <span>Regional Review & Registration Queue</span>
          {awaitingReviewFdrs.length > 0 && (
            <span className="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
              {awaitingReviewFdrs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('scrutiny_decisions')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeSection === 'scrutiny_decisions'
              ? 'border-[#174B80] text-[#174B80] bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShieldCheck size={14} />
          <span>Scrutiny Decisions & Observations</span>
          {scrutinizedFdrs.length > 0 && (
            <span className="bg-blue-100 text-[#174B80] font-bold px-1.5 py-0.5 rounded-full text-[10px]">
              {scrutinizedFdrs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('endorsed_hq')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeSection === 'endorsed_hq'
              ? 'border-[#174B80] text-[#174B80] bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Forward size={14} />
          <span>Forwarded to HQ Review</span>
          {endorsedHqFdrs.length > 0 && (
            <span className="bg-teal-100 text-teal-800 font-bold px-1.5 py-0.5 rounded-full text-[10px]">
              {endorsedHqFdrs.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSection('registered')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeSection === 'registered'
              ? 'border-[#174B80] text-[#174B80] bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <CheckCircle2 size={14} />
          <span>Approved & Registered Deposits ({registeredFdrs.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('all')}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeSection === 'all'
              ? 'border-[#174B80] text-[#174B80] bg-white'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Building2 size={14} />
          <span>All Regional Technical Institutions ({regionalFdrs.length})</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 1: Regional Review & Registration Queue (Awaiting Endorsement) */}
      {/* ------------------------------------------------------------------ */}
      {activeSection === 'queue' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden space-y-0">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-amber-50/30">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-[#24262B]">
                  Scrutinized Instruments Awaiting Regional Endorsement & Formal Registration
                </h3>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                  Step: Competent Authority Approval
                </span>
              </div>
              <p className="text-xs text-[#737985] mt-0.5">
                These submissions have been successfully examined and recommended by the AICTE Scrutiny Officer. As Regional Officer, conduct jurisdictional review and grant formal approval to register the deposit.
              </p>
            </div>
            <span className="text-xs text-[#737985] font-semibold font-tabular shrink-0">
              {awaitingReviewFdrs.length} Case(s) Pending Action
            </span>
          </div>

          {awaitingReviewFdrs.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-500 space-y-2">
              <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-2" />
              <p className="text-sm font-semibold text-gray-800">
                No Scrutinized Cases Awaiting Regional Approval in {selectedZone === 'ALL' ? 'Any Region' : `${selectedZone} Region`}
              </p>
              <p className="max-w-md mx-auto text-gray-500">
                All scrutinized FDR submissions in this region have been officially reviewed and registered. Newly recommended cases from the Scrutiny Officer workspace will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#24262B]">
                <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-[#737985] uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">FDR Number</th>
                    <th className="px-4 py-3">Institution & Region</th>
                    <th className="px-4 py-3">Issuing Bank</th>
                    <th className="px-4 py-3">Deposit Face Value</th>
                    <th className="px-4 py-3">Maturity Date</th>
                    <th className="px-4 py-3">Scrutiny Recommendation</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Regional Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {awaitingReviewFdrs.map((fdr) => {
                    const latestReview = fdr.scrutinyReviews?.[fdr.scrutinyReviews.length - 1];
                    return (
                      <tr key={fdr.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="px-4 py-3 font-semibold text-blue-900 font-mono">
                          {fdr.fdrNumber}
                          {fdr.predecessorFdrNumber && (
                            <div className="text-[10px] text-gray-500 font-sans">
                              (Replacement for {fdr.predecessorFdrNumber})
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-[220px]">
                          <div className="font-semibold text-gray-900 truncate">{fdr.institutionName}</div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1">
                            <span>{fdr.region} Region</span>
                            <span>•</span>
                            <span>{fdr.programType}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{fdr.bankName}</div>
                          <div className="text-[10px] text-gray-500">{fdr.branchIfsc || fdr.branchName}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold font-tabular text-gray-900">
                          ₹{fdr.principalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 font-tabular text-gray-600">
                          {fdr.maturityDate}
                        </td>
                        <td className="px-4 py-3 max-w-[220px]">
                          <div className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            <span>Recommended for Approval</span>
                          </div>
                          {latestReview && (
                            <p className="text-[10px] text-gray-600 truncate mt-0.5">
                              By: {latestReview.officerName} • "{latestReview.observations}"
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge type="case" value={fdr.caseStatus} />
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => onViewFdr(fdr)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => handleOpenReview(fdr)}
                            className="px-3.5 py-1 text-xs font-semibold rounded-md bg-[#174B80] hover:bg-[#153f6c] text-white shadow-2xs transition-colors"
                          >
                            Review & Endorse
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SECTION: Scrutiny Decisions & Observations Log                     */}
      {/* ------------------------------------------------------------------ */}
      {activeSection === 'scrutiny_decisions' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-blue-50/30">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-[#24262B]">
                  Regulatory Scrutiny Bureau Decisions & Case Trail
                </h3>
                <span className="text-[11px] font-semibold bg-blue-100 text-[#174B80] px-2 py-0.5 rounded-full">
                  Decisions Registry
                </span>
              </div>
              <p className="text-xs text-[#737985] mt-0.5">
                Authoritative record of decisions recorded by AICTE Scrutiny Officers (Recommendation for Approval, Institutional Correction Requests, and Bank Queries).
              </p>
            </div>
            <span className="text-xs text-[#737985] font-semibold font-tabular shrink-0">
              {scrutinizedFdrs.length} Scrutinized Instrument(s)
            </span>
          </div>

          {scrutinizedFdrs.length === 0 ? (
            <div className="py-16 text-center text-xs text-gray-500 space-y-2">
              <ShieldCheck size={36} className="mx-auto text-blue-600 mb-2" />
              <p className="text-sm font-semibold text-gray-800">
                No Scrutinized Records Found in {selectedZone === 'ALL' ? 'Any Region' : `${selectedZone} Region`}
              </p>
              <p className="max-w-md mx-auto text-gray-500">
                When an AICTE Scrutiny Officer examines an instrument and submits a formal decision, the decision, officer citations, and observations will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#24262B]">
                <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-[#737985] uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">FDR Reference</th>
                    <th className="px-4 py-3">Institution & Region</th>
                    <th className="px-4 py-3">Latest Scrutiny Outcome</th>
                    <th className="px-4 py-3">Officer Observations</th>
                    <th className="px-4 py-3">Case Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {scrutinizedFdrs.map((fdr) => {
                    const latestReview = fdr.scrutinyReviews?.[fdr.scrutinyReviews.length - 1];
                    const isAwaitingRo = fdr.caseStatus === 'AWAITING_COMPETENT_AUTHORITY';
                    return (
                      <tr key={fdr.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="px-4 py-3 font-semibold text-blue-900 font-mono">
                          {fdr.fdrNumber}
                          <span className="text-[10px] text-gray-500 font-normal block font-sans">
                            ₹{fdr.principalAmount.toLocaleString('en-IN')} • {fdr.bankName}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          <div className="font-semibold text-gray-900 truncate">{fdr.institutionName}</div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1">
                            <span className="font-medium text-[#174B80]">{fdr.region} Region</span>
                            <span>•</span>
                            <span>{fdr.programType}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 max-w-[200px]">
                          {latestReview ? (
                            <div>
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                latestReview.decision === 'RECOMMEND_APPROVAL' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                latestReview.decision === 'REQUEST_CORRECTION' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                latestReview.decision === 'QUERY_TO_BANK' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                'bg-red-100 text-red-800 border border-red-300'
                              }`}>
                                {latestReview.decision.replace(/_/g, ' ')}
                              </span>
                              <div className="text-[10px] text-gray-500 mt-1">
                                By: <strong>{latestReview.officerName}</strong>
                              </div>
                              <div className="text-[10px] text-gray-400">
                                {new Date(latestReview.reviewedAt).toLocaleDateString('en-IN')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-[280px]">
                          {latestReview ? (
                            <p className="text-xs text-gray-700 italic line-clamp-2">
                              "{latestReview.observations}"
                            </p>
                          ) : (
                            <span className="text-gray-400">No notes recorded</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge type="case" value={fdr.caseStatus} />
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => onViewFdr(fdr)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
                          >
                            Inspect
                          </button>
                          {isAwaitingRo && (
                            <button
                              onClick={() => handleOpenReview(fdr)}
                              className="px-3 py-1 text-xs font-semibold rounded-md bg-[#174B80] hover:bg-[#153f6c] text-white shadow-2xs transition-colors"
                            >
                              Review & Endorse
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SECTION: Forwarded to HQ Regulation Bureau for Central Review      */}
      {/* ------------------------------------------------------------------ */}
      {activeSection === 'endorsed_hq' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-teal-50/30">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-[#24262B]">
                  Instruments Endorsed & Forwarded to HQ Regulation Bureau
                </h3>
                <span className="text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">
                  Central Review Queue
                </span>
              </div>
              <p className="text-xs text-[#737985] mt-0.5">
                Regional Officer endorsement and observations have been recorded and forwarded to AICTE Headquarters for central examination and registration.
              </p>
            </div>
            <span className="text-xs text-[#737985] font-semibold font-tabular">
              {endorsedHqFdrs.length} Instrument(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#24262B]">
              <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-[#737985] uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">FDR Reference</th>
                  <th className="px-4 py-3">Institution & Region</th>
                  <th className="px-4 py-3">Principal Amount</th>
                  <th className="px-4 py-3">Regional Endorsement</th>
                  <th className="px-4 py-3">Endorsement Notes</th>
                  <th className="px-4 py-3">Case Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {endorsedHqFdrs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                      No FDRs currently forwarded to HQ in {selectedZone === 'ALL' ? 'any region' : `${selectedZone} Region`}.
                    </td>
                  </tr>
                ) : (
                  endorsedHqFdrs.map((fdr) => (
                    <tr key={fdr.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-blue-900 font-mono">
                        {fdr.fdrNumber}
                      </td>
                      <td className="px-4 py-3 max-w-[220px]">
                        <div className="font-semibold text-gray-900 truncate">{fdr.institutionName}</div>
                        <div className="text-[11px] text-gray-500">{fdr.region} Region</div>
                      </td>
                      <td className="px-4 py-3 font-semibold font-tabular">
                        ₹{fdr.principalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-teal-900">{fdr.endorsedBy || 'Regional Officer'}</div>
                        <div className="text-[10px] text-gray-400 font-tabular">
                          {fdr.endorsedAt ? new Date(fdr.endorsedAt).toLocaleDateString('en-IN') : 'Recently'}
                        </div>
                      </td>
                      <td className="px-4 py-3 max-w-[280px]">
                        <p className="text-xs text-gray-700 italic line-clamp-2">
                          "{fdr.endorsementNotes || 'Endorsed and forwarded for central approval.'}"
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge type="case" value={fdr.caseStatus} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onViewFdr(fdr)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 2: Approved & Registered FDRs                               */}
      {/* ------------------------------------------------------------------ */}
      {activeSection === 'registered' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-[#24262B]">
                  Officially Endorsed & Registered Security Deposits
                </h3>
                <span className="text-[11px] font-semibold bg-emerald-50 text-[#2A674E] border border-emerald-200 px-2 py-0.5 rounded-full">
                  AICTE Master Registry
                </span>
              </div>
              <p className="text-xs text-[#737985] mt-0.5">
                Active technical institution FDRs with full regional endorsement, valid bank lien endorsement, and statutory registration numbers.
              </p>
            </div>
            <span className="text-xs text-[#737985] font-semibold font-tabular">
              {registeredFdrs.length} Registered Instrument(s)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#24262B]">
              <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-[#737985] uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">FDR Reference</th>
                  <th className="px-4 py-3">Institution Name</th>
                  <th className="px-4 py-3">Bank Name</th>
                  <th className="px-4 py-3">Amount (INR)</th>
                  <th className="px-4 py-3">Maturity Date</th>
                  <th className="px-4 py-3">Registration Date</th>
                  <th className="px-4 py-3">Lifecycle</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {registeredFdrs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      No registered FDRs found in {selectedZone === 'ALL' ? 'any region' : `${selectedZone} Region`}.
                    </td>
                  </tr>
                ) : (
                  registeredFdrs.map((fdr) => (
                    <tr key={fdr.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-blue-900 font-mono">
                        {fdr.fdrNumber}
                      </td>
                      <td className="px-4 py-3 max-w-[220px] font-medium text-[#24262B] truncate">
                        {fdr.institutionName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {fdr.bankName}
                      </td>
                      <td className="px-4 py-3 font-semibold font-tabular">
                        ₹{fdr.principalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-tabular text-[#737985]">
                        {fdr.maturityDate}
                      </td>
                      <td className="px-4 py-3 font-tabular text-emerald-800 font-medium">
                        {fdr.registrationDate 
                          ? new Date(fdr.registrationDate).toLocaleDateString('en-IN')
                          : fdr.submissionDate}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge type="lifecycle" value={fdr.lifecycleStatus} />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => onViewFdr(fdr)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
                        >
                          View Registry
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SECTION 3: All Regional Instruments & Colleges                      */}
      {/* ------------------------------------------------------------------ */}
      {activeSection === 'all' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[#24262B]">
                Colleges & Technical Institutes in {selectedZone === 'ALL' ? 'All Jurisdictions' : `${selectedZone} Region`}
              </h3>
              <p className="text-xs text-[#737985] mt-0.5">
                Complete regional repository tracking compliance status, verification progress, and renewal schedules.
              </p>
            </div>
            <span className="text-xs text-[#737985] font-medium font-tabular">
              {regionalFdrs.length} Total Instruments
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#24262B]">
              <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-[#737985] uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">FDR Number</th>
                  <th className="px-4 py-3">Institution Name</th>
                  <th className="px-4 py-3">Bank Name</th>
                  <th className="px-4 py-3">Amount (INR)</th>
                  <th className="px-4 py-3">Maturity Date</th>
                  <th className="px-4 py-3">Latest Scrutiny Outcome</th>
                  <th className="px-4 py-3">Case Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {regionalFdrs.map((fdr) => {
                  const latestReview = fdr.scrutinyReviews?.[fdr.scrutinyReviews.length - 1];
                  return (
                    <tr key={fdr.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-blue-900 font-mono">
                        {fdr.fdrNumber}
                      </td>
                      <td className="px-4 py-3 max-w-[200px] truncate font-medium text-[#24262B]">
                        <div>{fdr.institutionName}</div>
                        <div className="text-[10px] text-gray-500 font-normal">{fdr.region} Region</div>
                      </td>
                      <td className="px-4 py-3">
                        {fdr.bankName}
                      </td>
                      <td className="px-4 py-3 font-semibold font-tabular">
                        ₹{fdr.principalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 font-tabular text-[#737985]">
                        {fdr.maturityDate}
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        {latestReview ? (
                          <div>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              latestReview.decision === 'RECOMMEND_APPROVAL' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              latestReview.decision === 'REQUEST_CORRECTION' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              latestReview.decision === 'QUERY_TO_BANK' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {latestReview.decision.replace(/_/g, ' ')}
                            </span>
                            <div className="text-[10px] text-gray-500 truncate mt-0.5">
                              By {latestReview.officerName}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">Pending Scrutiny</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge type="case" value={fdr.caseStatus} />
                      </td>
                      <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => onViewFdr(fdr)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
                        >
                          Inspect
                        </button>
                        {fdr.caseStatus === 'AWAITING_COMPETENT_AUTHORITY' && (
                          <button
                            onClick={() => handleOpenReview(fdr)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#174B80] hover:bg-[#153f6c] text-white shadow-2xs transition-colors"
                          >
                            Review & Endorse
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* REGIONAL OFFICER REVIEW & FORMAL REGISTRATION MODAL                */}
      {/* ------------------------------------------------------------------ */}
      {selectedFdr && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Regional Endorsement & Registration: ${selectedFdr.fdrNumber}`}
          subtitle={`${selectedFdr.institutionName} • Region: ${selectedFdr.region} • Principal: INR ${selectedFdr.principalAmount.toLocaleString('en-IN')}`}
          maxWidth="3xl"
          footer={
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRegionalReview}
                disabled={submittingReview}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>{submittingReview ? 'Recording Endorsement...' : 'Confirm Regional Endorsement & Forward to HQ'}</span>
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {actionError}
              </div>
            )}

            {/* Regulatory Summary Banner */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <Info size={14} className="text-[#174B80]" />
                <span>Statutory Authority: AICTE Regional Bureau Endorsement</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800">
                As the Regional Officer acting on behalf of the AICTE Competent Authority, your endorsement clears this scrutinized instrument and forwards it to the Headquarters Regulation Bureau for central review & final registration in the nationwide repository.
              </p>
            </div>

            {/* Institution Master Card */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-1.5">
                Technical Institution Master Data
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <span className="text-gray-500 block">Institution:</span>
                  <span className="font-semibold text-gray-900">{selectedFdr.institutionName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">AICTE Permanent ID:</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {selectedFdrInstitution?.aictePermanentId || '1-43289011'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Jurisdiction Region:</span>
                  <span className="font-semibold text-gray-900">{selectedFdr.region}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">State & City:</span>
                  <span className="text-gray-900">{selectedFdrInstitution?.city || 'City'}, {selectedFdrInstitution?.state || 'State'}</span>
                </div>
              </div>
            </div>

            {/* FDR Details Card */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-1.5">
                Fixed Deposit Instrument Parameters
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <span className="text-gray-500 block">FDR Reference:</span>
                  <span className="font-mono font-semibold text-blue-900">{selectedFdr.fdrNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Issuing Bank:</span>
                  <span className="font-semibold text-gray-900">{selectedFdr.bankName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Principal Amount:</span>
                  <span className="font-semibold font-tabular text-emerald-800 text-sm">
                    ₹{selectedFdr.principalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Maturity Date:</span>
                  <span className="font-semibold text-gray-900 font-tabular">{selectedFdr.maturityDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Lien Status:</span>
                  <span className="font-semibold text-emerald-700">
                    {selectedFdr.lienStatus === 'LIEN_MARKED_AICTE' ? 'Marked in Favor of AICTE' : selectedFdr.lienStatus}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Lien Reference:</span>
                  <span className="font-mono text-gray-900">{selectedFdr.lienReference}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Bank Verification:</span>
                  <span className="font-semibold text-emerald-700">{selectedFdr.verificationStatus}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Program Intake:</span>
                  <span className="text-gray-900">{selectedFdr.programType} ({selectedFdr.approvalYear})</span>
                </div>
              </div>
            </div>

            {/* Prior Regulatory Scrutiny Trail */}
            {selectedFdr.scrutinyReviews && selectedFdr.scrutinyReviews.length > 0 && (
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
                <h4 className="font-semibold text-emerald-950 flex items-center justify-between border-b border-emerald-200 pb-1.5">
                  <span>Scrutiny Officer Examination Record</span>
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Recommendation: {selectedFdr.scrutinyReviews[selectedFdr.scrutinyReviews.length - 1].decision.replace(/_/g, ' ')}
                  </span>
                </h4>
                <div className="text-xs text-gray-700 space-y-1">
                  <div>Officer: <strong>{selectedFdr.scrutinyReviews[selectedFdr.scrutinyReviews.length - 1].officerName}</strong></div>
                  <div>Reviewed At: <span className="font-tabular text-gray-500">{selectedFdr.scrutinyReviews[selectedFdr.scrutinyReviews.length - 1].reviewedAt}</span></div>
                  <div>Observations: <em>"{selectedFdr.scrutinyReviews[selectedFdr.scrutinyReviews.length - 1].observations}"</em></div>
                </div>
              </div>
            )}

            {/* Regional Decision Form */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Official Regional Bureau Decision *
                </label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#174B80] font-semibold bg-white"
                >
                  <option value="ENDORSE_FORWARD_HQ">Endorse & Forward to HQ Regulation Bureau (Awaiting HQ Central Review & Final Registration)</option>
                  <option value="APPROVE">Grant Regional Officer Endorsement & Recommend Central Registration</option>
                  <option value="REQUEST_CORRECTION">Request Institutional Clarification / Correction</option>
                  <option value="REJECT">Reject Application</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Regional Officer Endorsement Notes & Conditions
                </label>
                <textarea
                  rows={3}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Enter endorsement details, regional office registration order notes, and conditions..."
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#174B80] bg-white"
                />
              </div>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};
