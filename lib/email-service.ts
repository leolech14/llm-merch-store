import nodemailer from 'nodemailer';
import type { Order } from '@/types/orders';

/**
 * Email Service for Order Notifications
 * Uses SMTP to send order confirmation emails to admin
 *
 * Supports both full Order type and simplified webhook Order type
 */

interface EmailConfig {
  from: string;
  to: string;
  smtp: {
    host: string;
    port: number;
    user: string;
    password: string;
  };
}

// Type to handle both complete and simplified order structures
type OrderLike = any;

function getEmailConfig(): EmailConfig {
  const from = process.env.EMAIL_FROM || 'orders@llmmerch.space';
  const to = process.env.EMAIL_TO || process.env.EMAIL_FROM || 'orders@llmmerch.space';

  return {
    from,
    to,
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
    },
  };
}

function createTransporter() {
  const config = getEmailConfig();

  return nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: {
      user: config.smtp.user,
      pass: config.smtp.password,
    },
  });
}

function formatOrderEmail(order: OrderLike): string {
  const orderId = (order as any).orderId || 'N/A';
  const amount = (order as any).amount || (order as any).total || 0;
  const paymentStatus = (order as any).paymentStatus || (order as any).status || 'N/A';
  const paymentHash = (order as any).paymentHash || (order as any).hash || 'N/A';
  const timestamp = (order as any).createdAt || (order as any).timestamp || new Date().toISOString();

  // Check if this is a full Order with items and shipping info
  const items = (order as any).items;
  const shippingAddress = (order as any).shippingAddress;
  const subtotal = (order as any).subtotal;
  const shipping = (order as any).shipping;

  let emailBody = `
🎉 NEW ORDER RECEIVED!

Order ID: ${orderId}
Date: ${new Date(timestamp).toLocaleString('pt-BR')}
Payment Status: ${paymentStatus}
Payment Hash: ${typeof paymentHash === 'string' ? paymentHash.slice(0, 8) + '...' : paymentHash}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

  // Add items section if available
  if (items && Array.isArray(items)) {
    const itemsList = items
      .map((item: any) => `  - ${item.name} x${item.quantity} - R$ ${item.price.toFixed(2)}`)
      .join('\n');

    emailBody += `

📦 ITEMS:
${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 PAYMENT DETAILS:
Subtotal: R$ ${subtotal.toFixed(2)}
Shipping: R$ ${shipping.toFixed(2)}
TOTAL: R$ ${amount.toFixed(2)}`;
  } else {
    // Simplified order (webhook format)
    emailBody += `

💰 AMOUNT: R$ ${amount.toFixed(2)}`;
  }

  // Add shipping address if available
  if (shippingAddress) {
    emailBody += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📮 SHIPPING ADDRESS:
${shippingAddress.fullName}
${shippingAddress.email}
${shippingAddress.phone}

${shippingAddress.address}
${shippingAddress.city}, ${shippingAddress.state}
CEP: ${shippingAddress.zipCode}`;
  }

  emailBody += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎃 LLMmerch.space - Halloween Party Orders
View all orders: https://llmmerch.space/admin/orders
  `;

  return emailBody.trim();
}

export async function sendOrderNotification(order: OrderLike): Promise<void> {
  try {
    const config = getEmailConfig();

    // Skip if SMTP not configured (development mode)
    if (!config.smtp.user || !config.smtp.password) {
      console.log('[Email] SMTP not configured, skipping email notification');
      console.log('[Email] Order details:', {
        orderId: (order as any).orderId,
        total: (order as any).total || (order as any).amount,
        customer: (order as any).shippingAddress?.fullName || 'Unknown',
      });
      return;
    }

    const transporter = createTransporter();
    const emailBody = formatOrderEmail(order);
    const orderId = (order as any).orderId;
    const amount = (order as any).amount || (order as any).total || 0;

    await transporter.sendMail({
      from: config.from,
      to: config.to,
      subject: `🎃 New Order: ${orderId} - R$ ${amount.toFixed(2)}`,
      text: emailBody,
    });

    console.log('[Email] Order notification sent:', orderId);
  } catch (error) {
    // Don't throw - email failure shouldn't block order processing
    console.error('[Email] Failed to send notification:', error);
  }
}
