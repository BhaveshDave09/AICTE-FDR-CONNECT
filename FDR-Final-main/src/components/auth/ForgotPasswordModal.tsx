import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onBackToLogin
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your authorized institutional or official email address.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const msg = await api.forgotPassword(email);
      setSuccessMessage(msg);
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Account Password"
      subtitle="AICTE Security Deposit / FDR Management Portal"
      maxWidth="md"
      footer={
        <div className="w-full flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-[#174B80] hover:underline font-semibold flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span>Back to Login</span>
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 font-semibold text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        <p className="text-gray-600 text-[11.5px] leading-relaxed">
          Enter the email address registered with your institution, bank branch, or AICTE official profile. A secure cryptographic password recovery token will be dispatched to your verified address.
        </p>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage ? (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Password Recovery Dispatched</span>
            </div>
            <p className="text-[11.5px] text-emerald-700 leading-relaxed">
              {successMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Registered Email Address *
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="email"
                  placeholder="e.g. principal@college.edu.in or officer@aicte-india.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#174B80] text-xs font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#174B80] hover:bg-[#153f6c] text-white font-semibold rounded-lg shadow-2xs transition-colors flex items-center justify-center gap-2 text-xs"
            >
              <span>{loading ? 'Dispatching Token...' : 'Send Password Reset Link'}</span>
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
};
