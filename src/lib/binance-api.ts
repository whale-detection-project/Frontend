export interface BinanceKline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

export interface BinanceTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export interface CandleData {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface VolumeData {
  time: string | number;
  value: number;
  color?: string;
}

export interface BinanceKlineStream {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  k: {
    t: number; // Kline start time
    T: number; // Kline close time
    s: string; // Symbol
    i: string; // Interval
    f: number; // First trade ID
    L: number; // Last trade ID
    o: string; // Open price
    c: string; // Close price
    h: string; // High price
    l: string; // Low price
    v: string; // Base asset volume
    n: number; // Number of trades
    x: boolean; // Is this kline closed?
    q: string; // Quote asset volume
    V: string; // Taker buy base asset volume
    Q: string; // Taker buy quote asset volume
  };
}

export interface BinanceTickerStream {
  e: string; // Event type
  E: number; // Event time
  s: string; // Symbol
  p: string; // Price change
  P: string; // Price change percent
  w: string; // Weighted average price
  x: string; // First trade(F)-1 price (first trade before the 24hr rolling window)
  c: string; // Last price
  Q: string; // Last quantity
  b: string; // Best bid price
  B: string; // Best bid quantity
  a: string; // Best ask price
  A: string; // Best ask quantity
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
  O: number; // Statistics open time
  C: number; // Statistics close time
  F: number; // First trade ID
  L: number; // Last trade Id
  n: number; // Total number of trades
}

export class BinanceAPI {
  private static readonly BASE_URL = '/api/binance';
  private static readonly WS_URL = 'wss://stream.binance.com:9443/ws';

  // 심볼 정규화 (예: BTC/USD -> BTCUSDT)
  static normalizeSymbol(symbol: string): string {
    return symbol.replace('/', '').toUpperCase();
  }

  // 날짜를 TradingView 형식으로 변환
  static formatTime(
    timestamp: number,
    interval: string = '1d',
  ): string | number {
    // 분 단위 간격의 경우 (1m, 3m, 5m, 15m, 30m) - Unix 타임스탬프 숫자 사용
    if (interval.includes('m')) {
      return Math.floor(timestamp / 1000);
    }

    // 시간 단위 간격의 경우 (1h, 2h, 4h, 6h, 8h, 12h) - Unix 타임스탬프 숫자 사용
    if (interval.includes('h')) {
      return Math.floor(timestamp / 1000);
    }

    // 일/주/월 단위의 경우 날짜 문자열 (YYYY-MM-DD)
    if (
      interval.includes('d') ||
      interval.includes('w') ||
      interval.includes('M')
    ) {
      return new Date(timestamp).toISOString().split('T')[0];
    }

    // 기본값: Unix 타임스탬프 숫자
    return Math.floor(timestamp / 1000);
  }

  // 24시간 티커 정보 가져오기
  static async getTicker(symbol: string): Promise<BinanceTicker> {
    const normalizedSymbol = this.normalizeSymbol(symbol);
    const response = await fetch(
      `${this.BASE_URL}/ticker?symbol=${normalizedSymbol}`,
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ticker: ${response.statusText}`);
    }

    return response.json();
  }

  // 캔들스틱 데이터 가져오기
  static async getKlines(
    symbol: string,
    interval: string = '1d',
    limit: number = 100,
  ): Promise<CandleData[]> {
    try {
      const normalizedSymbol = this.normalizeSymbol(symbol);
      console.log(
        `Fetching klines: ${normalizedSymbol}, ${interval}, ${limit}`,
      );

      const response = await fetch(
        `${this.BASE_URL}/klines?symbol=${normalizedSymbol}&interval=${interval}&limit=${limit}`,
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Klines fetch error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: number[][] = await response.json();
      console.log(`Received ${data.length} klines for ${normalizedSymbol}`);

      return data.map(kline => ({
        time: this.formatTime(kline[0], interval),
        open: parseFloat(kline[1].toString()),
        high: parseFloat(kline[2].toString()),
        low: parseFloat(kline[3].toString()),
        close: parseFloat(kline[4].toString()),
        volume: parseFloat(kline[5].toString()),
      }));
    } catch (error) {
      console.error('캔들스틱 데이터 가져오기 실패:', error);
      throw error; // 에러를 다시 던져서 상위에서 처리할 수 있도록
    }
  }

  // WebSocket 연결 생성 (실시간 데이터)
  static createWebSocket(
    symbol: string,
    onKlineUpdate: (data: BinanceKlineStream) => void,
    onTickerUpdate: (data: BinanceTickerStream) => void,
  ): WebSocket | null {
    if (typeof window === 'undefined') return null;

    const normalizedSymbol = this.normalizeSymbol(symbol).toLowerCase();

    // 티커 스트림만 연결 (더 안정적)
    const wsUrl = `${this.WS_URL}/${normalizedSymbol}@ticker`;
    console.log('Connecting to WebSocket:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected successfully');
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket ticker data received:', data);
          onTickerUpdate(data);
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
        }
      };

      ws.onerror = error => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = event => {
        console.log('WebSocket connection closed:', event.code, event.reason);
      };

      return ws;
    } catch (error) {
      console.error('WebSocket creation error:', error);
      return null;
    }
  }

  // 인기 심볼 목록
  static getPopularSymbols(): string[] {
    return [
      'BTC/USDT',
      'ETH/USDT',
      'BNB/USDT',
      'ADA/USDT',
      'SOL/USDT',
      'XRP/USDT',
      'DOT/USDT',
      'DOGE/USDT',
      'AVAX/USDT',
      'MATIC/USDT',
    ];
  }

  // 이상 탐지 시뮬레이션 (실제로는 LSTM 모델 결과)
  static detectAnomalies(
    candleData: CandleData[],
  ): Array<{ time: string; value: number }> {
    const anomalies: Array<{ time: string; value: number }> = [];

    for (let i = 1; i < candleData.length; i++) {
      const current = candleData[i];
      const previous = candleData[i - 1];

      // 5% 이상의 급격한 변동을 이상치로 간주
      const changePercent =
        Math.abs((current.close - previous.close) / previous.close) * 100;

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
