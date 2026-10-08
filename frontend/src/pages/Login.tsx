import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authApi } from '../services/authApi';
import { Building2, BarChart3, MessageSquare, Zap, Eye, EyeOff, Mail, Lock, ArrowRight, User } from 'lucide-react';

export function Login() {
  const [isRegistering, setIsRegistering] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'salesperson' ? '/salesperson' : '/customer', { replace: true });
    }
  }, [user, navigate]);

  const handleComingSoon = (e: React.MouseEvent) => {
    e.preventDefault();
    setToastMessage('Coming Soon');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setIsLoading(true);
      try {
        const user = await authApi.register({ name, email, password });
        register(user);
        navigate('/customer'); // Default to customer on registration
      } catch (err: any) {
        setError(err.message || 'Failed to create account.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Login Logic
      if (!email || !password) {
        setError('Please fill in all fields');
        return;
      }

      setIsLoading(true);
      try {
        const user = await authApi.login({ email, password });
        login(user);

        if (user.role === 'salesperson') {
          navigate('/salesperson');
        } else {
          navigate('/customer');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to sign in. Please check your credentials.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-8 overflow-hidden bg-[#0A0B14]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl font-medium transition-all duration-300">
          {toastMessage}
        </div>
      )}

      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/login-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a14]/95 via-[#0a0a14]/70 to-[#0a0a14]/40"></div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-[1300px] flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 mx-auto">
        
        {/* Left Hero Area */}
        <div className="flex-1 max-w-xl text-white space-y-8 pb-8 lg:pb-0">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-4 lg:mb-10">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Building2 className="text-white w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight leading-none text-white">MASAL</div>
              <div className="text-[10px] text-white/70 tracking-widest uppercase mt-1.5 font-medium">Real Estate. Smarter With AI.</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold tracking-widest uppercase text-white/80">
              Turn Inquiries Into Opportunities
            </div>
            <h1 className="text-5xl lg:text-[64px] font-bold leading-[1.1] tracking-tight text-white">
              AI-powered <br/>
              real-estate <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#a78bfa] to-[#c084fc]">lead intelligence.</span>
            </h1>
            <p className="text-lg text-white/80 max-w-[420px] pt-3 leading-relaxed">
              Understand your leads better, respond smarter, and close deals faster with AI.
            </p>
          </div>

          {/* Feature blocks */}
          <div className="space-y-3 pt-6 max-w-[480px]">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 text-[#a78bfa]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Intelligent Lead Analysis</h3>
                <p className="text-sm text-white/70 mt-1 leading-snug">Understand intent, budget, and readiness with AI.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 text-[#a78bfa]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AI-Powered Sales Assistance</h3>
                <p className="text-sm text-white/70 mt-1 leading-snug">Get smart suggestions and replies in seconds.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 text-[#a78bfa]">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Faster Deal Closure</h3>
                <p className="text-sm text-white/70 mt-1 leading-snug">Focus on high-value opportunities that matter.</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="pt-6">
            <div className="inline-flex items-center justify-between gap-8 px-8 py-5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <div>
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-[11px] font-medium text-white/60 mt-1 uppercase tracking-wider">Leads Analyzed</div>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div>
                <div className="text-2xl font-bold text-white">3x</div>
                <div className="text-[11px] font-medium text-white/60 mt-1 uppercase tracking-wider">Faster Conversions</div>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div>
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-[11px] font-medium text-white/60 mt-1 uppercase tracking-wider">User Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Login/Register Card */}
        <div className="w-full max-w-[440px] flex-shrink-0">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[32px] p-8 sm:p-10 shadow-2xl border border-white/40">
            
            {/* Card inner top pills */}
            <div className="flex items-center justify-center gap-2.5 text-[11px] font-medium text-gray-500 mb-8">
              <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-primary" /> Smarter Leads</div>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <div>Faster Deals</div>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <div>AI for Real Estate</div>
            </div>

            {/* Header */}
            <div className="mb-8 text-center">
              <div className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2">
                {isRegistering ? 'Create Your Account' : 'Welcome Back'}
              </div>
              <h2 className="text-[28px] font-bold text-gray-900 tracking-tight leading-tight">
                {isRegistering ? 'Start managing leads smarter.' : 'Sign in to MASAL'}
              </h2>
              {!isRegistering && (
                <p className="text-sm text-gray-500 mt-2">Continue to your real estate sales workspace.</p>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
                  {error}
                </div>
              )}

              {isRegistering && (
                <div className="space-y-1.5">
                  <Label className="text-gray-700 text-sm font-semibold block text-left">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                    <Input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-gray-50/80 border-gray-200 text-gray-900 focus-visible:ring-primary h-11 rounded-xl text-[15px] w-full"
                      placeholder="John Doe"
                      disabled={isLoading}
                      required={isRegistering}
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <Label className="text-gray-700 text-sm font-semibold block text-left">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                  <Input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-gray-50/80 border-gray-200 text-gray-900 focus-visible:ring-primary h-11 rounded-xl text-[15px] w-full"
                    placeholder="name@example.com"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-gray-700 text-sm font-semibold block text-left">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                  <Input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-gray-50/80 border-gray-200 text-gray-900 focus-visible:ring-primary h-11 rounded-xl text-[15px] w-full"
                    placeholder={isRegistering ? "At least 6 characters" : "Enter your password"}
                    disabled={isLoading}
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              {isRegistering && (
                <div className="space-y-1.5">
                  <Label className="text-gray-700 text-sm font-semibold block text-left">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" />
                    <Input 
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 bg-gray-50/80 border-gray-200 text-gray-900 focus-visible:ring-primary h-11 rounded-xl text-[15px] w-full"
                      placeholder="Confirm your password"
                      disabled={isLoading}
                      required={isRegistering}
                    />
                  </div>
                </div>
              )}

              {!isRegistering && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer" />
                    <span className="text-sm font-medium text-gray-600">Remember me</span>
                  </label>
                  <button type="button" onClick={handleComingSoon} className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                    Forgot password?
                  </button>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/25 transition-all text-[15px] font-semibold mt-2 border-0"
              >
                {isLoading 
                  ? (isRegistering ? 'Creating account...' : 'Signing in...') 
                  : (isRegistering ? 'Create your account →' : 'Sign in →')}
              </Button>
              
              {!isRegistering && (
                <>
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-gray-200"></div>
                    <span className="flex-shrink-0 mx-4 text-xs text-gray-400 font-medium uppercase tracking-wider">OR</span>
                    <div className="flex-grow border-t border-gray-200"></div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleComingSoon} 
                    className="w-full h-11 flex items-center justify-center gap-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-[15px] font-semibold shadow-sm"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.72 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                      <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.72 17.57C14.74 18.23 13.48 18.63 12 18.63C9.14 18.63 6.71 16.7 5.84 14.09H2.17V16.94C3.98 20.53 7.69 23 12 23Z" fill="#34A853"/>
                      <path d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91V7.06H2.17C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.17 16.94L5.84 14.09Z" fill="#FBBC05"/>
                      <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.36 3.86C17.45 2.08 14.97 1 12 1C7.69 1 3.98 3.47 2.17 7.06L5.84 9.91C6.71 7.3 9.14 5.38 12 5.38Z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                </>
              )}
              
              <div className="text-center text-sm text-gray-500 pt-1">
                {isRegistering ? "Already have an account? " : "Don't have an account? "}
                <button 
                  type="button" 
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError('');
                  }} 
                  className="font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  {isRegistering ? "Log in instead" : "Create one"}
                </button>
              </div>
            </form>

            {/* Demo access - hidden on register to save vertical space */}
            {!isRegistering && (
              <div className="mt-8 bg-[#f8f9fa] rounded-2xl p-3 border border-gray-200 flex items-center gap-4">
                <img src="/demo-building.jpg" alt="Demo building" className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                <div className="flex-1">
                  <h4 className="text-[13px] font-bold text-gray-900 text-left">Demo Access</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-snug text-left">Explore the platform with demo credentials.</p>
                  <button 
                    type="button" 
                    onClick={() => {
                      setEmail('sales@masal.com');
                      setPassword('masal2024');
                    }}
                    className="mt-2 text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm"
                  >
                    Continue as Salesperson <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
