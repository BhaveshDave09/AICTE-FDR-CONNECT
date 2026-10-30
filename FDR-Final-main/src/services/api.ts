import { 
  FdrInstrument, 
  UserProfile, 
  Institution, 
  AuditEvent, 
  ExpiryReminderNotification, 
  DiscrepancyFlag,
  BankVerificationRequest,
  ScrutinyReview,
  ReleaseRefundRequest 
} from '../types';

export const api = {
  // Auth & Roles
  async getCurrentUser(): Promise<UserProfile> {
    const res = await fetch('/api/auth/current');
    const data = await res.json();
    return data.user;
  },

  async getAllRoles(): Promise<UserProfile[]> {
    const res = await fetch('/api/auth/roles');
    const data = await res.json();
    return data.users;
  },

  async login(payload: { email: string; password?: string; role?: string }): Promise<{ user: UserProfile; token: string; message: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  async forgotPassword(email: string): Promise<string> {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password reset request failed');
    return data.message;
  },

  async switchRole(userId: string): Promise<UserProfile> {
    const res = await fetch('/api/auth/switch-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to switch role');
    return data.user;
  },

  async registerInstitution(payload: any): Promise<any> {
    const res = await fetch('/api/auth/register-institution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  // Institutions
  async getInstitutions(): Promise<Institution[]> {
    const res = await fetch('/api/institutions');
    const data = await res.json();
    return data.institutions;
  },

  // FDRs
  async getFdrs(filters?: {
    search?: string;
    region?: string;
    institutionId?: string;
    lifecycleStatus?: string;
    verificationStatus?: string;
    caseStatus?: string;
    releaseStatus?: string;
  }): Promise<{ fdrs: FdrInstrument[]; total: number }> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });
    }
    const res = await fetch(`/api/fdrs?${params.toString()}`);
    const data = await res.json();
    return data;
  },

  async getFdrById(id: string): Promise<FdrInstrument> {
    const res = await fetch(`/api/fdrs/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch FDR');
    return data.fdr;
  },

  async submitFdr(payload: any): Promise<FdrInstrument> {
    const res = await fetch('/api/fdrs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit FDR');
    return data.fdr;
  },

  async resolveDiscrepancy(fdrId: string, discId: string, action: 'RESOLVE' | 'WAIVE', resolutionNotes?: string) {
    const res = await fetch(`/api/fdrs/${fdrId}/discrepancies/${discId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, resolutionNotes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to resolve discrepancy');
    return data;
  },

  async renewFdr(fdrId: string, payload: any): Promise<{ replacementFdr: FdrInstrument; previousFdr: FdrInstrument }> {
    const res = await fetch(`/api/fdrs/${fdrId}/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit renewal');
    return data;
  },

  // Bank Verification
  async requestBankVerification(fdrId: string): Promise<BankVerificationRequest> {
    const res = await fetch(`/api/fdrs/${fdrId}/request-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to initiate verification');
    return data.verificationRequest;
  },

  async revokeBankVerification(fdrId: string, reason?: string): Promise<any> {
    const res = await fetch(`/api/fdrs/${fdrId}/revoke-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to revoke verification request');
    return data;
  },

  async getVerificationByToken(token: string): Promise<any> {
    const res = await fetch(`/api/verification/by-token/${token}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch verification payload');
    return data;
  },

  async submitBankVerification(payload: any): Promise<any> {
    const res = await fetch('/api/verification/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit bank verification');
    return data;
  },

  // Scrutiny
  async submitScrutinyReview(payload: {
    fdrId: string;
    decision: 'RECOMMEND_APPROVAL' | 'REQUEST_CORRECTION' | 'QUERY_TO_BANK' | 'REJECT';
    observations: string;
    recommendationNote?: string;
  }): Promise<{ review: ScrutinyReview; fdr: FdrInstrument }> {
    const res = await fetch('/api/scrutiny/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit scrutiny review');
    return data;
  },

  // Regional Review & Approval
  async submitRegionalReview(payload: {
    fdrId: string;
    decision: 'APPROVE' | 'ENDORSE_FORWARD_HQ' | 'REQUEST_CORRECTION' | 'ESCALATE' | 'REJECT';
    observations?: string;
    requiresHqReview?: boolean;
  }): Promise<{ review: any; fdr: FdrInstrument }> {
    const res = await fetch('/api/regional/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit regional review');
    return data;
  },

  // HQ Central Review & Final Registration
  async submitHqReview(payload: {
    fdrId: string;
    decision: 'APPROVE' | 'APPROVE_RELEASE' | 'REGISTER_RELEASE' | 'REQUEST_CORRECTION' | 'REJECT';
    observations?: string;
  }): Promise<{ review: any; fdr: FdrInstrument }> {
    const res = await fetch('/api/hq/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit HQ review');
    return data;
  },

  // Release / Refund
  async submitReleaseRequest(payload: {
    fdrId: string;
    requestType: string;
    reason: string;
    regulatoryClearanceNo?: string;
    boardResolutionDate?: string;
  }): Promise<{ releaseRequest: ReleaseRefundRequest; fdr: FdrInstrument }> {
    const res = await fetch('/api/release-refund/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit release request');
    return data;
  },

  async reviewReleaseRequest(id: string, decision: 'APPROVE' | 'REQUEST_DOCS' | 'DISCHARGE' | 'REJECT', officerNotes?: string) {
    const res = await fetch(`/api/release-refund/${id}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, officerNotes })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to process release request');
    return data;
  },

  // Expiry monitoring & notifications
  async runExpiryCheck(): Promise<any> {
    const res = await fetch('/api/notifications/run-expiry-check', { method: 'POST' });
    const data = await res.json();
    return data;
  },

  async getNotifications(): Promise<ExpiryReminderNotification[]> {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    return data.notifications;
  },

  // Reports
  async getReportsSummary(): Promise<any> {
    const res = await fetch('/api/reports/summary');
    const data = await res.json();
    return data;
  },

  getExportCsvUrl(): string {
    return '/api/reports/export-csv';
  },

  // Audit
  async getAuditLogs(filters?: { category?: string; search?: string }): Promise<AuditEvent[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    const res = await fetch(`/api/audit?${params.toString()}`);
    const data = await res.json();
    return data.auditLogs;
  },

  // AI & OCR
  async extractFdrDocument(payload: { base64Data?: string; mimeType?: string; fileName?: string }): Promise<any> {
    const res = await fetch('/api/ai/extract-fdr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return data;
  },

  async askAiAssistant(question: string): Promise<{ answer: string; citations: string[]; source: string }> {
    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI Assistant request failed');
    return data;
  },

  // Settings
  async getSettings(): Promise<any> {
    const res = await fetch('/api/settings');
    const data = await res.json();
    return data.settings;
  },

  async updateSettings(settings: any): Promise<any> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    const data = await res.json();
    return data;
  }
};
