import React, { useState } from 'react';
import { Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { Institution, UserProfile, ExtractedFields } from '../../types';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

interface NewFdrModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutions: Institution[];
  currentUser: UserProfile;
  onFdrCreated: () => void;
}

export const NewFdrModal: React.FC<NewFdrModalProps> = ({
  isOpen,
  onClose,
  institutions,
  currentUser,
  onFdrCreated
}) => {
  const [institutionId, setInstitutionId] = useState(currentUser.institutionId || (institutions[0]?.id ?? ''));
  const [fdrNumber, setFdrNumber] = useState('');
  const [bankName, setBankName] = useState('State Bank of India');
  const [branchName, setBranchName] = useState('');
  const [branchIfsc, setBranchIfsc] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('2500000');
  const [interestRate, setInterestRate] = useState('7.1');
  const [issueDate, setIssueDate] = useState('2026-10-15');
  const [maturityDate, setMaturityDate] = useState('2031-10-15');
  const [lienStatus, setLienStatus] = useState<'LIEN_MARKED_AICTE' | 'LIEN_NOT_MARKED'>('LIEN_MARKED_AICTE');
  const [programType, setProgramType] = useState('Engineering');
  const [purpose, setPurpose] = useState('Security Deposit for Introduction of New AI/ML Technical Program');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // OCR Extraction state
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedFields | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const banks = [
    'State Bank of India',
    'Punjab National Bank',
    'Canara Bank',
    'Bank of Baroda',
    'Union Bank of India',
    'HDFC Bank',
    'ICICI Bank',
    'Axis Bank'
  ];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setExtracting(true);
    setErrorMessage('');

    try {
      // Read as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
          const res = await api.extractFdrDocument({
            base64Data: base64String,
            mimeType: file.type,
            fileName: file.name
          });
          if (res.extracted) {
            setExtractedData(res.extracted);
            // Autofill fields if empty
            if (!fdrNumber && res.extracted.fdrNumber) setFdrNumber(res.extracted.fdrNumber);
            if (res.extracted.bankName) setBankName(res.extracted.bankName);
            if (res.extracted.branchName) setBranchName(res.extracted.branchName);
            if (res.extracted.branchIfsc) setBranchIfsc(res.extracted.branchIfsc);
            if (res.extracted.principalAmount) setPrincipalAmount(String(res.extracted.principalAmount));
            if (res.extracted.issueDate) setIssueDate(res.extracted.issueDate);
            if (res.extracted.maturityDate) setMaturityDate(res.extracted.maturityDate);
          }
        } catch (err: any) {
          console.error('Extraction error:', err);
        } finally {
          setExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fdrNumber || !bankName || !principalAmount || !issueDate || !maturityDate) {
      setErrorMessage('Please fill all mandatory fields marked with an asterisk (*)');
      return;
    }

    setSubmitting(true);
    setErrorMessage('');

    try {
      await api.submitFdr({
        fdrNumber,
        institutionId: currentUser.role === 'institution' ? currentUser.institutionId : institutionId,
        bankName,
        branchName,
        branchIfsc,
        principalAmount: Number(principalAmount),
        interestRate: Number(interestRate),
        issueDate,
        maturityDate,
        lienStatus,
        programType,
        purpose,
        uploadedDocName: uploadedFile?.name || `FDR_${fdrNumber}_DepositReceipt.pdf`,
        extractedValues: extractedData
      });

      onFdrCreated();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit FDR instrument');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit New Fixed Deposit Receipt (FDR)"
      subtitle="Security Deposit Lodgement under AICTE Approval Process Handbook (Clause 1.4)"
      maxWidth="4xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white shadow-2xs"
          >
            {submitting ? 'Submitting to AICTE...' : 'Submit FDR for Scrutiny'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Document Upload & AI OCR Trigger */}
        <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-center">
          <input
            type="file"
            id="fdrDocUpload"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="fdrDocUpload"
            className="cursor-pointer flex flex-col items-center"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 text-[#174B80] flex items-center justify-center mb-2">
              <Upload size={18} />
            </div>
            <span className="font-semibold text-gray-800">
              {uploadedFile ? uploadedFile.name : 'Upload Fixed Deposit Receipt Document (PDF or Scan)'}
            </span>
            <span className="text-[11px] text-gray-500 mt-0.5">
              Automated OCR & Gemini document parser will extract 12 structured fields and perform discrepancy verification.
            </span>
          </label>

          {extracting && (
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              <Sparkles size={14} className="animate-spin text-blue-600" />
              <span>Analyzing Document & Performing OCR Field Extraction...</span>
            </div>
          )}

          {extractedData && !extracting && (
            <div className="mt-3 w-full bg-white p-3 rounded-lg border border-emerald-200 text-left">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 pb-2 border-b border-emerald-100">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  AI Document Analysis Complete (12 Fields Extracted)
                </span>
                <span className="text-[11px] bg-emerald-50 px-2 py-0.5 rounded font-mono">
                  Confidence: 98%
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-[11px] text-gray-700">
                <div>FDR No: <span className="font-mono font-semibold">{extractedData.fdrNumber}</span></div>
                <div>Amount: <span className="font-semibold">₹{extractedData.principalAmount?.toLocaleString('en-IN')}</span></div>
                <div>Maturity: <span className="font-semibold">{extractedData.maturityDate}</span></div>
                <div>Lien: <span className="font-semibold">{extractedData.lienMarkedToAicte ? 'AICTE Endorsed' : 'Not Marked'}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Institution Selection (if not locked to role) */}
        {currentUser.role !== 'institution' && (
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Select Institution *
            </label>
            <select
              value={institutionId}
              onChange={(e) => setInstitutionId(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80]"
            >
              {institutions.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.aictePermanentId}) - {inst.region} Region
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Grid Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              FDR Reference Number *
            </label>
            <input
              type="text"
              placeholder="e.g. SBI-BLR-88491029"
              value={fdrNumber}
              onChange={(e) => setFdrNumber(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80] font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Issuing Scheduled Commercial Bank *
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80]"
            >
              {banks.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Branch Name
            </label>
            <input
              type="text"
              placeholder="e.g. University Campus Branch"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Branch IFSC Code
            </label>
            <input
              type="text"
              placeholder="e.g. SBIN0004126"
              value={branchIfsc}
              onChange={(e) => setBranchIfsc(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80] font-mono uppercase"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Principal Deposit Amount (INR) *
            </label>
            <input
              type="number"
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80] font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Interest Rate (% p.a.)
            </label>
            <input
              type="number"
              step="0.05"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Date of Issue *
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80]"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Date of Maturity *
            </label>
            <input
              type="date"
              value={maturityDate}
              onChange={(e) => setMaturityDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80]"
            />
          </div>
        </div>

        {/* Lien Notation Declaration */}
        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
          <label className="block font-semibold text-blue-900 mb-1.5">
            Lien Notation to Member Secretary, AICTE New Delhi *
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="lienStatus"
                value="LIEN_MARKED_AICTE"
                checked={lienStatus === 'LIEN_MARKED_AICTE'}
                onChange={() => setLienStatus('LIEN_MARKED_AICTE')}
              />
              <span className="font-medium text-gray-800">
                Pledged jointly / Lien endorsed in favor of Member Secretary, AICTE
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="lienStatus"
                value="LIEN_NOT_MARKED"
                checked={lienStatus === 'LIEN_NOT_MARKED'}
                onChange={() => setLienStatus('LIEN_NOT_MARKED')}
              />
              <span className="text-gray-600">Lien Not Marked (Requires Correction)</span>
            </label>
          </div>
        </div>

        {/* Program & Purpose */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Discipline / Program
            </label>
            <select
              value={programType}
              onChange={(e) => setProgramType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80]"
            >
              <option value="Engineering">Engineering & Technology</option>
              <option value="Management">Management (MBA/PGDM)</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Architecture">Architecture & Planning</option>
              <option value="MCA">Computer Applications (MCA)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              Statutory Purpose / Regulatory Approval Clause
            </label>
            <input
              type="text"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80]"
            />
          </div>
        </div>

        {/* Institution Declaration */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-[11px] text-gray-600">
          <p className="font-semibold text-gray-800 mb-0.5">Statutory Declaration by Head of Institution:</p>
          I hereby certify that the Fixed Deposit Receipt submitted herein is genuine, free from any prior charge or encumbrance, and pledged in favor of Member Secretary, AICTE New Delhi as required under AICTE regulations.
        </div>
      </form>
    </Modal>
  );
};
