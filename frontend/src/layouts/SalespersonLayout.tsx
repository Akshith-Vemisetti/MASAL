import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, LogOut, LayoutDashboard, Users, UserCircle, Bot } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AIChat } from '../components/salesperson/AIChat';

interface SalespersonLayoutProps {
  children: React.ReactNode;
}

export function SalespersonLayout({ children }: SalespersonLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/salesperson', icon: LayoutDashboard },
    { name: 'Lead Management', path: '/salesperson/leads', icon: Users },
    { name: 'Inventory', path: '/salesperson/inventory', icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-8">
            <Link to="/salesperson" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Building2 className="text-white w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">MASAL Sales</span>
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
            <div className="hidden sm:flex items-center gap-3 text-sm">
              <div className="flex flex-col items-end">
                <span className="text-white font-medium">{user?.name}</span>
                <span className="text-xs text-text-secondary capitalize">{user?.role}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <UserCircle className="w-5 h-5 text-primary" />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-white transition-colors ml-4 pl-4 border-l border-border"
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

      {/* Global AI Assistant Button */}
      <button
        onClick={() => setIsGlobalChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
      >
        <Bot className="w-5 h-5" />
        <span className="font-medium">AI Assistant</span>
      </button>

      {/* Global AI Chat Drawer */}
      <AIChat 
        isOpen={isGlobalChatOpen} 
        onClose={() => setIsGlobalChatOpen(false)} 
        mode="global" 
      />
    </div>
  );
}
