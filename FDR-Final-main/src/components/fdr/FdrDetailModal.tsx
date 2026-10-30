import React, { useState, useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  FileCheck,
  QrCode,
  ExternalLink,
  Layers,
  KeyRound,
  RefreshCw,
  Unlock
} from 'lucide-react';
import { FdrInstrument, UserProfile, ExtractedFields } from '../../types';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { api } from '../../services/api';

interface FdrDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  fdr: FdrInstrument | null;
  fdrId?: string | null;
  currentUser: UserProfile;
  onRefreshFdr: () => void;
  onOpenVerifyModal: (fdr: FdrInstrument) => void;
  onOpenRenewModal: (fdr: FdrInstrument) => void;
  onOpenReleaseModal: (fdr: FdrInstrument) => void;
  showToast?: (msg: string) => void;
}

export const FdrDetailModal: React.FC<FdrDetailModalProps> = ({
  isOpen,
  onClose,
  fdr,
  fdrId,
  currentUser,
  onRefreshFdr,
  onOpenVerifyModal,
  onOpenRenewModal,
  onOpenReleaseModal,
  showToast
}) => {
  const [detailFdr, setDetailFdr] = useState<FdrInstrument | null>(fdr || null);
  const [loading, setLoading] = useState<boolean>(!fdr && !!(fdrId || fdr));
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'ocr_side_by_side' | 'verification' | 'scrutiny' | 'audit'>('overview');
  
  // Scrutiny Form state (for scrutiny officer)
  const [scrutinyDecision, setScrutinyDecision] = useState<'RECOMMEND_APPROVAL' | 'REQUEST_CORRECTION' | 'QUERY_TO_BANK' | 'REJECT'>('RECOMMEND_APPROVAL');
  const [scrutinyNotes, setScrutinyNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [resolvingDiscId, setResolvingDiscId] = useState<string | null>(null);
  const [requestingVerif, setRequestingVerif] = useState(false);

  // Regional Review state (for regional officer / headquarters)
  const [regionalDecision, setRegionalDecision] = useState<'APPROVE' | 'ENDORSE_FORWARD_HQ' | 'REQUEST_CORRECTION' | 'ESCALATE' | 'REJECT'>('ENDORSE_FORWARD_HQ');
  const [regionalNotes, setRegionalNotes] = useState('');
  const [submittingRegionalReview, setSubmittingRegionalReview] = useState(false);

  // Sync with prop & load authoritative record from backend API
  const fetchAuthoritativeFdr = async (targetId: string) => {
    try {
      if (!detailFdr && !fdr) setLoading(true);
      else setIsRefreshing(true);
      setError(null);
      const fetched = await api.getFdrById(targetId);
      if (fetched) {
        setDetailFdr(fetched);
      }
    } catch (err: any) {
      console.error('Failed to fetch FDR details by ID:', err);
      if (!detailFdr && !fdr) {
        setError(err?.message || 'Failed to retrieve instrument record from AICTE repository.');
      } else if (showToast) {
        showToast('Notice: Using cached instrument details.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (fdr) {
      setDetailFdr(fdr);
      setError(null);
    }
    const targetId = fdrId || fdr?.id || fdr?.fdrNumber;
    if (isOpen && targetId) {
      fetchAuthoritativeFdr(targetId);
    }
  }, [isOpen, fdr, fdrId]);

  if (!isOpen) return null;

  // Loading state when record is not yet in memory
  if (loading && !detailFdr) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Loading Deposit Record"
        subtitle="AICTE Central Security Deposit Registry"
        maxWidth="3xl"
      >
        <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
          <RefreshCw size={32} className="animate-spin text-[#174B80]" />
          <h3 className="text-sm font-semibold text-gray-800">
            Retrieving Authoritative FDR Data & Bank Verification Records...
          </h3>
          <p className="text-xs text-gray-500 max-w-sm">
            Validating regulatory permissions and loading statutory parameters for this instrument.
          </p>
        </div>
      </Modal>
    );
  }

  // Error state if loading failed and no record is available
  if (error && !detailFdr) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Instrument Not Accessible"
        subtitle="AICTE Regulation Bureau"
        maxWidth="lg"
      >
        <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">Unable to Display Instrument</h3>
          <p className="text-xs text-gray-600 max-w-sm">
            {error}
          </p>
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={() => {
                const targetId = fdrId || fdr?.id;
                if (targetId) fetchAuthoritativeFdr(targetId);
              }}
              className="px-3.5 py-1.5 bg-[#174B80] hover:bg-[#153f6c] text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center gap-1.5"
            >
              <RefreshCw size={12} />
              <span>Retry</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  const current = detailFdr || fdr;
  if (!current) return null;

  const documents = current.documents || [];
  const discrepancies = current.discrepancies || [];
  const extractedFields: Partial<ExtractedFields> = current.extractedFields || {};
  const scrutinyReviews = current.scrutinyReviews || [];
  const regionalReviews = current.regionalReviews || [];

  const handleResolveDiscrepancy = async (discId: string, action: 'RESOLVE' | 'WAIVE') => {
    setResolvingDiscId(discId);
    try {
      await api.resolveDiscrepancy(current.id, discId, action, `Resolved by ${currentUser.name}`);
      await fetchAuthoritativeFdr(current.id);
      onRefreshFdr();
      if (showToast) {
        showToast(`Discrepancy ${action === 'WAIVE' ? 'waived' : 'resolved'} successfully.`);
      }
    } catch (err: any) {
      console.error(err);
      if (showToast) showToast(err.message || 'Failed to update discrepancy.');
    } finally {
      setResolvingDiscId(null);
    }
  };

  const handleRequestVerification = async () => {
    setRequestingVerif(true);
    try {
      await api.requestBankVerification(current.id);
      await fetchAuthoritativeFdr(current.id);
      onRefreshFdr();
      if (showToast) {
        showToast('Bank verification request dispatched successfully.');
      }
    } catch (err: any) {
      console.error(err);
      if (showToast) showToast(err.message || 'Failed to dispatch verification request.');
    } finally {
      setRequestingVerif(false);
    }
  };

  const handleSubmitScrutiny = async () => {
    setSubmittingReview(true);
    try {
      await api.submitScrutinyReview({
        fdrId: current.id,
        decision: scrutinyDecision,
        observations: scrutinyNotes || `Scrutiny decision ${scrutinyDecision} recorded in official bureau registry.`
      });
      setScrutinyNotes('');
      await fetchAuthoritativeFdr(current.id);
      onRefreshFdr();
      if (showToast) {
        showToast(`Scrutiny review recorded: ${scrutinyDecision.replace(/_/g, ' ')}`);
      }
    } catch (err: any) {
      console.error(err);
      if (showToast) showToast(err.message || 'Failed to submit scrutiny review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitRegionalReview = async () => {
    if (!current || submittingRegionalReview) return;
    setSubmittingRegionalReview(true);
    try {
      await api.submitRegionalReview({
        fdrId: current.id,
        decision: regionalDecision,
        observations: regionalNotes || `Regional decision ${regionalDecision} endorsed by ${currentUser.name}.`,
        requiresHqReview: true
      });
      setRegionalNotes('');
      await fetchAuthoritativeFdr(current.id);
      onRefreshFdr();
      if (showToast) {
        showToast(
          regionalDecision === 'APPROVE' || regionalDecision === 'ENDORSE_FORWARD_HQ'
            ? `FDR ${current.fdrNumber} endorsed and forwarded to HQ Regulation Bureau central review queue!`
            : `Regional decision recorded: ${regionalDecision}`
        );
      }
    } catch (err: any) {
      console.error(err);
      if (showToast) showToast(err.message || 'Failed to submit regional review.');
    } finally {
      setSubmittingRegionalReview(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Fixed Deposit Instrument: ${current.fdrNumber}`}
      subtitle={`${current.institutionName} • Region: ${current.region} • Version ${current.version || 1} • Submitted: ${current.submissionDate || 'N/A'}`}
      maxWidth="5xl"
      footer={
        <div className="w-full flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Lifecycle:</span>
            <StatusBadge type="lifecycle" value={current.lifecycleStatus} />
            <span className="text-xs text-gray-500 ml-2">Verification:</span>
            <StatusBadge type="verification" value={current.verificationStatus} />
            <span className="text-xs text-gray-500 ml-2">Case Status:</span>
            <StatusBadge type="case" value={current.caseStatus} />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700"
            >
              Close
            </button>
            
            {current.verificationStatus === 'PENDING_BANK_VERIFICATION' && currentUser.role === 'bank_representative' && (
              <button
                onClick={() => onOpenVerifyModal(current)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white shadow-2xs"
              >
                Perform Bank Verification
              </button>
            )}

            {(current.lifecycleStatus === 'EXPIRING_SOON' || current.lifecycleStatus === 'MATURED') && currentUser.role === 'institution' && (
              <button
                onClick={() => onOpenRenewModal(current)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white shadow-2xs flex items-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>Submit Renewal</span>
              </button>
            )}

            {currentUser.role === 'regional_officer' && current.caseStatus === 'AWAITING_COMPETENT_AUTHORITY' && (
              <button
                onClick={() => setActiveTab('scrutiny')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white shadow-2xs flex items-center gap-1.5"
              >
                <ShieldCheck size={13} />
                <span>Regional Endorsement & Registration</span>
              </button>
            )}

            {current.releaseStatus === 'NONE' && (current.lifecycleStatus === 'MATURED' || current.caseStatus === 'APPROVED') && (
              <button
                onClick={() => onOpenReleaseModal(current)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 shadow-2xs flex items-center gap-1.5"
              >
                <Unlock size={13} />
                <span>Request Release / Refund</span>
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 text-xs overflow-x-auto">
          {[
            { id: 'overview', label: 'Instrument Overview', icon: FileText },
            { id: 'ocr_side_by_side', label: 'OCR & Extracted Fields', icon: Layers },
            { id: 'verification', label: 'Bank Verification & QR', icon: ShieldCheck },
            { id: 'scrutiny', label: 'Regulatory Audit & Decisions', icon: FileCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 font-medium border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-[#174B80] text-[#174B80] font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs">
            {isRefreshing && (
              <div className="flex items-center gap-2 text-[11px] text-[#174B80] bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 animate-pulse">
                <RefreshCw size={11} className="animate-spin" />
                <span>Syncing latest verification and scrutiny events from central database...</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-medium">Principal Face Value</span>
                <span className="text-xl font-bold text-gray-900 font-tabular mt-1 block">
                  ₹{Number(current.principalAmount || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-gray-500">Interest: {current.interestRate || 7.0}% p.a.</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-medium">Maturity Timeline</span>
                <span className="text-base font-bold text-gray-900 font-tabular mt-1 block">
                  {current.maturityDate || 'Not specified'}
                </span>
                <span className="text-[11px] text-gray-500">Issue Date: {current.issueDate || 'N/A'}</span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[11px] text-gray-500 uppercase tracking-wider block font-medium">Lien Endorsement</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                  current.lienStatus === 'LIEN_MARKED_AICTE' ? 'bg-[#E8F5EE] text-[#2A674E]' : 'bg-red-50 text-red-700'
                }`}>
                  {current.lienStatus === 'LIEN_MARKED_AICTE' ? 'Endorsed to Member Secretary AICTE' : 'Lien Not Marked'}
                </span>
                <div className="text-[11px] text-gray-500 truncate mt-1">Ref: {current.lienReference || 'AICTE-LIEN-RECORD'}</div>
              </div>
            </div>

            {/* Instrument Detail Fields */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-2.5">
              <h4 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">Issuing Commercial Bank & Branch Information</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Bank Name:</span>
                  <span className="font-semibold text-gray-900">{current.bankName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Branch:</span>
                  <span className="font-semibold text-gray-900">{current.branchName || 'Main Branch'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">IFSC Code:</span>
                  <span className="font-mono font-semibold text-gray-900">{current.branchIfsc || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Approval Year:</span>
                  <span className="font-semibold text-gray-900">{current.approvalYear || '2026-27'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-gray-500 block">Technical Program:</span>
                  <span className="font-medium text-gray-900">{current.programType || 'Engineering & Technology'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">AICTE Central Registration:</span>
                  <span className="font-medium text-emerald-800">
                    {current.caseStatus === 'APPROVED' ? `Registered on ${current.registrationDate ? new Date(current.registrationDate).toLocaleDateString('en-IN') : 'Official Master Record'}` : 'Pending Regional Endorsement'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-500 block">Regulatory Purpose:</span>
                <span className="text-gray-800">{current.purpose || 'Mandatory Security Deposit under AICTE Approval Process Handbook'}</span>
              </div>
            </div>

            {/* Endorsement and Registration Status Card */}
            {(current.endorsedBy || current.registrationNumber || current.hqReviewedBy) && (
              <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 font-semibold text-teal-950">
                    <CheckCircle2 size={15} className="text-teal-700" />
                    <span>Statutory Regional Endorsement & AICTE Master Registration</span>
                  </div>
                  {current.registrationNumber && (
                    <span className="font-mono font-bold text-xs bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-300">
                      {current.registrationNumber}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  {current.endorsedBy && (
                    <div>
                      <span className="text-teal-700 block font-medium">Endorsed By:</span>
                      <span className="font-semibold text-gray-900">{current.endorsedBy}</span>
                      {current.endorsedAt && (
                        <span className="text-[10px] text-gray-500 block font-tabular">
                          {new Date(current.endorsedAt).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  )}

                  {current.hqReviewedBy && (
                    <div>
                      <span className="text-teal-700 block font-medium">HQ Central Review:</span>
                      <span className="font-semibold text-gray-900">{current.hqReviewedBy}</span>
                      {current.hqReviewedAt && (
                        <span className="text-[10px] text-gray-500 block font-tabular">
                          {new Date(current.hqReviewedAt).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {current.endorsementNotes && (
                  <div className="pt-2 border-t border-teal-200/60 text-xs">
                    <span className="text-teal-800 font-semibold block">Regional Officer Endorsement Comments:</span>
                    <p className="text-gray-800 italic mt-0.5">"{current.endorsementNotes}"</p>
                  </div>
                )}

                {current.hqObservations && (
                  <div className="pt-2 border-t border-teal-200/60 text-xs">
                    <span className="text-teal-800 font-semibold block">HQ Central Bureau Observations:</span>
                    <p className="text-gray-800 italic mt-0.5">"{current.hqObservations}"</p>
                  </div>
                )}
              </div>
            )}

            {/* Predecessor / Replacement Chain if Renewed */}
            {(current.predecessorFdrNumber || current.replacementFdrNumber) && (
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                  <RotateCcw size={14} className="text-[#174B80]" />
                  <span>Immutable Renewal Chain</span>
                </div>
                {current.predecessorFdrNumber && (
                  <p className="text-blue-800">
                    This instrument was created as a statutory rollover / replacement for predecessor FDR: <strong className="font-mono">{current.predecessorFdrNumber}</strong>.
                  </p>
                )}
                {current.replacementFdrNumber && (
                  <p className="text-blue-800">
                    This instrument has matured and been rolled over into replacement FDR: <strong className="font-mono">{current.replacementFdrNumber}</strong>.
                  </p>
                )}
              </div>
            )}

            {/* Uploaded Documents List */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <h4 className="font-semibold text-gray-900 border-b border-gray-100 pb-2">
                Attached Statutory Deposit Certificates ({documents.length})
              </h4>
              {documents.length === 0 ? (
                <p className="text-gray-500 text-xs">No documents uploaded with this submission.</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-xl p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 shrink-0">
                          <FileText size={16} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{doc.fileName}</div>
                          <div className="text-[11px] text-gray-500">
                            Type: {doc.documentType.replace(/_/g, ' ')} • Size: {doc.fileSize} • Uploaded by {doc.uploadedBy}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full shrink-0">
                        OCR Confidence: {doc.ocrConfidence || 95}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: OCR Side-by-Side Review Tool */}
        {activeTab === 'ocr_side_by_side' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-600">
              <p className="font-semibold text-gray-900">Side-by-Side Field Auditing</p>
              Compare submitted institutional metadata directly against values extracted by optical recognition. Discrepancies are highlighted for examination.
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8F9FA] text-[11px] font-semibold text-gray-600 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5">Field Name</th>
                    <th className="px-4 py-2.5">Submitted Value (Institution)</th>
                    <th className="px-4 py-2.5">Extracted Value (Document OCR)</th>
                    <th className="px-4 py-2.5">Match Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    {
                      field: 'FDR Reference No.',
                      submitted: current.fdrNumber,
                      extracted: extractedFields.fdrNumber || current.fdrNumber,
                      matches: !discrepancies.some(d => d.field === 'fdrNumber' && d.status === 'OPEN')
                    },
                    {
                      field: 'Principal Face Value',
                      submitted: current.principalAmount != null ? `₹${Number(current.principalAmount).toLocaleString('en-IN')}` : 'Not Specified',
                      extracted: (extractedFields.principalAmount ?? current.principalAmount) != null ? `₹${Number(extractedFields.principalAmount ?? current.principalAmount).toLocaleString('en-IN')}` : 'Not Extracted',
                      matches: !discrepancies.some(d => d.field === 'principalAmount' && d.status === 'OPEN')
                    },
                    {
                      field: 'Issuing Bank Name',
                      submitted: current.bankName,
                      extracted: extractedFields.bankName || current.bankName,
                      matches: true
                    },
                    {
                      field: 'Date of Maturity',
                      submitted: current.maturityDate || 'N/A',
                      extracted: extractedFields.maturityDate || current.maturityDate || 'N/A',
                      matches: !discrepancies.some(d => d.field === 'maturityDate' && d.status === 'OPEN')
                    },
                    {
                      field: 'Lien Endorsement',
                      submitted: current.lienStatus === 'LIEN_MARKED_AICTE' ? 'Marked in favor of AICTE' : 'Not Marked',
                      extracted: extractedFields.lienMarkedToAicte ? 'Lien noted to Member Secretary AICTE' : 'Lien clause missing on document',
                      matches: !discrepancies.some(d => d.field === 'lienStatus' && d.status === 'OPEN')
                    }
                  ].map((row, i) => (
                    <tr key={i} className={!row.matches ? 'bg-red-50/50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{row.field}</td>
                      <td className="px-4 py-2.5 font-mono text-gray-900">{row.submitted}</td>
                      <td className="px-4 py-2.5 font-mono font-semibold text-gray-900">{row.extracted}</td>
                      <td className="px-4 py-2.5">
                        {row.matches ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <CheckCircle2 size={13} />
                            Exact Match
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-700 font-semibold bg-red-100/70 px-2 py-0.5 rounded-full">
                            <AlertTriangle size={12} />
                            Mismatch Detected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Discrepancies Resolution Box */}
            {discrepancies.length > 0 && (
              <div className="space-y-2 mt-3">
                <h4 className="font-semibold text-gray-900">Recorded Discrepancy Flags ({discrepancies.length})</h4>
                {discrepancies.map((disc) => (
                  <div key={disc.id} className="p-3 rounded-xl border border-red-200 bg-red-50/40 flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-red-900 flex items-center gap-1.5">
                        <AlertTriangle size={14} className="text-red-600" />
                        <span>{disc.field} Mismatch ({disc.severity} Priority)</span>
                      </div>
                      <p className="text-[11px] text-red-800 mt-1">{disc.reason}</p>
                      <div className="text-[10px] text-gray-500 mt-1">Source: {disc.evidenceSource}</div>
                      {disc.status !== 'OPEN' && (
                        <div className="mt-1 text-[11px] text-emerald-700 font-medium">
                          Status: {disc.status} ({disc.resolutionNotes})
                        </div>
                      )}
                    </div>

                    {disc.status === 'OPEN' && (currentUser.role === 'scrutiny_officer' || currentUser.role === 'headquarters') && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleResolveDiscrepancy(disc.id, 'RESOLVE')}
                          disabled={resolvingDiscId === disc.id}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-md shadow-2xs"
                        >
                          Mark Resolved
                        </button>
                        <button
                          onClick={() => handleResolveDiscrepancy(disc.id, 'WAIVE')}
                          disabled={resolvingDiscId === disc.id}
                          className="px-2 py-1 text-xs font-medium border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-md"
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

        {/* Tab 3: Bank Verification & QR Code */}
        {activeTab === 'verification' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Verification Status Card */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">Bank Verification Credentials</h4>
                  <StatusBadge type="verification" value={current.verificationStatus} />
                </div>
                
                {current.verificationRequest ? (
                  <div className="space-y-1.5 text-xs text-gray-700 pt-2">
                    <div>Token: <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 select-all">{current.verificationRequest.token}</span></div>
                    <div>Requested: <span className="font-tabular">{current.verificationRequest.requestedAt}</span></div>
                    <div>Expires At: <span className="font-tabular font-semibold text-amber-700">{current.verificationRequest.expiresAt}</span></div>
                    <div>Status: <span className="font-semibold">{current.verificationRequest.status}</span></div>

                    {(current.verificationRequest.status === 'EXPIRED' || current.verificationRequest.status === 'REVOKED') && (
                      <div className="pt-2">
                        <button
                          onClick={handleRequestVerification}
                          disabled={requestingVerif}
                          className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <RefreshCw size={13} className={requestingVerif ? 'animate-spin' : ''} />
                          <span>Regenerate Verification Token</span>
                        </button>
                      </div>
                    )}
                    
                    {current.verificationRequest.verifiedAt && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="font-semibold text-emerald-800">Verified by Bank Officer:</div>
                        <div>Name: {current.verificationRequest.bankOfficerName} ({current.verificationRequest.bankOfficerDesignation})</div>
                        <div>Reference No: <span className="font-mono">{current.verificationRequest.verificationReferenceNo}</span></div>
                        <div>Bank Observations: {current.verificationRequest.bankObservations || 'All fields checked and verified against CBS.'}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-3 space-y-2">
                    <p className="text-gray-500">No verification request has been dispatched yet for this instrument.</p>
                    <button
                      onClick={handleRequestVerification}
                      disabled={requestingVerif}
                      className="px-3.5 py-1.5 bg-[#174B80] hover:bg-[#123860] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <KeyRound size={13} className={requestingVerif ? 'animate-spin' : ''} />
                      <span>{requestingVerif ? 'Dispatching...' : 'Dispatch Bank Verification Request'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* QR Code Inspection Simulator */}
              <div className="p-4 bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center text-center">
                <div className="w-28 h-28 bg-gray-100 border border-gray-300 rounded-lg p-2 flex items-center justify-center mb-2 shadow-inner">
                  <QrCode size={88} className="text-[#25252A]" />
                </div>
                <div className="font-semibold text-gray-900 text-xs">Cryptographic Verification QR Code</div>
                <p className="text-[11px] text-gray-500 max-w-[260px] mt-0.5">
                  Authorized bank managers scan this token to access the tamper-proof Core Banking reconciliation gateway.
                </p>
                {current.verificationRequest && (
                  <button
                    onClick={() => onOpenVerifyModal(current)}
                    className="mt-2.5 px-3 py-1.5 text-xs font-semibold bg-[#174B80] hover:bg-[#153f6c] text-white rounded-lg shadow-2xs flex items-center gap-1.5"
                  >
                    <ExternalLink size={13} />
                    <span>Open Bank Portal View</span>
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

        {/* Tab 4: Scrutiny Decisions & Actions */}
        {activeTab === 'scrutiny' && (
          <div className="space-y-4 text-xs">
            {/* Scrutiny Reviews History */}
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Regulatory Scrutiny Trail ({scrutinyReviews.length})</h4>
              {scrutinyReviews.length === 0 ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-gray-500">
                  No official scrutiny observations recorded yet.
                </div>
              ) : (
                scrutinyReviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
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
                    <p className="text-gray-700 text-xs">{rev.observations}</p>
                    <div className="text-[10px] text-gray-400 font-tabular">{rev.reviewedAt}</div>
                  </div>
                ))
              )}
            </div>

            {/* Regional Officer Reviews History */}
            {(regionalReviews.length > 0 || current.endorsedBy) && (
              <div className="space-y-2 mt-3">
                <h4 className="font-semibold text-gray-900">Regional Bureau Endorsements & Decisions</h4>
                {regionalReviews.map((reg) => (
                  <div key={reg.id} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-950">{reg.officerName} ({reg.region} Regional Office)</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {reg.decision.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-emerald-900 text-xs">{reg.observations}</p>
                    <div className="text-[10px] text-emerald-600 font-tabular">{reg.reviewedAt}</div>
                  </div>
                ))}
                {regionalReviews.length === 0 && current.endorsedBy && (
                  <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-teal-950">{current.endorsedBy}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                        {current.caseStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-teal-900 text-xs">{current.endorsementNotes || 'Endorsed by Regional Officer.'}</p>
                    {current.endorsedAt && <div className="text-[10px] text-teal-600 font-tabular">{current.endorsedAt}</div>}
                  </div>
                )}
                {current.hqReviewedBy && (
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-1 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-indigo-950">HQ Regulation Bureau: {current.hqReviewedBy}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        Central Ratification
                      </span>
                    </div>
                    <p className="text-indigo-900 text-xs">{current.hqObservations || 'Ratified and registered by HQ Bureau.'}</p>
                    {current.hqReviewedAt && <div className="text-[10px] text-indigo-600 font-tabular">{current.hqReviewedAt}</div>}
                  </div>
                )}
              </div>
            )}

            {/* Officer Action Form (if scrutiny officer role) */}
            {(currentUser.role === 'scrutiny_officer' || currentUser.role === 'headquarters') && (
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-3 mt-4">
                <h4 className="font-semibold text-blue-900">Record Regulatory Scrutiny Decision</h4>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Decision Option</label>
                  <select
                    value={scrutinyDecision}
                    onChange={(e) => setScrutinyDecision(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#174B80] bg-white text-xs font-medium"
                  >
                    <option value="RECOMMEND_APPROVAL">Recommend Approval (Route to Regional Officer)</option>
                    <option value="REQUEST_CORRECTION">Request Institutional Correction (Deficit/Mismatch)</option>
                    <option value="QUERY_TO_BANK">Issue Query to Issuing Bank Branch</option>
                    <option value="REJECT">Reject FDR Submission</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Official Observations</label>
                  <textarea
                    rows={2}
                    value={scrutinyNotes}
                    onChange={(e) => setScrutinyNotes(e.target.value)}
                    placeholder="Enter formal observations referencing AICTE Approval Process Handbook clauses..."
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#174B80] bg-white text-xs"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitScrutiny}
                    disabled={submittingReview}
                    className="px-4 py-1.5 bg-[#174B80] hover:bg-[#153f6c] text-white font-semibold rounded-lg shadow-2xs"
                  >
                    {submittingReview ? 'Recording...' : 'Submit Scrutiny Decision'}
                  </button>
                </div>
              </div>
            )}

            {/* Regional Officer Action Form (if regional officer or headquarters role) */}
            {(currentUser.role === 'regional_officer' || currentUser.role === 'headquarters') && current.caseStatus === 'AWAITING_COMPETENT_AUTHORITY' && (
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-amber-900">Regional Bureau Endorsement & Formal Registration</h4>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Competent Authority Review
                  </span>
                </div>
                <p className="text-xs text-amber-800">
                  Scrutiny Officer has recommended approval. As Regional Officer, conduct jurisdictional review and grant formal endorsement to register this FDR in the AICTE master repository.
                </p>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Regional Decision</label>
                  <select
                    value={regionalDecision}
                    onChange={(e) => setRegionalDecision(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#174B80] bg-white text-xs font-semibold"
                  >
                    <option value="ENDORSE_FORWARD_HQ">Endorse & Forward to HQ Regulation Bureau (Central Review & Final Registration)</option>
                    <option value="APPROVE">Grant Regional Officer Endorsement & Recommend Approval</option>
                    <option value="REQUEST_CORRECTION">Request Institutional Clarification / Correction</option>
                    <option value="ESCALATE">Escalate to Headquarters Competent Authority</option>
                    <option value="REJECT">Reject Application</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Regional Officer Endorsement Notes</label>
                  <textarea
                    rows={2}
                    value={regionalNotes}
                    onChange={(e) => setRegionalNotes(e.target.value)}
                    placeholder="Enter endorsement details, regional office registration order notes, or conditions..."
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#174B80] bg-white text-xs"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitRegionalReview}
                    disabled={submittingRegionalReview}
                    className="px-4 py-1.5 bg-[#174B80] hover:bg-[#153f6c] text-white font-semibold rounded-lg shadow-2xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={13} />
                    <span>{submittingRegionalReview ? 'Recording...' : 'Grant Endorsement & Forward to HQ'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </Modal>
  );
};
