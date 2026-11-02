import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Truck, 
  Award, 
  ArrowRight
} from 'lucide-react';
import { WhatsAppLogo } from '@/components/ui/BrandLogos';

export const metadata = {
  title: 'About Us | LOCKMAN JERSEYS Ghana',
  description: 'About Lockman Jerseys — delivering authentic football club jerseys, national team kits, and retro classics across Ghana.',
};

export default function AboutPage() {
  return (
    <div className="bg-black min-h-screen pt-8 sm:pt-12 pb-36 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3.5 py-1 rounded-full airbnb-pill text-xs font-bold text-white">
            About Lockman Jerseys
          </span>
          <h1 className="font-sans text-3xl sm:text-5xl font-extrabold text-white leading-tight">
            Your Home For Authentic Football Jerseys in Ghana
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            We supply authentic football jerseys to fans, players, and collectors across Ghana. From current season club kits to national teams and iconic retro shirts.
          </p>
        </div>

        {/* Brand Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative rounded-3xl overflow-hidden airbnb-card aspect-[4/3] p-10 flex flex-col items-center justify-center bg-[#080808] border border-white/10 text-center space-y-4">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/15 overflow-hidden flex items-center justify-center p-3 shadow-2xl">
              <img
                src="/images/brand/logo.png"
                alt="LOCKMAN JERSEYS"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">Accra, Ghana</span>
              <h3 className="text-xl font-black text-white uppercase tracking-wider">LOCKMAN JERSEYS</h3>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-white">
                Quality Matchwear. Fast Ghana Delivery.
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Whether you support Real Madrid, Arsenal, Barcelona, Manchester City, or our own Ghana Black Stars, we bring you official kits that look and feel authentic.
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We offer both Player Version kits (athletic slim fit with heat-pressed badges) and Fan Version kits (comfortable regular fit with embroidered badges).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl airbnb-card space-y-1">
                <span className="text-2xl font-extrabold text-white">100%</span>
                <p className="font-sans text-xs text-white font-bold">Top Quality</p>
                <p className="text-xs text-zinc-400">Authentic badges and tags.</p>
              </div>
              <div className="p-4 rounded-2xl airbnb-card space-y-1">
                <span className="text-2xl font-extrabold text-white">24-48H</span>
                <p className="font-sans text-xs text-white font-bold">Delivery Time</p>
                <p className="text-xs text-zinc-400">To all regions of Ghana.</p>
              </div>
            </div>
          </div>
        </div>

        {/* What We Offer */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-white">
              Why Choose Lockman Jerseys
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">We make buying jerseys simple, fast, and personal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl airbnb-card space-y-3">
              <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-sm">
                <Award className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="font-sans text-sm font-bold text-white">Original Specifications</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Breathable performance mesh fabrics, official collar tags, and verified embroidery.
              </p>
            </div>

            <div className="p-6 rounded-3xl airbnb-card space-y-3">
              <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-sm">
                <Truck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <h3 className="font-sans text-sm font-bold text-white">Express Delivery</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Same-day rider dispatch across Accra; 24h express parcel delivery across Kumasi, Takoradi, and all regions.
              </p>
            </div>

            <div className="p-6 rounded-3xl airbnb-card space-y-3">
              <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-sm">
                <WhatsAppLogo className="w-5 h-5 text-[#25D366]" />
              </div>
              <h3 className="font-sans text-sm font-bold text-white">WhatsApp Concierge</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Direct ordering on WhatsApp or Snapchat with prefilled jersey details, rapid stock confirmation, and live support.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 pt-6 border-t border-white/[0.08]">
          <h2 className="font-sans text-2xl font-bold text-white">Ready to rep your team?</h2>
          <div className="flex justify-center gap-4">
            <Link
              href="/shop"
              className="px-7 py-3.5 rounded-full bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-all shadow-md flex items-center gap-2 active:scale-95"
            >
              <span>Explore All Jerseys</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
