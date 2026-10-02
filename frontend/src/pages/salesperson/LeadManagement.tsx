import { useState, useMemo, useEffect } from 'react';
import {
  Search, Filter, ChevronDown, ChevronUp, Bot, ArrowUpDown,
  MapPin, IndianRupee, Clock, Target, AlertTriangle, Sparkles
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { leadsApi } from '../../services/leadsApi';
import { AIChat, type LeadType } from '../../components/salesperson/AIChat';
import { cn } from '../../lib/utils';

export function LeadManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('SCORE_DESC');
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [chatLead, setChatLead] = useState<LeadType | null>(null);

  const [leads, setLeads] = useState<any[]>([]);
  const [analyzingLeadId, setAnalyzingLeadId] = useState<string | null>(null);
  const [analyzingAll, setAnalyzingAll] = useState(false);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await leadsApi.getAllLeads();
        setLeads(data);
      } catch (err) {
        console.error('Failed to fetch leads:', err);
      }
    };
    fetchLeads();
  }, []);

  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];

    // Filter by search term
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(lead =>
        (lead.name || '').toLowerCase().includes(lowerSearch) ||
        (lead.location || '').toLowerCase().includes(lowerSearch) ||
        (lead.property_requirement || '').toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by priority
    if (priorityFilter !== 'ALL') {
      const normalizedFilter = priorityFilter.toLowerCase();
      result = result.filter(lead => {
        const priority = lead.ai_analysis?.priority || lead.priority || 'UNKNOWN';
        const normalizedPriority = String(priority).trim().toLowerCase();
        return normalizedPriority === normalizedFilter;
      });
    }

    // Sort
    result.sort((a, b) => {
      const scoreA = a.ai_analysis?.priority_score || a.score || 0;
      const scoreB = b.ai_analysis?.priority_score || b.score || 0;
      const dateA = new Date(a.created_at || a.createdAt || 0).getTime();
      const dateB = new Date(b.created_at || b.createdAt || 0).getTime();

      switch (sortOption) {
        case 'SCORE_DESC':
          return scoreB - scoreA;
        case 'SCORE_ASC':
          return scoreA - scoreB;
        case 'DATE_DESC':
          return dateB - dateA;
        case 'DATE_ASC':
          return dateA - dateB;
        default:
          return 0;
      }
    });

    return result;
  }, [leads, searchTerm, priorityFilter, sortOption]);

  const toggleExpand = (id: string) => {
    setExpandedLeadId(prev => prev === id ? null : id);
  };

  const handleAnalyzeLead = async (leadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnalyzingLeadId(leadId);
    try {
      const updatedLead = await leadsApi.analyzeLead(leadId);
      setLeads(leads.map(lead => lead.id === leadId ? updatedLead : lead));
    } catch (error: any) {
      console.error('Failed to analyze lead:', error);
      alert(error.message || 'Failed to analyze lead. Please check the backend configuration.');
    } finally {
      setAnalyzingLeadId(null);
    }
  };

  const handleAnalyzeAll = async () => {
    setAnalyzingAll(true);
    try {
      const response = await leadsApi.analyzeAllPendingLeads();
      setLeads(leads.map(lead => {
        const analyzedLead = response.find((l: any) => l.id === lead.id);
        return analyzedLead ? analyzedLead : lead;
      }));
      alert('Analysis completed for pending leads.');
    } catch (error: any) {
      console.error('Failed to analyze all leads:', error);
      alert(error.message || 'Failed to analyze leads. Please check the backend configuration.');
    } finally {
      setAnalyzingAll(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'LOW': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-primary/20 text-primary border-primary/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-orange-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-slate-400';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Lead Management</h1>
          <p className="text-text-secondary">AI-prioritized leads needing your attention.</p>
        </div>
        <Button
          onClick={handleAnalyzeAll}
          disabled={analyzingAll}
          className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          {analyzingAll ? "Analyzing..." : "Analyze Pending Leads"}
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="p-4 bg-surface/50 border-border/50">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input
              placeholder="Search by name, location, or requirement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <Filter className={cn("w-4 h-4 shrink-0 transition-colors", priorityFilter !== 'ALL' ? "text-primary" : "text-text-secondary")} />
              <div className="relative">
                <select
                  className="appearance-none bg-surface border border-border/50 hover:border-border rounded-md pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary min-w-[140px] cursor-pointer transition-colors"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option className="bg-surface text-white py-1" value="ALL">All Priorities</option>
                  <option className="bg-surface text-white py-1" value="HIGH">High Priority</option>
                  <option className="bg-surface text-white py-1" value="MEDIUM">Medium Priority</option>
                  <option className="bg-surface text-white py-1" value="LOW">Low Priority</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 shrink-0 text-text-secondary" />
              <div className="relative">
                <select
                  className="appearance-none bg-surface border border-border/50 hover:border-border rounded-md pl-3 pr-8 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary min-w-[210px] cursor-pointer transition-colors"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option className="bg-surface text-white py-1" value="SCORE_DESC">Priority / Score: High to Low</option>
                  <option className="bg-surface text-white py-1" value="SCORE_ASC">Priority / Score: Low to High</option>
                  <option className="bg-surface text-white py-1" value="DATE_DESC">Newest</option>
                  <option className="bg-surface text-white py-1" value="DATE_ASC">Oldest</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredAndSortedLeads.length === 0 ? (
          <div className="text-center py-12 bg-surface/30 rounded-lg border border-border/50 text-text-secondary">
            No leads found matching your criteria.
          </div>
        ) : (
          filteredAndSortedLeads.map((lead) => {
            const priority = lead.ai_analysis?.priority || lead.priority || 'UNKNOWN';
            const score = lead.ai_analysis?.priority_score || lead.score || 0;
            const summary = lead.ai_analysis?.summary || lead.aiSummary || 'No summary available.';
            const intent = lead.ai_analysis?.intent || lead.intent || 'Unknown';
            const concerns = lead.ai_analysis?.concerns || lead.concerns || [];
            const nextAction = lead.ai_analysis?.recommended_next_action || lead.nextAction || 'None';
            const suggestedResponse = lead.ai_analysis?.suggested_response || lead.suggestedResponse || 'No suggestion available.';
            const priorityReason = lead.ai_analysis?.priority_reason || lead.priorityReason || 'No priority reason available.';

            return (
              <Card
                key={lead.id}
                className={cn(
                  "overflow-hidden transition-all duration-200 border-border/50",
                  expandedLeadId === lead.id ? "ring-1 ring-primary/30 shadow-lg shadow-primary/5" : "hover:border-border"
                )}
              >
                {/* Lead Summary Header (Clickable) */}
                <div
                  className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => toggleExpand(lead.id)}
                >
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-center flex-1">
                    {/* AI Score Badge */}
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-surface border border-border shrink-0">
                      <span className={cn("text-lg font-bold", getScoreColor(score))}>{score}</span>
                      <span className="text-[9px] uppercase text-text-muted tracking-wider">Score</span>
                    </div>

                    {/* Lead Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-white">{lead.name}</h3>
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border", getPriorityColor(priority))}>
                          {priority}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" /> {lead.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5" /> {lead.budget}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {lead.buying_timeline || lead.buyingTimeline}
                        </div>
                        {(lead.property_type || lead.propertyType) && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface border border-border/50 text-xs text-text-secondary">
                            🏢 {lead.property_type || lead.propertyType}
                          </div>
                        )}
                        {(lead.bhk_or_size || lead.bhkOrSize) && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface border border-border/50 text-xs text-text-secondary">
                            📐 {lead.bhk_or_size || lead.bhkOrSize}
                          </div>
                        )}
                        {lead.purpose && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface border border-border/50 text-xs text-text-secondary">
                            🎯 {lead.purpose}
                          </div>
                        )}
                        {lead.financing && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface border border-border/50 text-xs text-text-secondary">
                            🏦 {lead.financing}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="text-sm font-medium text-white line-clamp-1 flex-1 sm:w-48">
                      {lead.property_requirement || lead.propertyRequirement}
                    </span>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-surface border border-border">
                      {expandedLeadId === lead.id ? (
                        <ChevronUp className="w-4 h-4 text-text-secondary" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-text-secondary" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expandable AI Analysis Section */}
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-in-out",
                    expandedLeadId === lead.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <div className="overflow-hidden bg-surface/30">
                    <div className="p-5 border-t border-border/50">
                      {!lead.ai_analysis ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <Sparkles className="w-8 h-8 text-primary mb-4 opacity-50" />
                          <p className="text-text-secondary mb-4 text-center max-w-md">
                            This lead hasn't been analyzed yet. Use AI to automatically extract requirements, intent, and recommended actions.
                          </p>
                          <Button
                            onClick={(e) => handleAnalyzeLead(lead.id, e)}
                            disabled={analyzingLeadId === lead.id}
                            className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/50"
                          >
                            <Sparkles className={cn("w-4 h-4 mr-2", analyzingLeadId === lead.id && "animate-spin")} />
                            {analyzingLeadId === lead.id ? "Analyzing lead..." : "✨ Analyze with AI"}
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                          {/* Left: AI Summary & Intent */}
                          <div className="col-span-1 lg:col-span-2 space-y-5">
                            <div>
                              <h4 className="flex items-center gap-1.5 text-sm font-medium text-white mb-2">
                                <Sparkles className="w-4 h-4 text-primary" /> AI Summary
                              </h4>
                              <p className="text-sm text-text-secondary leading-relaxed">{summary}</p>
                            </div>

                            <div>
                              <h4 className="flex items-center gap-1.5 text-sm font-medium text-white mb-2">
                                <Sparkles className="w-4 h-4 text-primary" /> Priority Reason
                              </h4>
                              <p className="text-sm text-text-secondary leading-relaxed">{priorityReason}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6">
                              <div className="flex-1">
                                <h4 className="flex items-center gap-1.5 text-sm font-medium text-white mb-2">
                                  <Target className="w-4 h-4 text-green-400" /> Detected Intent
                                </h4>
                                <p className="text-sm text-text-secondary">{intent}</p>
                              </div>

                              <div className="flex-1">
                                <h4 className="flex items-center gap-1.5 text-sm font-medium text-white mb-2">
                                  <AlertTriangle className="w-4 h-4 text-yellow-400" /> Key Concerns
                                </h4>
                                <ul className="text-sm text-text-secondary list-disc pl-4 space-y-1">
                                  {concerns.map((concern: string, i: number) => (
                                    <li key={i}>{concern}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* Right: Suggested Action & Chat */}
                          <div className="col-span-1 bg-surface border border-border/50 rounded-lg p-4 flex flex-col justify-between">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Next Best Action</h4>
                                <p className="text-sm text-white">{nextAction}</p>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Suggested Response</h4>
                                <div className="p-3 bg-background rounded-md border border-border text-xs text-text-secondary italic">
                                  {suggestedResponse}
                                </div>
                              </div>
                            </div>

                            <Button
                              className="w-full mt-4 flex items-center justify-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setChatLead({
                                  id: lead.id,
                                  name: lead.name,
                                  location: lead.location,
                                  propertyRequirement: lead.property_requirement || lead.propertyRequirement,
                                  budget: lead.budget,
                                  buyingTimeline: lead.buying_timeline || lead.buyingTimeline,
                                  priority: priority as any,
                                  score: score,
                                  aiSummary: summary,
                                  intent: intent,
                                  concerns: concerns,
                                  nextAction: nextAction,
                                  suggestedResponse: suggestedResponse
                                });
                              }}
                            >
                              <Bot className="w-4 h-4" />
                              Chat with AI for {lead.name.split(' ')[0]}
                            </Button>
                          </div>

                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Lead-specific AI Chat Drawer */}
      <AIChat
        isOpen={!!chatLead}
        onClose={() => setChatLead(null)}
        mode="lead"
        lead={chatLead}
      />
    </div>
  );
}
