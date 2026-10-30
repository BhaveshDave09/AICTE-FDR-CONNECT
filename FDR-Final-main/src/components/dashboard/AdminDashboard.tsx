import React, { useState } from 'react';
import { 
  Settings, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Server, 
  RefreshCw, 
  Save, 
  FileClock,
  KeyRound,
  BellRing
} from 'lucide-react';
import { UserProfile, AuditEvent } from '../../types';
import { StatCard } from '../common/StatCard';

interface AdminDashboardProps {
  currentUser: UserProfile;
  users: UserProfile[];
  auditLogs: AuditEvent[];
  settings: any;
  onUpdateSettings: (settings: any) => Promise<void>;
  onRunExpiryScan: () => void;
  expiryScanRunning: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users,
  auditLogs,
  settings,
  onUpdateSettings,
  onRunExpiryScan,
  expiryScanRunning
}) => {
  const [localSettings, setLocalSettings] = useState(settings || {
    reminderThresholdsDays: [90, 60, 30],
    verificationTokenTtlDays: 30,
    minDepositTenureMonths: 60,
    autoEscalationDays: 14,
    demoMode: true,
    emailNotificationsActive: false
  });
  const [thresholdsStr, setThresholdsStr] = useState<string>(
    (settings?.reminderThresholdsDays || [90, 60, 30]).join(', ')
  );
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const parsedThresholds = thresholdsStr
        .split(',')
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n) && n > 0)
        .sort((a, b) => b - a);

      const payload = {
        ...localSettings,
        reminderThresholdsDays: parsedThresholds.length > 0 ? parsedThresholds : [90, 60, 30]
      };
      setLocalSettings(payload);
      await onUpdateSettings(payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#24262B]">
              System Administration & Governance
            </h1>
            <span className="text-[11px] font-semibold bg-gray-100 text-gray-800 border border-gray-300 px-2.5 py-0.5 rounded-full font-mono">
              e-Gov Infrastructure Cell
            </span>
          </div>
          <p className="text-xs text-[#737985] mt-1">
            Configure automated expiry monitoring engines, verification token TTL, user roles, and security audit logs.
          </p>
        </div>

        <button
          onClick={onRunExpiryScan}
          disabled={expiryScanRunning}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white transition-colors shadow-2xs"
        >
          <RefreshCw size={13} className={expiryScanRunning ? 'animate-spin' : ''} />
          <span>{expiryScanRunning ? 'Scanning All FDRs...' : 'Trigger Expiry Monitor Job'}</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Active System Roles"
          value={users.length}
          subtitle="Provisioned accounts"
          icon={Users}
          accentColor="#174B80"
          badge={{ text: 'RBAC Active', variant: 'info' }}
        />
        <StatCard
          title="Security Events"
          value={auditLogs.length}
          subtitle="Immutable audit trail"
          icon={FileClock}
          accentColor="#3F9876"
          badge={{ text: 'Append-Only', variant: 'success' }}
        />
        <StatCard
          title="Engine Status"
          value="Healthy"
          subtitle="Express + Vite + Gemini"
          icon={Server}
          accentColor="#10B981"
          badge={{ text: 'Online', variant: 'success' }}
        />
        <StatCard
          title="Token Expiry TTL"
          value={`${localSettings.verificationTokenTtlDays} Days`}
          subtitle="Cryptographic token lifetime"
          icon={KeyRound}
          accentColor="#E5A548"
          badge={{ text: 'Configured', variant: 'neutral' }}
        />
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Configuration Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#24262B]">System Thresholds & Expiry Policies</h3>
              <p className="text-xs text-[#737985]">Manage automated schedules, reminders, and token lifetimes.</p>
            </div>
            {saveSuccess && (
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium">
                Saved Successfully
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Bank Verification Token Lifespan (Days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={localSettings.verificationTokenTtlDays}
                onChange={(e) => setLocalSettings({ ...localSettings, verificationTokenTtlDays: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80]"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Defines cryptographic validity duration for links and QR codes issued to bank branch representatives.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Automated Expiry Alert Thresholds (Days Prior to Maturity)
              </label>
              <input
                type="text"
                value={thresholdsStr}
                onChange={(e) => setThresholdsStr(e.target.value)}
                placeholder="e.g. 90, 60, 30"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80] font-mono text-xs"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Configurable alert cadence (in days) prior to instrument maturity. Automatically triggers reminders and dashboard notifications.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {thresholdsStr.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0).map((threshold, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md bg-blue-50 text-[#174B80] border border-blue-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                    <BellRing size={12} />
                    <span>{threshold} Days Notice</span>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Statutory Lock-in Period for Technical Institutions (Months)
              </label>
              <input
                type="number"
                value={localSettings.minDepositTenureMonths}
                onChange={(e) => setLocalSettings({ ...localSettings, minDepositTenureMonths: Number(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80]"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Default: 60 months (5 years) for standard program security deposits; 96–120 months for new establishment.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-[#174B80] hover:bg-[#153f6c] text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Save size={13} />
                <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: User Roles & Access Control List (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-2xs">
          <div className="pb-3 border-b border-gray-100 mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#24262B]">Provisioned User Roles</h3>
            <span className="text-xs text-gray-500 font-mono">{users.length} Active Accounts</span>
          </div>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {users.map((u) => (
              <div key={u.id} className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-[#174B80] font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {u.role.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-gray-900 truncate">{u.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{u.designation}</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-gray-200 text-gray-800 shrink-0">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
