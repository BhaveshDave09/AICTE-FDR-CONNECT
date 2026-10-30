import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  X,
  Minus,
  Sparkles,
  BookOpen,
  ArrowRight,
  Shield,
  RefreshCw
} from 'lucide-react';
import { UserProfile, UserRole } from '../../types';
import { api } from '../../services/api';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: string[];
  timestamp: string;
  suggestLogin?: boolean;
}

interface FloatingAiAssistantProps {
  currentUser?: UserProfile | null;
  isAuthenticated: boolean;
  currentPageContext?: 'landing' | 'access_portal' | 'login' | 'dashboard';
  activeTab?: string;
  onNavigateToAccessPortal?: () => void;
  isOpenExternal?: boolean;
  onToggleExternal?: (open: boolean) => void;
}

export const FloatingAiAssistant: React.FC<FloatingAiAssistantProps> = ({
  currentUser,
  isAuthenticated,
  currentPageContext = 'landing',
  activeTab = 'dashboard',
  onNavigateToAccessPortal,
  isOpenExternal,
  onToggleExternal
}) => {
  // Chat state
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'init_1',
        sender: 'assistant',
        text: 'Namaste! I am the AICTE Compliance & FDR Assistant. Ask me anything about the AICTE FDR lifecycle, verification guidelines, discrepancy resolution, or Approval Process Handbook mandates.',
        citations: ['AICTE Approval Process Handbook (Clause 1.4 & 7.1)'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync external open request (e.g. from CTA button)
  useEffect(() => {
    if (typeof isOpenExternal === 'boolean' && isOpenExternal !== isOpen) {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  const handleSetOpen = (open: boolean) => {
    setIsOpen(open);
    if (onToggleExternal) {
      onToggleExternal(open);
    }
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Context-aware suggested questions
  const getSuggestedQuestions = (): string[] => {
    if (!isAuthenticated) {
      if (currentPageContext === 'access_portal') {
        return [
          'Which role should I select in the Access Portal?',
          'What does each dashboard do?',
          'How do I request institutional access?',
          'How does bank verification work?'
        ];
      }
      return [
        'What is this portal?',
        'How does FDR verification work?',
        'What are the portal\'s main features?',
        'Who can access the portal?'
      ];
    }

    // Authenticated role-specific questions
    const role = currentUser?.role;
    switch (role) {
      case 'institution':
        return [
          'Why is my FDR pending and what is next?',
          'Which documents are required for FDR lodgement?',
          'Which of my instruments mature in the next 90 days?',
          'What does this discrepancy mean?',
          'How do I submit a replacement FDR?'
        ];
      case 'bank_representative':
        return [
          'How do I verify an FDR with token or QR code?',
          'What should I do if CBS deposit balance differs?',
          'How is AICTE joint lien verified?',
          'Who should I contact if a token expired?'
        ];
      case 'scrutiny_officer':
        return [
          'Which submissions have open discrepancies?',
          'What is the policy for missing joint lien clause?',
          'How are correction requests tracked?',
          'Which cases require priority scrutiny?'
        ];
      case 'regional_officer':
        return [
          'Which institutions in my region have overdue renewals?',
          'How do I escalate non-compliant cases?',
          'What is the regional compliance summary?'
        ];
      case 'headquarters':
        return [
          'What is the nationwide deposit inventory summary?',
          'Which banks hold the largest share of deposits?',
          'How many instruments mature this quarter?',
          'What is the average verification turnaround time?'
        ];
      case 'release_officer':
        return [
          'What documents are required before deposit discharge?',
          'Has the 10-year lock-in period completed?',
          'What is the procedure for partial release?',
          'How is the Bank Discharge Order generated?'
        ];
      case 'admin':
        return [
          'How do I configure the 90/60/30 day reminder schedule?',
          'Where can I review security audit logs?',
          'How are verification tokens generated?'
        ];
      default:
        return [
          'Why is my FDR pending?',
          'Which FDRs mature in the next 90 days?',
          'What does this discrepancy mean?',
          'Which cases require my attention?'
        ];
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    // Private queries check for unauthenticated users
    const isPrivateCaseQuery =
      !isAuthenticated &&
      (q.toLowerCase().includes('my fdr') ||
        q.toLowerCase().includes('my submission') ||
        q.toLowerCase().includes('my deposit') ||
        q.toLowerCase().includes('my institution') ||
        q.toLowerCase().includes('my cases') ||
        q.toLowerCase().includes('status of fdr'));

    if (isPrivateCaseQuery) {
      setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: `ast_${Date.now()}`,
          sender: 'assistant',
          text: 'To inspect case-specific FDR balances, discrepancies, or approval statuses, please sign in through the Access Portal. Case data is protected by Role-Based Access Control and cannot be revealed to anonymous visitors.',
          suggestLogin: true,
          citations: ['AICTE Security & Least Privilege Policy'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, assistantMsg]);
        setLoading(false);
      }, 350);
      return;
    }

    try {
      const data = await api.askAiAssistant(q);
      const assistantMsg: ChatMessage = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        citations: data.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'The compliance engine could not retrieve that response right now. Please try again or refer to the AICTE Approval Process Handbook (Clause 1.4 & 7.1).',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = getSuggestedQuestions();

  return (
    <>
      {/* ---------------------------------------------------- */}
      {/* 1. Collapsed Floating Launcher Button                */}
      {/* ---------------------------------------------------- */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          {/* Subtle Tooltip Label */}
          <div className="hidden sm:flex items-center px-2.5 py-1 rounded-lg bg-[#25252A] text-white text-[11px] font-medium shadow-md border border-gray-700 animate-in fade-in duration-200">
            <span>AI Compliance Assistant</span>
          </div>

          <button
            type="button"
            onClick={() => handleSetOpen(true)}
            aria-label="Open AI Compliance Assistant"
            className="w-14 h-14 rounded-full bg-[#174B80] hover:bg-[#153f6c] text-white shadow-lg hover:shadow-xl transition-all duration-150 flex items-center justify-center cursor-pointer border-2 border-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Bot size={26} className="text-white" />
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 2. Expanded Floating Chatbot Panel                  */}
      {/* ---------------------------------------------------- */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AI Compliance Assistant Chat"
          className="fixed bottom-6 right-6 z-50 w-[calc(100vw-32px)] sm:w-[390px] h-[540px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Panel Header */}
          <div className="p-3.5 bg-[#25252A] text-white flex items-center justify-between border-b border-gray-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#174B80] border border-blue-400/30 flex items-center justify-center text-white shrink-0">
                <Bot size={18} />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                  <span>AI Compliance Assistant</span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1 py-0.2 rounded font-mono">
                    {isAuthenticated ? 'Authorized' : 'Public'}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Ask about FDR status, verification and compliance
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleSetOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Minimize assistant (keeps chat history)"
                aria-label="Minimize"
              >
                <Minus size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleSetOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close assistant"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Context Banner */}
          <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <Shield size={12} className="text-[#174B80] shrink-0" />
              <span className="truncate">
                {isAuthenticated
                  ? `User: ${currentUser?.name?.split(' (')[0]} (${currentUser?.role})`
                  : 'Mode: Public Information & Guidance'}
              </span>
            </div>
            {isAuthenticated && (
              <span className="text-[10px] text-slate-500 font-mono shrink-0">RBAC Active</span>
            )}
          </div>

          {/* Scrollable Conversation Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-[#F8F9FA]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3 leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#174B80] text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs">{msg.text}</p>

                  {/* Suggest Login Button */}
                  {msg.suggestLogin && onNavigateToAccessPortal && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          handleSetOpen(false);
                          onNavigateToAccessPortal();
                        }}
                        className="w-full py-1.5 px-2.5 text-xs font-semibold rounded-lg bg-[#174B80] text-white hover:bg-[#153f6c] transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Open Access Portal</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  )}

                  {/* Regulatory Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-gray-100 flex flex-wrap items-center gap-1 text-[10px] text-slate-500">
                      <BookOpen size={10} className="text-[#174B80]" />
                      <span className="font-semibold text-slate-700">Source:</span>
                      {msg.citations.map((c, i) => (
                        <span key={i} className="text-slate-600">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white rounded-2xl rounded-bl-none border border-gray-200 max-w-[80%] text-xs text-gray-600 shadow-2xs">
                <RefreshCw size={13} className="animate-spin text-[#174B80]" />
                <span>Checking regulatory rules & records...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          <div className="p-2.5 bg-white border-t border-gray-200 shrink-0">
            <div className="text-[10px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
              <Sparkles size={11} className="text-[#174B80]" />
              <span>Suggested Questions</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {suggestions.map((sq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendMessage(sq)}
                  className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 hover:border-[#174B80] hover:text-[#174B80] text-slate-700 transition-colors shrink-0 shadow-2xs"
                >
                  {sq}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={isAuthenticated ? "Ask about your FDR status, rules, or next steps..." : "Ask a question about the AICTE FDR portal..."}
              disabled={loading}
              className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#174B80] focus:border-[#174B80] text-gray-900 bg-white placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="p-2 bg-[#174B80] hover:bg-[#153f6c] disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer shrink-0"
              title="Send message"
              aria-label="Send"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
