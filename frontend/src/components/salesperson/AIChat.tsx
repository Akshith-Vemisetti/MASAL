import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { leadsApi } from '../../services/leadsApi';

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
  onClose: () => void;
  mode: 'global' | 'lead';
  lead?: LeadType | null;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function AIChat({ isOpen, onClose, mode, lead }: AIChatProps) {
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
                  { id: '1', role: 'assistant', content: `I've analyzed ${lead.name}'s requirement for a ${lead.propertyRequirement} in ${lead.location}. What would you like to know or draft?` }
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
  }, [isOpen, mode, lead?.id]);

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
      {/* Backdrop overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Floating Panel */}
      <div
        className={cn(
          "fixed z-50 flex flex-col bg-surface/95 backdrop-blur-xl border border-border shadow-2xl transition-all duration-300 ease-out overflow-hidden",
          // Mobile: nearly full screen but slight margin
          "top-2 right-2 bottom-2 left-2 rounded-3xl",
          // Desktop: floating on the right
          "sm:left-auto sm:top-4 sm:right-4 sm:bottom-4 sm:w-[420px] md:w-[480px]",
          // Animation states
          isOpen 
            ? "translate-x-0 opacity-100 scale-100" 
            : "translate-x-8 opacity-0 scale-95 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex flex-col border-b border-border/50 p-4 sm:p-5 bg-surface/50 z-10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white font-semibold">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/20 text-primary border border-primary/20 shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] leading-tight text-white/90">MASAL AI</span>
                <span className="text-[11px] text-text-secondary font-medium tracking-wide mt-0.5">
                  {mode === 'global' ? 'SALES ASSISTANT' : `LEAD ASSISTANT`}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {mode === 'lead' && lead && (
            <div className="text-xs text-text-secondary mt-4 flex items-center flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded-full bg-black/20 border border-white/5 shadow-sm text-slate-300">{lead.name.split(' ')[0]}</span>
              <span className="px-2.5 py-1 rounded-full bg-black/20 border border-white/5 shadow-sm text-slate-300">{lead.propertyRequirement}</span>
              <span className="px-2.5 py-1 rounded-full bg-black/20 border border-white/5 shadow-sm text-slate-300">{lead.budget}</span>
              <span className={cn(
                "px-2.5 py-1 rounded-full border shadow-sm",
                lead.priority === 'HIGH' ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : 
                lead.priority === 'MEDIUM' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" : 
                "bg-slate-500/10 text-slate-400 border-slate-500/20"
              )}>{lead.priority} Priority</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth bg-background/30">
          {isLoadingHistory ? (
            <div className="flex justify-center items-center h-full text-text-secondary">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
                  {msg.role === 'assistant' && (
                     <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mr-3 mt-1 shadow-sm border border-primary/10">
                        <Bot className="w-4 h-4" />
                     </div>
                  )}
                  <div className={cn(
                    "max-w-[85%] text-[14px] leading-relaxed",
                    msg.role === 'user'
                      ? "bg-primary text-primary-foreground px-4 py-3 rounded-2xl rounded-tr-[4px] shadow-sm"
                      : "text-slate-300 w-full"
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="flex flex-col gap-2 break-words">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ node, ...props }) => <p className="mb-4 last:mb-0 leading-relaxed" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-2" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-2" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                            h1: ({ node, ...props }) => <h1 className="text-lg font-semibold mb-3 mt-5 text-white" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-base font-semibold mb-3 mt-5 text-white" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-[15px] font-medium mb-2 mt-4 text-white" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                            table: ({ node, ...props }) => (
                              <div className="overflow-x-auto w-full mb-4 rounded-xl border border-border/50 bg-black/20 shadow-sm">
                                <table className="w-full text-sm text-left border-collapse" {...props} />
                              </div>
                            ),
                            th: ({ node, ...props }) => <th className="bg-white/5 font-medium p-3 border-b border-border/50 text-slate-200" {...props} />,
                            td: ({ node, ...props }) => <td className="p-3 border-b border-border/30 align-top" {...props} />,
                            pre: ({ node, ...props }) => (
                              <div className="overflow-x-auto w-full mb-4 rounded-xl bg-black/40 border border-border/50 shadow-inner">
                                <pre className="p-4 text-[13px] font-mono text-slate-300" {...props} />
                              </div>
                            ),
                            code: ({ node, inline, className, children, ...props }: any) => {
                              return inline ? (
                                <code className="bg-primary/10 px-1.5 py-0.5 rounded-md text-primary text-[13px] font-mono border border-primary/10" {...props}>
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
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mr-3 mt-1 shadow-sm border border-primary/10">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="px-4 py-3 bg-card/50 border border-border/50 rounded-2xl rounded-tl-[4px] flex items-center gap-1.5 shadow-sm mt-1">
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-px w-full" />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-5 border-t border-border/50 bg-surface/80 shrink-0">
          <div className="relative flex items-center bg-background/80 backdrop-blur-md border border-border hover:border-border/80 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 rounded-2xl transition-all shadow-inner group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === 'global' ? "Message MASAL AI..." : `Ask about ${lead?.name.split(' ')[0]}...`}
              className="w-full bg-transparent border-none pl-5 pr-14 py-4 text-[14px] text-white placeholder:text-text-secondary focus:outline-none focus:ring-0 transition-all"
            />
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "absolute right-1.5 w-9 h-9 rounded-full transition-all duration-300",
                inputValue.trim() && !isTyping && !isLoadingHistory
                  ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:scale-105"
                  : "bg-white/5 text-text-secondary/50"
              )}
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping || isLoadingHistory}
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
          <div className="text-center mt-2.5">
             <span className="text-[11px] text-text-secondary/50 font-medium">MASAL AI can make mistakes. Verify important information.</span>
          </div>
        </div>
      </div>
    </>
  );
}
