'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('lockman_admin_authed', 'true');
        window.location.href = '/admin/dashboard';
      } else {
        setError(data.message || 'Invalid administrator credentials');
      }
    } catch (err) {
      setError('Connection failed. Please check network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-16 bg-black font-sans selection:bg-white selection:text-black">
      <div className="w-full max-w-md space-y-6">
        
        {/* Branding header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-[#0C0C0C] border border-white/15 overflow-hidden flex items-center justify-center mx-auto p-1.5 shadow-2xl">
            <img
              src="/images/brand/logo.png"
              alt="LOCKMAN JERSEYS"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-xl font-black uppercase text-white tracking-widest">
                LOCKMAN JERSEYS
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-white text-black">
                Admin
              </span>
            </div>
            <p className="text-xs text-zinc-400 tracking-wider uppercase font-mono mt-1">
              Direct Management Console
            </p>
          </div>
        </div>

        {/* Minimalist Card */}
        <div className="p-8 rounded-3xl bg-[#0C0C0C] border border-white/10 shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1.5 font-mono">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="admin@lockmanjerseys.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black border border-white/15 rounded-2xl text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider block mb-1.5 font-mono">
                Access Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-black border border-white/15 rounded-2xl text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-full bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In To Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-white/10">
            <Link
              href="/"
              className="text-xs text-zinc-400 hover:text-white transition-colors"
            >
              ← Back to Storefront
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
