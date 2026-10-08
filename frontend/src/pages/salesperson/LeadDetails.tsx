import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Clock, Sparkles, User,
  CheckCircle, AlertTriangle, Edit, Phone, IndianRupee,
  Building, Home, CreditCard, CalendarDays, FileText,
  MessageSquare, FileClock, Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { leadsApi } from '../../services/leadsApi';
import { AIChat, type LeadType } from '../../components/salesperson/AIChat';
import { cn, showToast } from '../../lib/utils';

export function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    const fetchLead = async () => {
      try {
        if (!id) return;
        const data = await leadsApi.getLead(id);
        setLead(data);
      } catch (err) {
        console.error('Failed to fetch lead:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  const handleAnalyzeLead = async () => {
    if (!id) return;
    setAnalyzing(true);
    try {
      const updatedLead = await leadsApi.analyzeLead(id);
      setLead(updatedLead);
    } catch (error: any) {
      console.error('Failed to analyze lead:', error);
      alert(error.message || 'Failed to analyze lead.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleComingSoon = () => {
    showToast('Coming Soon');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12 bg-[#f8fafc] h-[calc(100vh-64px)]">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Lead not found</h2>
        <Button variant="outline" onClick={() => navigate('/salesperson/leads')}>
          Back to Leads
        </Button>
      </div>
    );
  }

  const priority = lead.ai_analysis?.priority || lead.priority || 'UNKNOWN';
  const score = lead.ai_analysis?.priority_score || lead.score || 0;
  const summary = lead.ai_analysis?.summary || lead.aiSummary || 'No summary available.';
  const intent = lead.ai_analysis?.intent || lead.intent || 'Unknown';
  const concerns = lead.ai_analysis?.concerns || lead.concerns || [];
  const nextAction = lead.ai_analysis?.recommended_next_action || lead.nextAction || 'None';
  const suggestedResponse = lead.ai_analysis?.suggested_response || lead.suggestedResponse || 'No suggestion available.';
  const priorityReason = lead.ai_analysis?.priority_reason || lead.priorityReason || 'No priority reason available.';
  const requirement = lead.property_requirement || lead.propertyRequirement || 'Not specified';
  const propertyType = lead.property_type || lead.propertyType || 'N/A';
  const bhk = lead.bhk_or_size || lead.bhkOrSize || 'N/A';
  const timeline = lead.buying_timeline || lead.buyingTimeline || 'Not specified';
  const budget = lead.budget || 'N/A';
  const purpose = lead.purpose || 'Not specified';
  const financing = lead.financing || 'Not specified';

  // Format date
  const createdDate = lead.created_at ? new Date(lead.created_at) : null;
  const dateFormatted = createdDate ? createdDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Unknown';
  const timeFormatted = createdDate ? createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Unknown';

  const chatLeadData: LeadType = {
    id: lead.id,
    name: lead.name,
    location: lead.location,
    propertyRequirement: requirement,
    budget: budget,
    buyingTimeline: timeline,
    priority: priority as any,
    score: score,
    aiSummary: summary,
    intent: intent,
    concerns: concerns,
    nextAction: nextAction,
    suggestedResponse: suggestedResponse
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'MEDIUM': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'LOW': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const initial = lead.name ? lead.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f8fafc] overflow-y-auto overflow-x-hidden relative">
      {/* GLOBAL HEADER AREA FOR LEAD SUMMARY */}
      <div className="bg-white border-b border-slate-200 shadow-sm shrink-0">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/salesperson/leads')}
              className="mt-1 flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors font-medium text-[13px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Leads
            </button>
          </div>

        </div>

        <div className="px-6 pb-4 flex flex-col xl:flex-row xl:items-end justify-between gap-4">
          {/* Left Side: Avatar & Details */}
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 font-bold text-2xl flex items-center justify-center shrink-0 shadow-sm">
              {initial}
            </div>

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 leading-none">{lead.name}</h1>
                <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-sm uppercase tracking-wide", getPriorityBadge(priority))}>
                  {priority} Priority
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[13px] text-slate-600 font-medium">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {typeof lead.location === 'string' ? lead.location : (lead.location?.locality || lead.location?.city || 'Unknown')}</span>
                <span className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5 text-slate-400" /> {budget}</span>
                <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-slate-400" /> {propertyType}</span>
                {bhk !== 'N/A' && <span className="flex items-center gap-1.5"><Home className="w-3.5 h-3.5 text-slate-400" /> {bhk}</span>}
                <span className="flex items-center gap-1.5 bg-primary/5 border border-primary/10 text-primary px-2.5 py-0.5 rounded-md"><Clock className="w-3.5 h-3.5" /> {timeline}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Score & Actions */}
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center bg-orange-50 border border-orange-100 rounded-lg px-4 py-1.5 shadow-sm">
                <span className="text-2xl font-bold text-orange-600 leading-tight">{score}</span>
                <span className="text-[10px] font-bold text-orange-600/80 uppercase tracking-wider">Lead Score</span>
              </div>
              <Button className="bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 rounded-lg px-4 h-9 text-sm" onClick={handleComingSoon}>
                <Edit className="w-3.5 h-3.5 mr-2" /> Edit Lead
              </Button>
            </div>
            <div className="text-[12px] text-slate-500 font-medium">
              Created {dateFormatted} • {timeFormatted}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 flex items-center gap-8 border-t border-slate-100">
          {['Overview', 'Conversations', 'Activity'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "py-3 font-semibold text-[13px] border-b-[3px] transition-colors flex items-center gap-2",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              )}
            >
              {tab === 'Overview' && <Home className="w-3.5 h-3.5" />}
              {tab === 'Conversations' && <MessageSquare className="w-3.5 h-3.5" />}
              {tab === 'Activity' && <FileClock className="w-3.5 h-3.5" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 max-w-[1400px] mx-auto w-full flex-1">

        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* LEFT COLUMN: Lead Details & Message (4 cols) */}
            <div className="lg:col-span-4 flex flex-col gap-6">

              {/* Lead Details Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-base">
                    <FileText className="w-4 h-4 text-slate-400" /> Lead Details
                  </h3>
                  <button onClick={handleComingSoon} className="text-primary text-[13px] font-semibold hover:underline flex items-center gap-1">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
                <div className="p-5">
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <span className="text-[13px] text-slate-500 font-medium flex items-center gap-2"><User className="w-3.5 h-3.5 text-slate-400" /> Name</span>
                      <span className="text-[13px] text-slate-900 font-semibold col-span-2 text-right break-words">{lead.name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <span className="text-[13px] text-slate-500 font-medium flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> Phone</span>
                      <span className="text-[13px] text-slate-900 font-semibold col-span-2 text-right flex items-center justify-end gap-2">
                        {lead.phone || 'Not available'}
                        {lead.phone && (
                          <button onClick={handleComingSoon} className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                            <Phone className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-start">
                      <span className="text-[13px] text-slate-500 font-medium flex items-center gap-2 mt-0.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Location</span>
                      <span className="text-[13px] text-slate-900 font-semibold col-span-2 text-right break-words">{typeof lead.location === 'string' ? lead.location : (lead.location?.locality || 'Unknown')}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-start">
                      <span className="text-[13px] text-slate-500 font-medium flex items-center gap-2 mt-0.5"><Clock className="w-3.5 h-3.5 text-slate-400" /> Budget</span>
                      <span className="text-[13px] text-slate-900 font-semibold col-span-2 text-right break-words">{budget}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <span className="text-[13px] text-slate-500 font-medium flex items-center gap-2"><Building className="w-3.5 h-3.5 text-slate-400" /> Property</span>
                      <span className="text-[13px] text-slate-900 font-semibold col-span-2 text-right">{propertyType}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <span className="text-[13px] text-slate-500 font-medium flex items-center gap-2"><Home className="w-3.5 h-3.5 text-slate-400" /> BHK</span>
                      <span className="text-[13px] text-slate-900 font-semibold col-span-2 text-right">{bhk !== 'N/A' ? bhk : requirement}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <span className="text-[13px] text-slate-500 font-medium flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-slate-400" /> Purpose</span>
                      <span className="text-[13px] text-slate-900 font-semibold col-span-2 text-right">{purpose}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-center">
                      <span className="text-[13px] text-slate-500 font-medium flex items-center gap-2"><CreditCard className="w-3.5 h-3.5 text-slate-400" /> Financing</span>
                      <span className="text-[13px] text-slate-900 font-semibold col-span-2 text-right">{financing}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 items-start">
                      <span className="text-[13px] text-slate-500 font-medium flex items-center gap-2 mt-0.5"><CalendarDays className="w-3.5 h-3.5 text-slate-400" /> Timeline</span>
                      <span className="text-[13px] text-slate-900 font-semibold col-span-2 text-right">{timeline}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Message Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
                <div className="px-5 py-3.5 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-base">
                    <MessageSquare className="w-4 h-4 text-slate-400" /> Customer Inquiry
                  </h3>
                </div>
                <div className="p-5">
                  <div className="text-[11px] text-slate-400 font-medium mb-3">Received {dateFormatted} • {timeFormatted}</div>
                  <div className="bg-primary/5 rounded-lg p-4 text-[14px] text-primary/90 leading-snug italic border border-primary/10 relative">
                    <div className="absolute top-1 left-2 text-primary/20 text-3xl font-serif leading-none">"</div>
                    <div className="relative z-10 px-1 pt-1 font-medium break-words whitespace-pre-wrap">{lead.customer_message || "No message provided."}</div>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Priority & AI Analysis (8 cols) */}
            <div className="lg:col-span-8 flex flex-col gap-6">

              {/* Lead Priority & Reason Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0">
                <div className="px-5 py-3.5 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-base">
                    <FileText className="w-4 h-4 text-slate-400" /> Lead Priority & Reason
                  </h3>
                </div>
                <div className="p-5">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Score Circle */}
                    <div className="relative shrink-0 flex items-center justify-center w-20 h-20 rounded-full border-[6px] border-rose-500 shadow-sm bg-white">
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-slate-900 leading-none">{score}</span>
                        <span className="text-[10px] text-slate-500 font-bold mt-0.5 uppercase tracking-wider">Score</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 flex-1 mt-1">
                      <span className={cn("inline-flex w-fit px-3 py-1 rounded-full text-[12px] font-bold border uppercase tracking-wide shadow-sm", getPriorityBadge(priority))}>
                        🔥 {priority} Priority
                      </span>
                      <p className="text-[14px] text-slate-700 leading-snug font-medium">
                        {priorityReason}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* AI Analysis Card - PRIMARY CONTENT */}
              <div className="bg-white rounded-xl border border-primary/20 shadow-sm overflow-hidden flex flex-col shrink-0 relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[80px] -z-10 pointer-events-none transform translate-x-1/3 -translate-y-1/4"></div>

                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-sm">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2.5 text-base">
                    <Sparkles className="w-5 h-5 text-primary" /> AI Analysis Report
                  </h3>
                  <div className="flex items-center gap-3">
                    {lead.ai_analysis && <span className="text-[12px] text-slate-400 font-medium">Generated {dateFormatted}</span>}
                    {!lead.ai_analysis && (
                      <Button
                        onClick={handleAnalyzeLead}
                        disabled={analyzing}
                        className="bg-primary hover:bg-primary/90 text-white rounded-lg shadow-sm h-8 px-4 text-sm font-semibold"
                      >
                        {analyzing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Analyzing...
                          </>
                        ) : "Generate Analysis"}
                      </Button>
                    )}
                  </div>
                </div>

                {!lead.ai_analysis ? (
                  <div className="flex flex-col items-center justify-center p-16 text-center text-slate-400 bg-white/50">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-5 shadow-sm border border-slate-100">
                      <Sparkles className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-700 mb-2">No AI analysis available yet</h3>
                    <p className="text-[14px] max-w-md mx-auto text-slate-500 leading-snug">
                      Click generate to automatically analyze this lead's requirements, intent, and generate a suggested response based on the customer's inquiry.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 space-y-6 bg-white/50 backdrop-blur-sm">
                    {/* Executive Summary */}
                    <div className="flex flex-col md:flex-row gap-5 items-start">
                      <div className="md:w-[30%] shrink-0 flex items-center gap-2.5 text-[14px] font-semibold text-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 shadow-sm">
                          <FileText className="w-4 h-4 text-primary" />
                        </div>
                        Executive Summary
                      </div>
                      <div className="md:w-[70%] text-[14px] text-slate-700 leading-snug font-medium mt-1 break-words whitespace-pre-wrap">
                        {summary}
                      </div>
                    </div>
                    <div className="h-px bg-slate-100 w-full" />

                    {/* Purchase Intent */}
                    <div className="flex flex-col md:flex-row gap-5 items-start">
                      <div className="md:w-[30%] shrink-0 flex items-center gap-2.5 text-[14px] font-semibold text-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 shadow-sm">
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        Purchase Intent
                      </div>
                      <div className="md:w-[70%] text-[14px] text-slate-800 leading-snug font-bold mt-1 break-words whitespace-pre-wrap">
                        {intent}
                      </div>
                    </div>
                    <div className="h-px bg-slate-100 w-full" />

                    {/* Requirements */}
                    <div className="flex flex-col md:flex-row gap-5 items-start">
                      <div className="md:w-[30%] shrink-0 flex items-center gap-2.5 text-[14px] font-semibold text-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100 shadow-sm">
                          <Home className="w-4 h-4 text-purple-600" />
                        </div>
                        Requirements
                      </div>
                      <div className="md:w-[70%] text-[14px] text-slate-700 leading-snug font-medium mt-1 break-words whitespace-pre-wrap">
                        {requirement}
                      </div>
                    </div>
                    <div className="h-px bg-slate-100 w-full" />

                    {/* Concerns */}
                    <div className="flex flex-col md:flex-row gap-5 items-start">
                      <div className="md:w-[30%] shrink-0 flex items-center gap-2.5 text-[14px] font-semibold text-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 border border-red-100 shadow-sm">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        </div>
                        Concerns
                      </div>
                      <div className="md:w-[70%] text-[14px] text-slate-700 leading-snug font-medium mt-1 break-words whitespace-pre-wrap">
                        {concerns.length > 0 ? concerns.join(', ') : 'None detected'}
                      </div>
                    </div>
                    <div className="h-px bg-slate-100 w-full" />

                    {/* Next Action */}
                    <div className="flex flex-col md:flex-row gap-5 items-start">
                      <div className="md:w-[30%] shrink-0 flex items-center gap-2.5 text-[14px] font-semibold text-slate-800">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 border border-orange-100 shadow-sm">
                          <FileText className="w-4 h-4 text-orange-600" />
                        </div>
                        Next Action
                      </div>
                      <div className="md:w-[70%] text-[14px] text-slate-800 font-bold leading-snug mt-1 break-words whitespace-pre-wrap">
                        {nextAction}
                      </div>
                    </div>
                    <div className="h-px bg-slate-100 w-full" />

                    {/* Suggested Response */}
                    <div className="flex flex-col md:flex-row gap-5 items-start bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 shadow-sm">
                      <div className="md:w-[30%] shrink-0 flex items-center gap-2.5 text-[14px] font-semibold text-emerald-900">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200 shadow-sm">
                          <MessageSquare className="w-4 h-4 text-emerald-700" />
                        </div>
                        Suggested Response
                      </div>
                      <div className="md:w-[70%] relative mt-1">
                        <p className="text-[14px] text-emerald-900 leading-snug pr-10 font-medium italic break-words whitespace-pre-wrap">"{suggestedResponse}"</p>
                        <button className="absolute -top-1 -right-1 p-2 rounded-lg hover:bg-emerald-100 text-emerald-700 transition-colors bg-white border border-emerald-200/50 shadow-sm" title="Copy response">
                          <FileText className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* CONVERSATIONS TAB */}
        {activeTab === 'Conversations' && (
          <div className="h-[calc(100vh-280px)] min-h-[600px] flex flex-col max-w-5xl mx-auto">
            {/* Chat specific header wrapper */}
            <div className="bg-white px-6 py-4 border border-slate-200 border-b-0 rounded-t-xl flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex flex-col gap-1.5">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-base">
                  <MessageSquare className="w-4 h-4 text-primary" /> AI Chat for this Lead
                </h3>
                <div className="flex items-center gap-2.5">
                  <span className="text-[14px] font-bold text-slate-700">{lead.name}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-[13px] text-slate-600 font-medium">{requirement}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider", getPriorityBadge(priority))}>
                    {priority} PRIORITY
                  </span>
                </div>
              </div>
              <Button variant="outline" className="border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 h-9 px-4 rounded-lg text-sm shadow-sm" onClick={handleComingSoon}>
                <Clock className="w-3.5 h-3.5 mr-2 text-slate-500" /> New Chat
              </Button>
            </div>

            {/* The existing AIChat component mapped tightly */}
            <div className="flex-1 rounded-b-2xl border border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col relative [&>div]:border-none [&>div]:shadow-none [&>div>div:first-child]:hidden">
              <AIChat
                isOpen={true}
                onClose={() => { }}
                mode="lead"
                lead={chatLeadData}
                inline={true}
              />
            </div>
          </div>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === 'Activity' && (
          <div className="flex flex-col items-center justify-center h-[500px] bg-white rounded-2xl border border-slate-200 shadow-sm text-center p-8 max-w-5xl mx-auto">
            <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-6 border border-primary/10">
              <FileClock className="w-12 h-12 text-primary/40" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Activity Coming Soon</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
              Lead activity tracking is coming soon. Future capabilities will include calls, site visits, follow-ups, status changes, notes, and timeline events.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

