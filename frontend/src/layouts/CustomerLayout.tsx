import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, LogOut, LayoutDashboard, Send, History, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/customer', icon: LayoutDashboard },
    { name: 'My Inquiries', path: '/customer/inquiries', icon: History },
    { name: 'Submit Inquiry', path: '/customer/submit', icon: Send },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-8">
            <Link to="/customer" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">MASAL</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive ? 'text-primary' : 'text-text-secondary'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-text-secondary">
              <UserCircle className="w-5 h-5" />
              <span>{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className="md:hidden border-b border-border bg-surface px-4 py-3 flex overflow-x-auto gap-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 text-sm font-medium transition-colors whitespace-nowrap px-3 py-1.5 rounded-full ${
                isActive ? 'bg-primary/10 text-primary' : 'text-text-secondary hover:text-primary'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
