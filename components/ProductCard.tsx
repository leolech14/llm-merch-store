'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import PixPaymentModal from './PixPaymentModal';
import { useCart, type Product } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  userId?: string;
}

export default function ProductCard({ product, userId }: ProductCardProps) {
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  const handlePixNow = async () => {
    if (!userId) {
      window.location.href = '/auth/signin?redirect=shop';
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/create-pix-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: product.price,
          productId: product.id,
          userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPixData(data);
        setShowPixModal(true);
      } else {
        alert('Failed to create payment');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all hover:shadow-2xl"
      >
        {product.popular && (
          <div className="absolute left-4 top-4 z-10 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
            🔥 POPULAR
          </div>
        )}

        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        <div className="p-6">
          <h3 className="mb-2 text-xl font-bold text-gray-900">{product.name}</h3>
          <p className="mb-4 text-sm text-gray-600">{product.description}</p>
          
          <div className="mb-4 text-3xl font-bold text-gray-900">
            R$ {product.price.toFixed(2)}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handlePixNow}
              disabled={loading}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Creating PIX...' : 'PIX IT NOW'}
            </button>

            <button
              onClick={() => addToCart(product)}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-95"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </motion.div>

      {showPixModal && pixData && (
        <PixPaymentModal
          pixCode={pixData.pixCode}
          qrCodeUrl={pixData.qrCodeUrl}
          amount={product.price}
          paymentIntentId={pixData.paymentIntentId}
          onSuccess={() => {
            setShowPixModal(false);
            window.location.href = '/payment/success';
          }}
          onCancel={() => setShowPixModal(false)}
        />
      )}
    </>
  );
}
