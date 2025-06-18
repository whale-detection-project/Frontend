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
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        },
      );
    }

    // 바이낸스 API에 24시간 티커 정보 요청
    const binanceUrl = `${process.env.BINANCE_API_URL}/api/v3/ticker/24hr?symbol=${symbol}`;

    const response = await fetch(binanceUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CryptoApp/1.0)',
        Accept: 'application/json',
      },
    });

    // API 응답이 성공적이지 않으면 에러 발생
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    // 응답 데이터를 JSON으로 파싱하고 클라이언트에 반환
    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    // 에러 발생 시 500 에러 반환
    return NextResponse.json(
      {
        error: 'Failed to fetch ticker data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      },
    );
  }
}

// OPTIONS 메서드 핸들러 추가 (CORS preflight 요청 처리)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
