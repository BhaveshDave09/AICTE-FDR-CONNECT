import React, { useState } from 'react';
import {
  Building2,
  Landmark,
  FileCheck2,
  MapPin,
  Layers,
  ShieldCheck,
  UserCheck,
  Clock,
  CheckCircle2,
  ArrowRight,
  FileText,
  AlertTriangle,
  Filter,
  ChevronDown,
  ChevronUp,
  Phone,
  QrCode,
  Bot,
  Lock
} from 'lucide-react';
import { UserRole, RegionalZone } from '../../types';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

interface LandingPageProps {
  onOpenAccessPortal: () => void;
  onSelectRoleLogin: (role: UserRole) => void;
  onOpenAssistant: () => void;
  onInstitutionRegistered: () => void;
  onOpenPrivacyPolicy: () => void;
  onOpenTermsOfUse: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAccessPortal,
  onSelectRoleLogin,
  onOpenAssistant,
  onInstitutionRegistered,
  onOpenPrivacyPolicy,
  onOpenTermsOfUse
}) => {
  // Institution Registration Modal State
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [instName, setInstName] = useState('');
  const [aicteId, setAicteId] = useState('');
  const [region, setRegion] = useState<RegionalZone>('Northern');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [submittingReg, setSubmittingReg] = useState(false);
  const [successRegMessage, setSuccessRegMessage] = useState('');
  const [errorRegMessage, setErrorRegMessage] = useState('');

  // Support / Contact Modal State
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportName, setSupportName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportCategory, setSupportCategory] = useState('access');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  // Workflow Active Stage Tab
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(1);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Filter for Features
  const [activeFeatureTab, setActiveFeatureTab] = useState<'all' | 'intake' | 'verification' | 'governance'>('all');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instName || !aicteId || !email) {
      setErrorRegMessage('Please fill in mandatory fields marked with an asterisk (*)');
      return;
    }
    setSubmittingReg(true);
    setErrorRegMessage('');

    try {
      const res = await api.registerInstitution({
        name: instName,
        aictePermanentId: aicteId,
        region,
        state,
        city,
        contactEmail: email,
        contactPhone: phone,
        address
      });

      setSuccessRegMessage(res.message);
      onInstitutionRegistered();
      setTimeout(() => {
        setRegisterModalOpen(false);
        setSuccessRegMessage('');
        setInstName('');
        setAicteId('');
        setEmail('');
        setPhone('');
        setAddress('');
      }, 3500);
    } catch (err: any) {
      setErrorRegMessage(err.message || 'Registration request failed.');
    } finally {
      setSubmittingReg(false);
    }
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportName || !supportEmail || !supportMessage) return;
    setSupportSubmitted(true);
    setTimeout(() => {
      setSupportModalOpen(false);
      setSupportSubmitted(false);
      setSupportName('');
      setSupportEmail('');
      setSupportMessage('');
    }, 2500);
  };

  // 7 Workflow Stages (Section 7)
  const workflowSteps = [
    {
      num: 1,
      title: 'Submit',
      kicker: 'Step 1: Instrument Lodgement',
      desc: 'An authorized institution signatory enters FDR certificate details (principal amount, bank, IFSC, issue and maturity dates, AICTE joint lien endorsement clause) and uploads scanned PDF receipts.',
      actor: 'Technical Institution',
      timeframe: 'Day 1'
    },
    {
      num: 2,
      title: 'Extract & Validate',
      kicker: 'Step 2: Automated Ingestion',
      desc: 'The document processing engine performs assisted text extraction, computing field-level confidence scores. The system cross-compares declared values against extracted certificate figures to identify missing lien endorsements or value deficits.',
      actor: 'AI Ingestion Engine',
      timeframe: 'Immediate'
    },
    {
      num: 3,
      title: 'Verify',
      kicker: 'Step 3: Bank Confirmation',
      desc: 'A unique, expiring verification token and QR code are transmitted to the issuing scheduled commercial bank branch. An authorized branch manager logs in, cross-checks Finacle/CBS ledger balances, and records official verification findings.',
      actor: 'Scheduled Commercial Bank',
      timeframe: '1–5 Days'
    },
    {
      num: 4,
      title: 'Review',
      kicker: 'Step 4: Regulatory Scrutiny',
      desc: 'AICTE Scrutiny Officers inspect original documents side-by-side with OCR extractions and bank responses. Officers may issue correction requests for mismatches or recommend formal approval.',
      actor: 'AICTE Scrutiny Officer',
      timeframe: '3–7 Days'
    },
    {
      num: 5,
      title: 'Register & Monitor',
      kicker: 'Step 5: Central Repository Lodgement',
      desc: 'Approved instruments are indexed into the nationwide central repository. Scheduled background jobs continuously monitor validity and maturity dates, triggering automated alerts prior to maturity.',
      actor: 'Regulation Bureau / System Scheduler',
      timeframe: 'Continuous'
    },
    {
      num: 6,
      title: 'Renew or Replace',
      kicker: 'Step 6: Predecessor-Linked Rollover',
      desc: 'When an FDR approaches maturity, the institution lodges an updated renewal advice or replacement FDR. The platform permanently links the new instrument to the predecessor without erasing history.',
      actor: 'Institution & Bank',
      timeframe: 'Pre-Maturity'
    },
    {
      num: 7,
      title: 'Request Release / Refund',
      kicker: 'Step 7: Statutory Discharge',
      desc: 'Upon fulfillment of the mandatory 10-year lock-in tenure or institutional closure, the college applies for release. After Regional Office vetting and Competent Authority approval, an official AICTE Bank Discharge Order is generated.',
      actor: 'Release Officer & Competent Authority',
      timeframe: 'Post Lock-in'
    }
  ];

  // 12 Comprehensive FAQs (Section 14)
  const faqs = [
    {
      q: 'What is the AICTE FDR Management Portal?',
      a: 'The AICTE Security Deposit & FDR Management Portal is a centralized digital platform developed for the AICTE Regulation Bureau (Problem Statement ID: 26265). It digitizes the entire lifecycle of Fixed Deposit Receipts submitted by technical institutions as mandatory security deposits, replacing fragmented spreadsheets and physical records with structured intake, bank verification, and automated expiry monitoring.'
    },
    {
      q: 'Who can access the portal?',
      a: 'Access is strictly governed by Role-Based Access Control (RBAC) across seven authorized stakeholder categories: Technical Institutions/Colleges, Scheduled Commercial Bank Partners, AICTE Scrutiny Officers, Regional Officers, Regulation Bureau HQ, Release/Refund Officers, and System Administrators. Each role operates within its own authorized workspace.'
    },
    {
      q: 'How can an institution submit an FDR?',
      a: 'An authorized institution signatory signs in via the Institution Dashboard, completes the structured FDR lodgement form with instrument details (bank name, IFSC, branch, deposit amount, maturity date, and AICTE joint lien declaration), and uploads scanned PDF receipts. The system immediately performs automated OCR validation to check for missing information.'
    },
    {
      q: 'How does bank verification work?',
      a: 'Instead of complex point-to-point API connections with hundreds of commercial banks, the portal generates a cryptographically unique, expiring verification token and QR code for the issuing branch. Authorized bank representatives open the gateway, verify the deposit balance and lien notation against Core Banking (CBS/Finacle), and record official confirmation.'
    },
    {
      q: 'Does AI verification guarantee that an FDR is genuine?',
      a: 'No. AI-assisted OCR extraction simply assists in reading certificate text and highlighting discrepancies with submitted metadata. Official confirmation relies strictly on authorized scheduled commercial bank endorsement and human scrutiny by AICTE regulatory examiners.'
    },
    {
      q: 'What happens when a discrepancy is detected?',
      a: 'If a face value deficit, tenure shortfall (<5 years lock-in), or missing joint AICTE lien clause is identified, the submission enters an automated correction loop in status "Awaiting Institution Correction". The college receives a specific notification detailing the discrepancy and can re-upload corrected documents without losing audit history.'
    },
    {
      q: 'How are maturity and renewal reminders managed?',
      a: 'A background scheduler checks maturity dates daily. Proactive advisory alerts are dispatched at 90-, 60-, and 30-day thresholds prior to maturity to ensure institutions initiate renewal negotiations with their banks before instruments lapse.'
    },
    {
      q: 'Can a matured FDR be released automatically?',
      a: 'No. Maturity alone does not entitle an institution to release of funds. Under AICTE Approval Process Handbook Clause 7.1, security deposits can only be released upon completion of the mandatory statutory tenure, verification of no outstanding student or faculty liabilities, and formal issuance of an AICTE Bank Discharge Order.'
    },
    {
      q: 'How can an institution track a release/refund request?',
      a: 'Institutions can monitor their release application status in real-time under the "Release / Refund Requests" tab in their dashboard. The timeline displays document vetting, regional review, eligibility confirmation, and discharge order issuance.'
    },
    {
      q: 'What should a user do if they cannot log in?',
      a: 'Users can use the "Forgot Password" link on the role login screen or contact their AICTE Regional Office. System administrators can assist with credential reset and institutional PID linkage after verifying authorized signatory credentials.'
    },
    {
      q: 'How is access to confidential FDR information controlled?',
      a: 'The platform enforces strict Row-Level Security (RLS) and least-privilege permissions. Technical institutions can only access their own instruments; bank representatives can only verify instruments drawn on their institution; and audit trails permanently record every view, submission, and modification.'
    },
    {
      q: 'How can a user contact the appropriate support team?',
      a: 'Users can open the "Help & Support" module within their dashboard or submit a support inquiry using the Help & Contact form on this portal. Queries are routed directly to the AICTE Regulation Bureau or relevant Regional Office.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#EEF0F3] text-[#24262B] flex flex-col font-sans">
      {/* ---------------------------------------------------- */}
      {/* 1. Header & Navigation                               */}
      {/* ---------------------------------------------------- */}
      <header className="sticky top-0 z-40 bg-[#25252A] text-white shadow-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[58px] flex items-center justify-between gap-4">
          {/* Brand */}
          <div
            className="flex items-center gap-3 shrink-0 cursor-pointer"
            onClick={() => scrollToSection('hero')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm border border-white/20 shrink-0 overflow-hidden">
              <img
                src="/assets/aistudio/d720b06e-b5b5-451a-ab78-41e8f93ad1ec_d6af7bc0.png"
                alt="FDR Connect Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base tracking-tight text-white">
                  FDR CONNECT
                </span>
                <span className="text-[10px] text-gray-400 hidden lg:inline">|</span>
                <span className="text-[11px] text-gray-300 hidden lg:inline font-medium">
                  Security Deposit Management
                </span>
              </div>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5 hidden sm:block">
                All India Council for Technical Education • Regulation Bureau
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center space-x-1 text-xs text-gray-300 font-medium">
            {[
              { id: 'problem', label: 'Overview' },
              { id: 'solution', label: 'Features' },
              { id: 'workflow', label: 'Workflow' },
              { id: 'benefits', label: 'Benefits' },
              { id: 'roles', label: 'Workspaces' },
              { id: 'security', label: 'Security' },
              { id: 'faq', label: 'FAQ' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-2.5 py-1.5 rounded-md hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setSupportModalOpen(true)}
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-md transition-colors"
            >
              <Phone size={13} />
              <span>Contact / Help</span>
            </button>

            <button
              onClick={() => setRegisterModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-600 hover:border-gray-400 text-gray-200 transition-colors whitespace-nowrap"
            >
              Institution Registration
            </button>

            <button
              onClick={onOpenAccessPortal}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#1a5592] text-white shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>Access Portal</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* 2. Hero Section                                      */}
      {/* ---------------------------------------------------- */}
      <section id="hero" className="bg-white border-b border-gray-200 py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#174B80]" />
            <span>AICTE Regulation Bureau </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#24262B] max-w-4xl mx-auto leading-tight">
            A Smarter, More Transparent Way to Manage Security Deposits and FDRs.
          </h1>

          <p className="text-sm sm:text-base text-[#737985] max-w-3xl mx-auto leading-relaxed">
            A centralized digital platform to manage Fixed Deposit Receipts, streamline verification, monitor maturity and renewal, and improve accountability across institutions, banks, and AICTE officials.
          </p>

          {/* Primary Actions */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onOpenAccessPortal}
              className="px-6 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-[#174B80] hover:bg-[#153f6c] text-white shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Access Portal</span>
              <ArrowRight size={15} />
            </button>

            <button
              onClick={() => scrollToSection('workflow')}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 transition-colors"
            >
              Explore How It Works
            </button>
          </div>

          {/* Key Capabilities Row */}
          <div className="pt-8 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            {[
              { title: 'Centralized FDR Records', desc: 'Single source of truth for all pledged instruments', icon: Building2 },
              { title: 'Bank Verification Workflow', desc: 'Secure token & QR gateway for branch managers', icon: QrCode },
              { title: 'Automated Expiry Alerts', desc: 'Configurable 90-, 60-, 30-day proactive notices', icon: Clock },
              { title: 'Secure Audit Trails', desc: 'Immutable, timestamped regulatory action history', icon: ShieldCheck }
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200">
                  <Icon size={16} className="text-[#174B80] mb-1.5" />
                  <div className="font-semibold text-xs text-gray-900 leading-snug">{f.title}</div>
                  <div className="text-[11px] text-[#737985] mt-0.5 leading-tight">{f.desc}</div>
                </div>
              );
            })}
          </div>

          {/* Structured Lifecycle Schematic */}
          <div className="pt-6 max-w-4xl mx-auto">
            <div className="bg-[#25252A] text-white rounded-2xl p-5 shadow-md border border-gray-800 text-left">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                  End-to-End Deposit Lifecycle Architecture
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  7 Roles Integrated
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-blue-300 font-mono block">STAGE 1–2</span>
                  <div className="font-semibold text-white mt-0.5">Lodgement & Ingestion</div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Institution uploads certificate; OCR extracts 12 fields and computes confidence scores.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-emerald-300 font-mono block">STAGE 3–4</span>
                  <div className="font-semibold text-white mt-0.5">Bank & Scrutiny</div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Bank verifies CBS ledger balances via QR code; AICTE officer examines original scans.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-amber-300 font-mono block">STAGE 5–6</span>
                  <div className="font-semibold text-white mt-0.5">Expiry & Renewal</div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    90/60/30 day alerts trigger renewal. New instruments permanently link to predecessors.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-purple-300 font-mono block">STAGE 7</span>
                  <div className="font-semibold text-white mt-0.5">Discharge & Release</div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    10-year lock-in audit, board resolution vetting, and formal Bank Discharge Orders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. Problem Statement Section                         */}
      {/* ---------------------------------------------------- */}
      <section id="problem" className="py-16 px-4 sm:px-6 bg-[#EEF0F3] border-b border-gray-200">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-[#174B80] uppercase tracking-wider">
              Operational Challenges Addressed
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#24262B]">
              Why a Centralized FDR Management System?
            </h2>
            <p className="text-xs sm:text-sm text-[#737985] max-w-2xl mx-auto">
              Addressing operational friction across institutional security deposit administration:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                title: 'Dispersed Records',
                desc: 'FDR information distributed across disparate physical files, localized spreadsheets, and communication threads.',
                icon: FileText
              },
              {
                title: 'Verification Delays',
                desc: 'Manual postal verification with bank branches causing prolonged uncertainty in institutional approval status.',
                icon: Landmark
              },
              {
                title: 'Missed Maturities',
                desc: 'Absence of proactive notifications leading to unmonitored maturity, renewal gaps, and statutory lapsing.',
                icon: Clock
              },
              {
                title: 'Opaque Discrepancies',
                desc: 'Unclear visibility into flagged discrepancies, missing joint lien clauses, and responsible officials.',
                icon: AlertTriangle
              },
              {
                title: 'Audit Complexity',
                desc: 'Time-consuming manual report preparation and difficulty reconstructing historical lifecycle events.',
                icon: ShieldCheck
              }
            ].map((p, i) => {
              const Icon = p.icon;
              return (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center font-bold">
                    <Icon size={16} />
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm text-[#24262B]">{p.title}</h3>
                  <p className="text-xs text-[#737985] leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. Proposed Solution Section                         */}
      {/* ---------------------------------------------------- */}
      <section id="solution" className="py-16 px-4 sm:px-6 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-[#174B80] uppercase tracking-wider">
              Integrated Solution
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#24262B]">
              One Platform. Complete FDR Lifecycle Visibility.
            </h2>
            <p className="text-xs sm:text-sm text-[#737985] max-w-2xl mx-auto">
              Five core capabilities unifying institutions, banks, and AICTE officials into an interconnected workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                num: '01',
                title: 'Centralized FDR Repository',
                desc: 'Maintain institution-wise and instrument-wise records with supporting documents, lien annotations, and complete lifecycle history in an indexed repository.',
                icon: Building2
              },
              {
                num: '02',
                title: 'Structured Verification',
                desc: 'Compare submitted information, identify discrepancies automatically, and support authorized bank confirmation through cryptographic token and QR links.',
                icon: ShieldCheck
              },
              {
                num: '03',
                title: 'Workflow and Case Management',
                desc: 'Track submissions, scrutiny assessments, correction requests, regional escalations, and official regulatory decisions with clear assignment.',
                icon: Layers
              },
              {
                num: '04',
                title: 'Expiry and Renewal Monitoring',
                desc: 'Monitor maturity dates and configure automated reminders for upcoming or overdue instruments at 90-, 60-, and 30-day intervals.',
                icon: Clock
              },
              {
                num: '05',
                title: 'Reporting and Auditability',
                desc: 'View status summaries, generate compliance reports, export CSV inventories, and trace every action through immutable, timestamped audit records.',
                icon: FileCheck2
              }
            ].map((sol, i) => {
              const Icon = sol.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-gray-50/70 border border-gray-200 hover:border-gray-300 transition-all shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#174B80] flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-mono font-semibold text-gray-400">{sol.num}</span>
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900">{sol.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{sol.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. How It Works Section                              */}
      {/* ---------------------------------------------------- */}
      <section id="workflow" className="py-16 px-4 sm:px-6 bg-[#EEF0F3] border-b border-gray-200">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-[#174B80] uppercase tracking-wider">
              Structured Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#24262B]">
              From Submission to Monitoring — A Structured Digital Workflow
            </h2>
            <p className="text-xs sm:text-sm text-[#737985] max-w-2xl mx-auto">
              Follow the end-to-end operational journey of a security deposit receipt through 7 key lifecycle milestones.
            </p>
          </div>

          {/* Stepper Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-gray-300 justify-start md:justify-center">
            {workflowSteps.map((s) => (
              <button
                key={s.num}
                onClick={() => setActiveWorkflowStep(s.num)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-1.5 ${
                  activeWorkflowStep === s.num
                    ? 'bg-[#174B80] text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-200'
                }`}
              >
                <span className="font-mono">0{s.num}.</span>
                <span>{s.title}</span>
              </button>
            ))}
          </div>

          {/* Active Step Showcase Card */}
          {(() => {
            const current = workflowSteps.find(s => s.num === activeWorkflowStep) || workflowSteps[0];
            return (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-xs font-semibold text-[#174B80] uppercase tracking-wider block">
                      {current.kicker}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-0.5">
                      {current.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="bg-slate-100 border border-slate-200 rounded px-2 py-0.5 text-slate-700">
                      Actor: <strong>{current.actor}</strong>
                    </span>
                    <span className="bg-blue-50 border border-blue-200 rounded px-2 py-0.5 text-blue-900">
                      Typical Timeline: <strong>{current.timeframe}</strong>
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-3xl">
                  {current.desc}
                </p>

                <div className="pt-2 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Step {current.num} of 7 in AICTE Regulation Bureau Standard Operating Procedure
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={activeWorkflowStep === 1}
                      onClick={() => setActiveWorkflowStep(prev => Math.max(1, prev - 1))}
                      className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                    >
                      Previous Step
                    </button>
                    <button
                      type="button"
                      disabled={activeWorkflowStep === 7}
                      onClick={() => setActiveWorkflowStep(prev => Math.min(7, prev + 1))}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#174B80] text-white rounded-lg disabled:opacity-40 hover:bg-[#153f6c] transition-colors"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 6. Role-Based Access Section (7 Roles)               */}
      {/* ---------------------------------------------------- */}
      <section id="roles" className="py-16 px-4 sm:px-6 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-[#174B80] uppercase tracking-wider">
              The Right Workspace for Every Role
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#24262B]">
              Role-Based Access Control
            </h2>
            <p className="text-xs sm:text-sm text-[#737985] max-w-2xl mx-auto">
              Select your authorized user category below to proceed to role-specific authentication. 
              Each role receives a partitioned dashboard tailored to its administrative mandate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[
              {
                role: 'institution' as UserRole,
                title: '1. Institution Dashboard',
                desc: 'Manage submissions, view verification status, correct discrepancies, and track renewals.',
                icon: Building2
              },
              {
                role: 'bank_representative' as UserRole,
                title: '2. Bank Partner Dashboard',
                desc: 'Review assigned verification requests and record authorized confirmations.',
                icon: Landmark
              },
              {
                role: 'scrutiny_officer' as UserRole,
                title: '3. AICTE Scrutiny Officer Dashboard',
                desc: 'Review submissions, identify discrepancies, and manage compliance cases.',
                icon: FileCheck2
              },
              {
                role: 'regional_officer' as UserRole,
                title: '4. Regional Officer Dashboard',
                desc: 'Monitor assigned institutions, overdue items, and escalations.',
                icon: MapPin
              },
              {
                role: 'headquarters' as UserRole,
                title: '5. Regulation Bureau / HQ Dashboard',
                desc: 'Obtain a centralized overview of FDR records, pending cases, and regional performance.',
                icon: Layers
              },
              {
                role: 'release_officer' as UserRole,
                title: '6. Release / Refund Dashboard',
                desc: 'Review requests, required documentation, eligibility, and approval status.',
                icon: ShieldCheck
              },
              {
                role: 'admin' as UserRole,
                title: '7. System Administrator Dashboard',
                desc: 'Manage accounts, permissions, workflow settings, and system health.',
                icon: UserCheck
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-gray-300 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#174B80] flex items-center justify-center font-bold">
                      <Icon size={20} />
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 leading-snug">{item.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>

                  <button
                    onClick={() => onSelectRoleLogin(item.role)}
                    className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>Continue to Portal</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Dedicated Access Portal CTA Box */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-bold text-slate-900">Dedicated Role Selection Screen</h3>
              <p className="text-xs text-slate-600">
                Prefer to view full stakeholder descriptions before choosing? Access the dedicated 7-role portal.
              </p>
            </div>
            <button
              onClick={onOpenAccessPortal}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#174B80] text-white hover:bg-[#153f6c] transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
            >
              <span>Open 7-Role Access Portal</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 7. Stakeholder Benefits Section                      */}
      {/* ---------------------------------------------------- */}
      <section id="benefits" className="py-16 px-4 sm:px-6 bg-[#EEF0F3] border-b border-gray-200">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-[#174B80] uppercase tracking-wider">
              Value Proposition
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#24262B]">
              Designed for Every Authorized Stakeholder
            </h2>
            <p className="text-xs sm:text-sm text-[#737985] max-w-2xl mx-auto">
              Tailored capabilities delivering immediate operational clarity across all regulatory participants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                stakeholder: 'Institutions',
                roleDesc: 'Engineering, Management & Pharmacy Colleges',
                points: [
                  'Real-time status transparency on submitted deposit certificates',
                  'Immediate alert on detected discrepancies with clear guidance',
                  'Frictionless renewal and predecessor instrument linking',
                  'Structured security deposit release application tracking'
                ]
              },
              {
                stakeholder: 'Bank Representatives',
                roleDesc: 'Scheduled Commercial Bank Branch Managers',
                points: [
                  'Secure, non-invasive verification without direct CBS API integration',
                  'Expiring cryptographic link and QR gateway for branch verification',
                  'Permanent record of verified balances and AICTE joint lien endorsement',
                  'Elimination of repetitive paper postal correspondences'
                ]
              },
              {
                stakeholder: 'Scrutiny & Regional Officers',
                roleDesc: 'AICTE Regional Directorates & Regulation Bureau',
                points: [
                  'Side-by-side document inspection with automated OCR highlights',
                  'Automated discrepancy flagging for face value and tenure mismatches',
                  'Jurisdictional oversight of expiring instruments in regional zones',
                  'Escalation routing for overdue institution responses'
                ]
              },
              {
                stakeholder: 'Regulation Bureau / Headquarters',
                roleDesc: 'Executive Leadership & Member Secretary Office',
                points: [
                  'Consolidated nationwide deposit inventory metrics',
                  'Surveillance of bank-wise distribution and concentration risk',
                  'Verification turnaround velocity benchmarking across regions',
                  'Exportable compliance reports and audit registries'
                ]
              },
              {
                stakeholder: 'Release / Refund Officers',
                roleDesc: 'Deposit Discharge & Liquidation Cell',
                points: [
                  'Automated verification of 10-year statutory lock-in compliance',
                  'Checklist inspection of Board resolutions and no-dues clearance',
                  'Controlled issuance of formal AICTE Bank Discharge Orders',
                  'Clear audit documentation preventing duplicate liquidation'
                ]
              },
              {
                stakeholder: 'System Administrators',
                roleDesc: 'IT & Infrastructure Cell',
                points: [
                  'Role-Based Access Control and credential lifecycle management',
                  'Configurable reminder threshold engines (90/60/30 days)',
                  'Verification token TTL management and scheduled cron monitor',
                  'Append-only security event audit log monitoring'
                ]
              }
            ].map((b, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                <div className="border-b border-gray-100 pb-2.5">
                  <h3 className="font-bold text-sm text-[#174B80]">{b.stakeholder}</h3>
                  <p className="text-[11px] text-gray-500">{b.roleDesc}</p>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  {b.points.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-emerald-700 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onOpenAccessPortal}
              className="px-6 py-2.5 text-xs font-semibold rounded-xl bg-[#174B80] text-white hover:bg-[#153f6c] transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>Access Your Workspace</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 8. Dashboard Preview Section (Demo Data)             */}
      {/* ---------------------------------------------------- */}
      <section className="py-16 px-4 sm:px-6 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-gray-200">
            <div>
              <span className="text-[11px] font-bold text-[#174B80] uppercase tracking-wider block">
                Interface Preview
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#24262B]">
                Dashboard Experience & Live Repository
              </h2>
              <p className="text-xs sm:text-sm text-[#737985] mt-0.5">
                Representative view of the regulatory workspace with compact cards, status indicators, and clean tables.
              </p>
            </div>
            <div className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-mono shrink-0">
              [Demonstration Dataset]
            </div>
          </div>

          {/* Sample KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Total FDR Records', val: '12', sub: 'Indexed Instruments' },
              { label: 'Pending Verification', val: '4', sub: 'Awaiting Bank CBS' },
              { label: 'Expiring Soon', val: '3', sub: 'Within 90 Days' },
              { label: 'Overdue Instruments', val: '1', sub: 'Immediate Renewal' },
              { label: 'Pending Scrutiny', val: '2', sub: 'Officer Review Queue' },
              { label: 'Release Requests', val: '2', sub: 'Eligibility Vetting' }
            ].map((k, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-500 font-medium block leading-tight">{k.label}</span>
                <span className="text-xl font-bold font-tabular text-[#24262B] block mt-1">{k.val}</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">{k.sub}</span>
              </div>
            ))}
          </div>

          {/* Sample Table */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
            <div className="p-3.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-800">Sample FDR Instruments Ledger</span>
              <span className="text-[11px] text-gray-500">Showing 4 of 12 sample records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-800">
                <thead className="bg-gray-100/70 text-[11px] font-semibold text-gray-600 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5">FDR Number</th>
                    <th className="px-4 py-2.5">Institution</th>
                    <th className="px-4 py-2.5">Bank & Branch</th>
                    <th className="px-4 py-2.5">Face Value</th>
                    <th className="px-4 py-2.5">Maturity Date</th>
                    <th className="px-4 py-2.5">Verification Status</th>
                    <th className="px-4 py-2.5">Action Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    {
                      fdr: 'SBI-BLR-88392019',
                      inst: 'R. V. College of Engineering',
                      bank: 'State Bank of India',
                      val: '₹25,00,000',
                      mat: '2026-11-20',
                      ver: 'CONFIRMED',
                      act: 'ACTIVE (Lien Intact)'
                    },
                    {
                      fdr: 'PNB-DEL-10293847',
                      inst: 'Delhi Technological University',
                      bank: 'Punjab National Bank',
                      val: '₹15,00,000',
                      mat: '2026-12-15',
                      ver: 'PENDING_BANK_VERIFICATION',
                      act: 'Token Dispatched'
                    },
                    {
                      fdr: 'HDFC-MUM-44918230',
                      inst: 'VJTI Mumbai',
                      bank: 'HDFC Bank',
                      val: '₹12,00,000',
                      mat: '2026-10-30',
                      ver: 'DISCREPANCY_FOUND',
                      act: 'Correction Loop'
                    },
                    {
                      fdr: 'BOB-HYD-55102938',
                      inst: 'JNTU College of Engineering',
                      bank: 'Bank of Baroda',
                      val: '₹30,00,000',
                      mat: '2031-08-10',
                      ver: 'CONFIRMED',
                      act: 'Under Release Review'
                    }
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-2.5 font-mono font-medium text-blue-900">{row.fdr}</td>
                      <td className="px-4 py-2.5 font-medium">{row.inst}</td>
                      <td className="px-4 py-2.5 text-gray-600">{row.bank}</td>
                      <td className="px-4 py-2.5 font-semibold font-tabular">{row.val}</td>
                      <td className="px-4 py-2.5 font-tabular text-gray-700">{row.mat}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                            row.ver === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : row.ver === 'DISCREPANCY_FOUND'
                              ? 'bg-red-50 text-red-800 border-red-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {row.ver}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-gray-600">{row.act}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 9. AI Compliance Assistant Section                   */}
      {/* ---------------------------------------------------- */}
      <section className="py-16 px-4 sm:px-6 bg-[#EEF0F3] border-b border-gray-200">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-[#174B80] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Bot size={28} />
          </div>

          <div className="space-y-2 flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-[11px] font-bold text-[#174B80] uppercase tracking-wider">
                Built-in Intelligence
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded font-mono">
                Persistent Everywhere
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Get Guidance When You Need It
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              The built-in AI compliance assistant can help answer questions on Approval Process Handbook regulations (Clause 1.4 & 7.1), missing documentation, discrepancy explanations, and required next steps.
            </p>

            <div className="pt-2 flex flex-wrap gap-1.5 justify-center md:justify-start">
              {[
                'Why was my submission returned for correction?',
                'Which documents are missing from this application?',
                'How can I submit a replacement FDR?',
                'What does pending bank verification mean?'
              ].map((q, idx) => (
                <span key={idx} className="text-[11px] bg-slate-50 border border-slate-200 rounded-md px-2 py-0.5 text-slate-700">
                  {q}
                </span>
              ))}
            </div>
          </div>

          <div className="shrink-0">
            <button
              onClick={onOpenAssistant}
              className="px-5 py-2.5 text-xs font-semibold rounded-xl bg-[#174B80] text-white hover:bg-[#153f6c] transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Bot size={15} />
              <span>Ask the Assistant</span>
            </button>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 10. Security & Accountability Section                */}
      {/* ---------------------------------------------------- */}
      <section id="security" className="py-16 px-4 sm:px-6 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-[#174B80] uppercase tracking-wider">
              Governance & Integrity
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#24262B]">
              Security and Accountability by Design
            </h2>
            <p className="text-xs sm:text-sm text-[#737985] max-w-2xl mx-auto">
              Implementing defense-in-depth principles across authentication, authorization, and cryptographic integrity:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'Role-Based Access Control',
                desc: 'Strict least-privilege boundary across 7 user classes preventing cross-institutional data exposure.',
                icon: UserCheck
              },
              {
                title: 'Controlled Bank Links',
                desc: 'Expiring, single-purpose tokens with time-to-live enforcement and revocation capability.',
                icon: QrCode
              },
              {
                title: 'Immutable Audit Logs',
                desc: 'Append-only ledger capturing actor, action, timestamp, and IP address for all regulatory operations.',
                icon: ShieldCheck
              },
              {
                title: 'Separated Verification Layers',
                desc: 'Strict isolation between institution-submitted metadata, bank CBS records, and official sign-offs.',
                icon: Layers
              }
            ].map((sec, i) => {
              const Icon = sec.icon;
              return (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                  <Icon size={18} className="text-[#174B80]" />
                  <h3 className="font-semibold text-xs sm:text-sm text-gray-900">{sec.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{sec.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 11. FAQ Section                                      */}
      {/* ---------------------------------------------------- */}
      <section id="faq" className="py-16 px-4 sm:px-6 bg-[#EEF0F3] border-b border-gray-200">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-bold text-[#174B80] uppercase tracking-wider">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#24262B]">
              Everything You Need to Know
            </h2>
            <p className="text-xs sm:text-sm text-[#737985]">
              Authoritative answers regarding the AICTE Security Deposit & FDR Management Portal workflow.
            </p>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-gray-900 hover:text-[#174B80] transition-colors"
                  >
                    <span>{idx + 1}. {faq.q}</span>
                    <span className="text-gray-400 shrink-0">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 12. Footer                                           */}
      {/* ---------------------------------------------------- */}
      <footer className="bg-[#25252A] text-white pt-12 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-800 text-xs">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shadow-xs border border-white/20 shrink-0 overflow-hidden">
                  <img
                    src="/assets/aistudio/d720b06e-b5b5-451a-ab78-41e8f93ad1ec_d6af7bc0.png"
                    alt="FDR Connect Logo"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="font-bold text-sm tracking-tight text-white">FDR CONNECT</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                Official regulatory management platform for Fixed Deposit Receipts and security deposits submitted under the AICTE Approval Process.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-200 mb-3 text-xs uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('problem')} className="hover:text-white transition-colors">Overview & Problem</button></li>
                <li><button onClick={() => scrollToSection('solution')} className="hover:text-white transition-colors">Core Capabilities</button></li>
                <li><button onClick={() => scrollToSection('workflow')} className="hover:text-white transition-colors">Workflow Stepper</button></li>
                <li><button onClick={() => scrollToSection('benefits')} className="hover:text-white transition-colors">Stakeholder Benefits</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-white transition-colors">Frequently Asked Questions</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-200 mb-3 text-xs uppercase tracking-wider">Workspaces</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => onSelectRoleLogin('institution')} className="hover:text-white transition-colors">Institution Portal</button></li>
                <li><button onClick={() => onSelectRoleLogin('bank_representative')} className="hover:text-white transition-colors">Bank Partner Portal</button></li>
                <li><button onClick={() => onSelectRoleLogin('scrutiny_officer')} className="hover:text-white transition-colors">Scrutiny Bureau</button></li>
                <li><button onClick={() => onSelectRoleLogin('headquarters')} className="hover:text-white transition-colors">Regulation Bureau HQ</button></li>
                <li><button onClick={onOpenAccessPortal} className="text-blue-300 hover:text-white transition-colors font-medium">All 7 Workspaces →</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-200 mb-3 text-xs uppercase tracking-wider">Regulatory Authority</h4>
              <p className="text-gray-400 text-xs leading-relaxed">
                All India Council for Technical Education (AICTE)<br />
                Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070<br />
                Regulation Bureau • Problem Statement ID: 26265
              </p>
              <div className="pt-2 flex items-center gap-3 text-gray-400">
                <button onClick={onOpenPrivacyPolicy} className="hover:text-white transition-colors">Privacy Policy</button>
                <span>·</span>
                <button onClick={onOpenTermsOfUse} className="hover:text-white transition-colors">Terms of Use</button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <p>© 2026 All India Council for Technical Education. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <button onClick={() => setSupportModalOpen(true)} className="hover:text-gray-300 transition-colors">
                Contact & Support
              </button>
              <span>·</span>
              <button onClick={onOpenAccessPortal} className="text-blue-400 hover:text-blue-300 transition-colors">
                Access Portal
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ---------------------------------------------------- */}
      {/* Institution Registration Modal                       */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Institution Registration for FDR Portal Access"
        maxWidth="lg"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
          {errorRegMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-2">
              <AlertTriangle size={15} />
              <span>{errorRegMessage}</span>
            </div>
          )}

          {successRegMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={15} />
              <span>{successRegMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Institution Name *</label>
              <input
                type="text"
                required
                value={instName}
                onChange={(e) => setInstName(e.target.value)}
                placeholder="e.g. National Institute of Technology"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">AICTE Permanent ID (PID) *</label>
              <input
                type="text"
                required
                value={aicteId}
                onChange={(e) => setAicteId(e.target.value)}
                placeholder="1-XXXXXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1">Regional Zone *</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as RegionalZone)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              >
                {['Northern', 'North-Western', 'Western', 'Southern', 'South-Western', 'Eastern', 'Central'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">Contact Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="registrar@institute.edu.in"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">Contact Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91-XXXXXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Campus Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full institutional address..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setRegisterModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingReg}
              className="px-5 py-2 bg-[#174B80] hover:bg-[#153f6c] text-white rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              {submittingReg ? 'Submitting Application...' : 'Submit Registration Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* Contact & Support Modal                              */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        title="AICTE FDR Portal Support & Contact Helpdesk"
        maxWidth="md"
      >
        {supportSubmitted ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="font-bold text-sm text-gray-900">Inquiry Received</h3>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              Your inquiry has been logged in the AICTE Regulation Bureau helpdesk. A ticket reference has been routed to your registered contact email.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSupportSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">Your Name *</label>
              <input
                type="text"
                required
                value={supportName}
                onChange={(e) => setSupportName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Official Email Address *</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="official@domain.edu.in"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">Inquiry Category *</label>
              <select
                value={supportCategory}
                onChange={(e) => setSupportCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              >
                <option value="access">Portal Access & Login Assistance</option>
                <option value="submission">FDR Submission & Document Extraction Guidance</option>
                <option value="verification">Bank Verification Workflow Support</option>
                <option value="technical">Technical Issue / Bug Reporting</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">Message / Details *</label>
              <textarea
                rows={3}
                required
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Describe your query or case reference..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-medium hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#174B80] hover:bg-[#153f6c] text-white rounded-lg text-xs font-semibold"
              >
                Submit Inquiry
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
