import { NextRequest, NextResponse } from 'next/server';

const VALID_INTERVALS = [
  '1m',
  '3m',
  '5m',
  '15m',
  '30m',
  '1h',
  '2h',
  '4h',
  '6h',
  '8h',
  '12h',
  '1d',
  '3d',
  '1w',
  '1M',
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') || '1d';
    const limit = searchParams.get('limit') || '100';

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 },
      );
    }

    // 유효한 간격인지 확인
    if (!VALID_INTERVALS.includes(interval)) {
      return NextResponse.json(
        {
          error: `Invalid interval. Valid intervals: ${VALID_INTERVALS.join(
            ', ',
          )}`,
        },
        { status: 400 },
      );
    }

    console.log(
      `Fetching klines for ${symbol}, interval: ${interval}, limit: ${limit}`,
    );

    const response = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Binance API error:', response.status, errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`,
      );
    }

    const data = await response.json();
    console.log(`Successfully fetched ${data.length} klines for ${symbol}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Binance API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch klines data' },
      { status: 500 },
    );
  }
}
