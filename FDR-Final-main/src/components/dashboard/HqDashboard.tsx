import React, { useState } from 'react';
import {
  Building2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Download,
  RefreshCw,
  PlusCircle,
  ChevronRight,
  Sparkles,
  Check,
  CheckCircle2,
  Info,
  Unlock
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { FdrInstrument, PortalKpiSummary, UserProfile } from '../../types';
import { StatCard } from '../common/StatCard';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

interface HqDashboardProps {
  currentUser: UserProfile;
  fdrs: FdrInstrument[];
  kpis: PortalKpiSummary;
  onOpenNewFdr: () => void;
  onViewFdr: (fdr: FdrInstrument) => void;
  onOpenVerifyModal: (fdr: FdrInstrument) => void;
  onOpenAssistant: () => void;
  onRunExpiryCheck: () => void;
  onExportCsv: () => void;
  expiryScanRunning: boolean;
  onRefreshAll?: () => Promise<void> | void;
  showToast?: (msg: string) => void;
  onReviewRelease?: (fdrId: string, decision: 'APPROVE' | 'REQUEST_DOCS' | 'DISCHARGE' | 'REJECT', notes?: string) => Promise<void>;
  onOpenReleaseModal?: (fdr: FdrInstrument) => void;
}

const LIFECYCLE_COLORS: Record<string, string> = {
  ACTIVE: '#3F9876',
  EXPIRING_SOON: '#E5A548',
  MATURED: '#D9534F',
  RENEWED_REPLACED: '#4A82BD',
  RELEASED: '#10B981'
};

export const HqDashboard: React.FC<HqDashboardProps> = ({
  currentUser,
  fdrs,
  kpis,
  onOpenNewFdr,
  onViewFdr,
  onOpenVerifyModal,
  onOpenAssistant,
  onRunExpiryCheck,
  onExportCsv,
  expiryScanRunning,
  onRefreshAll,
  showToast,
  onReviewRelease,
  onOpenReleaseModal
}) => {
  // Cases endorsed by Regional Officers awaiting HQ Central Review & Final Registration
  const hqReviewQueue = fdrs.filter(f => 
    f.caseStatus === 'ENDORSED_BY_REGIONAL_OFFICER' || 
    f.caseStatus === 'AWAITING_HQ_APPROVAL'
  );

  // Deposit Release & Refund Applications queue
  const releaseApplications = fdrs.filter(f => 
    f.releaseStatus !== 'NONE' || 
    Boolean(f.releaseRequest) || 
    f.lifecycleStatus === 'RELEASED'
  );

  // HQ Central Review Modal state
  const [selectedHqFdr, setSelectedHqFdr] = useState<FdrInstrument | null>(null);
  const [hqReviewModalOpen, setHqReviewModalOpen] = useState(false);
  const [hqDecision, setHqDecision] = useState<'APPROVE' | 'APPROVE_RELEASE' | 'REQUEST_CORRECTION' | 'REJECT'>('APPROVE');
  const [hqObservations, setHqObservations] = useState('');
  const [submittingHqReview, setSubmittingHqReview] = useState(false);
  const [hqActionError, setHqActionError] = useState<string | null>(null);

  // Release Vetting / Discharge Order Modal state
  const [selectedReleaseFdr, setSelectedReleaseFdr] = useState<FdrInstrument | null>(null);
  const [releaseReviewModalOpen, setReleaseReviewModalOpen] = useState(false);
  const [releaseDecision, setReleaseDecision] = useState<'APPROVE' | 'REQUEST_DOCS' | 'DISCHARGE' | 'REJECT'>('APPROVE');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [submittingReleaseReview, setSubmittingReleaseReview] = useState(false);

  const handleOpenHqReview = (fdr: FdrInstrument, defaultDecision: 'APPROVE' | 'APPROVE_RELEASE' = 'APPROVE') => {
    setSelectedHqFdr(fdr);
    setHqDecision(defaultDecision);
    if (defaultDecision === 'APPROVE_RELEASE' || fdr.releaseStatus !== 'NONE' || Boolean(fdr.releaseRequest)) {
      setHqObservations(`HQ Bureau release endorsement ratified (${currentUser.name}). Deposit release registered and forwarded to Deposit Release & Refund Applications queue.`);
    } else {
      setHqObservations(`Final central approval granted by HQ Regulation Bureau (${currentUser.name}). Regional Officer endorsement ratified. Registered in AICTE master repository.`);
    }
    setHqActionError(null);
    setHqReviewModalOpen(true);
  };

  const handleExecuteHqReview = async () => {
    if (!selectedHqFdr || submittingHqReview) return;
    setSubmittingHqReview(true);
    setHqActionError(null);

    try {
      await api.submitHqReview({
        fdrId: selectedHqFdr.id,
        decision: hqDecision,
        observations: hqObservations.trim() || `HQ Bureau review: ${hqDecision} recorded by ${currentUser.name}.`
      });

      if (onRefreshAll) {
        await onRefreshAll();
      }

      setHqReviewModalOpen(false);
      if (showToast) {
        if (hqDecision === 'APPROVE_RELEASE') {
          showToast(`FDR ${selectedHqFdr.fdrNumber} registered for release and reflected in Deposit Release & Refund Applications!`);
        } else if (hqDecision === 'APPROVE') {
          showToast(`FDR ${selectedHqFdr.fdrNumber} granted final HQ approval and registered! Expiry monitoring activated.`);
        } else {
          showToast(`HQ review decision recorded: ${hqDecision.replace(/_/g, ' ')}.`);
        }
      }
    } catch (err: any) {
      console.error('HQ review failed:', err);
      setHqActionError(err.message || 'Failed to submit HQ review.');
    } finally {
      setSubmittingHqReview(false);
    }
  };

  const handleExecuteReleaseReview = async () => {
    if (!selectedReleaseFdr || !onReviewRelease || submittingReleaseReview) return;
    setSubmittingReleaseReview(true);
    try {
      await onReviewRelease(selectedReleaseFdr.id, releaseDecision, releaseNotes);
      if (onRefreshAll) {
        await onRefreshAll();
      }
      setReleaseReviewModalOpen(false);
      if (showToast) {
        showToast(`Release application for ${selectedReleaseFdr.fdrNumber} updated: ${releaseDecision.replace(/_/g, ' ')}`);
      }
    } catch (err: any) {
      console.error('Release review failed:', err);
    } finally {
      setSubmittingReleaseReview(false);
    }
  };

  // Aggregate chart data
  const lifecycleData = [
    { name: 'Active', value: fdrs.filter(f => f.lifecycleStatus === 'ACTIVE').length, color: '#3F9876' },
    { name: 'Expiring (<90d)', value: fdrs.filter(f => f.lifecycleStatus === 'EXPIRING_SOON').length, color: '#E5A548' },
    { name: 'Matured', value: fdrs.filter(f => f.lifecycleStatus === 'MATURED').length, color: '#D9534F' },
    { name: 'Renewed', value: fdrs.filter(f => f.lifecycleStatus === 'RENEWED_REPLACED').length, color: '#4A82BD' },
    { name: 'Released', value: fdrs.filter(f => f.lifecycleStatus === 'RELEASED').length, color: '#10B981' }
  ].filter(d => d.value > 0);

  const regionData = [
    { region: 'Northern', count: fdrs.filter(f => f.region === 'Northern').length },
    { region: 'Western', count: fdrs.filter(f => f.region === 'Western').length },
    { region: 'Southern', count: fdrs.filter(f => f.region === 'Southern').length },
    { region: 'South-West', count: fdrs.filter(f => f.region === 'South-Western').length },
    { region: 'Eastern', count: fdrs.filter(f => f.region === 'Eastern').length },
    { region: 'Central', count: fdrs.filter(f => f.region === 'Central').length }
  ];

  // Pending cases requiring immediate scrutiny or action
  const pendingCases = fdrs
    .filter(f => f.caseStatus !== 'APPROVED' && f.caseStatus !== 'CLOSED')
    .slice(0, 6);

  // High priority alerts
  const priorityAlerts = [
    ...fdrs.filter(f => f.discrepancies.some(d => d.status === 'OPEN')).map(f => ({
      fdr: f,
      type: 'DISCREPANCY' as const,
      title: `OCR Discrepancy on ${f.fdrNumber}`,
      subtitle: `${f.institutionName} • ${f.discrepancies.filter(d => d.status === 'OPEN').length} flagged fields`
    })),
    ...fdrs.filter(f => f.lifecycleStatus === 'EXPIRING_SOON' || f.lifecycleStatus === 'MATURED').map(f => ({
      fdr: f,
      type: 'MATURITY' as const,
      title: `${f.lifecycleStatus === 'MATURED' ? 'Matured FDR' : 'Expiring within 30-90 Days'}`,
      subtitle: `${f.fdrNumber} • Maturity: ${f.maturityDate} • INR ${(f.principalAmount / 100000).toFixed(1)} Lakhs`
    }))
  ].slice(0, 5);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Personalized Welcome Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#24262B]">
              Welcome, {currentUser.name}
            </h1>
            <span className="text-[11px] font-semibold bg-blue-50 text-[#174B80] border border-blue-200 px-2.5 py-0.5 rounded-full">
              Regulation Bureau Headquarters
            </span>
          </div>
          <p className="text-xs text-[#737985] mt-1">
            Real-time regulatory dashboard for nationwide AICTE Fixed Deposit Receipts & security deposit compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onRunExpiryCheck}
            disabled={expiryScanRunning}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-2xs"
            title="Run Background Expiry Scan"
          >
            <RefreshCw size={13} className={expiryScanRunning ? 'animate-spin text-blue-600' : 'text-gray-500'} />
            <span>{expiryScanRunning ? 'Scanning...' : 'Run Expiry Scan'}</span>
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-2xs"
            title="Export CSV of nationwide FDRs"
          >
            <Download size={13} className="text-gray-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewFdr}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white transition-colors shadow-2xs"
          >
            <PlusCircle size={14} />
            <span>Submit New FDR</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row (Complif Dashboard Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total FDRs Registered"
          value={kpis.totalFdrCount}
          subtitle={`Total Value: ₹${(kpis.totalDepositValue / 10000000).toFixed(2)} Cr`}
          icon={Building2}
          accentColor="#174B80"
          badge={{ text: 'Nationwide', variant: 'info' }}
        />
        <StatCard
          title="Bank Confirmed"
          value={kpis.verifiedCount}
          subtitle={`${((kpis.verifiedCount / (kpis.totalFdrCount || 1)) * 100).toFixed(0)}% verification rate`}
          icon={ShieldCheck}
          accentColor="#3F9876"
          badge={{ text: 'Verified', variant: 'success' }}
        />
        <StatCard
          title="Pending Bank Scrutiny"
          value={kpis.pendingVerificationCount}
          subtitle="Awaiting bank branch confirmation"
          icon={Clock}
          accentColor="#E5A548"
          badge={{ text: 'In Queue', variant: 'warning' }}
        />
        <StatCard
          title="Flagged Discrepancies"
          value={kpis.discrepancyCount}
          subtitle="OCR or Bank data mismatches"
          icon={AlertTriangle}
          accentColor="#D9534F"
          badge={{ text: 'Requires Action', variant: 'error' }}
        />
      </div>

      {/* Main Grid: Lifecycle Chart, Regional Distribution & Priority Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Lifecycle Distribution Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#24262B]">FDR Lifecycle Health</h3>
              <span className="text-[11px] text-[#737985]">Live Status</span>
            </div>
            <p className="text-xs text-[#737985] mb-4">
              Real-time distribution of active, expiring, and matured instruments.
            </p>

            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={lifecycleData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {lifecycleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#25252A',
                      color: '#FFF',
                      borderRadius: '8px',
                      fontSize: '12px',
                      border: 'none'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-3 border-t border-gray-100">
            {lifecycleData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#24262B] font-medium">{item.name}</span>
                </div>
                <span className="font-semibold text-gray-700 font-tabular">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Center Column: Regional Intake & Compliance Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#24262B]">Regional Bureau Distribution</h3>
              <span className="text-[11px] text-[#737985]">AICTE Regions</span>
            </div>
            <p className="text-xs text-[#737985] mb-4">
              Number of security deposits registered across regional offices.
            </p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="region" tick={{ fontSize: 10, fill: '#737985' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#737985' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#25252A',
                      color: '#FFF',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="count" fill="#174B80" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#737985]">
            <span>Average Verification Turnaround</span>
            <span className="font-semibold text-[#24262B] font-tabular">4.2 working days</span>
          </div>
        </div>

        {/* Right Column: Priority Alerts & Actions (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-[#24262B]">Priority Regulatory Alerts</h3>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {priorityAlerts.length} Actionable
              </span>
            </div>
            <p className="text-xs text-[#737985] mb-3">
              Cases with detected discrepancies or imminent maturity deadlines.
            </p>

            <div className="space-y-2.5">
              {priorityAlerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-500">
                  No critical alerts currently active.
                </div>
              ) : (
                priorityAlerts.map((alert, i) => (
                  <div
                    key={i}
                    onClick={() => onViewFdr(alert.fdr)}
                    className="p-2.5 rounded-xl border border-gray-100 hover:border-gray-300 hover:bg-gray-50/70 transition-all cursor-pointer flex items-start justify-between gap-2"
                  >
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                        alert.type === 'DISCREPANCY' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {alert.type === 'DISCREPANCY' ? <AlertTriangle size={13} /> : <Clock size={13} />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#24262B]">{alert.title}</div>
                        <div className="text-[11px] text-[#737985] line-clamp-1">{alert.subtitle}</div>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-400 shrink-0 mt-1" />
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={onOpenAssistant}
            className="mt-3 w-full py-2 px-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center justify-center gap-1.5 hover:from-blue-100 hover:to-indigo-100 transition-colors"
          >
            <Sparkles size={13} className="text-blue-600" />
            <span>Consult AI Compliance Assistant on Cases</span>
          </button>
        </div>

      </div>

      {/* ------------------------------------------------------------------ */}
      {/* HQ CENTRAL REVIEW QUEUE: REGIONAL OFFICER ENDORSED INSTRUMENTS     */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-teal-50/40">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-[#24262B]">
                Regional Endorsements Awaiting HQ Central Review & Final Registration
              </h3>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                hqReviewQueue.length > 0 ? 'bg-teal-100 text-teal-800 border border-teal-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {hqReviewQueue.length} Pending Approval
              </span>
            </div>
            <p className="text-xs text-[#737985] mt-0.5">
              These instruments have been examined by Scrutiny Officers and endorsed by Regional Bureau Officers with central review conditions. Grant final registration to activate statutory expiry monitoring.
            </p>
          </div>
          {hqReviewQueue.length > 0 && (
            <span className="text-xs font-semibold text-teal-800 bg-teal-100 px-2.5 py-1 rounded-lg shrink-0">
              Action Required
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#24262B]">
            <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-[#737985] uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">FDR Reference</th>
                <th className="px-4 py-3">Institution & Region</th>
                <th className="px-4 py-3">Amount (INR)</th>
                <th className="px-4 py-3">Endorsed By Officer</th>
                <th className="px-4 py-3">Regional Endorsement Notes</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">HQ Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {hqReviewQueue.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    <CheckCircle2 size={24} className="mx-auto text-teal-600 mb-1.5 opacity-80" />
                    No regional endorsements currently awaiting central HQ review. All eligible deposits have been registered.
                  </td>
                </tr>
              ) : (
                hqReviewQueue.map((fdr) => (
                  <tr key={fdr.id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-blue-900 font-mono">
                      {fdr.fdrNumber}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="font-medium text-[#24262B] truncate">{fdr.institutionName}</div>
                      <div className="text-[11px] text-[#737985]">{fdr.region} Region</div>
                    </td>
                    <td className="px-4 py-3 font-semibold font-tabular">
                      ₹{fdr.principalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-teal-900">{fdr.endorsedBy || 'Regional Officer'}</div>
                      <div className="text-[10px] text-gray-400 font-tabular">
                        {fdr.endorsedAt ? new Date(fdr.endorsedAt).toLocaleDateString('en-IN') : 'Recent'}
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[260px]">
                      <p className="text-xs text-gray-700 italic line-clamp-2">
                        "{fdr.endorsementNotes || 'Endorsed for central HQ review.'}"
                      </p>
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
                        onClick={() => handleOpenHqReview(fdr, 'APPROVE')}
                        className="px-3 py-1 text-xs font-semibold rounded-md bg-[#174B80] hover:bg-[#153f6c] text-white shadow-2xs transition-colors"
                      >
                        Review & Register
                      </button>
                      <button
                        onClick={() => handleOpenHqReview(fdr, 'APPROVE_RELEASE')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors inline-flex items-center gap-1"
                        title="Register Release and reflect in Deposit Release & Refund Applications section"
                      >
                        <Unlock size={12} />
                        <span>Register Release</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* DEPOSIT RELEASE & REFUND APPLICATIONS SECTION                      */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/40">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-semibold text-[#24262B]">
                Deposit Release & Refund Applications
              </h3>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                releaseApplications.length > 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-600'
              }`}>
                {releaseApplications.length} Application(s)
              </span>
            </div>
            <p className="text-xs text-[#737985] mt-0.5">
              Review justification documents, regulatory clearance references, and record discharge orders.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
              {releaseApplications.filter(f => f.releaseStatus === 'UNDER_ELIGIBILITY_REVIEW' || f.releaseStatus === 'REQUESTED').length} Pending Vetting
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#24262B]">
            <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-[#737985] uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">FDR Reference</th>
                <th className="px-4 py-3">Institution & Region</th>
                <th className="px-4 py-3">Deposit Amount</th>
                <th className="px-4 py-3">Maturity Date</th>
                <th className="px-4 py-3">Reason / Justification</th>
                <th className="px-4 py-3">Release Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {releaseApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-1.5 opacity-80" />
                    No deposit release or refund applications currently pending.
                  </td>
                </tr>
              ) : (
                releaseApplications.map((fdr) => (
                  <tr key={fdr.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="px-4 py-3 font-semibold text-blue-900 font-mono">
                      {fdr.fdrNumber}
                      {fdr.registrationNumber && (
                        <div className="text-[10px] text-emerald-800 font-sans font-medium">
                          Reg: {fdr.registrationNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <div className="font-medium text-[#24262B] truncate">{fdr.institutionName}</div>
                      <div className="text-[11px] text-[#737985]">{fdr.region} Region</div>
                    </td>
                    <td className="px-4 py-3 font-semibold font-tabular">
                      ₹{fdr.principalAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 font-tabular text-[#737985]">
                      {fdr.maturityDate}
                    </td>
                    <td className="px-4 py-3 max-w-[260px]">
                      <div className="text-xs text-gray-800 font-medium truncate">
                        {fdr.releaseRequest?.requestType ? fdr.releaseRequest.requestType.replace(/_/g, ' ') : 'Statutory Release'}
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-1 italic">
                        "{fdr.releaseRequest?.reason || fdr.purpose || 'Statutory lock-in completed.'}"
                      </p>
                      {fdr.releaseRequest?.regulatoryClearanceNo && (
                        <div className="text-[10px] text-blue-700 font-mono">
                          Clearance: {fdr.releaseRequest.regulatoryClearanceNo}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge type="release" value={fdr.releaseStatus} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => onViewFdr(fdr)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
                      >
                        Inspect
                      </button>
                      {onReviewRelease && fdr.releaseStatus !== 'DISCHARGED' && (
                        <button
                          onClick={() => {
                            setSelectedReleaseFdr(fdr);
                            setReleaseDecision(fdr.releaseStatus === 'APPROVED' ? 'DISCHARGE' : 'APPROVE');
                            setReleaseNotes(fdr.releaseRequest?.officerNotes || '');
                            setReleaseReviewModalOpen(true);
                          }}
                          className="px-3 py-1 text-xs font-semibold rounded-md bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors"
                        >
                          {fdr.releaseStatus === 'APPROVED' ? 'Issue Discharge NOC' : 'Vetting / Decision'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Section: Active Cases & Scrutiny Table */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-[#24262B]">
              Pending Scrutiny & Verification Cases
            </h3>
            <p className="text-xs text-[#737985] mt-0.5">
              Instruments requiring administrative decision, bank confirmation, or correction review.
            </p>
          </div>
          <div className="text-xs font-medium text-[#737985]">
            Showing {pendingCases.length} active case(s)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#24262B]">
            <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-[#737985] uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">FDR Reference</th>
                <th className="px-4 py-3">Institution & Region</th>
                <th className="px-4 py-3">Bank & Branch</th>
                <th className="px-4 py-3">Amount (INR)</th>
                <th className="px-4 py-3">Maturity Date</th>
                <th className="px-4 py-3">Verification</th>
                <th className="px-4 py-3">Case Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingCases.map((fdr) => (
                <tr key={fdr.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 font-semibold text-blue-900 font-mono">
                    {fdr.fdrNumber}
                    {fdr.registrationNumber && (
                      <div className="text-[10px] text-emerald-800 font-sans font-medium">
                        Reg: {fdr.registrationNumber}
                      </div>
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
                    <StatusBadge type="verification" value={fdr.verificationStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge type="case" value={fdr.caseStatus} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => onViewFdr(fdr)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
                    >
                      Review
                    </button>
                    {fdr.verificationStatus === 'NOT_REQUESTED' && (
                      <button
                        onClick={() => onOpenVerifyModal(fdr)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md bg-[#174B80] hover:bg-[#143d67] text-white transition-colors"
                      >
                        Verify QR
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* HQ CENTRAL REVIEW & REGISTRATION MODAL                             */}
      {/* ------------------------------------------------------------------ */}
      {selectedHqFdr && (
        <Modal
          isOpen={hqReviewModalOpen}
          onClose={() => setHqReviewModalOpen(false)}
          title={`HQ Central Review & Final Registration: ${selectedHqFdr.fdrNumber}`}
          subtitle={`${selectedHqFdr.institutionName} • ${selectedHqFdr.region} Region • Principal: INR ${selectedHqFdr.principalAmount.toLocaleString('en-IN')}`}
          maxWidth="2xl"
          footer={
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={() => setHqReviewModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteHqReview}
                disabled={submittingHqReview}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>
                  {submittingHqReview 
                    ? 'Recording Decision...' 
                    : hqDecision === 'APPROVE_RELEASE' 
                    ? 'Confirm & Register Release for Refund' 
                    : 'Confirm Central Approval & Register'}
                </span>
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {hqActionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                {hqActionError}
              </div>
            )}

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <Info size={14} className="text-[#174B80]" />
                <span>Statutory Mandate: AICTE Headquarters Regulation Bureau</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800">
                Granting HQ approval will formally register this instrument in the AICTE Master Deposit Repository. Selecting 'Register Release' immediately routes this deposit into the Deposit Release & Refund Applications bureau queue.
              </p>
            </div>

            {/* Regional Endorsement Card */}
            <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-xl space-y-1.5">
              <div className="font-semibold text-teal-950 flex items-center justify-between">
                <span>Regional Officer Endorsement</span>
                <span className="text-[10px] text-teal-700 font-tabular">
                  {selectedHqFdr.endorsedAt ? new Date(selectedHqFdr.endorsedAt).toLocaleString('en-IN') : 'Recently'}
                </span>
              </div>
              <div className="text-gray-800">
                Endorsing Official: <strong>{selectedHqFdr.endorsedBy || 'Regional Officer'}</strong>
              </div>
              <div className="text-gray-700 italic">
                "{selectedHqFdr.endorsementNotes || 'Endorsed for central approval.'}"
              </div>
            </div>

            {/* Decision Select */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Central HQ Bureau Decision *
                </label>
                <select
                  value={hqDecision}
                  onChange={(e) => setHqDecision(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#174B80] font-semibold bg-white"
                >
                  <option value="APPROVE">Grant Final Approval & Register Deposit (Active Status & Expiry Monitoring)</option>
                  <option value="APPROVE_RELEASE">Register Release & Forward to Deposit Release & Refund Applications</option>
                  <option value="REQUEST_CORRECTION">Request Institutional Correction</option>
                  <option value="REJECT">Reject Application</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  HQ Observations & Statutory Order Notes
                </label>
                <textarea
                  rows={3}
                  value={hqObservations}
                  onChange={(e) => setHqObservations(e.target.value)}
                  placeholder="Enter headquarters registration order notes and directives..."
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#174B80] bg-white"
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* RELEASE APPLICATION VETTING & DISCHARGE MODAL                      */}
      {/* ------------------------------------------------------------------ */}
      {selectedReleaseFdr && (
        <Modal
          isOpen={releaseReviewModalOpen}
          onClose={() => setReleaseReviewModalOpen(false)}
          title={`Release Application Review: ${selectedReleaseFdr.fdrNumber}`}
          subtitle={`${selectedReleaseFdr.institutionName} • Amount: ₹${selectedReleaseFdr.principalAmount.toLocaleString('en-IN')}`}
          maxWidth="2xl"
          footer={
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={() => setReleaseReviewModalOpen(false)}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteReleaseReview}
                disabled={submittingReleaseReview}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Check size={14} />
                <span>{submittingReleaseReview ? 'Processing...' : 'Confirm Decision & Update Status'}</span>
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <Info size={14} className="text-[#174B80]" />
                <span>Deposit Release & Refund Bureau Jurisdiction</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800">
                Lien release orders legally discharge AICTE's encumbrance over the fixed deposit. Verify institutional lock-in tenure, No-Dues clearance, and Governing Body resolutions before approving or issuing discharge orders.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
              <div>
                <span className="text-gray-500 text-[11px]">Request Type:</span>
                <div className="font-semibold text-gray-800">
                  {selectedReleaseFdr.releaseRequest?.requestType ? selectedReleaseFdr.releaseRequest.requestType.replace(/_/g, ' ') : 'FULL RELEASE'}
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-[11px]">Clearance Reference:</span>
                <div className="font-mono text-gray-800 font-semibold">
                  {selectedReleaseFdr.releaseRequest?.regulatoryClearanceNo || 'AICTE/REG/NOC/2026'}
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500 text-[11px]">Stated Ground:</span>
                <div className="text-gray-700 italic mt-0.5">
                  "{selectedReleaseFdr.releaseRequest?.reason || selectedReleaseFdr.purpose || 'Statutory tenure completed.'}"
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Release Officer Decision *
                </label>
                <select
                  value={releaseDecision}
                  onChange={(e) => setReleaseDecision(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#174B80] font-semibold bg-white"
                >
                  <option value="APPROVE">Approve Release Request (Tenure & Clearance Verified)</option>
                  <option value="DISCHARGE">Issue AICTE Official Discharge NOC & Release Pledged Lien</option>
                  <option value="REQUEST_DOCS">Request Additional Supporting Documents from Institution</option>
                  <option value="REJECT">Reject Application (Outstanding Regulatory Liabilities)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Official Order Directives & Audit Notes
                </label>
                <textarea
                  rows={3}
                  value={releaseNotes}
                  onChange={(e) => setReleaseNotes(e.target.value)}
                  placeholder="Enter discharge order reference, approval terms, or document requirements..."
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
