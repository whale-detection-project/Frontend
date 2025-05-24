import { NextRequest, NextResponse } from 'next/server';

/**
 * 바이낸스 API에서 24시간 티커 정보를 가져오는 API 라우트 핸들러
 *
 * 이 함수는 특정 암호화폐 심볼(예: BTCUSDT)에 대한 24시간 가격 변동, 거래량 등의 정보를 제공합니다.
 * 클라이언트에서 /api/binance/ticker?symbol=BTCUSDT 와 같이 호출할 수 있습니다.
 */
export async function GET(request: NextRequest) {
  try {
    // 요청 URL에서 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    // 심볼 파라미터가 없으면 400 에러 반환
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 },
      );
    }

    // 바이낸스 API에 24시간 티커 정보 요청
    const response = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
    );

    // API 응답이 성공적이지 않으면 에러 발생
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // 응답 데이터를 JSON으로 파싱하고 클라이언트에 반환
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // 에러 발생 시 콘솔에 로그 기록 후 500 에러 반환
    console.error('Binance API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ticker data' },
      { status: 500 },
    );
  }
}
