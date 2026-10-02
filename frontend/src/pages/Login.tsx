import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../layouts/AuthLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { authApi } from '../services/authApi';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      // The backend handles the hardcoded salesperson check as well.
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
  };

  return (
    <AuthLayout>
      <div className="flex flex-col space-y-2 text-center mb-8">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Welcome Back</h2>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Sign in to MASAL</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Continue to MASAL →'}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-text-secondary">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
          Create your account
        </Link>
      </div>

      <div className="mt-8 p-4 rounded-md border border-border bg-surface/50 text-xs text-text-secondary text-left flex flex-col gap-3">
        <div>
          <p className="font-medium mb-1 text-white">Demo Credentials:</p>
          <p>Salesperson: sales@masal.com / masal2024</p>
          <p>Customer: Any email / Any password (auto-creates)</p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={() => {
            setEmail('sales@masal.com');
            setPassword('masal2024');
          }}
        >
          Continue as Salesperson
        </Button>
      </div>
    </AuthLayout>
  );
}
