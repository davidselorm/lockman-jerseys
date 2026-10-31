'use client';

import React, { useEffect } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#070707]">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-2xl apple-glass shadow-luxury border border-white/[0.08]">
        <div className="w-16 h-16 mx-auto rounded-full apple-glass-pill flex items-center justify-center text-amber-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-[0.2em]">
            Application Notice
          </span>
          <h1 className="text-2xl font-black uppercase text-white tracking-tight">
            Something Interrupted The Match
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            A temporary client or server refresh occurred. Please click below to reset the display.
          </p>
        </div>

        <button
          onClick={() => reset()}
          className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-glass"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reload View</span>
        </button>
      </div>
    </div>
  );
}
