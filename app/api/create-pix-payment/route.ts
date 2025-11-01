import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia' as any,
});

export async function POST(req: NextRequest) {
  try {
    const { amount, productId, productName } = await req.json();

    // Create PaymentIntent with PIX
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to centavos
      currency: 'brl',
      payment_method_types: ['pix'],

      payment_method_options: {
        pix: {
          expires_after_seconds: 600, // 10 minutes
        },
      },

      metadata: {
        productId,
        productName,
        timestamp: new Date().toISOString(),
      },
    });

    // Confirm the payment to generate PIX code
    const confirmedIntent = await stripe.paymentIntents.confirm(
      paymentIntent.id,
      {
        payment_method_data: {
          type: 'pix',
        },
        return_url: `${process.env.NEXT_PUBLIC_URL || 'https://llmmerch.space'}/payment/success`,
      }
    );

    // Extract PIX data
    const pixData = confirmedIntent.next_action?.pix_display_qr_code;

    if (!pixData) {
      throw new Error('Failed to generate PIX code');
    }

    return NextResponse.json({
      success: true,
      paymentIntentId: confirmedIntent.id,
      clientSecret: confirmedIntent.client_secret,
      pixCode: pixData.data,
      qrCodeUrl: pixData.image_url_png,
      expiresAt: pixData.expires_at,
      amount,
    });
  } catch (error: any) {
    console.error('PIX creation error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
