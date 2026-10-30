export type UserRole =
  | 'institution'
  | 'bank_representative'
  | 'scrutiny_officer'
  | 'regional_officer'
  | 'headquarters'
  | 'release_officer'
  | 'admin';

export type InstrumentLifecycle =
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'MATURED'
  | 'RENEWED_REPLACED'
  | 'RELEASED'
  | 'CLOSED';

export type VerificationStatus =
  | 'NOT_REQUESTED'
  | 'PENDING_BANK_VERIFICATION'
  | 'CONFIRMED'
  | 'DISCREPANCY_FOUND'
  | 'UNABLE_TO_VERIFY'
  | 'EXPIRED_REQUEST';

export type AdministrativeCaseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_SCRUTINY'
  | 'AWAITING_BANK_RESPONSE'
  | 'AWAITING_INSTITUTION_CORRECTION'
  | 'AWAITING_ADDITIONAL_EVIDENCE'
  | 'AWAITING_COMPETENT_AUTHORITY'
  | 'ENDORSED_BY_REGIONAL_OFFICER'
  | 'AWAITING_HQ_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLOSED';

export type ReleaseRefundStatus =
  | 'NONE'
  | 'REQUESTED'
  | 'DOCS_PENDING'
  | 'UNDER_ELIGIBILITY_REVIEW'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'DISCHARGED'
  | 'REJECTED';

export type RegionalZone =
  | 'Northern'
  | 'North-Western'
  | 'Western'
  | 'Southern'
  | 'South-Western'
  | 'Eastern'
  | 'Central';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  institutionId?: string;
  institutionName?: string;
  bankName?: string;
  branchCode?: string;
  region?: RegionalZone;
  avatarUrl?: string;
}

export interface Institution {
  id: string;
  aictePermanentId: string;
  name: string;
  region: RegionalZone;
  state: string;
  city: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  establishmentYear: number;
  approvalStatus: 'Approved' | 'Extension of Approval' | 'Under Scrutiny';
  totalDepositAmount: number;
  activeFdrCount: number;
}

export interface FdrDocument {
  id: string;
  fdrId: string;
  fileName: string;
  fileSize: string;
  mimeType: string;
  uploadedAt: string;
  uploadedBy: string;
  documentType: 'ORIGINAL_FDR' | 'RENEWAL_ADVICE' | 'BANK_VERIFICATION_CERTIFICATE' | 'RELEASE_NOC' | 'BOARD_RESOLUTION';
  storagePath: string;
  ocrStatus: 'PENDING' | 'PROCESSED' | 'FAILED';
  ocrConfidence: number; // 0 - 100
}

export interface ExtractedFields {
  fdrNumber?: string;
  bankName?: string;
  branchName?: string;
  branchIfsc?: string;
  principalAmount?: number;
  interestRate?: number;
  issueDate?: string;
  maturityDate?: string;
  lienMarkedToAicte?: boolean;
  lienDetails?: string;
  depositorName?: string;
  jointHolderName?: string;
  autoRenewalClause?: boolean;
  confidenceScores: Record<string, number>;
}

export interface DiscrepancyFlag {
  id: string;
  fdrId: string;
  field: string;
  submittedValue: string;
  extractedValue: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
  evidenceSource: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'WAIVED_BY_OFFICER';
  flaggedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface BankVerificationRequest {
  id: string;
  fdrId: string;
  institutionId?: string;
  intendedBankName?: string;
  intendedBranchName?: string;
  token: string;
  tokenHash?: string;
  qrCodeUrl?: string;
  expiresAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'DISCREPANCY' | 'UNABLE_TO_VERIFY' | 'EXPIRED' | 'REVOKED';
  requestedAt: string;
  requestedBy: string;
  revokedAt?: string;
  revokedBy?: string;
  revocationReason?: string;
  bankOfficerName?: string;
  bankOfficerEmail?: string;
  bankOfficerEmployeeId?: string;
  bankOfficerDesignation?: string;
  verificationReferenceNo?: string;
  verifiedAt?: string;
  bankObservations?: string;
  checkedFields?: {
    fdrNumberMatches: boolean;
    principalAmountMatches: boolean;
    datesConfirmed?: boolean;
    maturityDateMatches?: boolean;
    depositStatusChecked?: boolean;
    lienMarkedToAicteMatches: boolean;
    autoRenewalClauseMatches: boolean;
  };
  supportingCertificatePath?: string;
}

export interface ScrutinyReview {
  id: string;
  fdrId: string;
  officerId: string;
  officerName: string;
  decision: 'RECOMMEND_APPROVAL' | 'REQUEST_CORRECTION' | 'QUERY_TO_BANK' | 'REJECT';
  observations: string;
  reviewedAt: string;
  discrepanciesResolved: boolean;
  recommendationNote?: string;
}

export interface RegionalReview {
  id: string;
  fdrId: string;
  officerId: string;
  officerName: string;
  region: RegionalZone;
  decision: 'APPROVE' | 'ENDORSE_FORWARD_HQ' | 'REQUEST_CORRECTION' | 'ESCALATE' | 'REJECT';
  observations: string;
  reviewedAt: string;
  registrationNumber?: string;
  requiresHqReview?: boolean;
}

export interface ReleaseRefundRequest {
  id: string;
  fdrId: string;
  institutionId: string;
  institutionName: string;
  fdrNumber: string;
  amount: number;
  requestType: 'FULL_RELEASE' | 'PARTIAL_RELEASE' | 'CLOSURE_REFUND';
  reason: string;
  justificationDocumentUrl?: string;
  regulatoryClearanceNo?: string;
  boardResolutionDate?: string;
  status: ReleaseRefundStatus;
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvedAt?: string;
  approvedBy?: string;
  dischargedAt?: string;
  officerNotes?: string;
}

export interface FdrInstrument {
  id: string;
  fdrNumber: string;
  institutionId: string;
  institutionName: string;
  region: RegionalZone;
  bankName: string;
  branchName: string;
  branchIfsc: string;
  principalAmount: number;
  interestRate: number;
  issueDate: string;
  maturityDate: string;
  lienStatus: 'LIEN_MARKED_AICTE' | 'LIEN_NOT_MARKED' | 'CONDITIONAL_LIEN';
  lienReference: string;
  approvalYear: string;
  programType: 'Engineering' | 'Management' | 'Pharmacy' | 'Architecture' | 'MCA' | 'Applied Arts';
  purpose: string;
  
  // Separate status models
  lifecycleStatus: InstrumentLifecycle;
  verificationStatus: VerificationStatus;
  caseStatus: AdministrativeCaseStatus;
  releaseStatus: ReleaseRefundStatus;

  // Documents & Extraction
  documents: FdrDocument[];
  extractedFields?: ExtractedFields;
  discrepancies: DiscrepancyFlag[];
  
  // Verification
  verificationRequest?: BankVerificationRequest;
  
  // Scrutiny & Regional Endorsement
  scrutinyReviews: ScrutinyReview[];
  regionalReviews?: RegionalReview[];
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  registrationDate?: string;
  registrationNumber?: string;
  endorsedBy?: string;
  endorsedAt?: string;
  endorsementNotes?: string;
  hqReviewedBy?: string;
  hqReviewedAt?: string;
  hqObservations?: string;
  
  // Renewal tracking
  predecessorFdrId?: string;
  predecessorFdrNumber?: string;
  replacementFdrId?: string;
  replacementFdrNumber?: string;
  renewalNotes?: string;

  // Release Request
  releaseRequest?: ReleaseRefundRequest;

  // Metadata
  submissionDate: string;
  lastUpdated: string;
  version: number;
}

export interface AuditEvent {
  id: string;
  fdrId?: string;
  fdrNumber?: string;
  institutionId?: string;
  institutionName?: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  category: 'AUTH' | 'FDR_SUBMISSION' | 'OCR_EXTRACTION' | 'DISCREPANCY' | 'BANK_VERIFICATION' | 'SCRUTINY' | 'RENEWAL' | 'RELEASE_REFUND' | 'SYSTEM_SETTINGS';
  timestamp: string;
  ipAddress?: string;
  previousValue?: string;
  newValue?: string;
}

export interface ExpiryReminderNotification {
  id: string;
  fdrId: string;
  fdrNumber: string;
  institutionId: string;
  institutionName: string;
  daysToMaturity: number;
  maturityDate: string;
  amount: number;
  stage: '90_DAYS' | '60_DAYS' | '30_DAYS' | 'MATURED';
  sentAt: string;
  channel: 'PORTAL' | 'EMAIL_SIMULATED' | 'SMS_SIMULATED';
  status: 'DELIVERED' | 'PENDING' | 'ACKNOWLEDGED';
  message: string;
}

export interface PortalKpiSummary {
  totalFdrCount: number;
  totalDepositValue: number;
  activeFdrCount: number;
  verifiedCount: number;
  pendingVerificationCount: number;
  discrepancyCount: number;
  expiringIn90DaysCount: number;
  maturedCount: number;
  pendingScrutinyCount: number;
  releaseRequestsCount: number;
  avgTurnaroundDays: number;
}
