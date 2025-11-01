/**
 * Order Type Definitions for Fulfillment System
 */

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  // Future enhancement fields
  size?: string;
  color?: string;
  variant?: string;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export type FulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Order extends Record<string, unknown> {
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentStatus: 'PENDING' | 'CONFIRMED' | 'FAILED';
  paymentHash?: string;
  createdAt: string;
  updatedAt: string;
  // Fulfillment fields
  fulfillmentStatus?: FulfillmentStatus;
  trackingNumber?: string;
  estimatedDelivery?: string;
  customerNotes?: string;
  adminNotes?: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface OrderExportData {
  orderId: string;
  date: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: string; // CSV formatted list
  total: number;
  status: string;
}
