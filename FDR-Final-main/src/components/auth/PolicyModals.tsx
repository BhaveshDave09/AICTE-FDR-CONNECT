import React from 'react';
import { Modal } from '../common/Modal';
import { AlertCircle } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'terms';
}

export const PolicyModal: React.FC<PolicyModalProps> = ({
  isOpen,
  onClose,
  type
}) => {
  if (!isOpen) return null;

  const isPrivacy = type === 'privacy';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isPrivacy ? 'Draft Data Privacy & Security Policy' : 'Draft Terms of Use & Regulatory Notice'}
      subtitle="AICTE Regulation Bureau • Fixed Deposit Receipt (FDR) Management Portal (PS 26265)"
      maxWidth="3xl"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white shadow-2xs"
        >
          Close Document
        </button>
      }
    >
      <div className="space-y-3.5 text-xs text-gray-700 leading-relaxed">
        
        {/* Notice Disclaimer Banner */}
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-amber-900">
          <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong>Draft Policy Notice:</strong> This document represents the operational draft governance terms for the AICTE Smart Automation FDR Prototype (Problem Statement 26265). Formal deployment into national production requires statutory clearance by the AICTE Regulation Bureau and Member Secretary.
          </div>
        </div>

        {isPrivacy ? (
          <>
            <h4 className="font-semibold text-gray-900 text-sm">1. Scope and Collection of Financial Records</h4>
            <p>
              This portal collects Fixed Deposit Receipts, Core Banking references, institutional accreditation metadata, authorized signatory declarations, and bank branch officer identity records exclusively for validating mandatory institutional security deposits as required by the AICTE Approval Process Handbook (APH).
            </p>

            <h4 className="font-semibold text-gray-900 text-sm">2. Purpose of Processing and AI Document Analysis</h4>
            <p>
              Uploaded deposit certificates are processed through optical character recognition (PyMuPDF / Gemini models) strictly for metadata normalization, discrepancy verification against submitted figures, and tenure calculation. Information is never used for commercial profiling, automated credit assessment, or third-party advertising.
            </p>

            <h4 className="font-semibold text-gray-900 text-sm">3. Principle of Least Privilege and RBAC</h4>
            <p>
              Technical institutions are strictly restricted to their own submitted instruments and cannot query records of other colleges. Bank representatives receive scoped access only to instruments bearing their branch code or active verification token. Complete nationwide inventory visibility is restricted to authorized headquarters officials.
            </p>

            <h4 className="font-semibold text-gray-900 text-sm">4. Data Retention and Immutable Audit Trail</h4>
            <p>
              All submissions, document replacements, verification responses, and regulatory decisions are permanently preserved in append-only audit ledgers to guarantee institutional legal accountability across the mandatory 8-to-10 year lock-in period.
            </p>
          </>
        ) : (
          <>
            <h4 className="font-semibold text-gray-900 text-sm">1. Institutional Compliance Obligations</h4>
            <p>
              Approved technical institutions are required under AICTE Approval Process Handbook Clause 1.4 to maintain valid, unencumbered Fixed Deposit Receipts pledged in the joint name of the Authorized Signatory and the Member Secretary, AICTE New Delhi, throughout the mandated statutory lock-in tenure.
            </p>

            <h4 className="font-semibold text-gray-900 text-sm">2. Bank Verification & Legal Lien</h4>
            <p>
              Bank verification responses recorded by authorized branch managers via QR code or cryptographic token constitute official confirmation of deposit validity and lien recording in core banking ledgers.
            </p>

            <h4 className="font-semibold text-gray-900 text-sm">3. Statutory Release and Refund Restrictions</h4>
            <p>
              Under Clause 7.1, instrument maturity alone does not authorize unilateral encashment or release of funds without a formal AICTE Discharge Order issued by the Competent Authority.
            </p>

            <h4 className="font-semibold text-gray-900 text-sm">4. Prototype & Demonstration Disclaimer</h4>
            <p>
              Simulated or prototype banking actions, SMS/email dispatches, and mock records in development mode are explicitly flagged as simulated to maintain complete transparency.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
};
