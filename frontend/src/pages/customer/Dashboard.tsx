import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CustomerLayout } from '../../layouts/CustomerLayout';
import { Link } from 'react-router-dom';
import { Send, History, ArrowRight } from 'lucide-react';

export function CustomerDashboard() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting('Good morning');
      else if (hour >= 12 && hour < 17) setGreeting('Good afternoon');
      else if (hour >= 17 && hour < 21) setGreeting('Good evening');
      else setGreeting('Good night');
    };
    
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <CustomerLayout>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative rounded-2xl overflow-hidden bg-[#1a1e2d] text-white p-8 md:p-12 shadow-lg min-h-[240px] flex items-center">
          {/* Optional background overlay/image effect */}
          <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: 'url("/demo-building.jpg")' }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0B14] via-[#0A0B14]/80 to-transparent"></div>
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-xl md:text-2xl text-gray-300 font-medium mb-2">{greeting},</h2>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              {user?.name} 👋
            </h1>
            <p className="text-gray-400 text-lg">
              Find your perfect property. Submit a new inquiry or check the status of your existing inquiries.
            </p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          
          {/* Submit Inquiry Card */}
          <div className="bg-purple-50/50 rounded-2xl p-8 border border-purple-100 hover:border-purple-200 transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <Send className="w-64 h-64 text-purple-600" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
                <Send className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Submit New Inquiry</h3>
                <p className="text-gray-600 max-w-sm">
                  Tell us your property requirements and let our team help you find the best options.
                </p>
              </div>
              <Link 
                to="/customer/submit"
                className="inline-flex items-center justify-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-6 py-3 rounded-xl font-medium transition-all shadow-md shadow-purple-200"
              >
                <Send className="w-4 h-4" />
                Submit New Inquiry
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* View Inquiries Card */}
          <div className="bg-blue-50/50 rounded-2xl p-8 border border-blue-100 hover:border-blue-200 transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <History className="w-64 h-64 text-blue-600" />
            </div>
            
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                <History className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">View My Inquiries</h3>
                <p className="text-gray-600 max-w-sm">
                  Track the status of your inquiries and see responses from our team.
                </p>
              </div>
              <Link 
                to="/customer/inquiries"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 px-6 py-3 rounded-xl font-medium transition-all shadow-sm"
              >
                <History className="w-4 h-4" />
                View My Inquiries
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </CustomerLayout>
  );
}
