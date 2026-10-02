import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CustomerLayout } from '../../layouts/CustomerLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { leadsApi } from '../../services/leadsApi';

export function InquiriesList() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);

  useEffect(() => {
    const fetchInquiries = async () => {
      if (!user?.id) return;
      try {
        const userInquiries = await leadsApi.getMyLeads(user.id);
        setInquiries(userInquiries);
      } catch (err) {
        console.error('Failed to fetch inquiries:', err);
      }
    };
    fetchInquiries();
  }, [user]);

  const formatDate = (isoString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(isoString));
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Inquiries</h1>
            <p className="text-text-secondary">View and track your submitted property requirements.</p>
          </div>
          <Link to="/customer/submit">
            <Button>Submit New Inquiry</Button>
          </Link>
        </div>

        {inquiries.length === 0 ? (
          <Card className="bg-surface border-border">
            <CardContent className="py-16 text-center">
              <div className="text-text-secondary mb-4">You haven't submitted any inquiries yet.</div>
              <Link to="/customer/submit">
                <Button variant="outline">Submit Inquiry</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <Card key={inquiry.id} className="bg-surface border-border transition-colors hover:border-primary/50">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-white">{inquiry.property_requirement}</h3>
                      <div className="text-sm text-text-secondary flex flex-wrap gap-x-4 gap-y-1">
                        <span>📍 {inquiry.location}</span>
                        <span>💰 {inquiry.budget}</span>
                        <span>⏱️ {inquiry.buying_timeline}</span>
                        {(inquiry.property_type || inquiry.propertyType) && <span>🏢 {inquiry.property_type || inquiry.propertyType}</span>}
                        {(inquiry.bhk_or_size || inquiry.bhkOrSize) && <span>📐 {inquiry.bhk_or_size || inquiry.bhkOrSize}</span>}
                        {inquiry.purpose && <span>🎯 {inquiry.purpose}</span>}
                        {inquiry.financing && <span>🏦 {inquiry.financing}</span>}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2">
                      <div className="text-sm text-text-secondary">
                        {formatDate(inquiry.created_at)}
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        inquiry.status === 'Completed' 
                          ? 'bg-green-500/10 text-green-500' 
                          : inquiry.status === 'In Progress'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {inquiry.status || 'Pending'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
