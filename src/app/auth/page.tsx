'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { display_name: displayName } },
        });
        if (error) throw error;
        setMessage('Check your email for a confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center px-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-3xl">🏀</span>
          <h1 className="text-2xl font-bold text-[#e2e8f0] tracking-tight">Dynasty Hoops</h1>
        </div>
        <p className="text-[#64748b] text-sm">Multiplayer College Basketball Management</p>
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-sm bg-[#1e2535] border border-[#2d3748] rounded-xl p-6 shadow-2xl">
        {/* Tab toggle */}
        <div className="flex bg-[#161b27] rounded-lg p-1 mb-6">
          <button
            onClick={() => setMode('login')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'login' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8] hover:text-[#e2e8f0]'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${mode === 'signup' ? 'bg-[#3b82f6] text-white' : 'text-[#94a3b8] hover:text-[#e2e8f0]'}`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs text-[#94a3b8] mb-1.5 uppercase tracking-wide">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Coach Johnson"
                required
                className="fm-input"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-[#94a3b8] mb-1.5 uppercase tracking-wide">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="coach@example.com"
              required
              className="fm-input"
            />
          </div>

          <div>
            <label className="block text-xs text-[#94a3b8] mb-1.5 uppercase tracking-wide">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="fm-input"
            />
          </div>

          {error && (
            <div className="text-[#ef4444] text-sm bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {message && (
            <div className="text-[#10b981] text-sm bg-[#10b981]/10 border border-[#10b981]/20 rounded-md px-3 py-2">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full mt-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {mode === 'signup' ? 'Creating...' : 'Signing in...'}
              </span>
            ) : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>
      </div>

      <p className="mt-6 text-xs text-[#475569] text-center max-w-sm">
        For entertainment purposes. All players are fictional. Real school names used for program context only.
      </p>
    </div>
  );
}
