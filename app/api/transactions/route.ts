import { NextRequest, NextResponse } from 'next/server';
import { getTransactionHistory, recordPurchase, recordOffer } from '@/lib/event-store';

/**
 * GET /api/transactions
 *
 * Get transaction history
 * Query params:
 * - ?productId=ask-anything-chest (optional - filter by product)
 *
 * Returns: Array of transactions with buyer, seller, price, timestamp
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId') || undefined;

    const transactions = getTransactionHistory(productId);

    return NextResponse.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions
 *
 * Record a new purchase or offer
 *
 * Body for purchase:
 * {
 *   action: 'purchase',
 *   productId: string,
 *   productName: string,
 *   buyerNickname: string,
 *   price: number,
 *   sellerNickname?: string,  // For P2P resale
 *   originalPrice?: number,
 *   paymentMethod?: 'pix' | 'credit_card' | 'cash',
 * }
 *
 * Body for offer:
 * {
 *   action: 'offer',
 *   productId: string,
 *   productName: string,
 *   buyerNickname: string,
 *   offerAmount: number,
 *   currentOwner?: string,
 *   accepted?: boolean,
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'purchase') {
      const {
        productId,
        productName,
        buyerNickname,
        price,
        sellerNickname,
        originalPrice,
        paymentMethod,
        notes,
      } = body;

      // Validate required fields
      if (!productId || !productName || !buyerNickname || !price) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const event = recordPurchase(productId, productName, buyerNickname, price, {
        sellerNickname,
        originalPrice,
        paymentMethod,
        notes,
      });

      return NextResponse.json({
        success: true,
        event,
        message: sellerNickname
          ? `${buyerNickname} bought from ${sellerNickname} for R$${price}`
          : `${buyerNickname} bought "${productName}" for R$${price}`,
      });
    }

    if (action === 'offer') {
      const {
        productId,
        productName,
        buyerNickname,
        offerAmount,
        currentOwner,
        accepted,
        originalPrice,
      } = body;

      if (!productId || !productName || !buyerNickname || !offerAmount) {
        return NextResponse.json(
          { success: false, error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const event = recordOffer(productId, productName, buyerNickname, offerAmount, currentOwner, {
        accepted,
        originalPrice,
      });

      return NextResponse.json({
        success: true,
        event,
        message: accepted
          ? `${currentOwner} accepted ${buyerNickname}'s offer of R$${offerAmount}`
          : `${buyerNickname} offered R$${offerAmount}`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action. Use "purchase" or "offer"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error recording transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record transaction' },
      { status: 500 }
    );
  }
}
