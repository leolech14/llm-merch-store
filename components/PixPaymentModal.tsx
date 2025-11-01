'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PixPaymentModalProps {
  pixCode: string;
  qrCodeUrl: string;
  amount: number;
  paymentHash: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PixPaymentModal({
  pixCode,
  qrCodeUrl,
  amount,
  paymentHash,
  onSuccess,
  onCancel,
}: PixPaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes (EBANX expiration)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setChecking(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!checking) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/pix-payment-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentHash }),
        });

        const data = await response.json();

        // Check if payment is confirmed (status 'CO' in EBANX)
        if (data.confirmed || data.status === 'CO') {
          clearInterval(pollInterval);
          onSuccess();
        }
      } catch (error) {
        console.error('Payment check failed:', error);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [checking, paymentHash, onSuccess]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md bg-white p-8 shadow-2xl border-4 border-black"
        >
          <button
            onClick={onCancel}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-white border-4 border-black">
              <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Pay with PIX</h2>
            <p className="text-3xl font-bold text-black font-mono">
              R$ {amount.toFixed(2)}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Expires in {formatTime(timeLeft)}
            </p>
          </div>

          <div className="my-6 flex justify-center">
            <div className="bg-white p-4 border-2 border-black">
              <img
                src={qrCodeUrl}
                alt="PIX QR Code"
                className="h-48 w-48"
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-center text-sm font-medium text-gray-700">
              Or copy the code below:
            </p>

            <div className="relative">
              <input
                type="text"
                value={pixCode}
                readOnly
                className="w-full border-2 border-black bg-white px-4 py-3 pr-24 font-mono text-sm text-black focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black px-6 py-2 font-bold text-white shadow-md transition-all hover:bg-black/80 active:scale-95"
              >
                {copied ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </span>
                ) : (
                  'Copy'
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 bg-white border-2 border-black p-4">
            <p className="text-center text-sm text-black">
              {checking ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <strong>Waiting for payment...</strong>
                  <br />
                  We'll confirm automatically when you pay!
                </span>
              ) : (
                <>
                  <strong>How to pay:</strong>
                  <br />
                  1. Click "Copy" above
                  <br />
                  2. Open your bank app
                  <br />
                  3. Select "PIX" → "Copy & Paste"
                  <br />
                  4. Confirm payment
                </>
              )}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
