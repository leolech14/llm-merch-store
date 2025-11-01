import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const OFFERS_FILE = path.join(process.cwd(), 'data', 'offers.json');

interface Offer {
  id: string;
  productId: string;
  productName: string;
  buyerEmail: string;
  buyerNickname: string;
  offerAmount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

interface OffersData {
  offers: Offer[];
  lastUpdated: string;
}

function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function getOffers(): OffersData {
  ensureDataDir();
  try {
    if (fs.existsSync(OFFERS_FILE)) {
      return JSON.parse(fs.readFileSync(OFFERS_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Error reading offers file:', error);
  }

  return {
    offers: [],
    lastUpdated: new Date().toISOString()
  };
}

function saveOffers(data: OffersData) {
  ensureDataDir();
  try {
    fs.writeFileSync(OFFERS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving offers file:', error);
  }
}

// GET: Fetch all offers or offers for a specific product
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const userEmail = searchParams.get('userEmail');

  const offersData = getOffers();
  let offers = offersData.offers;

  if (productId) {
    offers = offers.filter(o => o.productId === productId);
  }

  if (userEmail) {
    offers = offers.filter(o => o.buyerEmail === userEmail);
  }

  // Group offers by product
  const offersByProduct = offers.reduce((acc, offer) => {
    if (!acc[offer.productId]) {
      acc[offer.productId] = [];
    }
    acc[offer.productId].push(offer);
    return acc;
  }, {} as { [key: string]: Offer[] });

  return NextResponse.json({ offers, offersByProduct });
}

// POST: Create a new offer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, productName, buyerEmail, buyerNickname, offerAmount, message } = body;

    // Enhanced validation
    const errors: string[] = [];

    if (!productId || typeof productId !== 'string') {
      errors.push('productId required (string)');
    }
    if (!buyerEmail || typeof buyerEmail !== 'string' || !buyerEmail.includes('@')) {
      errors.push('buyerEmail required (valid email)');
    }
    if (!buyerNickname || typeof buyerNickname !== 'string') {
      errors.push('buyerNickname required (string)');
    } else if (buyerNickname.length > 50) {
      errors.push('buyerNickname max 50 characters');
    }
    if (typeof offerAmount !== 'number' || !Number.isFinite(offerAmount)) {
      errors.push('offerAmount must be a valid number');
    } else if (offerAmount < 150) {
      errors.push('offerAmount must be >= R$150 (base price: R$149)');
    } else if (offerAmount > 10000) {
      errors.push('offerAmount unrealistic (max: R$10,000)');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const offersData = getOffers();

    const newOffer: Offer = {
      id: `offer_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      productId,
      productName,
      buyerEmail,
      buyerNickname,
      offerAmount,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    offersData.offers.push(newOffer);
    offersData.lastUpdated = new Date().toISOString();

    saveOffers(offersData);

    return NextResponse.json({ success: true, offer: newOffer });
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}

// PUT: Accept or reject an offer
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { offerId, action, ownerEmail } = body;

    if (!offerId || !action || !ownerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (action !== 'accept' && action !== 'reject') {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    const offersData = getOffers();
    const offer = offersData.offers.find(o => o.id === offerId);

    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      );
    }

    if (offer.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Offer already processed' },
        { status: 400 }
      );
    }

    offer.status = action === 'accept' ? 'accepted' : 'rejected';
    offer.updatedAt = new Date().toISOString();

    offersData.lastUpdated = new Date().toISOString();
    saveOffers(offersData);

    return NextResponse.json({ success: true, offer });
  } catch (error) {
    console.error('Error updating offer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update offer' },
      { status: 500 }
    );
  }
}
