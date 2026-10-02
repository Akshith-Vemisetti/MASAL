import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CustomerLayout } from '../../layouts/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { FileText, Clock, CheckCircle } from 'lucide-react';

export function CustomerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });

  useEffect(() => {
    // Load mock data
    const inquiries = JSON.parse(localStorage.getItem('masal_inquiries') || '[]');
    const userInquiries = inquiries.filter((i: any) => i.userId === user?.id);
    
    setStats({
      total: userInquiries.length,
      active: userInquiries.filter((i: any) => i.status !== 'Completed').length,
      completed: userInquiries.filter((i: any) => i.status === 'Completed').length,
    });
  }, [user]);

  return (
    <CustomerLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Hi, {user?.name} 👋
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl">
            Welcome to MASAL. Tell us what you're looking for and we'll help connect your requirement with the right opportunities.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-surface border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">Total Submissions</CardTitle>
              <FileText className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-surface border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">Active Inquiries</CardTitle>
              <Clock className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="bg-surface border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-secondary">Completed</CardTitle>
              <CheckCircle className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Future expansion area */}
        <Card className="bg-surface border-border mt-8">
          <CardHeader>
            <CardTitle className="text-xl text-white">Recent Activity</CardTitle>
            <CardDescription>Your latest interactions and updates.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.total === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                No inquiries submitted yet. Go to "Submit Inquiry" to get started.
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">
                Recent inquiries will appear here when connected to the backend.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
