import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, Clock, ExternalLink } from 'lucide-react';
import { ExpiryReminderNotification, UserProfile } from '../../types';
import { Modal } from '../common/Modal';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ExpiryReminderNotification[];
  currentUser: UserProfile;
  onRunExpiryScan: () => void;
  expiryScanRunning: boolean;
  onSelectFdrNumber?: (fdrNumber: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  currentUser,
  onRunExpiryScan,
  expiryScanRunning,
  onSelectFdrNumber
}) => {
  const [filterStage, setFilterStage] = useState('ALL');

  if (!isOpen) return null;

  const filtered = notifications.filter(n => {
    if (filterStage !== 'ALL' && n.stage !== filterStage) return false;
    return true;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Statutory Expiry Monitoring & Reminders Center"
      subtitle="Automated background alerts triggered at 90, 60, 30 days prior to FDR maturity & statutory lock-in completion"
      maxWidth="3xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <button
            onClick={onRunExpiryScan}
            disabled={expiryScanRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
          >
            <RefreshCw size={13} className={expiryScanRunning ? 'animate-spin text-blue-600' : ''} />
            <span>{expiryScanRunning ? 'Scanning Repository...' : 'Run Real-Time Expiry Scan Now'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#174B80] hover:bg-[#153f6c] text-white shadow-2xs"
          >
            Done
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        
        {/* Filter bar */}
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div className="flex items-center gap-1.5">
            {['ALL', '30_DAYS', '60_DAYS', '90_DAYS', 'MATURED'].map((stage) => (
              <button
                key={stage}
                onClick={() => setFilterStage(stage)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterStage === stage
                    ? 'bg-[#174B80] text-white font-semibold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {stage === 'ALL' ? 'All Alerts' : stage.replace('_', ' ')}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-gray-500 font-tabular font-medium">
            {filtered.length} Dispatched Reminder(s)
          </span>
        </div>

        {/* Notification Cards Stream */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              No notifications for the selected category.
            </div>
          ) : (
            filtered.map((notif) => {
              const isUrgent = notif.stage === '30_DAYS' || notif.stage === 'MATURED';
              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 transition-colors ${
                    isUrgent
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      notif.stage === 'MATURED' ? 'bg-red-100 text-red-700' :
                      notif.stage === '30_DAYS' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-[#174B80]'
                    }`}>
                      {notif.stage === 'MATURED' ? <AlertTriangle size={13} /> : <Clock size={13} />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 font-mono">
                          {notif.fdrNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ${
                          notif.stage === 'MATURED' ? 'bg-red-100 text-red-800' :
                          notif.stage === '30_DAYS' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {notif.stage.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 mt-1 leading-snug">
                        {notif.message}
                      </p>

                      <div className="mt-2 flex items-center gap-3 text-[11px] text-gray-500">
                        <span>Institution: <strong className="text-gray-800">{notif.institutionName}</strong></span>
                        <span>Maturity Date: <strong className="font-tabular text-gray-800">{notif.maturityDate}</strong></span>
                        <span>Channel: <strong className="uppercase">{notif.channel.replace('_', ' ')}</strong></span>
                      </div>
                    </div>
                  </div>

                  {onSelectFdrNumber && (
                    <button
                      onClick={() => {
                        onSelectFdrNumber(notif.fdrNumber);
                        onClose();
                      }}
                      className="shrink-0 p-1.5 rounded-md hover:bg-gray-200 text-gray-600 transition-colors"
                      title="Inspect FDR"
                    >
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
};
