import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-[#070707]">
      <div className="max-w-md w-full text-center space-y-6 p-8 rounded-3xl apple-glass shadow-luxury border border-white/[0.08]">
        <div className="w-16 h-16 mx-auto rounded-2xl apple-glass-pill flex items-center justify-center text-white">
          <Compass className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
            Error 404
          </span>
          <h1 className="font-heading text-2xl font-extrabold text-white">
            Page Not Found
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The jersey or page you are looking for could not be found.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-glass"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Home</span>
          </Link>
          <Link
            href="/shop"
            className="flex-1 py-3 px-4 rounded-xl apple-glass-pill text-white text-xs font-semibold transition-colors flex items-center justify-center"
          >
            <span>Shop Jerseys</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
