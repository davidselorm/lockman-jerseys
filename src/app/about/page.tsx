import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Truck, 
  Award, 
  CreditCard, 
  ArrowRight
} from 'lucide-react';

export const metadata = {
  title: 'About Us | LOCKMAN JERSEYS Ghana',
  description: 'About Lockman Jerseys — delivering authentic football club jerseys, national team kits, and retro classics across Ghana.',
};

export default function AboutPage() {
  return (
    <div className="bg-[#070707] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="px-3.5 py-1 rounded-full apple-glass-pill text-xs font-semibold text-zinc-300">
            About Lockman Jerseys
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl font-black text-white leading-tight">
            Your Home For Authentic Football Jerseys in Ghana
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal">
            We supply high-quality football jerseys to fans, players, and collectors across Ghana. From current season club kits to national teams and iconic retro shirts.
          </p>
        </div>

        {/* Brand Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="relative rounded-3xl overflow-hidden apple-glass-card aspect-[4/3] shadow-luxury p-6 flex items-center justify-center bg-gradient-to-b from-[#181818] to-[#0A0A0A] border border-white/[0.08]">
            <img
              src="https://assets.adidas.com/images/w_600,f_auto,q_auto/a4f3b5c777d04f2f9872b16100ee2ebf_9366/Real_Madrid_24-25_Home_Jersey_White_IU5011_01_laydown.jpg"
              alt="Real Madrid Jersey"
              className="w-full h-full object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.8)]"
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                Quality Jerseys. Fast Delivery.
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Whether you support Real Madrid, Arsenal, Barcelona, Manchester City, or our own Ghana Black Stars, we bring you official kits that look and feel authentic.
              </p>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We offer both Player Version kits (athletic slim fit with heat-pressed badges) and Fan Version kits (comfortable regular fit with embroidered badges).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl apple-glass-card space-y-1">
                <span className="text-2xl font-bold text-white font-mono">100%</span>
                <p className="font-heading text-xs text-white font-bold">Top Quality</p>
                <p className="text-xs text-zinc-400">Authentic badges and tags.</p>
              </div>
              <div className="p-4 rounded-2xl apple-glass-card space-y-1">
                <span className="text-2xl font-bold text-white font-mono">24-48H</span>
                <p className="font-heading text-xs text-white font-bold">Delivery Time</p>
                <p className="text-xs text-zinc-400">To all regions of Ghana.</p>
              </div>
            </div>
          </div>
        </div>

        {/* What We Offer */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              Why Choose Lockman Jerseys
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">We make buying jerseys simple, fast, and reliable.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl apple-glass-card space-y-3">
              <div className="w-10 h-10 rounded-xl apple-glass-pill text-white flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="font-heading text-sm font-bold text-white">Original Specifications</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Breathable fabrics, correct collar details, and original club badges.
              </p>
            </div>

            <div className="p-6 rounded-2xl apple-glass-card space-y-3">
              <div className="w-10 h-10 rounded-xl apple-glass-pill text-white flex items-center justify-center">
                <Truck className="w-5 h-5 text-zinc-200" />
              </div>
              <h3 className="font-heading text-sm font-bold text-white">Reliable Ghana Delivery</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Same day delivery in Accra, and 1-2 days parcel delivery across Kumasi, Takoradi, Tamale, and all regions.
              </p>
            </div>

            <div className="p-6 rounded-2xl apple-glass-card space-y-3">
              <div className="w-10 h-10 rounded-xl apple-glass-pill text-white flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-zinc-200" />
              </div>
              <h3 className="font-heading text-sm font-bold text-white">Convenient Payment</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pay directly with MTN MoMo, Telecel Cash, or AT Money with instant order confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4 pt-6 border-t border-white/[0.08]">
          <h2 className="font-heading text-2xl font-bold text-white">Ready to rep your team?</h2>
          <div className="flex justify-center gap-4">
            <Link
              href="/shop"
              className="px-6 py-3 rounded-xl bg-white text-black text-xs font-bold hover:bg-zinc-200 transition-colors shadow-glass flex items-center gap-2"
            >
              <span>Explore Jerseys</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
