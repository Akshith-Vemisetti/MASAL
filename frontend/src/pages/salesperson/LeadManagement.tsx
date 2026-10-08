import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, Filter, ChevronDown,
  MapPin, Clock, Sparkles, User, Plus, Building2, AlignLeft, Zap, Loader2, CheckCircle, XCircle
} from 'lucide-react';
import { leadsApi } from '../../services/leadsApi';
import { cn, isUnderThreeMonths } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export function LeadManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortOption, setSortOption] = useState<string>('SCORE_DESC');
  const [activeTab, setActiveTab] = useState<string>('ALL');

  const [leads, setLeads] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);

  const fetchLeads = useCallback(async () => {
    try {
      const data = await leadsApi.getAllLeads();
      setLeads(data);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleComingSoon = () => {
    setToastMessage('Coming Soon');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const getNormalizedPriority = (priority: string) => {
    return String(priority || '').trim().toLowerCase();
  };

  const stats = useMemo(() => {
    return {
      total: leads.length,
      highPriority: leads.filter(l => getNormalizedPriority(l.ai_analysis?.priority || l.priority) === 'high').length,
      mediumPriority: leads.filter(l => getNormalizedPriority(l.ai_analysis?.priority || l.priority) === 'medium').length,
      urgent: leads.filter(l => isUnderThreeMonths(l.buying_timeline || l.buyingTimeline)).length,
    };
  }, [leads]);

  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(lead => 
        (lead.name && lead.name.toLowerCase().includes(term)) ||
        (lead.location && lead.location.toLowerCase().includes(term)) ||
        (lead.property_requirement && lead.property_requirement.toLowerCase().includes(term)) ||
        (lead.propertyRequirement && lead.propertyRequirement.toLowerCase().includes(term))
      );
    }

    // Priority Dropdown filter
    if (priorityFilter !== 'ALL') {
      result = result.filter(lead => {
        const p = getNormalizedPriority(lead.ai_analysis?.priority || lead.priority);
        return p === priorityFilter.toLowerCase();
      });
    }

    // Tab filter
    if (activeTab === 'HIGH') {
      result = result.filter(lead => getNormalizedPriority(lead.ai_analysis?.priority || lead.priority) === 'high');
    } else if (activeTab === 'MEDIUM') {
      result = result.filter(lead => getNormalizedPriority(lead.ai_analysis?.priority || lead.priority) === 'medium');
    } else if (activeTab === 'URGENT') {
      result = result.filter(lead => isUnderThreeMonths(lead.buying_timeline || lead.buyingTimeline));
    }

    // Sorting
    result.sort((a, b) => {
      const scoreA = a.ai_analysis?.priority_score || a.score || 0;
      const scoreB = b.ai_analysis?.priority_score || b.score || 0;
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();

      switch (sortOption) {
        case 'SCORE_DESC': return scoreB - scoreA;
        case 'SCORE_ASC': return scoreA - scoreB;
        case 'DATE_DESC': return dateB - dateA;
        case 'DATE_ASC': return dateA - dateB;
        default: return 0;
      }
    });

    return result;
  }, [leads, searchTerm, priorityFilter, sortOption, activeTab]);

  const getPriorityBadge = (priority: string) => {
    const p = getNormalizedPriority(priority);
    switch(p) {
      case 'high': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-600">High</span>;
      case 'medium': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-600">Medium</span>;
      case 'low': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600">Low</span>;
      default: return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Unknown</span>;
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90) return 'text-amber-500';
    if (score >= 70) return 'text-blue-500';
    return 'text-gray-500';
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl font-medium transition-all duration-300">
          {toastMessage}
        </div>
      )}

      {/* Hero Section */}
      <div className="relative rounded-[24px] overflow-hidden bg-white shadow-sm border border-gray-100 min-h-[160px] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80"
          style={{ backgroundImage: "url('/login-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800/90 to-transparent w-full md:w-3/4" />
        
        <div className="relative z-10 p-8 w-full flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              Lead Management
            </h1>
            <p className="text-slate-300 font-medium text-sm md:text-base max-w-lg">
              AI-prioritized leads to help you focus on the best opportunities.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap justify-center md:justify-end">
            <button
              onClick={async () => {
                 if (isAnalyzing) return;
                 try {
                    setIsAnalyzing(true);
                    setAnalysisError(false);
                    setAnalysisSuccess(false);
                    await leadsApi.analyzeAllPendingLeads();
                    await fetchLeads();
                    setAnalysisSuccess(true);
                    setTimeout(() => setAnalysisSuccess(false), 4000);
                 } catch (err) {
                    setAnalysisError(true);
                    setTimeout(() => setAnalysisError(false), 4000);
                 } finally {
                    setIsAnalyzing(false);
                 }
              }}
              className={cn(
                "px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-sm border",
                isAnalyzing ? "bg-white/10 text-white border-white/20 cursor-not-allowed" :
                analysisSuccess ? "bg-emerald-500/20 text-emerald-100 border-emerald-500/30" :
                analysisError ? "bg-red-500/20 text-red-100 border-red-500/30" :
                "bg-white/10 hover:bg-white/20 text-white border-white/20"
              )}
            >
              {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin" /> :
               analysisSuccess ? <CheckCircle className="w-5 h-5" /> :
               analysisError ? <XCircle className="w-5 h-5" /> :
               <Sparkles className="w-5 h-5 text-purple-300" />}
              {isAnalyzing ? "Analyzing..." :
               analysisSuccess ? "Analysis Complete" :
               analysisError ? "Analysis Failed" :
               "Analyze Pending Leads"}
            </button>
            <button 
              onClick={handleComingSoon}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2 shrink-0"
            >
              <Plus className="w-5 h-5" /> Add Lead
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Leads</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
              <span className="text-xs font-bold text-emerald-500 mb-1">↑ 12% this week</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">High Priority</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.highPriority}</h3>
            <span className="text-xs font-bold text-rose-500">Needs attention</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Medium Priority</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.mediumPriority}</h3>
            <span className="text-xs font-bold text-gray-500">Follow up scheduled</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Urgent Timeline</p>
            <h3 className="text-2xl font-bold text-gray-900">{stats.urgent}</h3>
            <span className="text-xs font-bold text-gray-500">Hot leads (≤ 3 months)</span>
          </div>
        </div>
      </div>

      {/* Filter Area & Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
          <div className="relative w-full lg:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by name, location, or requirement..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
            <div className="relative">
              <select
                className="appearance-none bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer transition-colors"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="ALL">All Priorities</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                className="appearance-none bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 focus:outline-none cursor-pointer transition-colors"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="SCORE_DESC">Priority / Score: High to Low</option>
                <option value="SCORE_ASC">Priority / Score: Low to High</option>
                <option value="DATE_DESC">Newest First</option>
                <option value="DATE_ASC">Oldest First</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <button className="p-2.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors shrink-0">
              <Filter className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                setSearchTerm('');
                setPriorityFilter('ALL');
                setSortOption('SCORE_DESC');
                setActiveTab('ALL');
              }}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors text-sm font-bold shrink-0"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-t border-gray-100 pt-4 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Leads', icon: User, count: stats.total, color: 'text-purple-600', bg: 'bg-purple-100' },
            { id: 'HIGH', label: 'High Priority', icon: Sparkles, count: stats.highPriority, color: 'text-rose-600', bg: 'bg-rose-100' },
            { id: 'MEDIUM', label: 'Medium Priority', icon: Clock, count: stats.mediumPriority, color: 'text-amber-600', bg: 'bg-amber-100' },
            { id: 'URGENT', label: 'Urgent', icon: Zap, count: stats.urgent, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-gray-900 text-white" 
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-transparent"
              )}
            >
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-white" : tab.color)} />
              {tab.label}
              <span className={cn("px-2 py-0.5 rounded-full text-xs", activeTab === tab.id ? "bg-gray-800 text-gray-300" : tab.bg, activeTab !== tab.id && tab.color)}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px] whitespace-nowrap table-fixed">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-[11px] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3 w-[120px]">Score / Priority</th>
                <th className="px-4 py-3 w-[150px]">Name</th>
                <th className="px-4 py-3 w-[120px]">Location</th>
                <th className="px-4 py-3 w-[110px]">Budget</th>
                <th className="px-4 py-3 w-[140px]">Requirement</th>
                <th className="px-4 py-3 w-[110px]">Timeline</th>
                <th className="px-4 py-3 min-w-[150px]">AI Summary</th>
                <th className="px-4 py-3 w-[110px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAndSortedLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500 font-medium">
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAndSortedLeads.map((lead) => {
                  const score = lead.ai_analysis?.priority_score || lead.score || 0;
                  const priority = lead.ai_analysis?.priority || lead.priority || 'UNKNOWN';
                  const summary = lead.ai_analysis?.summary || 'Pending AI analysis...';
                  const propertyType = lead.property_type || lead.propertyType || 'Any';
                  const requirement = lead.property_requirement || lead.propertyRequirement || 'Any';
                  const timeline = lead.buying_timeline || lead.buyingTimeline || 'Flexible';

                  return (
                    <tr 
                      key={lead.id || lead._id} 
                      className="hover:bg-gray-50/50 transition-colors group h-14"
                    >
                      {/* Score / Priority (Combined) */}
                      <td className="px-4 py-2 align-middle">
                        <div className="flex flex-col gap-1.5 items-start justify-center h-full">
                          {getPriorityBadge(priority)}
                          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                            <span className={cn("text-[11px]", getScoreBadgeColor(score))}>{score}</span> SCORE
                          </div>
                        </div>
                      </td>
                      
                      {/* Name */}
                      <td className="px-4 py-2 font-bold text-gray-900 truncate">
                        {lead.name}
                      </td>

                      {/* Location */}
                      <td className="px-4 py-2 text-gray-600 font-medium">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate" title={typeof lead.location === 'string' ? lead.location : (lead.location?.locality || lead.location?.city || 'Unknown')}>
                            {typeof lead.location === 'string' ? lead.location : (lead.location?.locality || lead.location?.city || 'Unknown')}
                          </span>
                        </div>
                      </td>

                      {/* Budget */}
                      <td className="px-4 py-2 text-gray-600 font-medium truncate" title={lead.budget || 'Not specified'}>
                        {lead.budget || 'Not specified'}
                      </td>

                      {/* Requirement (Combined Property Type & Req) */}
                      <td className="px-4 py-2">
                        <div className="flex flex-col gap-0.5 justify-center h-full text-[12px]">
                          <span className="font-semibold text-gray-800 flex items-center gap-1 truncate" title={propertyType}>
                            <Building2 className="w-3 h-3 text-gray-400 shrink-0" /> {propertyType}
                          </span>
                          <span className="text-gray-500 truncate" title={requirement}>
                            {requirement}
                          </span>
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="px-4 py-2 text-gray-600 font-medium">
                         <div className="flex items-center gap-1.5 truncate" title={timeline}>
                          <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{timeline}</span>
                         </div>
                      </td>

                      {/* AI Summary */}
                      <td className="px-4 py-2">
                        <div className="text-gray-500 text-[12px] font-medium truncate" title={summary}>
                          {summary}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2 text-center align-middle">
                        <button 
                          onClick={() => navigate(`/salesperson/leads/${lead.id || lead._id}`)}
                          className="px-3 py-1.5 bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-lg text-[11px] font-bold transition-all shadow-sm mx-auto flex items-center justify-center gap-1.5 w-full"
                        >
                          View <AlignLeft className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


