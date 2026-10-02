import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot } from 'lucide-react';
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

export function AIChat({ isOpen, onClose, mode, lead }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset or set initial greeting when opened
  useEffect(() => {
    if (isOpen) {
      if (mode === 'global') {
        setMessages([
          { id: '1', role: 'assistant', content: "Hello! I'm your MASAL AI Assistant. How can I help you manage your pipeline today?" }
        ]);
      } else if (mode === 'lead' && lead) {
        setMessages([
          { id: '1', role: 'assistant', content: `I've analyzed ${lead.name}'s requirement for a ${lead.propertyRequirement} in ${lead.location}. What would you like to know or draft?` }
        ]);
      }
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
      {/* Backdrop overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300" 
          onClick={onClose} 
        />
      )}
      
      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 z-50 w-full sm:w-[400px] md:w-[450px] h-[100dvh] bg-surface border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out transform",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex flex-col border-b border-border p-4 bg-surface/95 z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Bot className="w-5 h-5 text-primary" />
              {mode === 'global' ? 'MASAL AI Assistant' : `AI — ${lead?.name}`}
            </div>
            <button 
              onClick={onClose} 
              className="text-text-secondary hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {mode === 'lead' && lead && (
            <div className="text-xs text-text-secondary">
              Context: {lead.propertyRequirement} • {lead.budget} • {lead.location} • <span className={cn(
                lead.priority === 'HIGH' ? "text-orange-400" : lead.priority === 'MEDIUM' ? "text-yellow-400" : "text-slate-400"
              )}>{lead.priority} Priority</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex w-full", msg.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                msg.role === 'user' 
                  ? "bg-primary text-primary-foreground rounded-tr-sm" 
                  : "bg-card border border-border text-white rounded-tl-sm overflow-hidden"
              )}>
                {msg.role === 'assistant' ? (
                  <div className="flex flex-col gap-1.5 break-words">
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-3 mt-4 text-white" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold mb-3 mt-4 text-white" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-2 mt-4 text-white" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-white" {...props} />
                      }}
                    >
                      {msg.content}
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
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 bg-card border border-border flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-text-secondary rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border bg-surface/95">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === 'global' ? "Ask MASAL AI anything..." : `Ask something about ${lead?.name.split(' ')[0]}...`}
              className="w-full bg-background border border-border rounded-full pl-4 pr-12 py-3 text-sm text-white placeholder:text-text-secondary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
            <Button 
              size="icon" 
              variant="ghost" 
              className="absolute right-1 w-10 h-10 rounded-full hover:bg-primary/20 text-primary"
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
