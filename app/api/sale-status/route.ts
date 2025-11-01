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

  // Fixed sale start time: 57 hours 25 minutes from now (Nov 2, 2025 9:25 PM)
  const startTime = new Date(now.getTime() + (57 * 60 * 60 * 1000) + (25 * 60 * 1000));
  const endTime = new Date(startTime.getTime() + (24 * 60 * 60 * 1000)); // 24 hours after start

  let status: 'before' | 'during' | 'after';
  let isActive = false;
  let timeUntilStart: number | undefined;
  let timeUntilEnd: number | undefined;

  if (now < startTime) {
    // Before sale
    status = 'before';
    isActive = false;
    timeUntilStart = startTime.getTime() - now.getTime();
  } else if (now >= startTime && now < endTime) {
    // During sale
    status = 'during';
    isActive = true;
    timeUntilEnd = endTime.getTime() - now.getTime();
  } else {
    // After sale
    status = 'after';
    isActive = false;
  }

  const response: SaleStatus = {
    isActive,
    status,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    ...(timeUntilStart !== undefined && { timeUntilStart }),
    ...(timeUntilEnd !== undefined && { timeUntilEnd })
  };

  return NextResponse.json(response);
}
