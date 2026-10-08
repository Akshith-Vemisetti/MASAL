import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, LayoutDashboard, Send, History, Search, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../lib/utils';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [toastMessage, setToastMessage] = useState('');
  const [isSidebarDropdownOpen, setIsSidebarDropdownOpen] = useState(false);
  const [isHeaderDropdownOpen, setIsHeaderDropdownOpen] = useState(false);
  
  const sidebarDropdownRef = useRef<HTMLDivElement>(null);
  const headerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarDropdownRef.current && !sidebarDropdownRef.current.contains(event.target as Node)) {
        setIsSidebarDropdownOpen(false);
      }
      if (headerDropdownRef.current && !headerDropdownRef.current.contains(event.target as Node)) {
        setIsHeaderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setToastMessage(customEvent.detail);
      setTimeout(() => setToastMessage(''), 3000);
    };
    window.addEventListener('show-toast', handleToast);

    return () => {
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
    { name: 'Dashboard', path: '/customer', icon: LayoutDashboard },
    { name: 'My Inquiries', path: '/customer/inquiries', icon: History },
    { name: 'Submit Inquiry', path: '/customer/submit', icon: Send },
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
      <aside className="w-[260px] bg-[#0A0B14] flex flex-col justify-between flex-shrink-0 text-white h-screen sticky top-0 overflow-y-auto hidden md:flex">
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
          </nav>
        </div>

        {/* User Profile Footer */}
        <div className="relative" ref={sidebarDropdownRef}>
          <div 
            className="p-4 m-4 bg-white/5 rounded-2xl flex items-center justify-between hover:bg-white/10 transition-colors cursor-pointer" 
            onClick={() => setIsSidebarDropdownOpen(!isSidebarDropdownOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6b21a8] to-[#4c1d95] flex items-center justify-center font-bold text-white shadow-inner">
                {user?.name?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white truncate max-w-[100px]">{user?.name || 'Customer'}</span>
                <span className="text-xs text-gray-400 capitalize">{user?.role || 'Customer'}</span>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isSidebarDropdownOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isSidebarDropdownOpen && (
            <div className="absolute bottom-[calc(100%-1rem)] left-4 right-4 mb-2 bg-[#1a1e2d] border border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-800">
                <p className="text-sm font-semibold text-white truncate">{user?.name || 'Customer'}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.email || 'customer@example.com'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 transition-colors font-medium flex items-center gap-2"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-[80px] px-8 flex items-center justify-between flex-shrink-0 bg-transparent">
          {/* Mobile Menu Toggle (Simplified for now, visible only on small screens if needed) */}
          <div className="md:hidden flex items-center gap-4">
             <Building2 className="w-6 h-6 text-primary" />
             <span className="text-lg font-bold">MASAL</span>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search properties, locations, or keywords..." 
              className="w-full bg-white border-0 shadow-sm rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 text-gray-800 font-medium placeholder:text-gray-400 placeholder:font-normal"
            />
          </div>

          {/* Right Header Items */}
          <div className="flex items-center gap-6 ml-auto">
            <button onClick={handleComingSoon} className="relative text-gray-400 hover:text-gray-600 transition-colors p-2 bg-white rounded-full shadow-sm">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="relative" ref={headerDropdownRef}>
              <div 
                className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-gray-100 rounded-full transition-colors pr-3" 
                onClick={() => setIsHeaderDropdownOpen(!isHeaderDropdownOpen)}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6b21a8] to-[#4c1d95] flex items-center justify-center text-white font-bold shadow-sm">
                   {user?.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-bold text-gray-900">{user?.name || 'Customer'}</span>
                  <span className="text-[11px] text-gray-500 font-medium capitalize">{user?.role || 'Customer'}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isHeaderDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isHeaderDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Customer'}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email || 'customer@example.com'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium flex items-center gap-2"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Nav Header below top bar */}
        <div className="md:hidden border-b border-gray-200 bg-white px-4 py-3 flex overflow-x-auto gap-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 text-sm font-medium transition-colors whitespace-nowrap px-3 py-1.5 rounded-full ${
                  isActive ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Dashboard Content */}
        <main className="flex-1 px-4 sm:px-8 pb-10 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
