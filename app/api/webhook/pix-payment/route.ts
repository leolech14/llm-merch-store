import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * POST /api/webhook/pix-payment
 *
 * Webhook handler for EBANX payment confirmation callbacks.
 *
 * EBANX will POST to this endpoint when a payment status changes.
 *
 * Expected payload:
 * {
 *   merchant_payment_code: string,  // Format: "productId-timestamp"
 *   status: string,                  // "CO" = confirmed, "PE" = pending, "CA" = cancelled
 *   hash: string,                    // Payment hash
 *   amount_total: number,            // Amount in BRL
 *   currency_code: string,           // "BRL"
 * }
 */

interface EBANXWebhookPayload {
  merchant_payment_code: string;
  status: string;
  hash: string;
  amount_total: number;
  currency_code: string;
  payment_type_code?: string;
  [key: string]: unknown;
}

interface Product {
  name: string;
  stock: number;
  sold: boolean;
}

interface Inventory {
  products: Record<string, Product>;
  lastUpdated: string;
}

interface Order {
  orderId: string;
  productId: string;
  amount: number;
  paymentHash: string;
  timestamp: string;
  status: string;
  merchantPaymentCode: string;
}

// Atomic file operation helper with locking mechanism
async function withFileLock<T>(
  filePath: string,
  operation: (data: T) => Promise<T>,
  initialData: T
): Promise<T> {
  const lockFile = `${filePath}.lock`;
  const maxRetries = 10;
  const retryDelay = 100; // milliseconds

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Try to create lock file (atomic operation)
      await fs.writeFile(lockFile, 'locked', { flag: 'wx' });

      try {
        // Read current data
        let data: T;
        try {
          const content = await fs.readFile(filePath, 'utf-8');
          data = JSON.parse(content);
        } catch {
          // File doesn't exist or is invalid, use initial data
          data = initialData;
        }

        // Perform operation
        const updatedData = await operation(data);

        // Write back atomically
        await fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), 'utf-8');

        return updatedData;
      } finally {
        // Clean up lock file
        try {
          await fs.unlink(lockFile);
        } catch {
          // Ignore cleanup errors
        }
      }
    } catch (error) {
      if (attempt < maxRetries - 1) {
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        throw error;
      }
    }
  }

  throw new Error(`Failed to acquire lock for ${filePath}`);
}

async function updateInventory(productId: string): Promise<void> {
  const inventoryPath = path.join(process.cwd(), 'data', 'inventory.json');

  await withFileLock<Inventory>(
    inventoryPath,
    async (inventory) => {
      const product = inventory.products[productId];

      if (!product) {
        throw new Error(`Product not found: ${productId}`);
      }

      if (product.stock > 0) {
        product.stock -= 1;
        if (product.stock === 0) {
          product.sold = true;
        }
      }

      inventory.lastUpdated = new Date().toISOString();
      return inventory;
    },
    { products: {}, lastUpdated: new Date().toISOString() }
  );
}

async function logTransaction(order: Order): Promise<void> {
  const ordersPath = path.join(process.cwd(), 'data', 'orders.json');

  await withFileLock<Order[]>(
    ordersPath,
    async (orders) => {
      orders.push(order);
      return orders;
    },
    []
  );
}

function parseWebhookPayload(payload: unknown): EBANXWebhookPayload {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid webhook payload');
  }

  const data = payload as Record<string, unknown>;

  const merchant_payment_code = data.merchant_payment_code;
  const status = data.status;
  const hash = data.hash;
  const amount_total = data.amount_total;
  const currency_code = data.currency_code;

  if (
    typeof merchant_payment_code !== 'string' ||
    typeof status !== 'string' ||
    typeof hash !== 'string' ||
    typeof amount_total !== 'number' ||
    typeof currency_code !== 'string'
  ) {
    throw new Error('Invalid webhook payload: missing or invalid required fields');
  }

  return {
    merchant_payment_code,
    status,
    hash,
    amount_total,
    currency_code,
    ...data,
  };
}

function extractProductIdFromMerchantCode(merchantCode: string): string {
  // Format: "productId-timestamp"
  const parts = merchantCode.split('-');
  if (parts.length < 2) {
    throw new Error(`Invalid merchant payment code format: ${merchantCode}`);
  }
  // Everything except the last part (timestamp) is the product ID
  return parts.slice(0, -1).join('-');
}

export async function POST(request: NextRequest) {
  const requestId = `webhook-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  try {
    console.log(`[${requestId}] Received EBANX webhook request`);

    // Parse webhook payload
    let payload: EBANXWebhookPayload;
    try {
      const body = await request.json();
      payload = parseWebhookPayload(body);
    } catch (error) {
      console.error(`[${requestId}] Failed to parse webhook payload:`, error);
      // Return 200 OK anyway (webhook best practice: don't let sender retry on bad data)
      return NextResponse.json(
        { status: 'ignored', reason: 'Invalid payload format' },
        { status: 200 }
      );
    }

    const { merchant_payment_code, status, hash, amount_total } = payload;

    console.log(
      `[${requestId}] Webhook details:`,
      JSON.stringify({
        merchantPaymentCode: merchant_payment_code,
        status,
        amount: amount_total,
        hash: hash.slice(0, 8) + '...',
      })
    );

    // Only process confirmed payments (status: 'CO')
    if (status !== 'CO') {
      console.log(
        `[${requestId}] Payment status is not confirmed (${status}), ignoring webhook`
      );
      return NextResponse.json(
        { status: 'acknowledged', message: 'Non-confirmed payment status' },
        { status: 200 }
      );
    }

    // Extract product ID from merchant payment code
    let productId: string;
    try {
      productId = extractProductIdFromMerchantCode(merchant_payment_code);
    } catch (error) {
      console.error(`[${requestId}] Failed to extract product ID:`, error);
      // Still return 200 OK (no point retrying if data is malformed)
      return NextResponse.json(
        { status: 'ignored', reason: 'Invalid merchant payment code format' },
        { status: 200 }
      );
    }

    // Generate order ID
    const orderId = `order-${hash.slice(0, 8)}-${Date.now()}`;

    // Process payment: update inventory and log transaction
    try {
      // Update inventory (decrement stock)
      await updateInventory(productId);
      console.log(`[${requestId}] Inventory updated for product: ${productId}`);

      // Log transaction
      const order: Order = {
        orderId,
        productId,
        amount: amount_total,
        paymentHash: hash,
        timestamp: new Date().toISOString(),
        status: 'CONFIRMED',
        merchantPaymentCode: merchant_payment_code,
      };

      await logTransaction(order);
      console.log(`[${requestId}] Transaction logged:`, orderId);

      // Send email notification
      try {
        const { sendOrderNotification } = await import('@/lib/email-service');
        await sendOrderNotification(order as any);
      } catch (emailError) {
        console.error(`[${requestId}] Email notification failed:`, emailError);
        // Continue - don't block order confirmation
      }

      // Success response
      return NextResponse.json(
        {
          status: 'success',
          orderId,
          message: 'Payment processed and inventory updated',
        },
        { status: 200 }
      );
    } catch (error) {
      console.error(`[${requestId}] Error processing payment:`, error);

      // Still return 200 OK per webhook best practices
      // In production, you'd want to implement a retry mechanism or manual review process
      return NextResponse.json(
        {
          status: 'acknowledged',
          message: 'Webhook received but processing encountered an error',
          orderId,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(`[${requestId}] Unexpected error in webhook handler:`, error);
    // Return 200 OK to prevent EBANX from retrying indefinitely
    return NextResponse.json(
      { status: 'error', message: 'Unexpected server error' },
      { status: 200 }
    );
  }
}
