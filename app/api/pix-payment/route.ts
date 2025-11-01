import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/pix-payment
 * Create a PIX payment request via EBANX
 *
 * Body:
 * {
 *   amount: number,           // Amount in BRL
 *   productId: string,
 *   productName: string,
 *   buyerEmail?: string,      // Optional buyer email
 *   buyerName?: string,       // Optional buyer name
 * }
 *
 * Response:
 * {
 *   success: true,
 *   paymentHash: string,      // EBANX payment hash
 *   pixCode: string,          // PIX code (copy-paste)
 *   qrCodeUrl: string,        // QR code URL/image
 *   expiresAt: string,        // Expiration time
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, productId, productName, buyerEmail, buyerName } = body;

    // Validate required fields
    if (!amount || !productId || !productName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: amount, productId, productName' },
        { status: 400 }
      );
    }

    // Get EBANX integration key from environment
    const integrationKey = process.env.EBANX_INTEGRATION_KEY;
    if (!integrationKey) {
      console.error('EBANX_INTEGRATION_KEY not configured');
      return NextResponse.json(
        { success: false, error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    // Prepare EBANX API request
    const ebanxPayload = {
      integration_key: integrationKey,
      operation: 'request',
      payment: {
        name: buyerName || 'Customer',
        email: buyerEmail || `customer@llmmerch.local`,
        document: '00000000000000', // Placeholder - would be collected from user in production
        country: 'br',
        payment_type_code: 'pix',
        merchant_payment_code: `${productId}-${Date.now()}`,
        currency_code: 'BRL',
        amount_total: amount,
        // Metadata for tracking
        description: `Purchase of ${productName}`,
        // PIX configuration
        pix: {
          time_limit: 900, // 15 minutes expiration
        },
      },
    };

    // Call EBANX sandbox API
    const ebanxResponse = await fetch('https://sandbox.ebanx.com/ws/direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ebanxPayload),
    });

    if (!ebanxResponse.ok) {
      console.error('EBANX API error:', ebanxResponse.status, await ebanxResponse.text());
      return NextResponse.json(
        { success: false, error: 'Failed to create payment with EBANX' },
        { status: 500 }
      );
    }

    const ebanxData = await ebanxResponse.json();

    // Check if EBANX response indicates success
    if (ebanxData.status !== 'SUCCESS' || !ebanxData.payment) {
      console.error('EBANX payment creation failed:', ebanxData);
      return NextResponse.json(
        { success: false, error: ebanxData.error_message || 'Payment creation failed' },
        { status: 400 }
      );
    }

    const { payment } = ebanxData;

    // Extract PIX details from response
    const pixCode = payment.pix?.qr_code_value || payment.redirect_url;
    const qrCodeUrl = payment.redirect_url || '';
    const paymentHash = payment.hash;

    // Calculate expiration time (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    return NextResponse.json({
      success: true,
      paymentHash,
      pixCode,
      qrCodeUrl,
      expiresAt,
      status: payment.status, // "PE" = pending
      amount: payment.amount_total,
      currency: payment.currency_code,
    });
  } catch (error) {
    console.error('Error creating PIX payment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
