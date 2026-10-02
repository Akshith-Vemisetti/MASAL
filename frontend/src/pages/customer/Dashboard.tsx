import { useAuth } from '../../context/AuthContext';
import { CustomerLayout } from '../../layouts/CustomerLayout';
import { Link } from 'react-router-dom';
import { Send, History } from 'lucide-react';

export function CustomerDashboard() {
  const { user } = useAuth();

  return (
    <CustomerLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="max-w-2xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
              Hi, {user?.name} 👋
            </h1>
            <p className="text-text-secondary text-lg md:text-xl leading-relaxed">
              Welcome to MASAL. Tell us what you're looking for and we'll help connect your requirement with the right opportunities.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link 
              to="/customer/submit"
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-all hover:scale-105"
            >
              <Send className="w-5 h-5" />
              Submit New Inquiry
            </Link>
            <Link 
              to="/customer/inquiries"
              className="flex items-center gap-2 bg-surface hover:bg-surface/80 border border-border text-white px-8 py-3 rounded-lg font-medium transition-all hover:scale-105"
            >
              <History className="w-5 h-5 text-primary" />
              View My Inquiries
            </Link>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
