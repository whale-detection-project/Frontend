// 바이낸스 API 관련 타입 정의 및 유틸리티 클래스
// 암호화폐 거래소 바이낸스의 REST API와 WebSocket을 사용하여 실시간 데이터를 가져옵니다.

// 바이낸스 캔들스틱(OHLCV) 데이터 타입
export interface BinanceKline {
  openTime: number; // 캔들 시작 시간
  open: string; // 시가 (문자열로 전달됨)
  high: string; // 고가
  low: string; // 저가
  close: string; // 종가
  volume: string; // 거래량
  closeTime: number; // 캔들 종료 시간
  quoteAssetVolume: string; // 견적 자산 거래량
  numberOfTrades: number; // 거래 횟수
  takerBuyBaseAssetVolume: string; // 테이커 매수 기본 자산 거래량
  takerBuyQuoteAssetVolume: string; // 테이커 매수 견적 자산 거래량
}

// 바이낸스 24시간 티커 정보 타입
export interface BinanceTicker {
  symbol: string; // 심볼 (예: BTCUSDT)
  priceChange: string; // 24시간 가격 변동
  priceChangePercent: string; // 24시간 가격 변동률
  weightedAvgPrice: string; // 가중 평균 가격
  prevClosePrice: string; // 이전 종가
  lastPrice: string; // 현재 가격
  lastQty: string; // 마지막 거래량
  bidPrice: string; // 매수 호가
  bidQty: string; // 매수 호가량
  askPrice: string; // 매도 호가
  askQty: string; // 매도 호가량
  openPrice: string; // 24시간 시가
  highPrice: string; // 24시간 고가
  lowPrice: string; // 24시간 저가
  volume: string; // 24시간 거래량
  quoteVolume: string; // 24시간 견적 거래량
  openTime: number; // 24시간 시작 시간
  closeTime: number; // 24시간 종료 시간
  firstId: number; // 첫 거래 ID
  lastId: number; // 마지막 거래 ID
  count: number; // 거래 횟수
}

// 차트에서 사용할 캔들 데이터 타입 (바이낸스 데이터를 가공한 형태)
export interface CandleData {
  time: string | number; // 시간 (문자열 또는 숫자)
  open: number; // 시가 (숫자로 변환됨)
  high: number; // 고가
  low: number; // 저가
  close: number; // 종가
  volume?: number; // 거래량 (선택적)
}

// 거래량 데이터 타입
export interface VolumeData {
  time: string | number; // 시간
  value: number; // 거래량 값
  color?: string; // 색상 (선택적)
}

// 바이낸스 WebSocket 캔들스틱 스트림 데이터 타입
export interface BinanceKlineStream {
  e: string; // 이벤트 타입
  E: number; // 이벤트 시간
  s: string; // 심볼
  k: {
    // 캔들스틱 데이터
    t: number; // 캔들 시작 시간
    T: number; // 캔들 종료 시간
    s: string; // 심볼
    i: string; // 간격
    f: number; // 첫 거래 ID
    L: number; // 마지막 거래 ID
    o: string; // 시가
    c: string; // 종가
    h: string; // 고가
    l: string; // 저가
    v: string; // 기본 자산 거래량
    n: number; // 거래 횟수
    x: boolean; // 캔들이 닫혔는지 여부
    q: string; // 견적 자산 거래량
    V: string; // 테이커 매수 기본 자산 거래량
    Q: string; // 테이커 매수 견적 자산 거래량
  };
}

// 바이낸스 WebSocket 티커 스트림 데이터 타입
export interface BinanceTickerStream {
  e: string; // 이벤트 타입
  E: number; // 이벤트 시간
  s: string; // 심볼
  p: string; // 가격 변동
  P: string; // 가격 변동률
  w: string; // 가중 평균 가격
  x: string; // 첫 거래 가격
  c: string; // 현재 가격
  Q: string; // 마지막 거래량
  b: string; // 최고 매수 호가
  B: string; // 최고 매수 호가량
  a: string; // 최고 매도 호가
  A: string; // 최고 매도 호가량
  o: string; // 시가
  h: string; // 고가
  l: string; // 저가
  v: string; // 총 거래 기본 자산 거래량
  q: string; // 총 거래 견적 자산 거래량
  O: number; // 통계 시작 시간
  C: number; // 통계 종료 시간
  F: number; // 첫 거래 ID
  L: number; // 마지막 거래 ID
  n: number; // 총 거래 횟수
}

/**
 * 바이낸스 API를 사용하여 암호화폐 데이터를 가져오는 유틸리티 클래스
 * REST API와 WebSocket을 통해 실시간 데이터를 제공합니다.
 */
export class BinanceAPI {
  // API 엔드포인트 설정
  private static readonly BASE_URL = '/api/binance'; // 프록시 서버 URL
  private static readonly WS_URL = 'wss://stream.binance.com:9443/ws'; // WebSocket URL

  // WebSocket 재연결 관련 설정
  private static reconnectAttempts = 0; // 현재 재연결 시도 횟수
  private static maxReconnectAttempts = 5; // 최대 재연결 시도 횟수

  /**
   * 심볼을 바이낸스 형식으로 정규화
   * 예: "BTC/USDT" -> "BTCUSDT"
   */
  static normalizeSymbol(symbol: string): string {
    return symbol.replace('/', '').toUpperCase();
  }

  /**
   * 타임스탬프를 TradingView 차트 라이브러리에 맞는 형식으로 변환
   * 간격에 따라 다른 형식을 사용합니다.
   */
  static formatTime(timestamp: number, interval: string = '1d'): string | number {
    // 분 단위 간격 (1m, 3m, 5m, 15m, 30m) - Unix 타임스탬프 숫자 사용
    if (interval.includes('m')) {
      return Math.floor(timestamp / 1000);
    }

    // 시간 단위 간격 (1h, 2h, 4h, 6h, 8h, 12h) - Unix 타임스탬프 숫자 사용
    if (interval.includes('h')) {
      return Math.floor(timestamp / 1000);
    }

    // 일/주/월 단위 - 날짜 문자열 (YYYY-MM-DD) 형식
    if (interval.includes('d') || interval.includes('w') || interval.includes('M')) {
      return new Date(timestamp).toISOString().split('T')[0];
    }

    // 기본값: Unix 타임스탬프 숫자
    return Math.floor(timestamp / 1000);
  }

  /**
   * 특정 심볼의 24시간 티커 정보를 가져옵니다.
   * 현재 가격, 변동률, 거래량 등의 정보를 포함합니다.
   */
  static async getTicker(symbol: string): Promise<BinanceTicker> {
    const normalizedSymbol = this.normalizeSymbol(symbol);

    // 재시도 로직 추가
    let lastError: Error | null = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.BASE_URL}/ticker?symbol=${normalizedSymbol}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // 타임아웃 설정
          signal: AbortSignal.timeout(10000), // 10초 타임아웃
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Ticker fetch failed (attempt ${attempt}):`, response.status, errorText);
          throw new Error(`Failed to fetch ticker: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.error(`Ticker fetch error (attempt ${attempt}/${maxRetries}):`, lastError.message);

        // 마지막 시도가 아니면 잠시 대기 후 재시도
        if (attempt < maxRetries) {
          const delay = attempt * 1000; // 1초, 2초, 3초 대기
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // 모든 재시도가 실패한 경우
    throw lastError || new Error('Failed to fetch ticker after all retries');
  }

  /**
   * 캔들스틱 데이터를 가져옵니다.
   * 차트를 그리기 위한 OHLCV (시가, 고가, 저가, 종가, 거래량) 데이터입니다.
   */
  static async getKlines(
    symbol: string,
    interval: string = '1d',
    limit: number = 100,
  ): Promise<CandleData[]> {
    const normalizedSymbol = this.normalizeSymbol(symbol);

    // 재시도 로직 추가
    let lastError: Error | null = null;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // API 호출
        const response = await fetch(
          `${this.BASE_URL}/klines?symbol=${normalizedSymbol}&interval=${interval}&limit=${limit}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            // 타임아웃 설정
            signal: AbortSignal.timeout(15000), // 15초 타임아웃 (klines는 더 큰 데이터)
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Klines fetch failed (attempt ${attempt}):`, response.status, errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        // 바이낸스에서 받은 배열 데이터를 파싱
        const data: number[][] = await response.json();

        // 데이터 유효성 검사
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Invalid or empty klines data received');
        }

        // 바이낸스 형식을 차트에서 사용할 형식으로 변환
        const candleData = data.map((kline) => {
          // 데이터 유효성 검사
          if (!Array.isArray(kline) || kline.length < 6) {
            throw new Error('Invalid kline data format');
          }

          return {
            time: this.formatTime(kline[0], interval), // 시간
            open: parseFloat(kline[1].toString()), // 시가
            high: parseFloat(kline[2].toString()), // 고가
            low: parseFloat(kline[3].toString()), // 저가
            close: parseFloat(kline[4].toString()), // 종가
            volume: parseFloat(kline[5].toString()), // 거래량
          };
        });

        return candleData;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // 마지막 시도가 아니면 잠시 대기 후 재시도
        if (attempt < maxRetries) {
          const delay = attempt * 1500; // 1.5초, 3초, 4.5초 대기
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // 모든 재시도가 실패한 경우
    console.error('캔들스틱 데이터 가져오기 실패 (모든 재시도 완료):', lastError?.message);
    throw lastError || new Error('Failed to fetch klines after all retries');
  }

  /**
   * WebSocket 연결을 생성하여 실시간 데이터를 받습니다.
   * 현재는 티커 데이터만 구독합니다.
   */
  static createWebSocket(
    symbol: string,
    onKlineUpdate: (data: BinanceKlineStream) => void,
    onTickerUpdate: (data: BinanceTickerStream) => void,
  ): WebSocket | null {
    // 서버 사이드에서는 WebSocket을 사용할 수 없음
    if (typeof window === 'undefined') return null;

    const normalizedSymbol = this.normalizeSymbol(symbol).toLowerCase();

    // 티커 스트림 URL 생성 (더 안정적이므로 티커만 사용)
    const wsUrl = `${this.WS_URL}/${normalizedSymbol}@ticker`;

    try {
      const ws = new WebSocket(wsUrl);

      // 연결 성공 시
      ws.onopen = () => {
        this.reconnectAttempts = 0; // 연결 성공 시 재연결 시도 횟수 초기화
      };

      // 메시지 수신 시
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onTickerUpdate(data); // 콜백 함수 호출
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
        }
      };

      // 에러 발생 시
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // 개발 환경에서는 더 자세한 정보 출력
        if (process.env.NODE_ENV === 'development') {
          console.error('WebSocket error details:', {
            readyState: ws.readyState,
            url: wsUrl,
            error: error,
          });
        }
      };

      // 연결 종료 시
      ws.onclose = (event) => {
        // 비정상적인 종료인 경우 재연결 시도
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;

          // 점진적으로 재연결 간격 증가 (3초, 6초, 9초...)
          setTimeout(() => {
            this.createWebSocket(symbol, onKlineUpdate, onTickerUpdate);
          }, 3000 * this.reconnectAttempts);
        }
      };

      return ws;
    } catch (error) {
      console.error('WebSocket creation error:', error);
      return null;
    }
  }

  /**
   * WebSocket 연결 상태를 확인합니다.
   */
  static isWebSocketConnected(ws: WebSocket | null): boolean {
    return ws !== null && ws.readyState === WebSocket.OPEN;
  }

  /**
   * WebSocket 연결을 안전하게 종료합니다.
   */
  static closeWebSocket(ws: WebSocket | null): void {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close(1000, 'Normal closure');
    }
  }

  /**
   * 인기 있는 암호화폐 심볼 목록을 반환합니다.
   */
  static getPopularSymbols(): string[] {
    return [
      'BTC/USDT', // 비트코인
      'ETH/USDT', // 이더리움
      'BNB/USDT', // 바이낸스 코인
      'ADA/USDT', // 카르다노
      'SOL/USDT', // 솔라나
      'XRP/USDT', // 리플
      'DOT/USDT', // 폴카닷
      'DOGE/USDT', // 도지코인
      'AVAX/USDT', // 아발란체
      'MATIC/USDT', // 폴리곤
    ];
  }

  /**
   * 이상 탐지 시뮬레이션 함수
   * 실제 프로덕션에서는 LSTM 모델의 결과를 사용해야 합니다.
   * 현재는 5% 이상의 급격한 변동을 이상치로 간주합니다.
   */
  static detectAnomalies(candleData: CandleData[]): Array<{ time: string; value: number }> {
    const anomalies: Array<{ time: string; value: number }> = [];

    // 각 캔들을 이전 캔들과 비교하여 이상치 탐지
    for (let i = 1; i < candleData.length; i++) {
      const current = candleData[i];
      const previous = candleData[i - 1];

      // 가격 변동률 계산
      const changePercent = Math.abs((current.close - previous.close) / previous.close) * 100;

      // 5% 이상의 급격한 변동을 이상치로 간주
      if (changePercent > 5) {
        anomalies.push({
          time: current.time.toString(),
          value: current.high + current.high * 0.01, // 캔들 위쪽에 마커 표시
        });
      }
    }

    return anomalies;
  }
}
