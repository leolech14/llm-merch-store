import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/pix-payment-status
 * Check the status of a PIX payment via EBANX
 *
 * Body:
 * {
 *   paymentHash: string  // The payment hash from the create payment response
 * }
 *
 * Response:
 * {
 *   success: true,
 *   status: "PE" | "CO" | "CA",  // PE=pending, CO=confirmed, CA=cancelled
 *   paymentHash: string,
 *   amount: number,
 *   currency: string,
 *   confirmedAt?: string,
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentHash } = body;

    if (!paymentHash) {
      return NextResponse.json(
        { success: false, error: 'Missing paymentHash' },
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

    // Prepare EBANX API request to check payment status
    const ebanxPayload = {
      integration_key: integrationKey,
      operation: 'query',
      hash: paymentHash,
    };

    // Call EBANX sandbox API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const ebanxResponse = await fetch('https://sandbox.ebanx.com/ws/direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ebanxPayload),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!ebanxResponse.ok) {
      console.error('EBANX API error:', ebanxResponse.status, await ebanxResponse.text());
      return NextResponse.json(
        { success: false, error: 'Failed to check payment status' },
        { status: 500 }
      );
    }

    const ebanxData = await ebanxResponse.json();

    // Check if EBANX response indicates success
    if (ebanxData.status !== 'SUCCESS' || !ebanxData.payment) {
      console.error('EBANX payment query failed:', ebanxData);
      return NextResponse.json(
        { success: false, error: 'Failed to retrieve payment information' },
        { status: 400 }
      );
    }

    const { payment } = ebanxData;
    const isConfirmed = payment.status === 'CO'; // CO = confirmed

    return NextResponse.json({
      success: true,
      paymentHash: payment.hash,
      status: payment.status, // "PE" = pending, "CO" = confirmed, "CA" = cancelled
      amount: payment.amount_total,
      currency: payment.currency_code,
      confirmed: isConfirmed,
      confirmedAt: isConfirmed ? payment.transaction_date : undefined,
      merchantCode: payment.merchant_payment_code,
    });
  } catch (error) {
    console.error('Error checking payment status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
