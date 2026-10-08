import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { leadsApi } from '../../services/leadsApi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface LeadType {
  id: string;
  name: string;
  location: string;
  propertyRequirement: string;
  budget: string;
  buyingTimeline: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  aiSummary: string;
  intent: string;
  concerns: string[];
  nextAction: string;
  suggestedResponse: string;
}

interface AIChatProps {
  isOpen: boolean;
  onClose?: () => void;
  mode: 'global' | 'lead';
  lead?: LeadType | null;
  inline?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export function AIChat({ isOpen, onClose, mode, lead, inline = false }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history or set initial greeting when opened
  useEffect(() => {
    if (isOpen) {
      let isCurrent = true;

      const fetchHistory = async () => {
        setIsLoadingHistory(true);
        try {
          const res = await leadsApi.getChatHistory(mode, lead?.id);
          if (isCurrent) {
            if (res.messages && res.messages.length > 0) {
              const historyMsgs = res.messages.map((m: any, i: number) => ({
                id: `hist-${Date.now()}-${i}`,
                role: m.role,
                content: m.content
              }));
              setMessages(historyMsgs);
            } else {
              // Initial greeting
              if (mode === 'global') {
                setMessages([
                  { id: '1', role: 'assistant', content: "Hello! I'm your MASAL AI Assistant. How can I help you manage your pipeline today?" }
                ]);
              } else if (mode === 'lead' && lead) {
                setMessages([
                  { id: '1', role: 'assistant', content: `I've analyzed ${lead.name}'s requirement for a ${lead.propertyRequirement} in ${typeof lead.location === 'string' ? lead.location : (lead.location as any)?.locality || 'Unknown'}. What would you like to know or draft?` }
                ]);
              } else {
                setMessages([]);
              }
            }
          }
        } catch (e) {
          console.error("Failed to load history", e);
          if (isCurrent) {
            // fallback greeting
            if (mode === 'global') {
              setMessages([{ id: '1', role: 'assistant', content: "Hello! I'm ready to help." }]);
            } else if (mode === 'lead' && lead) {
              setMessages([{ id: '1', role: 'assistant', content: `Hello! I'm ready to help with ${lead.name}.` }]);
            }
          }
        } finally {
          if (isCurrent) {
            setIsLoadingHistory(false);
          }
        }
      };

      fetchHistory();

      return () => { isCurrent = false; };
    } else {
       // Clear messages when closed so it fetches fresh when reopening
       setMessages([]);
    }
  }, [isOpen, mode, lead]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), role: 'user', content: inputValue.trim() };
    const newMessages = [...messages, newMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const messagesForApi = newMessages
        // Filter out initial system-like greeting from the UI which has no role in the backend
        .filter(m => m.id !== '1')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await leadsApi.chatWithAI({
        messages: messagesForApi,
        mode: mode,
        lead_id: lead?.id
      });

      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: res.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {/* Backdrop overlay (only if not inline) */}
      {!inline && (
        <div
          className={cn(
            "fixed inset-0 bg-[#0A0B14]/20 backdrop-blur-[2px] z-40 transition-all duration-300",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onClose}
        />
      )}

      {/* Chat Panel */}
      <div
        className={cn(
          "flex flex-col overflow-hidden transition-all duration-300 ease-out",
          inline 
            ? "relative w-full h-full bg-white" 
            : cn(
                "fixed z-50 bg-white/95 backdrop-blur-xl border border-purple-200/50 shadow-[0_20px_60px_-15px_rgba(107,33,168,0.2)] top-4 right-4 bottom-4 left-4 rounded-[2rem]",
                "sm:left-auto sm:w-[440px] md:w-[480px]",
                isOpen 
                  ? "translate-x-0 opacity-100 scale-100" 
                  : "translate-x-8 opacity-0 scale-95 pointer-events-none"
              )
        )}
      >
        {/* Subtle background glows */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 rounded-[2rem]">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[50%] bg-purple-200/30 blur-[80px] rounded-full" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[50%] bg-violet-200/30 blur-[80px] rounded-full" />
          <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-purple-50/80 to-transparent" />
        </div>

        {/* Header */}
        <div className={cn(
          "flex flex-col p-4 sm:p-5 z-10 shrink-0 border-b border-purple-100/50"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 font-semibold text-slate-900">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-700 shadow-sm border border-purple-200/50">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] leading-tight font-bold text-slate-800">MASAL AI</span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                  </span>
                </div>
                <span className="text-[12px] font-medium tracking-wide mt-0.5 text-slate-500">
                  {mode === 'global' ? 'Sales Assistant' : `Lead Assistant`}
                </span>
              </div>
            </div>
            {!inline && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-purple-700 hover:bg-purple-50 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Tags under header for lead mode */}
          {mode === 'lead' && lead && (
            <div className="text-[11px] mt-4 flex items-center flex-wrap gap-2">
              <span className="px-2 py-0.5 rounded-full shadow-sm font-medium bg-white/80 border border-purple-100 text-slate-600">{lead.name.split(' ')[0]}</span>
              <span className="px-2 py-0.5 rounded-full shadow-sm font-medium bg-white/80 border border-purple-100 text-slate-600">{lead.propertyRequirement}</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full border shadow-sm font-bold",
                lead.priority === 'HIGH' ? "bg-orange-50 text-orange-600 border-orange-200" : 
                lead.priority === 'MEDIUM' ? "bg-amber-50 text-amber-600 border-amber-200" : 
                "bg-slate-50 text-slate-600 border-slate-200"
              )}>{lead.priority}</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth z-10 relative">
          {isLoadingHistory ? (
            <div className="flex justify-center items-center h-full text-purple-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  {msg.role === 'assistant' && (
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600 flex items-center justify-center shrink-0 mr-3 mt-1 shadow-sm border border-purple-200/60">
                        <Bot className="w-4 h-4" />
                     </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] text-[14px] leading-relaxed shadow-sm",
                    msg.role === 'user'
                      ? "bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-md"
                      : "w-full px-5 py-4 rounded-2xl rounded-tl-sm bg-[#f8f5ff]/90 backdrop-blur-sm border border-purple-200/60 text-slate-800"
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="flex flex-col break-words">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ node: _node, ...props }) => <p className="mb-3 last:mb-0 leading-relaxed" {...props} />,
                            ul: ({ node: _node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1.5" {...props} />,
                            ol: ({ node: _node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5" {...props} />,
                            li: ({ node: _node, ...props }) => <li className="mb-1 text-slate-700" {...props} />,
                            h1: ({ node: _node, ...props }) => <h1 className="text-lg font-bold mb-3 mt-4 text-slate-900" {...props} />,
                            h2: ({ node: _node, ...props }) => <h2 className="text-base font-bold mb-3 mt-4 text-slate-900" {...props} />,
                            h3: ({ node: _node, ...props }) => <h3 className="text-[15px] font-semibold mb-2 mt-3 text-slate-800" {...props} />,
                            strong: ({ node: _node, ...props }) => <strong className="font-semibold text-slate-900" {...props} />,
                            table: ({ node: _node, ...props }) => (
                              <div className="overflow-x-auto w-full mb-4 rounded-xl border border-purple-200/50 bg-white/80 shadow-sm">
                                <table className="w-full text-sm text-left border-collapse" {...props} />
                              </div>
                            ),
                            th: ({ node: _node, ...props }) => <th className="font-semibold p-3 border-b bg-purple-50/50 border-purple-100 text-slate-800" {...props} />,
                            td: ({ node: _node, ...props }) => <td className="p-3 border-b align-top border-purple-100/50 text-slate-700" {...props} />,
                            pre: ({ node: _node, ...props }) => (
                              <div className="overflow-x-auto w-full mb-4 rounded-xl shadow-inner bg-white/80 border border-purple-100">
                                <pre className="p-4 text-[13px] font-mono text-slate-800" {...props} />
                              </div>
                            ),
                            code: ({ node: _node, inline: isInlineCode, className: _className, children, ...props }: any) => {
                              return isInlineCode ? (
                                <code className="bg-purple-100/50 px-1.5 py-0.5 rounded-md text-purple-800 text-[13px] font-mono border border-purple-200/50" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className="text-[13px] font-mono" {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {msg.content.replace(/<br\s*\/?>/gi, '\n')}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex w-full justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 text-purple-600 flex items-center justify-center shrink-0 mr-3 mt-1 shadow-sm border border-purple-200/60">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm mt-1 bg-[#f8f5ff]/90 backdrop-blur-sm border border-purple-200/60">
                    <div className="w-1.5 h-1.5 bg-purple-500/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-purple-500/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-purple-500/60 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-px w-full" />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-5 shrink-0 border-t border-purple-100/50 bg-white/60 backdrop-blur-md z-10">
          <div className="relative flex items-center border border-purple-200/60 rounded-2xl transition-all group bg-white/80 focus-within:bg-white hover:border-purple-300 focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-100 shadow-sm">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === 'global' ? "Ask MASAL AI..." : `Ask about ${lead?.name.split(' ')[0]}...`}
              className="w-full bg-transparent border-none pl-5 pr-14 py-4 text-[14px] focus:outline-none focus:ring-0 transition-all text-slate-900 placeholder:text-slate-400"
            />
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "absolute right-2 w-9 h-9 rounded-full transition-all duration-300 flex items-center justify-center",
                inputValue.trim() && !isTyping && !isLoadingHistory
                  ? "bg-purple-600 text-white shadow-md hover:bg-purple-700 hover:scale-105"
                  : "bg-purple-50 text-purple-300"
              )}
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping || isLoadingHistory}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
          <div className="text-center mt-3">
             <span className="text-[11px] font-medium text-slate-400">
               MASAL AI can make mistakes. Verify important information.
             </span>
          </div>
        </div>
      </div>
    </>
  );
}
