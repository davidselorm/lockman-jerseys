'use client';

import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  Send, 
  CheckCircle2, 
  Truck
} from 'lucide-react';
import { WhatsAppLogo, SnapchatLogo } from '@/components/ui/BrandLogos';
import { useCart } from '@/lib/store/cart-context';
import { buildWhatsAppUrl, buildSnapchatUrl } from '@/lib/utils';

export default function ContactPage() {
  const { storeSettings } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Jersey Availability');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const whatsappNumber = storeSettings?.whatsapp_number || '233257107980';
  const phoneDisplay = storeSettings?.phone_display || '+233 25 710 7980';
  const snapchatUser = storeSettings?.snapchat_username || 'yawloqman';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;

    if (whatsappNumber) {
      const formatted = `Hi LOCKMAN JERSEYS,\n\nName: ${name}\nPhone: ${phone}\nTopic: ${subject}\n\nMessage:\n${message}`;
      window.open(buildWhatsAppUrl(whatsappNumber, formatted), '_blank');
    }

    setSubmitted(true);
    setTimeout(() => {
      setName('');
      setPhone('');
      setMessage('');
      setSubmitted(false);
    }, 4000);
  };

  return (
    <div className="bg-black min-h-screen pt-8 sm:pt-12 pb-36 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-6 space-y-2">
          <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white">
            Concierge & Support
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Have a question about kit availability, sizing, custom heat press name printing, or delivery? Reach out to our team directly.
          </p>
        </div>

        {/* Grid: Contact Information & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Direct channels */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 rounded-3xl airbnb-card space-y-4">
              <h3 className="font-sans text-xs font-bold text-white uppercase tracking-wider">
                Direct Channels
              </h3>

              {/* WhatsApp */}
              {whatsappNumber && (
                <a
                  href={buildWhatsAppUrl(whatsappNumber, 'Hello Lockman Jerseys, I need assistance with an order')}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl airbnb-pill hover:border-white/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-sm">
                    <WhatsAppLogo className="w-5 h-5 text-[#25D366]" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-bold text-emerald-400 block">
                      Fastest Response
                    </span>
                    <span className="font-sans text-sm font-bold text-white group-hover:text-zinc-200 transition-colors">
                      Chat on WhatsApp
                    </span>
                    <p className="text-xs text-zinc-400 font-mono">{phoneDisplay}</p>
                  </div>
                </a>
              )}

              {/* Snapchat */}
              {snapchatUser && (
                <a
                  href={buildSnapchatUrl(snapchatUser)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl airbnb-pill hover:border-white/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-sm">
                    <SnapchatLogo className="w-5 h-5 text-[#FFFC00]" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-bold text-zinc-400 block">
                      Snapchat Boutique
                    </span>
                    <span className="font-sans text-sm font-bold text-white group-hover:text-zinc-200 transition-colors">
                      @{snapchatUser}
                    </span>
                    <p className="text-xs text-zinc-400">Direct order messaging & videos</p>
                  </div>
                </a>
              )}

              {/* Email */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl airbnb-pill">
                <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-sm">
                  <Mail className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-zinc-400 block uppercase tracking-wider">
                    Email Support
                  </span>
                  <span className="text-sm font-bold text-white">
                    {storeSettings?.email_contact || 'support@lockmanjerseys.com'}
                  </span>
                </div>
              </div>

            </div>

            {/* Delivery Notice */}
            <div className="p-6 rounded-3xl airbnb-card space-y-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-white stroke-[2.5]" />
                <h3 className="font-sans text-sm font-bold text-white">
                  Ghana Delivery Information
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-zinc-400 leading-relaxed">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span><strong>Accra Metro:</strong> Same-day dispatch (GH₵ 30).</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  <span><strong>Outside Accra:</strong> 1-2 days courier delivery (GH₵ 60).</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-white font-bold">Free Nationwide Delivery on orders over GH₵ 1,200.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 airbnb-card p-8 rounded-3xl space-y-6">
            <div>
              <h2 className="font-sans text-2xl font-extrabold text-white">
                Send Us a Message
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Fill in your details and we will reply to you on WhatsApp right away.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-white text-black text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-black mx-auto stroke-[2.5]" />
                <h4 className="font-sans text-base font-extrabold text-black">Opening WhatsApp...</h4>
                <p className="text-xs text-zinc-700">
                  Redirecting to WhatsApp to send your inquiry directly to our team!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kwame Mensah"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 airbnb-search-bar rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-300">Phone Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0244123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 airbnb-search-bar rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/40"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Topic</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 airbnb-search-bar rounded-xl text-white text-xs focus:outline-none focus:border-white/40 cursor-pointer"
                  >
                    <option value="Jersey Availability" className="bg-[#0A0A0A] text-white">Check Jersey Availability</option>
                    <option value="Custom Name & Number" className="bg-[#0A0A0A] text-white">Custom Name & Number Printing</option>
                    <option value="Order Tracking" className="bg-[#0A0A0A] text-white">Order Status & Delivery</option>
                    <option value="Bulk Team Order" className="bg-[#0A0A0A] text-white">Bulk Team / Squad Order</option>
                    <option value="Other" className="bg-[#0A0A0A] text-white">Other Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what jersey, team, or size you are looking for..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-4 airbnb-search-bar rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/40 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                >
                  <WhatsAppLogo className="w-4 h-4 text-black" />
                  <span>Send via WhatsApp</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
