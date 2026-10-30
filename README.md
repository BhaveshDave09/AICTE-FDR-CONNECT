# AICTE-FDR-CONNECT

AICTE Security Deposit & Fixed Deposit Receipts (FDR) Lifecycle, Bank Verification, AI Scrutiny, and Automated Expiry Monitoring Portal (Problem Statement ID: 26265).

---

## 🚀 Overview

AICTE-FDR-CONNECT is a unified regulatory portal designed for the All India Council for Technical Education (AICTE) Regulation Bureau. It streamlines and secures the lifecycle of institutional Fixed Deposit Receipts (FDRs) submitted as security deposits for statutory approvals.

### Key Capabilities
- **End-to-End Lifecycle Tracking**: Deposit submission, bank verification, AI-driven scrutiny, renewal reminders, and lien release/refund workflows.
- **Automated Bank Verification**: Tokenized digital bank confirmation with SHA-256 integrity verification.
- **AI-Powered Scrutiny**: Automated analysis grounded in AICTE Approval Process Handbook (APH) regulations with fallback regulatory rules.
- **Audit Logging**: Immutable event ledger tracking all regulatory actions and state changes.
- **Role-Based Workspaces**: Tailored dashboards for AICTE HQ, Regional Officers, Scrutiny Officers, Bank Representatives, and Institutions.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Recharts, Motion
- **Backend**: Node.js, Express, TypeScript (TSX)
- **Deployment**: Render Blueprint (`render.yaml`), Docker/Node.js compatible

---

## 💻 Local Development

### Prerequisites
- Node.js (v20+ recommended)
- npm

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/BhaveshDave09/AICTE-FDR-CONNECT.git
cd AICTE-FDR-CONNECT/FDR-Final-main
npm install --legacy-peer-deps
```

### 2. Run the Development Server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

---

