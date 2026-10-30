import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  QrCode, 
  Calendar,
  Lock,
  UserCheck,
  Building2,
  Clock,
  KeyRound,
  FileText,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  RefreshCw,
  Search
} from 'lucide-react';
import { FdrInstrument, UserProfile } from '../../types';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

interface BankVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  fdr: FdrInstrument | null;
  directToken?: string;
  currentUser: UserProfile;
  onVerificationCompleted: () => void;
}

type TokenValidationState = 'IDLE' | 'VALIDATING' | 'AUTHORIZED' | 'ERROR' | 'UNAUTHORIZED_BANK' | 'EXPIRED' | 'REVOKED' | 'ALREADY_CONSUMED' | 'NO_TOKEN_INITIATED';

export const BankVerifyModal: React.FC<BankVerifyModalProps> = ({
  isOpen,
  onClose,
  fdr,
  directToken,
  currentUser,
  onVerificationCompleted
}) => {
  // Token resolution and validation state
  const [tokenInput, setTokenInput] = useState('');
  const [validationState, setValidationState] = useState<TokenValidationState>('IDLE');
  const [verifiedPayload, setVerifiedPayload] = useState<any | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ message: string; code?: string; intendedBank?: string }>({ message: '' });
  
  // Verification form state
  const [officerName, setOfficerName] = useState('');
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerEmpId, setOfficerEmpId] = useState('');
  const [officerDesignation, setOfficerDesignation] = useState('');
  const [verificationRefNo, setVerificationRefNo] = useState('');
  const [decision, setDecision] = useState<'CONFIRMED' | 'DISCREPANCY' | 'UNABLE_TO_VERIFY'>('CONFIRMED');
  const [bankObservations, setBankObservations] = useState('');
  
  // Strict requirement: Do not preselect checklist items; require conscious verification
  const [checkedFields, setCheckedFields] = useState({
    fdrNumberMatches: false,
    principalAmountMatches: false,
    datesConfirmed: false,
    depositStatusChecked: false,
    lienMarkedToAicteMatches: false,
    autoRenewalClauseMatches: false
  });

  // Endorsement declaration requirement
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [initiatingToken, setInitiatingToken] = useState(false);

  // Synchronize officer metadata with logged-in user
  useEffect(() => {
    if (currentUser) {
      setOfficerName(currentUser.name || '');
      setOfficerEmail(currentUser.email || '');
      setOfficerEmpId(currentUser.branchCode ? `BANK-${currentUser.branchCode}` : 'SBI-EMP-44910');
      setOfficerDesignation(currentUser.designation || 'Branch Verification Officer');
      setVerificationRefNo(`VER/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, [currentUser]);

  // Primary Token Validation Handler
  const validateToken = async (candidateToken: string) => {
    if (!candidateToken || !candidateToken.trim()) {
      setValidationState('ERROR');
      setErrorDetails({ message: 'Please provide a valid verification token or QR code payload.' });
      setVerifiedPayload(null);
      return;
    }

    const cleanToken = candidateToken.trim();
    setValidationState('VALIDATING');
    setErrorDetails({ message: '' });
    setSubmitError('');
    setVerifiedPayload(null);

    try {
      const payload = await api.getVerificationByToken(cleanToken);
      setVerifiedPayload(payload);
      setValidationState('AUTHORIZED');
    } catch (err: any) {
      setVerifiedPayload(null);
      const msg = err.message || 'Token validation failed';
      
      if (msg.includes('expired') || err.code === 'TOKEN_EXPIRED') {
        setValidationState('EXPIRED');
        setErrorDetails({ message: msg, code: 'TOKEN_EXPIRED' });
      } else if (msg.includes('revoked') || err.code === 'TOKEN_REVOKED') {
        setValidationState('REVOKED');
        setErrorDetails({ message: msg, code: 'TOKEN_REVOKED' });
      } else if (msg.includes('already') || err.code === 'TOKEN_CONSUMED') {
        setValidationState('ALREADY_CONSUMED');
        setErrorDetails({ message: msg, code: 'TOKEN_CONSUMED' });
      } else if (msg.includes('Mismatch') || msg.includes('Access Denied') || err.code === 'UNAUTHORIZED_BANK_PARTNER') {
        setValidationState('UNAUTHORIZED_BANK');
        setErrorDetails({ message: msg, code: 'UNAUTHORIZED_BANK_PARTNER' });
      } else {
        setValidationState('ERROR');
        setErrorDetails({ message: msg, code: 'TOKEN_NOT_FOUND' });
      }
    }
  };

  // On modal open or input change, initiate token evaluation
  useEffect(() => {
    if (!isOpen) {
      setValidationState('IDLE');
      setVerifiedPayload(null);
      setErrorDetails({ message: '' });
      setSubmitError('');
      setDeclarationAccepted(false);
      setCheckedFields({
        fdrNumberMatches: false,
        principalAmountMatches: false,
        datesConfirmed: false,
        depositStatusChecked: false,
        lienMarkedToAicteMatches: false,
        autoRenewalClauseMatches: false
      });
      return;
    }

    if (directToken) {
      setTokenInput(directToken);
      validateToken(directToken);
    } else if (fdr) {
      if (fdr.verificationRequest?.token) {
        setTokenInput(fdr.verificationRequest.token);
        validateToken(fdr.verificationRequest.token);
      } else {
        // FDR exists but has no active token requested yet
        setValidationState('NO_TOKEN_INITIATED');
        setVerifiedPayload(null);
      }
    } else {
      setValidationState('IDLE');
      setVerifiedPayload(null);
    }
  }, [isOpen, directToken, fdr, currentUser]);

  // Handler for manual token submission
  const handleManualLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      validateToken(tokenInput.trim());
    }
  };

  // Handler for generating a new verification token for an un-initiated or expired FDR
  const handleGenerateToken = async () => {
    if (!fdr) return;
    setInitiatingToken(true);
    setSubmitError('');
    try {
      const verifReq = await api.requestBankVerification(fdr.id);
      setTokenInput(verifReq.token);
      await validateToken(verifReq.token);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to dispatch verification request');
    } finally {
      setInitiatingToken(false);
    }
  };

  // Submit Official Bank Endorsement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!verifiedPayload?.token) {
      setSubmitError('Cannot submit: active verification token is missing or unverified.');
      return;
    }

    if (!declarationAccepted) {
      setSubmitError('You must confirm the official endorsement declaration acknowledging review against bank records.');
      return;
    }

    if ((decision === 'DISCREPANCY' || decision === 'UNABLE_TO_VERIFY') && (!bankObservations || bankObservations.trim().length < 5)) {
      setSubmitError('A specific explanation or reason is strictly required when reporting a discrepancy or inability to verify.');
      return;
    }

    if (!officerName.trim() || !officerEmail.trim() || !officerEmpId.trim() || !verificationRefNo.trim()) {
      setSubmitError('Please complete all mandatory officer identification fields.');
      return;
    }

    setSubmitting(true);

    try {
      await api.submitBankVerification({
        token: verifiedPayload.token,
        bankOfficerName: officerName,
        bankOfficerEmail: officerEmail,
        bankOfficerEmployeeId: officerEmpId,
        bankOfficerDesignation: officerDesignation,
        verificationReferenceNo: verificationRefNo,
        decision,
        bankObservations,
        checkedFields,
        declarationAccepted: true
      });

      onVerificationCompleted();
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to record official bank verification');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Secure Bank FDR Verification Gateway"
      subtitle="Official Scheduled Commercial Bank Core Banking Reconciliation Gateway"
      maxWidth="3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#174B80]" />
            <span>AICTE Regulation Bureau • Problem Statement ID 26265</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700 transition-colors"
            >
              Cancel
            </button>

            {validationState === 'AUTHORIZED' && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || !declarationAccepted}
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#123860] disabled:bg-gray-400 text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Submitting Endorsement...</span>
                  </>
                ) : (
                  <span>Submit Official Bank Endorsement</span>
                )}
              </button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        
        {/* Token Search Bar (Always accessible for manual token/QR entry) */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
          <form onSubmit={handleManualLookup} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <KeyRound size={14} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Enter or paste cryptographic verification token (e.g. aicte_vrf_SBIN_...)..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full bg-white text-xs text-gray-900 rounded-lg pl-9 pr-3 py-2 border border-gray-300 focus:outline-hidden focus:border-[#174B80] font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={validationState === 'VALIDATING'}
              className="px-4 py-2 bg-[#25252A] hover:bg-black disabled:bg-gray-400 text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              {validationState === 'VALIDATING' ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <QrCode size={13} />
                  <span>Authenticate Token</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* ------------------------------------------------------------------- */}
        {/* SECURITY ENFORCEMENT: ONLY GENERIC ERROR STATES WHEN UNAUTHORIZED    */}
        {/* NEVER expose FDR details or checklist before token authorization   */}
        {/* ------------------------------------------------------------------- */}

        {/* State 1: Validating in Progress */}
        {validationState === 'VALIDATING' && (
          <div className="p-8 bg-white rounded-xl border border-gray-200 text-center space-y-3">
            <RefreshCw size={28} className="animate-spin text-[#174B80] mx-auto" />
            <h4 className="font-semibold text-gray-900 text-sm">Validating Cryptographic Verification Token...</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Verifying token authenticity, SHA-256 integrity hash, expiration timestamp, and issuing bank authorization.
            </p>
          </div>
        )}

        {/* State 2: Token Not Found / Invalid */}
        {validationState === 'ERROR' && (
          <div className="p-6 bg-red-50/80 rounded-xl border border-red-200 space-y-3">
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-900 text-sm">Verification Token Invalid or Not Found</h4>
                <p className="text-xs text-red-700 mt-1 leading-relaxed">
                  {errorDetails.message || 'The provided verification token is invalid, malformed, or does not exist in the AICTE Regulation Bureau database.'}
                </p>
                <div className="mt-3 p-2.5 bg-white rounded-lg border border-red-200 text-[11px] text-gray-600 space-y-1">
                  <div>• Ensure the complete token string from the official AICTE verification dispatch was pasted without truncation.</div>
                  <div>• If you scanned a physical verification letter, scan the QR code again or contact the institution to confirm initiation.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Token Expired */}
        {validationState === 'EXPIRED' && (
          <div className="p-6 bg-amber-50/80 rounded-xl border border-amber-200 space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 text-sm">Verification Link Expired</h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  {errorDetails.message || 'This verification token has exceeded its statutory validity window.'}
                </p>
                <p className="text-[11px] text-amber-700 mt-2">
                  Per AICTE Regulation Bureau guidelines, verification tokens carry a time-to-live (TTL) of 30 days. 
                  An authorized AICTE Scrutiny Officer or Regional Officer can re-issue an updated verification token.
                </p>

                {(currentUser.role === 'scrutiny_officer' || currentUser.role === 'headquarters' || currentUser.role === 'regional_officer' || currentUser.role === 'admin') && fdr && (
                  <button
                    onClick={handleGenerateToken}
                    disabled={initiatingToken}
                    className="mt-3 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw size={12} className={initiatingToken ? 'animate-spin' : ''} />
                    <span>Re-issue Active Verification Token</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* State 4: Token Revoked */}
        {validationState === 'REVOKED' && (
          <div className="p-6 bg-rose-50/80 rounded-xl border border-rose-200 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-rose-900 text-sm">Verification Request Revoked</h4>
                <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                  {errorDetails.message || 'This verification request was revoked by an authorized AICTE Regulation Bureau officer.'}
                </p>
                <p className="text-[11px] text-rose-700 mt-2">
                  Revocation occurs if an instrument was superseded by a renewal advice or if a discrepancy correction was requested.
                </p>

                {(currentUser.role === 'scrutiny_officer' || currentUser.role === 'headquarters' || currentUser.role === 'regional_officer' || currentUser.role === 'admin') && fdr && (
                  <button
                    onClick={handleGenerateToken}
                    disabled={initiatingToken}
                    className="mt-3 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw size={12} className={initiatingToken ? 'animate-spin' : ''} />
                    <span>Generate New Verification Token</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* State 5: Token Already Completed / Consumed */}
        {validationState === 'ALREADY_CONSUMED' && (
          <div className="p-6 bg-purple-50/80 rounded-xl border border-purple-200 space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-purple-900 text-sm">Verification Request Already Completed</h4>
                <p className="text-xs text-purple-800 mt-1 leading-relaxed">
                  {errorDetails.message || 'This verification request was already endorsed and closed. Duplicate submissions are strictly prevented.'}
                </p>
                <div className="mt-3 p-3 bg-white rounded-lg border border-purple-200 text-xs text-gray-700">
                  <div className="font-semibold text-purple-900 mb-1">Status: Consumed / Endorsed</div>
                  <div className="text-[11px] text-gray-500">
                    The recorded endorsement has been communicated to the AICTE Scrutiny Officer and is locked in the tamper-proof audit trail.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 6: Unauthorized Bank Partner */}
        {validationState === 'UNAUTHORIZED_BANK' && (
          <div className="p-6 bg-blue-50/80 rounded-xl border border-blue-200 space-y-3">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-[#174B80] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Bank Partner Authorization Required</h4>
                <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                  {errorDetails.message || 'Access Denied: You are not authenticated with credentials for the issuing commercial bank.'}
                </p>
                <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200 text-[11px] text-gray-700 space-y-1">
                  <div>Currently Signed In As: <strong className="text-gray-900">{currentUser.name} ({currentUser.role})</strong></div>
                  {currentUser.bankName && <div>Assigned Bank: <strong className="text-gray-900">{currentUser.bankName}</strong></div>}
                  <div className="text-blue-700 pt-1 font-medium">
                    To endorse this instrument, sign in with the authorized bank branch credentials matching this deposit.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* State 7: No Token Initiated Yet for this FDR */}
        {validationState === 'NO_TOKEN_INITIATED' && (
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center space-y-3">
            <QrCode size={36} className="text-gray-400 mx-auto" />
            <h4 className="font-semibold text-gray-900 text-sm">No Active Bank Verification Request</h4>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              A cryptographic verification token has not yet been generated for this Fixed Deposit Receipt ({fdr?.fdrNumber}).
            </p>
            <div className="pt-2">
              <button
                onClick={handleGenerateToken}
                disabled={initiatingToken}
                className="px-4 py-2 bg-[#174B80] hover:bg-[#123860] disabled:bg-gray-400 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <KeyRound size={13} className={initiatingToken ? 'animate-spin' : ''} />
                <span>{initiatingToken ? 'Generating Secure Token...' : 'Initiate Secure Bank Verification'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* AUTHORIZED STATE: FDR DETAILS AND RECONCILIATION CHECKLIST ARE SHOWN */}
        {/* ------------------------------------------------------------------- */}
        {validationState === 'AUTHORIZED' && verifiedPayload && (
          <div className="space-y-4">
            
            {/* Authenticated Verification Session Badge */}
            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
                <div>
                  <div className="font-semibold text-emerald-900 text-xs">
                    Cryptographic Token Authenticated & Authorized
                  </div>
                  <div className="text-[10px] text-emerald-700 font-mono">
                    Token: {verifiedPayload.token} • Valid until {new Date(verifiedPayload.expiresAt).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>

              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full uppercase shrink-0">
                Authorized Session
              </span>
            </div>

            {/* FDR Details Card (Only revealed after successful token validation) */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2.5">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div>
                  <span className="text-[11px] text-gray-500 uppercase font-semibold">Instrument Under Verification</span>
                  <div className="font-mono text-base font-bold text-gray-900">{verifiedPayload.fdrNumber}</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-500 uppercase font-semibold">Declared Face Value</span>
                  <div className="text-base font-bold text-[#174B80] font-tabular">
                    ₹{Number(verifiedPayload.principalAmount).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <span className="text-gray-500 block">Institution Name:</span>
                  <span className="font-semibold text-gray-900 truncate block">{verifiedPayload.institutionName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Issuing Bank:</span>
                  <span className="font-semibold text-gray-900">{verifiedPayload.bankName}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Branch & IFSC:</span>
                  <span className="font-mono font-semibold text-gray-900">{verifiedPayload.branchIfsc || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Maturity Date:</span>
                  <span className="font-tabular font-semibold text-gray-900">{verifiedPayload.maturityDate}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between text-[11px] text-gray-600">
                <span>Issue Date: <strong className="text-gray-900">{verifiedPayload.issueDate}</strong></span>
                <span>Lien Mandate: <strong className="text-emerald-800">{verifiedPayload.lienStatus}</strong></span>
                <span>Lien Ref: <strong className="font-mono text-gray-800">{verifiedPayload.lienReference}</strong></span>
              </div>
            </div>

            {/* Core Banking Checklist (Finacle / CBS Evidence) */}
            <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h4 className="font-semibold text-gray-900 flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-[#174B80]" />
                  <span>Mandatory Core Banking (CBS / Finacle) Verification Checklist</span>
                </h4>
                <span className="text-[10px] text-gray-500 font-medium">Verify each field against live ledger</span>
              </div>

              <div className="space-y-2 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedFields.fdrNumberMatches}
                    onChange={(e) => setCheckedFields({ ...checkedFields, fdrNumberMatches: e.target.checked })}
                    className="mt-0.5 rounded border-gray-300 text-[#174B80] focus:ring-[#174B80]"
                  />
                  <div>
                    <span className="text-gray-900 font-semibold block">1. FDR Reference Number Matches</span>
                    <span className="text-gray-500 text-[11px]">The FDR receipt number corresponds to an active fixed deposit account in branch CBS.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedFields.principalAmountMatches}
                    onChange={(e) => setCheckedFields({ ...checkedFields, principalAmountMatches: e.target.checked })}
                    className="mt-0.5 rounded border-gray-300 text-[#174B80] focus:ring-[#174B80]"
                  />
                  <div>
                    <span className="text-gray-900 font-semibold block">2. Principal Deposit Amount Matches</span>
                    <span className="text-gray-500 text-[11px]">The deposit amount in bank ledger exactly matches ₹{Number(verifiedPayload.principalAmount).toLocaleString('en-IN')}.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedFields.datesConfirmed}
                    onChange={(e) => setCheckedFields({ ...checkedFields, datesConfirmed: e.target.checked })}
                    className="mt-0.5 rounded border-gray-300 text-[#174B80] focus:ring-[#174B80]"
                  />
                  <div>
                    <span className="text-gray-900 font-semibold block">3. Issue Date & Maturity Date Confirmed</span>
                    <span className="text-gray-500 text-[11px]">Deposit creation date ({verifiedPayload.issueDate}) and maturity date ({verifiedPayload.maturityDate}) agree with bank records.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedFields.depositStatusChecked}
                    onChange={(e) => setCheckedFields({ ...checkedFields, depositStatusChecked: e.target.checked })}
                    className="mt-0.5 rounded border-gray-300 text-[#174B80] focus:ring-[#174B80]"
                  />
                  <div>
                    <span className="text-gray-900 font-semibold block">4. Active Deposit Status & No Premature Encashment</span>
                    <span className="text-gray-500 text-[11px]">Deposit is live and unencumbered; no premature liquidation, loan against FDR, or overdraft has been issued.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedFields.lienMarkedToAicteMatches}
                    onChange={(e) => setCheckedFields({ ...checkedFields, lienMarkedToAicteMatches: e.target.checked })}
                    className="mt-0.5 rounded border-gray-300 text-[#174B80] focus:ring-[#174B80]"
                  />
                  <div>
                    <span className="text-gray-900 font-semibold block">5. Legal Lien Marked in Favor of Member Secretary, AICTE New Delhi</span>
                    <span className="text-gray-500 text-[11px]">Lien is formally noted in CBS in favor of Member Secretary AICTE / Regional Officer.</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors">
                  <input
                    type="checkbox"
                    checked={checkedFields.autoRenewalClauseMatches}
                    onChange={(e) => setCheckedFields({ ...checkedFields, autoRenewalClauseMatches: e.target.checked })}
                    className="mt-0.5 rounded border-gray-300 text-[#174B80] focus:ring-[#174B80]"
                  />
                  <div>
                    <span className="text-gray-900 font-semibold block">6. Automatic Renewal / Rollover Clause Verified</span>
                    <span className="text-gray-500 text-[11px]">Recorded only if supported by bank mandate so security deposit does not mature without notice.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Official Endorsement Outcome & Officer Metadata */}
            <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
              <h4 className="font-semibold text-gray-900 text-xs">Bank Verification Outcome & Officer Identification</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Verification Outcome *
                  </label>
                  <select
                    value={decision}
                    onChange={(e) => setDecision(e.target.value as any)}
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#174B80] font-semibold text-xs"
                  >
                    <option value="CONFIRMED">CONFIRMED AGAINST BANK RECORDS</option>
                    <option value="DISCREPANCY">DISCREPANCY FOUND (Mismatch in Amount / Dates / Lien)</option>
                    <option value="UNABLE_TO_VERIFY">UNABLE TO VERIFY (Deposit Record Not Found)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Bank Verification Reference Number *
                  </label>
                  <input
                    type="text"
                    value={verificationRefNo}
                    onChange={(e) => setVerificationRefNo(e.target.value)}
                    placeholder="e.g. SBI/VER/2026/8892"
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#174B80] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Authorized Bank Officer Name *
                  </label>
                  <input
                    type="text"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#174B80] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Official Bank Email *
                  </label>
                  <input
                    type="email"
                    value={officerEmail}
                    onChange={(e) => setOfficerEmail(e.target.value)}
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#174B80] text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Branch Code / Employee ID *
                  </label>
                  <input
                    type="text"
                    value={officerEmpId}
                    onChange={(e) => setOfficerEmpId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#174B80] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Officer Designation *
                  </label>
                  <input
                    type="text"
                    value={officerDesignation}
                    onChange={(e) => setOfficerDesignation(e.target.value)}
                    className="w-full p-2 rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#174B80] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Bank Officer Observations & Findings {decision !== 'CONFIRMED' && <span className="text-red-600 font-bold">* (Strictly required for Discrepancy or Unable to Verify)</span>}
                </label>
                <textarea
                  rows={2}
                  value={bankObservations}
                  onChange={(e) => setBankObservations(e.target.value)}
                  placeholder={
                    decision === 'CONFIRMED'
                      ? 'e.g. Deposit active in Core Banking System. Lien noted in favor of Member Secretary AICTE.'
                      : 'State the specific discrepancies found in amount, maturity date, or lien notation...'
                  }
                  className="w-full p-2 rounded-lg border border-gray-300 focus:outline-hidden focus:border-[#174B80] text-xs"
                />
              </div>

              {/* Correct Legal Endorsement Wording per Requirement 5 */}
              <div className="pt-3 border-t border-gray-200">
                <label className="flex items-start gap-2.5 cursor-pointer p-3 bg-blue-50/70 rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={declarationAccepted}
                    onChange={(e) => setDeclarationAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-blue-300 text-[#174B80] focus:ring-[#174B80]"
                  />
                  <div className="text-xs text-blue-900 leading-relaxed">
                    <strong>Official Bank Declaration:</strong> “I confirm that I have reviewed the fields selected above against the bank records available to me and that the response accurately reflects the verification performed.”
                  </div>
                </label>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
                  {submitError}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </Modal>
  );
};
