"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ArrowRight, Home, Package } from "lucide-react";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface OrderData {
  orderId: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  shipping: number;
  paymentStatus: "CONFIRMED" | "PENDING" | "FAILED";
  shippingAddress: {
    name: string;
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
  };
  estimatedDelivery: {
    min: number;
    max: number;
  };
  createdAt: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch order data from localStorage or API
    const fetchOrderData = async () => {
      try {
        // First, try to get from localStorage (for demo/testing)
        const storedOrder = localStorage.getItem(`order_${orderId}`);

        if (storedOrder) {
          setOrderData(JSON.parse(storedOrder));
          setLoading(false);
          return;
        }

        // In production, fetch from API
        // const response = await fetch(`/api/orders/${orderId}`);
        // if (!response.ok) throw new Error("Order not found");
        // const data = await response.json();
        // setOrderData(data);

        // For demo purposes, create sample order data
        const sampleOrder: OrderData = {
          orderId: orderId,
          items: [
            {
              id: "transformer-chest",
              name: "Transformer Architecture",
              price: 149.0,
              quantity: 1,
              image: "/Transformer-Chest.png",
            },
            {
              id: "self-attention",
              name: "Self-Attention Tee",
              price: 149.0,
              quantity: 1,
              image: "/Self-Attention.png",
            },
          ],
          subtotal: 298.0,
          shipping: 15.0,
          total: 313.0,
          paymentStatus: "CONFIRMED",
          shippingAddress: {
            name: "Seu Nome",
            street: "Rua Principal",
            number: "123",
            city: "São Paulo",
            state: "SP",
            zipCode: "01000-000",
          },
          estimatedDelivery: {
            min: 5,
            max: 7,
          },
          createdAt: new Date().toISOString(),
        };

        setOrderData(sampleOrder);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load order"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-foreground border-t-transparent mx-auto mb-4" />
          <p className="text-lg font-semibold">Loading your order...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-6"
        >
          <div className="text-6xl font-black text-destructive">!</div>
          <h1 className="text-3xl font-black">Order Not Found</h1>
          <p className="text-muted-foreground text-lg">
            {error || "We couldn't find your order. Please check the order ID."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-foreground text-background font-black text-sm hover:bg-foreground/90 transition-colors"
          >
            BACK TO HOME
          </button>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <a
            href="/"
            className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            LLMMerch
          </a>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container max-w-2xl mx-auto px-4 py-16"
      >
        {/* Success Badge */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-foreground/10 border-2 border-foreground flex items-center justify-center"
          >
            <Check className="w-10 h-10 text-foreground" strokeWidth={3} />
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tight">
            ORDER
            <br />
            CONFIRMED
          </h1>

          <p className="text-muted-foreground text-lg">
            Payment received successfully
          </p>
        </motion.div>

        {/* Order Number - Prominently Displayed */}
        <motion.div
          variants={itemVariants}
          className="bg-muted/50 border-2 border-border rounded-lg p-8 mb-8 text-center space-y-2"
        >
          <p className="text-sm font-mono text-muted-foreground uppercase tracking-wider">
            Order Number
          </p>
          <p className="text-5xl font-black font-mono break-all">
            {orderData.orderId}
          </p>
          <p className="text-xs text-muted-foreground pt-4">
            {new Date(orderData.createdAt).toLocaleDateString("pt-BR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </motion.div>

        {/* Payment Status */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {/* Payment Status */}
          <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
            <p className="text-xs font-mono text-muted-foreground mb-2 uppercase">
              Payment
            </p>
            <p className="font-black text-foreground">CONFIRMED</p>
          </div>

          {/* Delivery Time */}
          <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
            <p className="text-xs font-mono text-muted-foreground mb-2 uppercase">
              Delivery
            </p>
            <p className="font-black text-foreground">
              {orderData.estimatedDelivery.min}-{orderData.estimatedDelivery.max}d
            </p>
          </div>

          {/* Order Status */}
          <div className="bg-muted/30 border border-border rounded-lg p-4 text-center">
            <p className="text-xs font-mono text-muted-foreground mb-2 uppercase">
              Status
            </p>
            <p className="font-black text-foreground">PROCESSING</p>
          </div>
        </motion.div>

        {/* Items Ordered */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-lg font-black mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Items Ordered
          </h2>
          <div className="space-y-3">
            {orderData.items.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="flex items-center justify-between border-b border-border pb-4 last:border-b-0"
              >
                <div className="flex items-center gap-4 flex-1">
                  {item.image && (
                    <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden border border-border">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="font-mono font-black text-lg whitespace-nowrap ml-4">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          variants={itemVariants}
          className="bg-muted/30 border-2 border-border rounded-lg p-6 space-y-3 mb-8"
        >
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono">R$ {orderData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="font-mono">R$ {orderData.shipping.toFixed(2)}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-black text-lg">Total</span>
            <span className="font-mono font-black text-2xl">
              R$ {orderData.total.toFixed(2)}
            </span>
          </div>
        </motion.div>

        {/* Shipping Address */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-lg font-black mb-4">Shipping Address</h2>
          <div className="bg-muted/20 border border-border rounded-lg p-6 space-y-2">
            <p className="font-semibold">{orderData.shippingAddress.name}</p>
            <p className="text-muted-foreground">
              {orderData.shippingAddress.street}, {orderData.shippingAddress.number}
            </p>
            <p className="text-muted-foreground">
              {orderData.shippingAddress.city}, {orderData.shippingAddress.state}{" "}
              {orderData.shippingAddress.zipCode}
            </p>
          </div>
        </motion.div>

        {/* Delivery Timeline */}
        <motion.div
          variants={itemVariants}
          className="bg-muted/30 border-2 border-border rounded-lg p-6 mb-8"
        >
          <h2 className="text-lg font-black mb-4">Estimated Delivery</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-black text-sm">
                1
              </div>
              <div>
                <p className="font-semibold">Order Processing</p>
                <p className="text-sm text-muted-foreground">
                  1-2 business days
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-black text-sm">
                2
              </div>
              <div>
                <p className="font-semibold">In Transit</p>
                <p className="text-sm text-muted-foreground">
                  {orderData.estimatedDelivery.min}-{orderData.estimatedDelivery.max}{" "}
                  business days
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-foreground/30 text-foreground flex items-center justify-center font-black text-sm">
                3
              </div>
              <div>
                <p className="font-semibold text-foreground/70">Delivered</p>
                <p className="text-sm text-muted-foreground">
                  Arrives at your door
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div variants={itemVariants} className="space-y-3">
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 bg-foreground text-background font-black text-sm hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2 rounded-lg"
          >
            <ArrowRight className="w-5 h-5" />
            CONTINUE SHOPPING
          </button>
          <button
            onClick={() => router.push("/")}
            className="w-full py-4 border-2 border-foreground text-foreground font-black text-sm hover:bg-foreground/10 transition-colors flex items-center justify-center gap-2 rounded-lg"
          >
            <Home className="w-5 h-5" />
            BACK TO HOME
          </button>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          variants={itemVariants}
          className="mt-12 p-6 bg-muted/20 border border-border/50 rounded-lg text-center text-sm text-muted-foreground space-y-2"
        >
          <p>
            A confirmation email has been sent to your inbox with order details
          </p>
          <p>
            Questions? Check our FAQ or{" "}
            <a href="#contact" className="text-foreground hover:underline">
              contact us
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
