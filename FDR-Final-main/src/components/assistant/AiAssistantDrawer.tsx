import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  BookOpen, 
  ShieldCheck, 
  FileText, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { UserProfile } from '../../types';
import { api } from '../../services/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: string[];
  timestamp: string;
}

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Namaste, ${currentUser.name}! I am the AICTE Regulatory Compliance Assistant. I can help answer queries grounded in your authorized FDR records and the AICTE Approval Process Handbook (APH Clause 1.4 & 7.1). How may I assist you today?`,
      citations: ['AICTE Approval Process Handbook (Clause 1.4, 3.2, 7.1)'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const sampleQuestions = [
    'Why is my FDR pending and what action must I take next?',
    'Which of my instruments mature in the next 90 days?',
    'What discrepancy was detected on my submitted deposit receipt?',
    'What are the mandatory conditions for security deposit release under Clause 7.1?'
  ];

  const handleSendMessage = async (queryText?: string) => {
    const q = (queryText || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const data = await api.askAiAssistant(q);
      const assistantMsg: Message = {
        id: `ast_${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        citations: data.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        text: 'I encountered an error retrieving that compliance information. Please try again or consult the AICTE Regional Bureau officer.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/35 backdrop-blur-[2px] flex justify-end animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md sm:max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="p-4 bg-[#25252A] text-white flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#174B80] border border-blue-400/30 flex items-center justify-center text-white">
              <Bot size={18} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-semibold text-sm">
                <span>AI Compliance Assistant</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-1.5 py-0.5 rounded font-mono">
                  Grounded
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Grounded in your authorized records & AICTE regulations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Suggested Queries */}
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="text-[11px] font-semibold text-gray-500 mb-1.5 flex items-center gap-1">
            <Sparkles size={12} className="text-blue-600" />
            <span>Suggested Compliance Queries</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sampleQuestions.map((sq, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sq)}
                className="text-[11px] text-left px-2.5 py-1 rounded-full bg-white border border-gray-300 hover:border-[#174B80] hover:text-[#174B80] text-gray-700 transition-colors leading-tight shadow-2xs"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow-2xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#174B80] text-white rounded-br-xs'
                    : 'bg-gray-100 text-[#24262B] border border-gray-200 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-line text-xs font-normal">
                  {msg.text}
                </div>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-gray-200/60 text-[10.5px]">
                    <span className="font-semibold text-gray-500 block mb-0.5">Authoritative Regulatory Sources:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-blue-900 font-medium">
                      {msg.citations.map((c, idx) => (
                        <li key={idx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-1 px-1 font-tabular">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-xl max-w-[70%] border border-gray-200">
              <Sparkles size={14} className="animate-spin text-[#174B80]" />
              <span className="text-xs text-gray-600 font-medium">Retrieving authorized case facts & handbook rules...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about your FDR status, discrepancies, or AICTE clauses..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-[#174B80]"
            />
            <button
              type="submit"
              disabled={loading || !inputQuery.trim()}
              className="p-2 bg-[#174B80] hover:bg-[#153f6c] disabled:opacity-50 text-white rounded-xl transition-colors shadow-2xs"
            >
              <Send size={15} />
            </button>
          </form>
          <div className="text-[10px] text-gray-400 text-center mt-1.5">
            Responses are strictly scoped to authenticated user records and official AICTE policies.
          </div>
        </div>
      </div>
    </div>
  );
};
