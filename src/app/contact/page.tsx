'use client';

import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Camera, 
  Send, 
  CheckCircle2, 
  Truck
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { buildWhatsAppUrl, buildSnapchatUrl } from '@/lib/utils';

export default function ContactPage() {
  const { storeSettings } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Jersey Availability');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const whatsappNumber = storeSettings?.whatsapp_number || '';
  const snapchatUser = storeSettings?.snapchat_username || '';

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
    <div className="bg-[#070707] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="border-b border-white/[0.08] pb-6 space-y-2">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
            Contact Us
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Have a question about a jersey, your size, custom printing, or your order? We are here to help you.
          </p>
        </div>

        {/* Grid: Contact Information & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Direct channels */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="p-6 rounded-3xl apple-glass space-y-4 border border-white/[0.08]">
              <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider">
                Direct Contact
              </h3>

              {/* WhatsApp */}
              {whatsappNumber && (
                <a
                  href={buildWhatsAppUrl(whatsappNumber, 'Hello Lockman Jerseys, I need assistance with an order')}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl apple-glass-card hover:border-white/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl apple-glass-pill text-white flex items-center justify-center shrink-0">
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-semibold text-emerald-400 block">
                      Fastest Response
                    </span>
                    <span className="font-heading text-sm font-bold text-white group-hover:text-zinc-200 transition-colors">
                      Chat on WhatsApp
                    </span>
                    <p className="text-xs text-zinc-400 font-mono">{storeSettings?.phone_display || whatsappNumber}</p>
                  </div>
                </a>
              )}

              {/* Snapchat */}
              {snapchatUser && (
                <a
                  href={buildSnapchatUrl(snapchatUser)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3.5 p-3.5 rounded-2xl apple-glass-card hover:border-white/30 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl apple-glass-pill text-white flex items-center justify-center shrink-0">
                    <Camera className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-semibold text-zinc-400 block">
                      Snapchat
                    </span>
                    <span className="font-heading text-sm font-bold text-white group-hover:text-zinc-200 transition-colors">
                      @{snapchatUser}
                    </span>
                    <p className="text-xs text-zinc-400">Order & message via Snapchat</p>
                  </div>
                </a>
              )}

              {/* Email */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl apple-glass-card">
                <div className="w-10 h-10 rounded-xl apple-glass-pill text-white flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-zinc-300" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-zinc-400 block">
                    Email Support
                  </span>
                  <span className="text-sm font-medium text-white">
                    {storeSettings?.email_contact || 'support@lockmanjerseys.com'}
                  </span>
                </div>
              </div>

            </div>

            {/* Delivery Notice */}
            <div className="p-6 rounded-3xl apple-glass space-y-3 border border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-zinc-300" />
                <h3 className="font-heading text-sm font-bold text-white">
                  Delivery Information
                </h3>
              </div>
              <ul className="space-y-2 text-xs text-zinc-400 leading-relaxed">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span><strong>Accra Metro:</strong> Same-day dispatch (GH₵ 30).</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span><strong>Outside Accra:</strong> 1-2 days courier delivery (GH₵ 60).</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span><strong>Free Delivery:</strong> On orders over GH₵ 1,200.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 apple-glass p-8 rounded-3xl shadow-luxury space-y-6 border border-white/[0.08]">
            <div>
              <h2 className="font-heading text-2xl font-extrabold text-white">
                Send Us a Message
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                Fill in your details and we will reply to you on WhatsApp right away.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="font-heading text-base font-bold text-white">Message Sent!</h4>
                <p className="text-xs text-zinc-300">
                  Opening WhatsApp to complete your message with our team...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kwame Mensah"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Phone Number (WhatsApp) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0244123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Subject</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#141414] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-white/30"
                  >
                    <option value="Jersey Availability">Check Jersey Availability</option>
                    <option value="Custom Name & Number">Custom Name & Number Printing</option>
                    <option value="Order Tracking">Order Status & Delivery</option>
                    <option value="Bulk Team Order">Bulk Team / Squad Order</option>
                    <option value="Other">Other Inquiry</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what jersey, team, or size you are looking for..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 text-xs focus:outline-none focus:border-white/30 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-glass"
                >
                  <Send className="w-4 h-4 text-black" />
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
