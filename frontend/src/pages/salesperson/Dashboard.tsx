import { useEffect, useState, useCallback } from 'react';
import { Users, Flame, Clock, Zap, ArrowRight, UserPlus, Building2, Sparkles, BarChart3, MapPin, Banknote, Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { leadsApi } from '../../services/leadsApi';
import { inventoryApi } from '../../services/inventoryApi';
import { useAuth } from '../../context/AuthContext';
import { API_ORIGIN } from '../../services/api';
import { cn, isUnderThreeMonths } from '../../lib/utils';

export function SalespersonDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  
  // Analysis Quick Action States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSuccess, setAnalysisSuccess] = useState(false);
  const [analysisError, setAnalysisError] = useState(false);
  
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      const leadsData = await leadsApi.getAllLeads();
      setLeads(leadsData);
      
      const userId = (user as any)?._id || (user as any)?.id;
      if (userId) {
        const invData = await inventoryApi.getMyInventory(userId);
        setInventory(invData);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      if (showLoading) setError('Unable to load dashboard data. Please try again later.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 17) return 'Good afternoon,';
    if (hour < 21) return 'Good evening,';
    return 'Good night,';
  };
  const greeting = getGreeting();

  const totalLeads = leads.length;
  
  const getNormalizedPriority = (lead: any) => {
    return String(lead.ai_analysis?.priority || lead.priority || '').trim().toLowerCase();
  };

  const highPriority = leads.filter(l => getNormalizedPriority(l) === 'high').length;
  const mediumPriority = leads.filter(l => getNormalizedPriority(l) === 'medium').length;

  const urgentTimeline = leads.filter(l => isUnderThreeMonths(l.buying_timeline || l.buyingTimeline)).length;

  const handleComingSoon = () => {
    setToastMessage('Coming Soon');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const sortedLeads = [...leads].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  const recentLeads = sortedLeads.slice(0, 5);

  const sortedInventory = [...inventory].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  const recentInventory = sortedInventory.slice(0, 2);

  const getPriorityColor = (priority: string) => {
    switch(getNormalizedPriority({ priority })) {
      case 'high': return 'bg-rose-100 text-rose-600';
      case 'medium': return 'bg-amber-100 text-amber-600';
      case 'low': return 'bg-emerald-100 text-emerald-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getInitials = (name: string) => name ? name.charAt(0).toUpperCase() : '?';

  const getLocationString = (loc: any) => {
    if (!loc) return 'Various';
    if (typeof loc === 'object') {
      const parts = [loc.locality, loc.city].filter(Boolean);
      return parts.length > 0 ? parts.join(', ') : 'Various';
    }
    return String(loc);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl font-medium transition-all duration-300">
          {toastMessage}
        </div>
      )}

      {/* Hero Section */}
      <div className="relative rounded-[24px] overflow-hidden bg-white shadow-sm border border-gray-100 min-h-[220px] flex items-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/login-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent w-full md:w-3/4" />
        
        <div className="relative z-10 p-8 w-full flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="text-gray-600 font-medium mb-1 text-lg flex items-center gap-2">
              {greeting}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              {user?.name || 'Salesperson'} <span className="text-2xl">👋</span>
            </h1>
            <p className="text-gray-700 mt-3 text-lg font-medium">Here's a quick overview of your sales pipeline.</p>
            <p className="text-gray-500 italic mt-1 font-serif text-lg">"Smarter tools for bigger opportunities."</p>
          </div>

          <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 shadow-2xl md:min-w-[280px]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-white" />
              <h3 className="text-white font-bold text-sm">AI-Driven<br/>Real Estate Sales</h3>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Convert more leads<br/>with intelligent insights.
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Leads */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4 z-10">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="z-10">
            <p className="text-sm text-gray-500 font-medium">Total Leads</p>
            {loading ? <div className="h-9 mt-1 flex items-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div> : <h3 className="text-3xl font-bold text-gray-900 mt-1">{totalLeads}</h3>}
            <p className="text-xs font-bold text-emerald-500 mt-2 flex items-center gap-1">
              ↑ +12% this week
            </p>
          </div>
          {/* Decorative chart background simulation */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-50/50 to-transparent pointer-events-none" />
        </div>

        {/* High Priority */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4 z-10">
              <Flame className="w-6 h-6" />
            </div>
          </div>
          <div className="z-10">
            <p className="text-sm text-gray-500 font-medium">High Priority</p>
            {loading ? <div className="h-9 mt-1 flex items-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div> : <h3 className="text-3xl font-bold text-gray-900 mt-1">{highPriority}</h3>}
            <p className="text-xs font-bold text-red-500 mt-2">
              Needs attention
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-red-50/50 to-transparent pointer-events-none" />
        </div>

        {/* Medium Priority */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-500 mb-4 z-10">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="z-10">
            <p className="text-sm text-gray-500 font-medium">Medium Priority</p>
            {loading ? <div className="h-9 mt-1 flex items-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div> : <h3 className="text-3xl font-bold text-gray-900 mt-1">{mediumPriority}</h3>}
            <p className="text-xs font-bold text-gray-500 mt-2">
              Follow up scheduled
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-amber-50/50 to-transparent pointer-events-none" />
        </div>

        {/* Urgent Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-4 z-10">
              <Zap className="w-6 h-6" />
            </div>
          </div>
          <div className="z-10">
            <p className="text-sm text-gray-500 font-medium">Urgent Timeline</p>
            {loading ? <div className="h-9 mt-1 flex items-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div> : <h3 className="text-3xl font-bold text-gray-900 mt-1">{urgentTimeline}</h3>}
            <p className="text-xs font-bold text-gray-500 mt-2">
              Hot leads (≤ 3 months)
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-emerald-50/50 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* Main Content Split: Recent Leads & Property Inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Leads</h2>
            <button 
              onClick={() => navigate('/salesperson/leads')} 
              className="text-sm font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : error ? (
              <div className="text-red-500 text-sm text-center py-8 flex flex-col items-center"><AlertTriangle className="w-6 h-6 mb-2" />{error}</div>
            ) : recentLeads.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-8">No leads yet.</div>
            ) : (
              recentLeads.map((lead, i) => {
                const leadId = lead.id || lead._id;
                return (
                <div key={leadId || i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-purple-100 hover:shadow-sm transition-all group cursor-pointer gap-4" onClick={() => navigate(`/salesperson/leads/${leadId}`)}>
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0 mt-1 sm:mt-0">
                      {getInitials(lead.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-sm truncate max-w-[200px]">{lead.name || 'Not provided'}</span>
                        {lead.priority && (
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold capitalize whitespace-nowrap ${getPriorityColor(lead.priority)}`}>
                            {lead.priority}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1 shrink-0"><MapPin className="w-3.5 h-3.5"/> <span className="truncate max-w-[120px]">{lead.location || lead.location_preference || 'Not specified'}</span></span>
                        <span className="flex items-center gap-1 shrink-0"><Banknote className="w-3.5 h-3.5"/> {lead.budget || (lead.budget_min ? `₹ ${lead.budget_min} - ${lead.budget_max}` : 'Budget not specified')}</span>
                        <span className="flex items-center gap-1 shrink-0"><Building2 className="w-3.5 h-3.5"/> {lead.property_type || 'Not specified'}</span>
                        {lead.bhk_or_size || lead.property_size_requirement ? <span className="shrink-0">{lead.bhk_or_size || lead.property_size_requirement}</span> : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 mt-2 sm:mt-0 w-full sm:w-auto shrink-0">
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No date'}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/salesperson/leads/${leadId}`); }}
                      className="px-4 py-1.5 text-xs font-bold text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 shrink-0"
                    >
                      View <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>

        {/* Property Inventory */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Property Inventory</h2>
            <button 
              onClick={() => navigate('/salesperson/inventory')} 
              className="text-sm font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-4 flex-1">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : error ? (
              <div className="text-red-500 text-sm text-center py-8 flex flex-col items-center"><AlertTriangle className="w-6 h-6 mb-2" />{error}</div>
            ) : recentInventory.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-8">No properties in inventory.</div>
            ) : (
              recentInventory.map((property, i) => {
                const propertyId = property.id || property._id;
                return (
                <div key={propertyId || i} className="rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group flex flex-col" onClick={() => navigate(`/salesperson/inventory/${propertyId}`)}>
                  <div className="h-32 bg-gray-200 relative">
                    {property.images && property.images.length > 0 ? (
                      <img src={`${API_ORIGIN}${property.images[0]}`} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-[10px] text-gray-500 font-medium">Image unavailable</span>
                      </div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded shadow-sm">
                      For {property.status === 'rent' ? 'Rent' : 'Sale'}
                    </div>
                  </div>
                  <div className="p-4 bg-white flex flex-col flex-1">
                    <h4 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1" title={property.title}>{property.title || 'Untitled Property'}</h4>
                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1 line-clamp-1 truncate" title={getLocationString(property.location)}><MapPin className="w-3 h-3 shrink-0"/> {getLocationString(property.location)}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                      <div className="font-bold text-purple-700 text-sm shrink-0">
                        ₹ {property.price ? property.price.toLocaleString('en-IN') : 'On Request'}
                        {property.status === 'rent' && <span className="text-xs text-gray-500 font-medium"> / month</span>}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded shrink-0">
                        {property.bhk && <span>{property.bhk} BHK</span>}
                        {property.bhk && property.area && <span>•</span>}
                        {property.area && <span>{property.area} sqft</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>
        </div>

      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6">
        
        {/* Add New Lead (Coming Soon for Salesperson) */}
        <div 
          onClick={handleComingSoon}
          className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100 hover:bg-purple-50 transition-colors cursor-pointer group flex items-start justify-between relative overflow-hidden"
        >
          <div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-3">
              <UserPlus className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Add New Lead</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[150px]">Capture new inquiries and grow your pipeline.</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm self-end group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className="absolute -bottom-4 -right-4 text-purple-100 opacity-50 transform rotate-12 group-hover:scale-110 transition-transform">
            <Users className="w-24 h-24" />
          </div>
        </div>

        {/* Add Property */}
        <div 
          onClick={() => navigate('/salesperson/inventory/add')}
          className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 hover:bg-blue-50 transition-colors cursor-pointer group flex items-start justify-between relative overflow-hidden"
        >
          <div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">Add Property</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[150px]">List your properties and reach more buyers.</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm self-end group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className="absolute -bottom-4 -right-4 text-blue-100 opacity-50 transform rotate-12 group-hover:scale-110 transition-transform">
            <Building2 className="w-24 h-24" />
          </div>
        </div>

        {/* AI Assistant */}
        <div 
          onClick={() => {
             // For global chat triggered from dashboard
             // The SalespersonLayout has the state. 
             // We can trigger it by emitting a custom event or we can just navigate if it was a route.
             // Wait, the prompt says "connect it to the existing functionality". In SalespersonLayout, the floating button opens it.
             // I'll dispatch a custom event that SalespersonLayout can listen to, or simply tell the user to use the floating button for now.
             // Actually, I can just dispatch an event: window.dispatchEvent(new CustomEvent('open-global-chat'))
             window.dispatchEvent(new CustomEvent('open-global-chat'));
          }}
          className="bg-fuchsia-50/50 rounded-2xl p-5 border border-fuchsia-100 hover:bg-fuchsia-50 transition-colors cursor-pointer group flex items-start justify-between relative overflow-hidden"
        >
          <div>
            <div className="w-10 h-10 rounded-full bg-fuchsia-100 flex items-center justify-center text-fuchsia-600 mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gray-900 text-sm mb-1">AI Assistant</h4>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[150px]">Get AI insights, generate responses, and analyze leads.</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-fuchsia-600 shadow-sm self-end group-hover:translate-x-1 transition-transform">
            <ArrowRight className="w-4 h-4" />
          </div>
          <div className="absolute -bottom-4 -right-4 text-fuchsia-100 opacity-50 transform rotate-12 group-hover:scale-110 transition-transform">
            <Sparkles className="w-24 h-24" />
          </div>
        </div>

        {/* Analyze Pending Leads */}
        <div 
          onClick={async () => {
             if (isAnalyzing) return;
             try {
                setIsAnalyzing(true);
                setAnalysisError(false);
                setAnalysisSuccess(false);
                await leadsApi.analyzeAllPendingLeads();
                
                // Refresh data silently
                await fetchDashboardData(false);
                
                setAnalysisSuccess(true);
                setTimeout(() => {
                   setAnalysisSuccess(false);
                }, 4000);
             } catch (err) {
                setAnalysisError(true);
                setTimeout(() => {
                   setAnalysisError(false);
                }, 4000);
             } finally {
                setIsAnalyzing(false);
             }
          }}
          className={cn(
             "rounded-2xl p-5 border transition-colors cursor-pointer group flex items-start justify-between relative overflow-hidden",
             isAnalyzing ? "bg-emerald-50/80 border-emerald-200 cursor-not-allowed" : 
             analysisSuccess ? "bg-emerald-100 border-emerald-300 shadow-sm" :
             analysisError ? "bg-red-50/80 border-red-200" :
             "bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50"
          )}
        >
          <div className="relative z-10">
            <div className={cn(
               "w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors",
               isAnalyzing ? "bg-emerald-100 text-emerald-600" :
               analysisSuccess ? "bg-emerald-500 text-white" :
               analysisError ? "bg-red-100 text-red-600" :
               "bg-emerald-100 text-emerald-600"
            )}>
              {isAnalyzing ? (
                 <Loader2 className="w-5 h-5 animate-spin" />
              ) : analysisSuccess ? (
                 <CheckCircle className="w-5 h-5" />
              ) : analysisError ? (
                 <AlertTriangle className="w-5 h-5" />
              ) : (
                 <BarChart3 className="w-5 h-5" />
              )}
            </div>
            <h4 className={cn(
              "font-bold text-sm mb-1 transition-colors",
              analysisSuccess ? "text-emerald-900" :
              analysisError ? "text-red-900" :
              "text-gray-900"
            )}>
              {isAnalyzing ? "Analyzing Pending Leads..." :
               analysisSuccess ? "Analysis Complete" :
               analysisError ? "Analysis Failed" :
               "Analyze Pending Leads"}
            </h4>
            <p className={cn(
               "text-xs leading-relaxed max-w-[150px] transition-colors",
               analysisSuccess ? "text-emerald-800" :
               analysisError ? "text-red-700" :
               "text-gray-500"
            )}>
              {isAnalyzing ? "MASAL AI is analyzing pending leads..." :
               analysisSuccess ? "Pending leads analyzed successfully." :
               analysisError ? "Unable to analyze pending leads. Try again." :
               "Let AI analyze and identify your best opportunities."}
            </p>
          </div>
          
          <div className={cn(
             "w-8 h-8 rounded-full flex items-center justify-center shadow-sm self-end transition-all z-10",
             isAnalyzing ? "bg-white text-emerald-400 opacity-50" :
             analysisSuccess ? "bg-emerald-600 text-white" :
             analysisError ? "bg-red-500 text-white" :
             "bg-white text-emerald-600 group-hover:translate-x-1"
          )}>
            {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : 
             analysisSuccess ? <CheckCircle className="w-4 h-4" /> : 
             analysisError ? <XCircle className="w-4 h-4" /> : 
             <ArrowRight className="w-4 h-4" />}
          </div>
          <div className={cn(
             "absolute -bottom-4 -right-4 opacity-50 transform rotate-12 transition-all duration-700",
             isAnalyzing ? "text-emerald-200 scale-110 animate-pulse" :
             analysisSuccess ? "text-emerald-200 scale-100" :
             analysisError ? "text-red-100 scale-100" :
             "text-emerald-100 group-hover:scale-110"
          )}>
            {isAnalyzing ? <Sparkles className="w-24 h-24" /> :
             analysisError ? <AlertTriangle className="w-24 h-24" /> :
             <BarChart3 className="w-24 h-24" />}
          </div>
        </div>

      </div>
    </div>
  );
}
