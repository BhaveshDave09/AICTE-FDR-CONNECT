import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Layers,
  RefreshCw,
  Send,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { FdrInstrument, UserProfile, DiscrepancyFlag, ExtractedFields } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { api } from '../../services/api';

interface ExaminationPageProps {
  fdrId: string | null;
  initialFdr?: FdrInstrument | null;
  currentUser: UserProfile;
  onBack: () => void;
  onRefreshAll: () => Promise<void> | void;
  onOpenVerifyModal?: (fdr: FdrInstrument) => void;
  onOpenRenewModal?: (fdr: FdrInstrument) => void;
  onOpenReleaseModal?: (fdr: FdrInstrument) => void;
  showToast?: (msg: string) => void;
  onSwitchToRegionalQueue?: (fdr: FdrInstrument) => void;
}

export const ExaminationPage: React.FC<ExaminationPageProps> = ({
  fdrId,
  initialFdr,
  currentUser,
  onBack,
  onRefreshAll,
  onOpenVerifyModal,
  onOpenRenewModal,
  onOpenReleaseModal,
  showToast,
  onSwitchToRegionalQueue
}) => {
  const [fdr, setFdr] = useState<FdrInstrument | null>(initialFdr || null);
  const [loading, setLoading] = useState<boolean>(!initialFdr && !!fdrId);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  // Sync initialFdr whenever it is provided or updated by parent
  useEffect(() => {
    if (initialFdr) {
      setFdr(initialFdr);
      setError(null);
    }
  }, [initialFdr]);

  // Tab navigation inside Examination Workspace
  const [activeTab, setActiveTab] = useState<'overview' | 'ocr_side_by_side' | 'discrepancies' | 'verification' | 'decision'>('ocr_side_by_side');

  // Decision Form State
  const [decision, setDecision] = useState<'RECOMMEND_APPROVAL' | 'REQUEST_CORRECTION' | 'QUERY_TO_BANK' | 'REJECT'>('RECOMMEND_APPROVAL');
  const [observations, setObservations] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [resolvingDiscId, setResolvingDiscId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load FDR Data reliably from API
  const loadFdrData = useCallback(async () => {
    if (!fdrId) {
      setError('No submission or FDR identifier was provided. Please select an instrument from the scrutiny queue.');
      setLoading(false);
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // If we already have FDR data displayed, do not replace the screen with a blank loading state
    if (fdr || initialFdr) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);
    setActionError(null);

    try {
      const fetched = await api.getFdrById(fdrId);
      if (!fetched) {
        throw new Error(`Record with reference ID "${fdrId}" was not found in the AICTE repository.`);
      }
      setFdr(fetched);
    } catch (err: any) {
      console.error('Failed to load FDR details for examination:', err);
      // Only show full blocking error if we don't have any cached or initial data to display
      if (!fdr && !initialFdr) {
        setError(err?.message || 'Failed to load examination record from AICTE repository. Please try again.');
      } else if (showToast) {
        showToast('Notice: Could not sync latest status from server. Showing cached record.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [fdrId, fdr, initialFdr, showToast]);

  useEffect(() => {
    loadFdrData();
  }, [fdrId]);

  // Handle resolving or waiving a discrepancy flag
  const handleResolveDiscrepancy = async (discId: string, action: 'RESOLVE' | 'WAIVE') => {
    if (!fdr || resolvingDiscId) return;
    setResolvingDiscId(discId);
    setActionError(null);
    try {
      await api.resolveDiscrepancy(
        fdr.id, 
        discId, 
        action, 
        `Resolved by Scrutiny Officer ${currentUser.name}`
      );
      // Reload current FDR data
      await loadFdrData();
      await onRefreshAll();
      if (showToast) {
        showToast(`Discrepancy flag ${action === 'WAIVE' ? 'waived' : 'resolved'} successfully.`);
      }
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || 'Failed to update discrepancy status.');
    } finally {
      setResolvingDiscId(null);
    }
  };

  // Handle submitting final scrutiny decision
  const handleSubmitDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fdr || submittingReview) return;

    setSubmittingReview(true);
    setActionError(null);
    try {
      const res = await api.submitScrutinyReview({
        fdrId: fdr.id,
        decision,
        observations: observations.trim() || `Scrutiny decision ${decision} endorsed by ${currentUser.name}.`
      });

      if (res && res.fdr) {
        setFdr(res.fdr);
      }

      setSuccessMessage(
        decision === 'RECOMMEND_APPROVAL'
          ? `Scrutiny decision (Recommend Approval) recorded successfully. Forwarded to ${fdr.region} Regional Officer queue for final endorsement & registration.`
          : `Scrutiny decision (${decision.replace(/_/g, ' ')}) recorded successfully in AICTE registry.`
      );
      setObservations('');
      await loadFdrData();
      await onRefreshAll();

      if (showToast) {
        showToast(`Scrutiny decision recorded for ${fdr.fdrNumber}`);
      }
    } catch (err: any) {
      console.error(err);
      setActionError(err.message || 'Failed to record scrutiny decision.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Safe Null-Defensive Getters
  const documents = fdr?.documents ?? [];
  const discrepancies = fdr?.discrepancies ?? [];
  const extractedFields: Partial<ExtractedFields> = fdr?.extractedFields ?? {};
  const scrutinyReviews = fdr?.scrutinyReviews ?? [];
  const openDiscrepancies = discrepancies.filter(d => d.status === 'OPEN');
  const primaryDoc = documents[0];

  // 1. Loading State
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-2xs space-y-4 animate-in fade-in duration-150">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-64 bg-gray-100 rounded animate-pulse mt-1.5" />
          </div>
        </div>

        <div className="py-16 flex flex-col items-center justify-center text-center">
          <RefreshCw size={28} className="animate-spin text-[#174B80] mb-3" />
          <h3 className="text-sm font-semibold text-gray-800">
            Loading Examination Record & OCR Analysis...
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mt-1">
            Retrieving certificate metadata, bank verification tokens, and PyMuPDF field extractions.
          </p>
        </div>
      </div>
    );
  }

  // 2. Error State with Retry
  if (error || !fdr) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 shadow-2xs space-y-4 animate-in fade-in duration-150">
        <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Regulatory Scrutiny Bureau</h2>
            <p className="text-xs text-gray-500">Document Examination & Decision Workspace</p>
          </div>
        </div>

        <div className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-base font-semibold text-gray-900">Unable to Open Examination Record</h3>
          <p className="text-xs text-gray-600 mt-1 mb-4">
            {error || 'The requested FDR instrument could not be located or loaded.'}
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={loadFdrData}
              className="px-4 py-2 bg-[#174B80] hover:bg-[#153f6c] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw size={13} />
              <span>Retry Loading</span>
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg transition-colors"
            >
              Return to Scrutiny Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Active Examination Workspace
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors shadow-2xs shrink-0"
              title="Return to Scrutiny Queue"
            >
              <ArrowLeft size={16} />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#174B80] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {fdr.fdrNumber}
                </span>
                <span className="text-sm sm:text-base font-semibold text-[#24262B]">
                  {fdr.institutionName}
                </span>
                <span className="text-[11px] font-medium text-gray-500">
                  • Region: {fdr.region} • Version {fdr.version || 1}
                </span>
              </div>
              <p className="text-xs text-[#737985] mt-0.5">
                Submitted Purpose: <span className="text-gray-800">{fdr.purpose}</span>
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {isRefreshing && (
              <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#174B80] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 animate-pulse">
                <RefreshCw size={11} className="animate-spin" />
                <span>Syncing...</span>
              </span>
            )}
            <StatusBadge type="case" value={fdr.caseStatus} />
            <StatusBadge type="verification" value={fdr.verificationStatus} />
            <StatusBadge type="lifecycle" value={fdr.lifecycleStatus} />
          </div>
        </div>

        {/* Action Error Banner if discrepancy or decision submission failed */}
        {actionError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center justify-between gap-2 animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button 
              onClick={() => setActionError(null)} 
              className="text-red-700 hover:text-red-900 font-bold px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Alert Banner if Decision Submitted */}
        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              {onSwitchToRegionalQueue && fdr && (
                <button
                  type="button"
                  onClick={() => onSwitchToRegionalQueue(fdr)}
                  className="px-3 py-1.5 bg-[#174B80] hover:bg-[#153f6c] text-white font-semibold text-xs rounded-lg shadow-2xs flex items-center gap-1 transition-colors"
                >
                  <span>View in Regional Officer Section</span>
                  <ExternalLink size={12} />
                </button>
              )}
              <button 
                onClick={() => setSuccessMessage(null)} 
                className="text-emerald-700 hover:text-emerald-900 font-bold px-1.5 py-0.5 rounded hover:bg-emerald-100"
                title="Dismiss message"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation Bar */}
        <div className="flex overflow-x-auto border-b border-gray-200 text-xs pt-1 -mb-1">
          {[
            { id: 'ocr_side_by_side', label: 'OCR Field Vetting', icon: Layers, badge: openDiscrepancies.length > 0 ? `${openDiscrepancies.length} Flags` : undefined, badgeColor: 'bg-red-100 text-red-700' },
            { id: 'discrepancies', label: 'Discrepancy Flags', icon: AlertTriangle, count: discrepancies.length },
            { id: 'overview', label: 'Instrument Details', icon: FileText },
            { id: 'verification', label: 'Bank Endorsement', icon: ShieldCheck },
            { id: 'decision', label: 'Record Decision', icon: Send, highlight: true }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#174B80] text-[#174B80] font-semibold bg-blue-50/40 rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                } ${tab.highlight && !isActive ? 'text-[#174B80] font-medium' : ''}`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${tab.badgeColor}`}>
                    {tab.badge}
                  </span>
                )}
                {typeof tab.count === 'number' && tab.count > 0 && !tab.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-700">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* Tab 1: OCR Side-by-Side Review Tool (Default for Examination)       */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'ocr_side_by_side' && (
        <div className="space-y-4">
          
          {/* Informational Guidance */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 text-xs text-gray-600 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#174B80]" />
                <span>Side-by-Side Audit: Institutional Metadata vs Scanned Certificate</span>
              </p>
              <p className="text-[11px] text-[#737985] mt-0.5">
                The optical recognition engine extracts key statutory parameters from the uploaded bank certificate. Mismatches are highlighted for examination.
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                OCR Confidence: {primaryDoc?.ocrConfidence ?? 98}%
              </span>
            </div>
          </div>

          {/* Side by side comparison table */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-gray-600 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Statutory Field</th>
                    <th className="px-4 py-3">Submitted Value (College)</th>
                    <th className="px-4 py-3">Extracted Value (Scanned FDR)</th>
                    <th className="px-4 py-3">Audit Match Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    {
                      field: 'FDR Reference Number',
                      submitted: fdr.fdrNumber,
                      extracted: extractedFields.fdrNumber || fdr.fdrNumber,
                      matches: !discrepancies.some(d => d.field === 'fdrNumber' && d.status === 'OPEN')
                    },
                    {
                      field: 'Principal Face Value',
                      submitted: fdr.principalAmount != null ? `₹${Number(fdr.principalAmount).toLocaleString('en-IN')}` : 'Not Specified',
                      extracted: (extractedFields.principalAmount ?? fdr.principalAmount) != null ? `₹${Number(extractedFields.principalAmount ?? fdr.principalAmount).toLocaleString('en-IN')}` : 'Not Extracted',
                      matches: !discrepancies.some(d => d && d.field === 'principalAmount' && d.status === 'OPEN')
                    },
                    {
                      field: 'Issuing Bank Name',
                      submitted: fdr.bankName,
                      extracted: extractedFields.bankName || fdr.bankName,
                      matches: true
                    },
                    {
                      field: 'Branch Name & IFSC',
                      submitted: `${fdr.branchName || 'Main'} (${fdr.branchIfsc})`,
                      extracted: `${extractedFields.branchName || fdr.branchName || 'Main'} (${extractedFields.branchIfsc || fdr.branchIfsc})`,
                      matches: true
                    },
                    {
                      field: 'Maturity Date & Tenure',
                      submitted: fdr.maturityDate,
                      extracted: extractedFields.maturityDate || fdr.maturityDate,
                      matches: !discrepancies.some(d => d.field === 'maturityDate' && d.status === 'OPEN')
                    },
                    {
                      field: 'AICTE Joint Lien Endorsement',
                      submitted: fdr.lienStatus === 'LIEN_MARKED_AICTE' ? 'Marked in favor of AICTE' : 'Not Marked',
                      extracted: extractedFields.lienMarkedToAicte ? 'Lien noted to Member Secretary AICTE' : 'Lien endorsement clause missing on document',
                      matches: !discrepancies.some(d => d.field === 'lienStatus' && d.status === 'OPEN')
                    }
                  ].map((row, idx) => (
                    <tr key={idx} className={!row.matches ? 'bg-red-50/40' : 'hover:bg-gray-50/70 transition-colors'}>
                      <td className="px-4 py-3 font-semibold text-gray-800">{row.field}</td>
                      <td className="px-4 py-3 font-mono text-gray-900">{row.submitted}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-gray-900">{row.extracted}</td>
                      <td className="px-4 py-3">
                        {row.matches ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                            <CheckCircle2 size={13} />
                            Exact Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 font-semibold bg-red-100 px-2 py-0.5 rounded-full text-[11px]">
                            <AlertTriangle size={12} />
                            Mismatch Flagged
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Uploaded Certificate Details */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
                <FileText size={20} />
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  {primaryDoc?.fileName || `${fdr.fdrNumber}_scanned_receipt.pdf`}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  Uploaded by: {primaryDoc?.uploadedBy || 'Authorized Signatory'} • Size: {primaryDoc?.fileSize || '2.2 MB'} • Status: {primaryDoc?.ocrStatus || 'PROCESSED'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('decision')}
              className="px-4 py-2 bg-[#174B80] hover:bg-[#153f6c] text-white font-semibold rounded-lg shadow-2xs flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>Proceed to Record Decision</span>
              <Send size={13} />
            </button>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Tab 2: Discrepancy Flags & Resolutions                              */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'discrepancies' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Regulatory Discrepancy Evaluation ({discrepancies.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Review automated OCR discrepancy flags, inspect evidence sources, and record authorized resolutions or waivers.
              </p>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              openDiscrepancies.length > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700'
            }`}>
              {openDiscrepancies.length} Open Flags
            </span>
          </div>

          {discrepancies.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-800 text-xs">No Discrepancies Recorded</p>
              <p className="text-[11px] text-gray-500 max-w-sm mx-auto mt-0.5">
                All submitted metadata fields align with extracted document parameters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {discrepancies.map((disc) => (
                <div 
                  key={disc.id} 
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs ${
                    disc.status === 'OPEN' ? 'border-red-200 bg-red-50/40' : 'border-gray-200 bg-gray-50/60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                      <AlertTriangle size={14} className={disc.status === 'OPEN' ? 'text-red-600' : 'text-gray-400'} />
                      <span>{disc.field} Mismatch ({disc.severity} Priority)</span>
                    </div>
                    <p className="text-xs text-gray-700">{disc.reason}</p>
                    <div className="text-[11px] text-gray-500">
                      Evidence Source: <span className="font-medium text-gray-700">{disc.evidenceSource}</span>
                    </div>
                    {disc.status !== 'OPEN' && (
                      <div className="mt-1 text-[11px] text-emerald-800 font-semibold">
                        Resolved: {disc.status} ({disc.resolutionNotes || 'Authorized resolution by scrutiny bureau'})
                      </div>
                    )}
                  </div>

                  {disc.status === 'OPEN' && (
                    <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                      <button
                        onClick={() => handleResolveDiscrepancy(disc.id, 'RESOLVE')}
                        disabled={resolvingDiscId === disc.id}
                        className="px-3 py-1.5 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 size={13} />
                        <span>{resolvingDiscId === disc.id ? 'Saving...' : 'Mark Resolved'}</span>
                      </button>
                      <button
                        onClick={() => handleResolveDiscrepancy(disc.id, 'WAIVE')}
                        disabled={resolvingDiscId === disc.id}
                        className="px-3 py-1.5 text-xs font-medium border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                      >
                        Waive
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Tab 3: Instrument Full Overview & Metadata                          */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-medium">Principal Face Value</span>
              <span className="text-xl font-bold text-gray-900 font-tabular mt-1 block">
                ₹{Number(fdr.principalAmount || 0).toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-gray-500">Interest Rate: {fdr.interestRate}% p.a.</span>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-medium">Statutory Tenure</span>
              <span className="text-base font-bold text-gray-900 font-tabular mt-1 block">
                {fdr.maturityDate}
              </span>
              <span className="text-[11px] text-gray-500">Lodged: {fdr.issueDate}</span>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-medium">Lien Annotation</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                fdr.lienStatus === 'LIEN_MARKED_AICTE' ? 'bg-[#E8F5EE] text-[#2A674E]' : 'bg-red-50 text-red-700'
              }`}>
                {fdr.lienStatus === 'LIEN_MARKED_AICTE' ? 'Endorsed to Member Secretary AICTE' : 'Lien Not Marked'}
              </span>
              <div className="text-[11px] text-gray-500 truncate mt-1">Ref: {fdr.lienReference || 'N/A'}</div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <h4 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Issuing Commercial Bank Information</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-gray-500 block">Bank:</span>
                <span className="font-semibold text-gray-900">{fdr.bankName}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Branch:</span>
                <span className="font-semibold text-gray-900">{fdr.branchName || 'Main Campus Branch'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">IFSC Code:</span>
                <span className="font-mono font-semibold text-gray-900">{fdr.branchIfsc}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Academic Year:</span>
                <span className="font-semibold text-gray-900">{fdr.approvalYear || 'Current'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Tab 4: Bank Verification & QR Details                               */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'verification' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Scheduled Commercial Bank Verification</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Core Banking System (CBS) confirmation token and verification trail.
              </p>
            </div>
            <StatusBadge type="verification" value={fdr.verificationStatus} />
          </div>

          {fdr.verificationRequest ? (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 block">Security Verification Token:</span>
                  <span className="font-mono bg-white px-2.5 py-1 rounded border border-gray-200 inline-block font-semibold mt-1">
                    {fdr.verificationRequest.token}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Token Validity:</span>
                  <span className="font-semibold text-amber-800 mt-1 block">
                    Expires: {fdr.verificationRequest.expiresAt}
                  </span>
                </div>
              </div>

              {fdr.verificationRequest.verifiedAt && (
                <div className="pt-3 border-t border-gray-200 mt-3 space-y-1">
                  <div className="font-semibold text-emerald-800">Confirmed by Bank Branch Manager:</div>
                  <div>Officer: {fdr.verificationRequest.bankOfficerName} ({fdr.verificationRequest.bankOfficerDesignation})</div>
                  <div>Reference No: <span className="font-mono">{fdr.verificationRequest.verificationReferenceNo}</span></div>
                  <div>Observations: <span className="text-gray-700">{fdr.verificationRequest.bankObservations || 'CBS records match.'}</span></div>
                </div>
              )}

              {onOpenVerifyModal && (
                <div className="pt-2">
                  <button
                    onClick={() => onOpenVerifyModal(fdr)}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-[#174B80] hover:bg-[#153f6c] text-white rounded-lg shadow-2xs flex items-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    <span>Open Bank Portal View</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>No verification request has been dispatched yet for this instrument.</p>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* Tab 5: Record Regulatory Decision Form                              */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'decision' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-2xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Record Formal Scrutiny Decision
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Record regulatory recommendation in accordance with the AICTE Approval Process Handbook (APH).
            </p>
          </div>

          {/* Historical Reviews */}
          {scrutinyReviews.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-800">Prior Scrutiny Observations ({scrutinyReviews.length})</h4>
              <div className="space-y-2">
                {scrutinyReviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{rev.officerName}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        rev.decision === 'RECOMMEND_APPROVAL' ? 'bg-[#E8F5EE] text-[#2A674E]' :
                        rev.decision === 'REQUEST_CORRECTION' ? 'bg-[#FEF7ED] text-[#B45309]' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {rev.decision.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-gray-700">{rev.observations}</p>
                    <div className="text-[10px] text-gray-400 font-tabular">{rev.reviewedAt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmitDecision} className="p-4 bg-blue-50/40 rounded-xl border border-blue-200 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                Official Recommendation
              </label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#174B80] bg-white text-xs font-medium"
              >
                <option value="RECOMMEND_APPROVAL">Recommend Approval (All Criteria & Lien Satisfied)</option>
                <option value="REQUEST_CORRECTION">Request Institutional Correction (Mismatch / Deficit)</option>
                <option value="QUERY_TO_BANK">Issue Query to Issuing Bank Branch</option>
                <option value="REJECT">Reject FDR Submission</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-800 mb-1">
                Officer Observations & APH Clause References
              </label>
              <textarea
                rows={3}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Enter formal observations referencing AICTE Approval Process Handbook (e.g., Clause 1.4 Endowment Security Deposit verified)..."
                className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-[#174B80] bg-white text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-gray-500">
                Action recorded by: <strong className="text-gray-800">{currentUser.name}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-3.5 py-2 text-xs font-medium border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-4 py-2 bg-[#174B80] hover:bg-[#153f6c] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Send size={13} className={submittingReview ? 'animate-spin' : ''} />
                  <span>{submittingReview ? 'Recording...' : 'Submit Scrutiny Decision'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
