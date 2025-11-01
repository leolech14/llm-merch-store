'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import PixPaymentModal from '@/components/PixPaymentModal';
import { X } from 'lucide-react';

interface ShippingInfo {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !loading && !showPixModal) {
      router.push('/');
    }
  }, [items, router, loading, showPixModal]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!shippingInfo.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!shippingInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingInfo.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!shippingInfo.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!shippingInfo.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!shippingInfo.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!shippingInfo.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5}-?\d{3}$/.test(shippingInfo.zipCode)) {
      newErrors.zipCode = 'Invalid ZIP code format';
    }

    if (!shippingInfo.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handlePayWithPix = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Generate order ID
      const newOrderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setOrderId(newOrderId);

      // Create PIX payment request
      const response = await fetch('/api/pix-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice,
          productId: newOrderId,
          productName: `Order ${newOrderId}`,
          buyerEmail: shippingInfo.email,
          buyerName: shippingInfo.fullName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPixData(data);
        setShowPixModal(true);
      } else {
        alert(`Failed to create payment: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error processing payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePixSuccess = async () => {
    try {
      // Save order to database (optional - implement as needed)
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          items,
          totalPrice,
          shippingInfo,
          paymentHash: pixData.paymentHash,
        }),
      }).catch(() => {
        // Order might not be saved but payment was successful
        console.warn('Order save failed but payment succeeded');
      });

      // Clear cart
      clearCart();

      // Close modal and redirect
      setShowPixModal(false);
      router.push(`/order/${orderId}`);
    } catch (error) {
      console.error('Order confirmation error:', error);
      // Still redirect to order page even if save fails
      clearCart();
      setShowPixModal(false);
      router.push(`/order/${orderId}`);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-2xl font-black text-black mb-4">CART EMPTY</p>
          <p className="text-sm text-black/60 mb-6">Add items to proceed to checkout</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-black text-white font-black text-sm hover:bg-black/90"
          >
            BACK TO SHOP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="border-b-2 border-black p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-black/5 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black">CHECKOUT</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-4 md:p-8">
        {/* Left: Shipping Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-xl font-black mb-4">SHIPPING ADDRESS</h2>

            {/* Full Name */}
            <div className="mb-4">
              <label className="text-xs font-black uppercase tracking-wider text-black/60 mb-2 block">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={shippingInfo.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className={`w-full px-3 py-2 border-2 ${
                  errors.fullName ? 'border-red-500 bg-red-50' : 'border-black'
                } bg-white text-black font-mono text-sm focus:outline-none`}
              />
              {errors.fullName && (
                <p className="text-red-600 text-xs font-mono mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="text-xs font-black uppercase tracking-wider text-black/60 mb-2 block">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={shippingInfo.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                className={`w-full px-3 py-2 border-2 ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-black'
                } bg-white text-black font-mono text-sm focus:outline-none`}
              />
              {errors.email && (
                <p className="text-red-600 text-xs font-mono mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="mb-4">
              <label className="text-xs font-black uppercase tracking-wider text-black/60 mb-2 block">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={shippingInfo.phone}
                onChange={handleInputChange}
                placeholder="(11) 99999-9999"
                className={`w-full px-3 py-2 border-2 ${
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-black'
                } bg-white text-black font-mono text-sm focus:outline-none`}
              />
              {errors.phone && (
                <p className="text-red-600 text-xs font-mono mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Address */}
            <div className="mb-4">
              <label className="text-xs font-black uppercase tracking-wider text-black/60 mb-2 block">
                Street Address
              </label>
              <input
                type="text"
                name="address"
                value={shippingInfo.address}
                onChange={handleInputChange}
                placeholder="123 Main St, Apt 4B"
                className={`w-full px-3 py-2 border-2 ${
                  errors.address ? 'border-red-500 bg-red-50' : 'border-black'
                } bg-white text-black font-mono text-sm focus:outline-none`}
              />
              {errors.address && (
                <p className="text-red-600 text-xs font-mono mt-1">{errors.address}</p>
              )}
            </div>

            {/* City, State, ZIP - 3 columns */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-black/60 mb-2 block">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={shippingInfo.city}
                  onChange={handleInputChange}
                  placeholder="São Paulo"
                  className={`w-full px-3 py-2 border-2 ${
                    errors.city ? 'border-red-500 bg-red-50' : 'border-black'
                  } bg-white text-black font-mono text-sm focus:outline-none`}
                />
                {errors.city && (
                  <p className="text-red-600 text-xs font-mono mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-wider text-black/60 mb-2 block">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={shippingInfo.state}
                  onChange={handleInputChange}
                  placeholder="SP"
                  maxLength={2}
                  className={`w-full px-3 py-2 border-2 ${
                    errors.state ? 'border-red-500 bg-red-50' : 'border-black'
                  } bg-white text-black font-mono text-sm focus:outline-none uppercase`}
                />
                {errors.state && (
                  <p className="text-red-600 text-xs font-mono mt-1">{errors.state}</p>
                )}
              </div>
            </div>

            {/* ZIP Code */}
            <div className="mb-6">
              <label className="text-xs font-black uppercase tracking-wider text-black/60 mb-2 block">
                ZIP Code
              </label>
              <input
                type="text"
                name="zipCode"
                value={shippingInfo.zipCode}
                onChange={handleInputChange}
                placeholder="01310-100"
                className={`w-full px-3 py-2 border-2 ${
                  errors.zipCode ? 'border-red-500 bg-red-50' : 'border-black'
                } bg-white text-black font-mono text-sm focus:outline-none`}
              />
              {errors.zipCode && (
                <p className="text-red-600 text-xs font-mono mt-1">{errors.zipCode}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Right: Order Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="border-2 border-black"
        >
          <div className="p-6 space-y-6">
            {/* Summary Header */}
            <div>
              <h2 className="text-xl font-black mb-4">ORDER SUMMARY</h2>
            </div>

            {/* Items */}
            <div className="space-y-3 border-b-2 border-black pb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-black">{item.name}</p>
                    <p className="text-xs text-black/60 font-mono">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-mono font-black whitespace-nowrap">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-black/60 font-mono">Subtotal</span>
                <span className="font-mono">R$ {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-black/60 font-mono">Shipping</span>
                <span className="font-mono">FREE</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-black/60 font-mono">Fees</span>
                <span className="font-mono">R$ 0.00</span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t-2 border-b-2 border-black py-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-black">TOTAL</span>
                <span className="text-3xl font-mono font-black">R$ {totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-black/5 border border-black p-3 text-xs font-mono">
              <p className="font-black mb-2">PAYMENT METHOD</p>
              <p>PIX - Instant Brazilian Transfer</p>
              <p className="text-black/60 mt-2">Fast and secure payment method</p>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayWithPix}
              disabled={loading}
              className="w-full py-3 bg-black text-white font-black text-sm hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'PROCESSING...' : 'PAY WITH PIX'}
            </button>

            {/* Continue Shopping */}
            <button
              onClick={() => router.push('/')}
              disabled={loading}
              className="w-full py-3 border-2 border-black text-black font-black text-sm hover:bg-black/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        </motion.div>
      </div>

      {/* PIX Payment Modal */}
      {showPixModal && pixData && (
        <PixPaymentModal
          pixCode={pixData.pixCode}
          qrCodeUrl={pixData.qrCodeUrl}
          amount={pixData.amount}
          paymentHash={pixData.paymentHash}
          onSuccess={handlePixSuccess}
          onCancel={() => setShowPixModal(false)}
        />
      )}
    </div>
  );
}
