'use client';

import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  CreditCard, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-context';
import { formatCedis } from '@/lib/utils';
import { createOrder, submitPaymentProof } from '@/lib/store/data-service';

interface MoMoCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  directProduct?: {
    product: any;
    size: any;
    quantity: number;
    totalAmount: number;
  };
}

export function MoMoCheckoutModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  directProduct 
}: MoMoCheckoutModalProps) {
  const { items, total, deliveryCity, storeSettings } = useCart();

  const [selectedNetwork, setSelectedNetwork] = useState<'mtn' | 'telecel' | 'at'>('mtn');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  
  const [copiedNumber, setCopiedNumber] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<any | null>(null);

  if (!isOpen) return null;

  const currentTotal = directProduct ? directProduct.totalAmount : total;

  const networkDetails = {
    mtn: {
      title: 'MTN Mobile Money',
      number: storeSettings?.mtn_momo_number || '',
      name: storeSettings?.mtn_momo_name || '',
      badge: 'MTN MoMo',
      dialCode: '*170#',
    },
    telecel: {
      title: 'Telecel Cash',
      number: storeSettings?.telecel_cash_number || '',
      name: storeSettings?.telecel_cash_name || '',
      badge: 'Telecel',
      dialCode: '*110#',
    },
    at: {
      title: 'AT Money',
      number: storeSettings?.at_money_number || '',
      name: storeSettings?.at_money_name || '',
      badge: 'AT Money',
      dialCode: '*110#',
    },
  };

  const activeNetwork = networkDetails[selectedNetwork];
  const hasConfiguredNumber = Boolean(activeNetwork.number);

  const handleCopyNumber = () => {
    if (!activeNetwork.number) return;
    navigator.clipboard.writeText(activeNetwork.number.replace(/\s+/g, ''));
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2500);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !deliveryAddress || !paymentReference) {
      alert('Please fill out all required fields and provide your transaction reference.');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = directProduct ? [
        {
          product_id: directProduct.product.id,
          product_name: directProduct.product.name,
          size: directProduct.size,
          quantity: directProduct.quantity,
          unit_price: directProduct.product.price,
          total_price: directProduct.totalAmount,
          image_url: directProduct.product.images[0],
        }
      ] : items.map(i => ({
        product_id: i.product.id,
        product_name: i.product.name,
        size: i.selectedSize,
        quantity: i.quantity,
        unit_price: i.product.price,
        total_price: i.product.price * i.quantity,
        image_url: i.product.images[0],
      }));

      const newOrder = await createOrder({
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        delivery_city: deliveryCity,
        delivery_notes: deliveryNotes,
        payment_method: `momo_${selectedNetwork}` as any,
        order_channel: 'web',
        items: orderItems,
        total_amount: currentTotal,
        initial_payment_reference: paymentReference,
      });

      if (proofImage) {
        await submitPaymentProof(newOrder.id, paymentReference, proofImage);
      }

      setOrderCompleted(newOrder);
    } catch (err) {
      console.error('Failed to create order:', err);
      alert('Could not submit order. Please try again or contact our concierge on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl apple-glass rounded-3xl shadow-luxury overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl apple-glass-pill text-white">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Ghana Mobile Money Checkout</h3>
              <p className="text-[11px] text-zinc-400">Direct Merchant & Subscriber Transfer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl apple-glass-pill text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {orderCompleted ? (
          /* Order Confirmation Screen */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl apple-glass-pill flex items-center justify-center mx-auto text-white">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full apple-glass-pill text-xs font-mono text-white font-bold">
                Order #{orderCompleted.order_number}
              </span>
              <h4 className="text-xl font-black text-white uppercase tracking-tight">Payment Reference Submitted</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong>{customerName}</strong>. Your payment reference <strong>({paymentReference})</strong> has been received by our dispatch team.
              </p>
            </div>

            <div className="p-4 rounded-2xl apple-glass-pill text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Verification Status:</span>
                <span className="font-bold text-zinc-200 uppercase tracking-wider font-mono">Submitted (Pending Verification)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Payable:</span>
                <span className="font-bold text-white font-mono">{formatCedis(currentTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Delivery Address:</span>
                <span className="text-white font-medium">{deliveryAddress}, {deliveryCity}</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400">
              Payments are verified manually by our administrator before dispatch. You will receive an SMS confirmation once reconciled.
            </p>

            <button
              onClick={onSuccess}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition-colors shadow-glass"
            >
              Return to Matchwear Store
            </button>
          </div>
        ) : (
          /* Payment Form Screen */
          <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {/* Step 1: Select MoMo Network */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-bold text-white uppercase tracking-wider block font-mono">
                1. Select Mobile Money Provider
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {(['mtn', 'telecel', 'at'] as const).map((net) => {
                  const info = networkDetails[net];
                  const isSelected = selectedNetwork === net;
                  return (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setSelectedNetwork(net)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-white bg-white/15 shadow-glass'
                          : 'border-white/10 apple-glass-pill hover:border-white/30'
                      }`}
                    >
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border border-white/20 text-white">
                        {info.badge}
                      </span>
                      <p className="text-xs font-bold text-white mt-1.5">{info.title}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Payment Instruction Box */}
            <div className="p-4 rounded-2xl apple-glass-pill space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Total Payable:</span>
                <span className="text-base font-bold text-white font-mono">{formatCedis(currentTotal)}</span>
              </div>

              {hasConfiguredNumber ? (
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/15 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 block font-semibold">
                      {activeNetwork.title} Number
                    </span>
                    <span className="text-base font-mono font-bold text-white tracking-wider">
                      {activeNetwork.number}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyNumber}
                    className="px-3 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-glass"
                  >
                    {copiedNumber ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-zinc-400">
                  <p className="font-semibold text-white mb-1">Payment Account Configuration:</p>
                  <p>
                    Direct merchant account details can be set up in the Admin Dashboard. If transferring directly to the store manager, enter your transaction reference below.
                  </p>
                </div>
              )}

              {activeNetwork.name && (
                <p className="text-xs text-zinc-400">
                  <strong>Account Name:</strong> <span className="text-white font-mono">{activeNetwork.name}</span>
                </p>
              )}
            </div>

            {/* Step 3: Customer & Delivery Details */}
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-white uppercase tracking-wider block font-mono">
                2. Delivery & Contact Details
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kwame Mensah"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-white/30 backdrop-blur-xl"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Phone / WhatsApp *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 024 000 0000"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-white/30 backdrop-blur-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Delivery Address & Landmark *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. East Legon, Near American House"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-white/30 backdrop-blur-xl"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Delivery Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Call before arrival"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-white/30 backdrop-blur-xl"
                />
              </div>
            </div>

            {/* Step 4: Transaction Reference & Proof */}
            <div className="space-y-4 pt-2 border-t border-white/[0.08]">
              <label className="text-[11px] font-bold text-white uppercase tracking-wider block font-mono">
                3. Payment Reconciliation
              </label>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Transaction ID / Reference Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TXN-1029482109 or 24192049182"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-xs placeholder-zinc-500 focus:outline-none focus:border-white/30 font-mono font-bold backdrop-blur-xl"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Attach Payment Screenshot (Optional)
                </label>
                <div className="border border-dashed border-white/20 rounded-2xl p-4 text-center hover:border-white/40 transition-colors cursor-pointer relative apple-glass-pill">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <Upload className="w-4 h-4 text-white" />
                    <span className="text-xs text-white font-medium">
                      {proofImage ? 'Screenshot attached (Click to change)' : 'Upload Transfer Screenshot'}
                    </span>
                    <span className="text-[10px] text-zinc-400">PNG, JPG up to 10MB</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="p-3.5 rounded-2xl apple-glass-pill flex items-start gap-2.5 text-xs text-zinc-400">
              <AlertCircle className="w-4 h-4 shrink-0 text-white mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                Payments are verified manually by our administrator before parcel dispatch. No funds are deducted automatically.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-glass"
            >
              {isSubmitting ? (
                <span>Submitting Order...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-black" />
                  <span>Submit Order & Payment Reference</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
