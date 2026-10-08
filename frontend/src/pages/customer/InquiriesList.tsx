import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CustomerLayout } from '../../layouts/CustomerLayout';
import { Button } from '../../components/ui/button';
import { leadsApi } from '../../services/leadsApi';
import { MapPin, IndianRupee, Clock, Building, Maximize, Target, Landmark, Send, Calendar, History } from 'lucide-react';

export function InquiriesList() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        const userInquiries = await leadsApi.getMyLeads(user.id);
        setInquiries(userInquiries);
      } catch (err) {
        console.error('Failed to fetch inquiries:', err);
      } finally {
        setIsLoading(false);
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
        {/* Header Section */}
        <div className="relative rounded-2xl overflow-hidden bg-[#1a1e2d] text-white p-6 md:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0B14] via-[#0A0B14]/80 to-transparent"></div>
          {/* Abstract decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#8b5cf6]/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
          
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5">My Inquiries</h1>
            <p className="text-gray-400 text-sm max-w-md">View and track your submitted property requirements.</p>
          </div>
          <Link to="/customer/submit" className="relative z-10">
            <Button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-xl flex items-center gap-2 px-5 py-4 text-sm shadow-lg shadow-purple-500/20">
              <Send className="w-4 h-4" />
              Submit New Inquiry
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#8b5cf6]"></div>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-12 text-center">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1.5">No Inquiries Found</h3>
            <p className="text-gray-500 text-sm mb-5 max-w-sm mx-auto">You haven't submitted any property inquiries yet. Let us know what you are looking for.</p>
            <Link to="/customer/submit">
              <Button className="bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg px-6 text-sm">Submit Inquiry</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5 transition-all duration-300 group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    
                    {/* Title and Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h3 className="text-[17px] font-bold text-gray-900 group-hover:text-[#8b5cf6] transition-colors">
                        {inquiry.property_requirement || 'Property Requirement Not Specified'}
                      </h3>
                      <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide whitespace-nowrap ${
                        inquiry.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20' 
                        : inquiry.status === 'In Progress' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-500/20' 
                        : 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                          inquiry.status === 'Completed' ? 'bg-emerald-500' 
                          : inquiry.status === 'In Progress' ? 'bg-blue-500' 
                          : 'bg-amber-500'
                        }`} />
                        {inquiry.status || 'Pending'}
                      </div>
                    </div>
                    
                    {/* Primary Highlight Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-[11px] font-semibold">
                        <MapPin className="w-3 h-3" />
                        <span>{inquiry.location || 'Location Not Specified'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md text-[11px] font-semibold">
                        <IndianRupee className="w-3 h-3" />
                        <span>{inquiry.budget || 'Budget Not Specified'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[11px] font-semibold">
                        <Clock className="w-3 h-3" />
                        <span>{inquiry.buying_timeline || 'Timeline Not Specified'}</span>
                      </div>
                    </div>
                    
                    {/* Secondary Details */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 p-2.5 bg-gray-50/80 rounded-lg border border-gray-100">
                      {(inquiry.property_type || inquiry.propertyType) && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Property Type</span>
                          <div className="flex items-center gap-1.5 text-gray-800 font-medium text-[11px]">
                            <Building className="w-3 h-3 text-purple-400" />
                            <span>{inquiry.property_type || inquiry.propertyType}</span>
                          </div>
                        </div>
                      )}
                      {(inquiry.bhk_or_size || inquiry.bhkOrSize) && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Size/Config</span>
                          <div className="flex items-center gap-1.5 text-gray-800 font-medium text-[11px]">
                            <Maximize className="w-3 h-3 text-emerald-400" />
                            <span>{inquiry.bhk_or_size || inquiry.bhkOrSize}</span>
                          </div>
                        </div>
                      )}
                      {inquiry.purpose && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Purpose</span>
                          <div className="flex items-center gap-1.5 text-gray-800 font-medium text-[11px]">
                            <Target className="w-3 h-3 text-blue-400" />
                            <span>{inquiry.purpose}</span>
                          </div>
                        </div>
                      )}
                      {inquiry.financing && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Financing</span>
                          <div className="flex items-center gap-1.5 text-gray-800 font-medium text-[11px]">
                            <Landmark className="w-3 h-3 text-amber-400" />
                            <span>{inquiry.financing}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Timestamp Right side */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 md:pl-4 md:border-l min-w-[100px] h-full">
                    <div className="flex flex-col md:items-end gap-0.5">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Submitted</span>
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-700">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        {formatDate(inquiry.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
