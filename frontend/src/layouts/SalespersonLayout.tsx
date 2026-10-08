import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, LayoutDashboard, Users, Sparkles, Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AIChat } from '../components/salesperson/AIChat';
import { showToast } from '../lib/utils';

interface SalespersonLayoutProps {
  children: React.ReactNode;
}

export function SalespersonLayout({ children }: SalespersonLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  React.useEffect(() => {
    const handleOpenChat = () => setIsGlobalChatOpen(true);
    window.addEventListener('open-global-chat', handleOpenChat);

    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setToastMessage(customEvent.detail);
      setTimeout(() => setToastMessage(''), 3000);
    };
    window.addEventListener('show-toast', handleToast);

    return () => {
      window.removeEventListener('open-global-chat', handleOpenChat);
      window.removeEventListener('show-toast', handleToast);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleComingSoon = () => {
    showToast('Coming Soon');
  };

  const navItems = [
    { name: 'Dashboard', path: '/salesperson', icon: LayoutDashboard },
    { name: 'Lead Management', path: '/salesperson/leads', icon: Users },
    { name: 'Inventory', path: '/salesperson/inventory', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex font-sans">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl font-medium transition-all duration-300">
          {toastMessage}
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-[260px] bg-[#0A0B14] flex flex-col justify-between flex-shrink-0 text-white h-screen sticky top-0 overflow-y-auto">
        <div>
          {/* Logo */}
          <div className="px-6 py-8 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-[#E2B75A]" />
            <span className="text-xl font-bold tracking-wider">MASAL</span>
          </div>

          {/* Navigation */}
          <nav className="mt-4 flex flex-col gap-1 px-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-[15px] font-medium ${
                    isActive
                      ? 'bg-gradient-to-r from-[#6b21a8] to-[#4c1d95] text-white shadow-lg shadow-purple-900/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            
            <button
              onClick={() => setIsGlobalChatOpen(true)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-[15px] font-medium text-gray-400 hover:text-white hover:bg-white/5 w-full text-left"
            >
              <Sparkles className="w-5 h-5" />
              AI Assistant
            </button>
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="p-4 m-4 bg-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer" onClick={handleLogout}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6b21a8] to-[#4c1d95] flex items-center justify-center font-bold text-white shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-white truncate max-w-[100px]">{user?.name || 'Sarah Jenkins'}</span>
              <span className="text-xs text-gray-400">{user?.role || 'Salesperson'}</span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-[80px] px-8 flex items-center justify-between flex-shrink-0 bg-transparent">
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search leads, properties, locations..." 
              className="w-full bg-white border-0 shadow-sm rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-800 font-medium placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>

          {/* Right Header Items */}
          <div className="flex items-center gap-6">
            <button onClick={handleComingSoon} className="relative text-gray-400 hover:text-gray-600 transition-colors p-2 bg-white rounded-full shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer">
              <img src="/demo-building.jpg" alt="Profile" className="w-9 h-9 rounded-full object-cover shadow-sm" onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }} />
              <div className="hidden w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                 {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-gray-900">{user?.name || 'Sarah Jenkins'}</span>
                <span className="text-[11px] text-gray-500 font-medium capitalize">{user?.role || 'Salesperson'}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 px-8 pb-10 overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Floating AI Button (Global) */}
      <button
        onClick={() => setIsGlobalChatOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#8b5cf6] to-[#581c87] text-white rounded-full shadow-[0_8px_30px_rgba(107,33,168,0.3)] hover:shadow-[0_12px_40px_rgba(107,33,168,0.5)] transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95 group border border-purple-300/30"
      >
        <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
      </button>

      {/* Global AI Chat Drawer */}
      {/* We will redesign the AIChat component's floating ui to match the rounded design later or inside the component if needed. */}
      <AIChat 
        isOpen={isGlobalChatOpen} 
        onClose={() => setIsGlobalChatOpen(false)} 
        mode="global" 
      />
    </div>
  );
}
