import { useEffect, useState } from 'react';
import { Users, AlertCircle, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { leadsApi } from '../../services/leadsApi';

export function SalespersonDashboard() {
  const [leads, setLeads] = useState<any[]>([]);

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

  const totalLeads = leads.length;
  
  const getNormalizedPriority = (lead: any) => {
    return String(lead.ai_analysis?.priority || lead.priority || '').trim().toLowerCase();
  };

  const highPriority = leads.filter(l => getNormalizedPriority(l) === 'high').length;
  const mediumPriority = leads.filter(l => getNormalizedPriority(l) === 'medium').length;

  const isUnderThreeMonths = (timelineRaw: any) => {
    const t = String(timelineRaw || '').trim().toLowerCase();
    if (!t) return false;
    
    // Explicit cases mentioned by the user
    if (t === 'immediate') return true;
    if (t === 'within 1 month') return true;
    if (t === 'within 2 months') return true;
    if (t === '1 month') return true;
    if (t === '2 months') return true;
    if (t === '1') return true;
    if (t === '2') return true;
    if (t.includes('urgent')) return true; // keep existing logic safely
    
    // Explicit exclusions
    if (t === 'within 3 months' || t === 'with in 3 months' || t === '3 months' || t === '3' || t.includes('3-6') || t.includes('6+')) return false;
    
    // Regex fallback to check if a single number < 3 appears before month
    const match = t.match(/(\d+)\s*month/);
    if (match) {
      const months = parseInt(match[1], 10);
      return months < 3;
    }
    
    return false;
  };

  const urgentTimeline = leads.filter(l => isUnderThreeMonths(l.buying_timeline || l.buyingTimeline)).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Sales Dashboard</h1>
        <p className="text-text-secondary">Overview of your pipeline and AI insights.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-surface/50 border-border/50 hover:bg-surface transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Total Leads</p>
              <h3 className="text-3xl font-bold text-white mt-2">{totalLeads}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+12% this week</span>
          </div>
        </Card>

        <Card className="p-6 bg-surface/50 border-border/50 hover:bg-surface transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">High Priority</p>
              <h3 className="text-3xl font-bold text-white mt-2">{highPriority}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-orange-400">
            <span>Requires immediate action</span>
          </div>
        </Card>

        <Card className="p-6 bg-surface/50 border-border/50 hover:bg-surface transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Medium Priority</p>
              <h3 className="text-3xl font-bold text-white mt-2">{mediumPriority}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-text-secondary">
            <span>Follow up scheduled</span>
          </div>
        </Card>

        <Card className="p-6 bg-surface/50 border-border/50 hover:bg-surface transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-text-secondary">Urgent Timeline</p>
              <h3 className="text-3xl font-bold text-white mt-2">{urgentTimeline}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-text-secondary">
            <span>Hot leads</span>
          </div>
        </Card>
      </div>

      {/* Recent Activity or AI Insights summary could go here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-primary"></div>
              <p className="text-sm text-text-secondary leading-relaxed">
                <strong className="text-white">Rahul Sharma</strong> is showing high engagement. Suggested action: Schedule property tour for this weekend.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-orange-400"></div>
              <p className="text-sm text-text-secondary leading-relaxed">
                <strong className="text-white">Amit Patel</strong> has an urgent timeline. He needs commercial space options by tomorrow.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-yellow-400"></div>
              <p className="text-sm text-text-secondary leading-relaxed">
                3 leads in your pipeline have requested Vastu-compliant properties. Consider compiling a curated list to send out.
              </p>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
