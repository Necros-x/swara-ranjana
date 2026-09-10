"use client";

import React, { useState } from 'react';
import { Button } from '@/admin-site/components/ui/Button';
import { Input } from '@/admin-site/components/ui/Input';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function Login({
  nextPath,
  initialError,
}: {
  nextPath?: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Unable to verify this session.');

      const { data: profile, error: profileError } = await supabase
        .from('staff_profiles')
        .select('role, status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError || !profile || profile.status !== 'ACTIVE') {
        await supabase.auth.signOut();
        throw new Error('This account is not authorized for the admin portal.');
      }

      router.replace(nextPath?.startsWith('/admin/') ? nextPath : '/admin/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FEFFFF]">
      <div className="hidden lg:flex w-1/2 bg-[#0E1721] relative overflow-hidden items-center justify-center">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(circle at 50% 50%, #2271B1 0%, transparent 60%)' }}
        />
        <div className="absolute w-96 h-96 border border-[#31465A]/30 rounded-full rotate-45 transform" />
        <div className="absolute w-[30rem] h-[30rem] border border-[#31465A]/20 rounded-full -rotate-12 transform" />

        <div className="z-10 text-center px-12">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-[#FEFFFF]/10 flex items-center justify-center backdrop-blur-sm border border-[#FEFFFF]/20">
            <span className="text-[#FEFFFF] font-gemola text-4xl">S</span>
          </div>
          <h1 className="text-[#FEFFFF] font-gemola text-4xl mb-4 tracking-wide font-light">Swara Ranjana</h1>
          <p className="text-[#C2CBD2] font-light max-w-sm mx-auto">
            Secure concert administration, ticketing and entrance operations.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-10">
            <h2 className="font-gemola text-3xl text-[#0E1721] font-light tracking-tight mb-2 uppercase">Swara Ranjana</h2>
            <h3 className="text-[#31465A] font-light uppercase tracking-widest text-sm">Administration</h3>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="admin-email" className="text-sm font-medium text-[#0E1721]">Email Address</label>
              <Input
                id="admin-email"
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="admin-password" className="text-sm font-medium text-[#0E1721]">Password</label>
                <span className="text-xs text-[#7D8A95]">Staff access only</span>
              </div>
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {error}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base font-medium">
              {isSubmitting ? 'Signing In…' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-10 text-center text-xs text-[#7D8A95]">
            Secure access restricted to authorized personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
