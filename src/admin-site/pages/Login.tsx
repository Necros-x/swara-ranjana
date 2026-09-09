"use client";

import React from 'react';
import { Button } from '@/admin-site/components/ui/Button';
import { Input } from '@/admin-site/components/ui/Input';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/admin/dashboard');
  };

  return (
    <div className="flex min-h-screen bg-[#FEFFFF]">
      {/* Left Artwork Panel - Hidden on mobile */}
      <div className="hidden lg:flex w-1/2 bg-[#0E1721] relative overflow-hidden items-center justify-center">
        {/* Subtle decorative background - representing the butterfly/artwork */}
        <div className="absolute inset-0 opacity-20" style={{
          background: 'radial-gradient(circle at 50% 50%, #2271B1 0%, transparent 60%)'
        }}></div>
        <div className="absolute w-96 h-96 border border-[#31465A]/30 rounded-full rotate-45 transform"></div>
        <div className="absolute w-[30rem] h-[30rem] border border-[#31465A]/20 rounded-full -rotate-12 transform"></div>
        
        <div className="z-10 text-center px-12">
          <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-[#FEFFFF]/10 flex items-center justify-center backdrop-blur-sm border border-[#FEFFFF]/20">
            <span className="text-[#FEFFFF] font-serif font-bold italic text-4xl">S</span>
          </div>
          <h1 className="text-[#FEFFFF] font-serif text-4xl mb-4 tracking-wide font-light">Swara Ranjana 2026</h1>
          <p className="text-[#C2CBD2] font-light max-w-sm mx-auto">
            The premier indoor musical concert administration and entrance operations platform.
          </p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-10">
            <h2 className="font-serif text-3xl text-[#0E1721] font-medium tracking-tight mb-2 uppercase">Swara Ranjana</h2>
            <h3 className="text-xl text-[#31465A] font-light uppercase tracking-widest text-sm">Administration</h3>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#0E1721]">Email Address</label>
              <Input 
                type="email" 
                placeholder="admin@swararanjana.com"
                defaultValue="admin@swararanjana.com"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#0E1721]">Password</label>
                <a href="#" className="text-xs font-medium text-[#2271B1] hover:underline">Forgot Password?</a>
              </div>
              <Input 
                type="password" 
                placeholder="••••••••"
                defaultValue="password123"
                required
                className="h-11"
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base font-medium">
              Sign In
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
