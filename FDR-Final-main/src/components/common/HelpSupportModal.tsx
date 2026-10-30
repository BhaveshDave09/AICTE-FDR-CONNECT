import React, { useState } from 'react';
import { Modal } from './Modal';
import {
  HelpCircle,
  BookOpen,
  Phone,
  Mail,
  FileCheck
} from 'lucide-react';

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'handbook' | 'workflow' | 'contacts' | 'faqs'>('handbook');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AICTE FDR Regulatory Compliance & Support"
      maxWidth="3xl"
    >
      <div className="space-y-5 text-[#24262B]">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 gap-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('handbook')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'handbook'
                ? 'border-[#174B80] text-[#174B80] font-semibold'
                : 'border-transparent text-[#737985] hover:text-[#24262B]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            APH Norms & Sizing
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'workflow'
                ? 'border-[#174B80] text-[#174B80] font-semibold'
                : 'border-transparent text-[#737985] hover:text-[#24262B]'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            SOP & Verification Rules
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'faqs'
                ? 'border-[#174B80] text-[#174B80] font-semibold'
                : 'border-transparent text-[#737985] hover:text-[#24262B]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Common Inquiries & FAQs
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'contacts'
                ? 'border-[#174B80] text-[#174B80] font-semibold'
                : 'border-transparent text-[#737985] hover:text-[#24262B]'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            Bureau Contacts
          </button>
        </div>

        {/* Tab 1: APH Norms */}
        {activeTab === 'handbook' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl">
              <h4 className="font-semibold text-[#174B80] text-sm mb-1">
                AICTE Approval Process Handbook (APH) Mandatory Deposit Table
              </h4>
              <p className="text-[#4A505C]">
                Security deposits must be created as Fixed Deposit Receipts (FDR) in a Scheduled Commercial Bank, 
                drawn jointly in the name of the Applicant Trust/Society and the Regional Officer, AICTE.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl space-y-2">
                <div className="font-semibold text-gray-900 text-xs">Engineering & Technology (Technical UG)</div>
                <div className="text-[#737985]">
                  Minimum Deposit: <strong className="text-gray-900">₹35,00,000 (35 Lakhs)</strong>
                </div>
                <div className="text-[#737985]">
                  Mandatory Tenure: <strong className="text-gray-900">8–10 Years (Lock-in)</strong>
                </div>
                <div className="text-[11px] text-gray-500">
                  Lien marked in favor of AICTE Regional Officer; no premature encashment or loan against FDR permitted without NOC.
                </div>
              </div>

              <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl space-y-2">
                <div className="font-semibold text-gray-900 text-xs">Management & MCA Programs (PG)</div>
                <div className="text-[#737985]">
                  Minimum Deposit: <strong className="text-gray-900">₹15,00,000 (15 Lakhs)</strong>
                </div>
                <div className="text-[#737985]">
                  Mandatory Tenure: <strong className="text-gray-900">8–10 Years</strong>
                </div>
                <div className="text-[11px] text-gray-500">
                  Must be drawn on a Scheduled Commercial Bank in India with joint operating authorization.
                </div>
              </div>

              <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl space-y-2">
                <div className="font-semibold text-gray-900 text-xs">Pharmacy & Architecture Institutes</div>
                <div className="text-[#737985]">
                  Minimum Deposit: <strong className="text-gray-900">₹25,00,000 (25 Lakhs)</strong>
                </div>
                <div className="text-[#737985]">
                  Mandatory Tenure: <strong className="text-gray-900">10 Years</strong>
                </div>
                <div className="text-[11px] text-gray-500">
                  Mandatory joint account with Regional Director / AICTE Regulation Bureau nominee.
                </div>
              </div>

              <div className="p-3 bg-white border border-[#E5E7EB] rounded-xl space-y-2">
                <div className="font-semibold text-gray-900 text-xs">Polytechnic / Diploma Institutions</div>
                <div className="text-[#737985]">
                  Minimum Deposit: <strong className="text-gray-900">₹15,00,000 (15 Lakhs)</strong>
                </div>
                <div className="text-[#737985]">
                  Mandatory Tenure: <strong className="text-gray-900">8 Years</strong>
                </div>
                <div className="text-[11px] text-gray-500">
                  Annual interest automatically credits to the institution's designated operating account.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SOP & Verification */}
        {activeTab === 'workflow' && (
          <div className="space-y-4 text-xs">
            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white">
              <div className="p-3">
                <span className="font-semibold text-gray-900">Stage 1: Deposit Creation & OCR Upload</span>
                <p className="text-[#737985] mt-1">
                  The institution creates the FDR in joint name and uploads clear scanned copies of both the FDR Certificate and the Bank Confirmation Letter. OCR extracts FDR Number, Principal, Maturity Date, and Lien notation.
                </p>
              </div>
              <div className="p-3">
                <span className="font-semibold text-gray-900">Stage 2: Bank Direct Verification</span>
                <p className="text-[#737985] mt-1">
                  A cryptographic verification link with QR code is dispatched to the issuing bank's authorized Nodal Officer. The bank confirms authenticity and lien marking directly into the portal.
                </p>
              </div>
              <div className="p-3">
                <span className="font-semibold text-gray-900">Stage 3: AICTE Scrutiny & Approval</span>
                <p className="text-[#737985] mt-1">
                  The Scrutiny Officer verifies tenure compliance, amount adequacy against APH tables, and branch credentials. On satisfaction, the deposit status changes to Active/Approved.
                </p>
              </div>
              <div className="p-3">
                <span className="font-semibold text-gray-900">Stage 4: Automated Expiry Monitoring & Release</span>
                <p className="text-[#737985] mt-1">
                  System monitors maturity dates with automated reminders at 90, 60, 30, and 15 days. Upon completion of lock-in period and regulatory clearance, Release / Refund Officer processes formal discharge.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: FAQs */}
        {activeTab === 'faqs' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="font-semibold text-gray-900">Q: Can an FDR be encashed prematurely?</div>
              <p className="text-[#737985] mt-1">
                No. AICTE FDRs carry an irrevocable lien in favor of the Council. Scheduled banks are legally bound not to encash or issue credit against the deposit without an official Discharge Certificate issued by the AICTE Regulation Bureau.
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="font-semibold text-gray-900">Q: What should an institution do if an FDR is flagged with a Discrepancy?</div>
              <p className="text-[#737985] mt-1">
                Go to the <em>Discrepancies & Corrections</em> tab in your sidebar. Review the flagged mismatch (e.g., joint name format error or amount variance), submit a corrected document or clarification note, and request re-scrutiny.
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="font-semibold text-gray-900">Q: How does bank verification work if our branch has not received the link?</div>
              <p className="text-[#737985] mt-1">
                The Bank Representative can use the "Verify by Token / QR" tab to input the unique cryptographic verification token from the physical verification letter or scan the QR code directly.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Contacts */}
        {activeTab === 'contacts' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-white border border-[#E5E7EB] rounded-xl space-y-1.5">
                <div className="font-semibold text-gray-900">Regulation Bureau Headquarter</div>
                <div className="text-[#737985]">Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070</div>
                <div className="flex items-center gap-1.5 text-blue-700 font-medium pt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>regulation@aicte-india.org</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                  <Phone className="w-3.5 h-3.5" />
                  <span>011-29581000 / 29581050</span>
                </div>
              </div>

              <div className="p-3.5 bg-white border border-[#E5E7EB] rounded-xl space-y-1.5">
                <div className="font-semibold text-gray-900">Technical Helpdesk (Portal Support)</div>
                <div className="text-[#737985]">Smart Automation Division (Problem Statement 26265)</div>
                <div className="flex items-center gap-1.5 text-blue-700 font-medium pt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>fdr-portal-support@aicte-india.org</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Toll Free: 1800-11-2345 (Mon–Fri 9:30–18:00)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#25252A] hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </Modal>
  );
};
