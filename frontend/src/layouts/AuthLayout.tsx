import React from 'react';
import { Building2 } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Left side - Branding (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-surface border-r border-border relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">MASAL</span>
          </div>

          <div className="space-y-6 max-w-lg">
            <h1 className="text-4xl font-semibold leading-tight text-white">
              AI-powered real-estate<br />
              <span className="text-primary">lead intelligence.</span>
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              Turn customer inquiries into actionable sales opportunities.
              Manage your pipeline smarter, not harder.
            </p>
          </div>

          <div className="mt-16 space-y-4">
            <div className="flex items-center gap-3 text-text-secondary">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Intelligent lead analysis</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>AI-powered sales assistance</span>
            </div>
            <div className="flex items-center gap-3 text-text-secondary">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Faster lead prioritization</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-text-secondary">
          &copy; {new Date().getFullYear()} MASAL Inc. All rights reserved.
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile branding */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">MASAL</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
