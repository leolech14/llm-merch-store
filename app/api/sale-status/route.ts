import { NextResponse } from 'next/server';

export interface SaleStatus {
  isActive: boolean;
  status: 'before' | 'during' | 'after';
  startTime: string;
  endTime: string;
  timeUntilStart?: number;
  timeUntilEnd?: number;
  nextSaleStart?: string;
}

export async function GET() {
  const now = new Date();

  // São Paulo timezone offset (UTC-3)
  const saoPauloOffset = -3 * 60; // minutes
  const localOffset = now.getTimezoneOffset();
  const offsetDiff = (saoPauloOffset - localOffset) * 60 * 1000;

  // Get current date in São Paulo
  const saoPauloNow = new Date(now.getTime() + offsetDiff);

  // SALE START: Tonight at 9 PM São Paulo time (November 1, 2025 9:00 PM BRT)
  const startTime = new Date(saoPauloNow);
  startTime.setHours(21, 0, 0, 0); // 9 PM tonight

  // If it's already past 9 PM today, don't move to next day - sale is active!
  if (saoPauloNow.getHours() >= 21) {
    // Sale is active now! Keep tonight's date
    startTime.setHours(21, 0, 0, 0);
  }

  // SALE END: Sunday November 2, 2025 at 9:00 PM BRT (next Sunday)
  const endTime = new Date(saoPauloNow);
  const daysUntilSunday = (7 - saoPauloNow.getDay()) % 7; // Days until Sunday
  const sundayDate = daysUntilSunday === 0 ? 0 : daysUntilSunday; // If today is Sunday, use today

  endTime.setDate(saoPauloNow.getDate() + (sundayDate === 0 ? 0 : daysUntilSunday));
  endTime.setHours(21, 0, 0, 0); // 9 PM Sunday

  // If Sunday 9 PM already passed, extend to next Sunday
  if (saoPauloNow > endTime) {
    endTime.setDate(endTime.getDate() + 7);
  }

  // Convert back to server time for comparison
  const startTimeServer = new Date(startTime.getTime() - offsetDiff);
  const endTimeServer = new Date(endTime.getTime() - offsetDiff);

  // TEST MODE: Allow purchases before countdown ends
  // Set TEST_MODE=true in Vercel to enable
  const TEST_MODE = process.env.TEST_MODE === 'true';

  if (TEST_MODE) {
    console.log('[Sale Status] TEST MODE ENABLED - Sale is always active');
  }

  let status: 'before' | 'during' | 'after';
  let isActive = false;
  let timeUntilStart: number | undefined;
  let timeUntilEnd: number | undefined;

  if (now < startTimeServer) {
    // Before sale
    status = 'before';
    isActive = TEST_MODE; // ✅ TEST MODE: Allow purchases even before countdown
    timeUntilStart = startTimeServer.getTime() - now.getTime();
  } else if (now >= startTimeServer && now < endTimeServer) {
    // During sale - ACTIVE!
    status = 'during';
    isActive = true;
    timeUntilEnd = endTimeServer.getTime() - now.getTime();
  } else {
    // After sale
    status = 'after';
    isActive = TEST_MODE; // ✅ TEST MODE: Keep active even after sale ends
  }

  const response: SaleStatus = {
    isActive,
    status,
    startTime: startTimeServer.toISOString(),
    endTime: endTimeServer.toISOString(),
    ...(timeUntilStart !== undefined && { timeUntilStart }),
    ...(timeUntilEnd !== undefined && { timeUntilEnd })
  };

  return NextResponse.json(response);
}
