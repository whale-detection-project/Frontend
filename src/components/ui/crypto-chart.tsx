/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  Time,
  CandlestickData,
  LineData,
  HistogramData,
} from 'lightweight-charts';
import { BinanceAPI } from '@/lib/binance-api';
import { useTheme } from '@/contexts/theme-context';
import {
  RefreshCw,
  TrendingDown,
  TrendingUp,
  BarChart,
  LineChart,
  CheckSquare,
  Square,
} from 'lucide-react';

// 컴포넌트 Props 타입 정의
interface CryptoChartProps {
  symbol?: string; // 표시할 암호화폐 심볼 (기본값: BTCUSDT)
  height?: number; // 차트 높이 (기본값: 400px)
}

// 차트 타입 정의
type ChartType = 'candlestick' | 'line'; // 캔들스틱 또는 라인 차트

// 시간 간격 타입 정의
type TimeInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

// 인기 암호화폐 심볼 목록 (드롭다운에서 사용)
const POPULAR_SYMBOLS = [
  'BTCUSDT', // 비트코인
  'ETHUSDT', // 이더리움
  'BNBUSDT', // 바이낸스 코인
  'ADAUSDT', // 카르다노
  'SOLUSDT', // 솔라나
  'XRPUSDT', // 리플
  'DOTUSDT', // 폴카닷
  'DOGEUSDT', // 도지코인
  'AVAXUSDT', // 아발란체
  'MATICUSDT', // 폴리곤
];

// 시간 간격 옵션 (버튼에 표시될 텍스트와 값)
const TIME_INTERVALS = [
  { value: '1m', label: '1분' },
  { value: '5m', label: '5분' },
  { value: '15m', label: '15분' },
  { value: '1h', label: '1시간' },
  { value: '4h', label: '4시간' },
  { value: '1d', label: '1일' },
  { value: '1w', label: '1주' },
];

export default function CryptoChart({
  symbol: initialSymbol = 'BTCUSDT', // 기본 심볼
  height = 400, // 기본 높이
}: CryptoChartProps) {
  // DOM 요소 참조 (차트가 렌더링될 div)
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // 차트 API 참조들 (차트 조작을 위해 필요)
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // 테마 컨텍스트 (다크모드/라이트모드)
  const { theme } = useTheme();

  // === 상태 관리 ===
  const [symbol, setSymbol] = useState(initialSymbol); // 현재 선택된 심볼
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('1d'); // 현재 시간 간격
  const [chartType, setChartType] = useState<ChartType>('candlestick'); // 차트 타입
  const [showVolume, setShowVolume] = useState(true); // 거래량 표시 여부
  const [dataLimit] = useState(200); // 가져올 데이터 개수

  // 실시간 가격 정보 상태
  const [currentPrice, setCurrentPrice] = useState<number>(0); // 현재 가격
  const [priceChange, setPriceChange] = useState<number>(0); // 24시간 가격 변동
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0); // 24시간 가격 변동률
  const [volume24h, setVolume24h] = useState<number>(0); // 24시간 거래량
  const [high24h, setHigh24h] = useState<number>(0); // 24시간 고가
  const [low24h, setLow24h] = useState<number>(0); // 24시간 저가

  // UI 상태
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [isUpdating, setIsUpdating] = useState(false); // 업데이트 중 상태
  const [chartInitialized, setChartInitialized] = useState(false); // 차트 초기화 완료 여부
  const [error, setError] = useState<string | null>(null); // 에러 상태

  /**
   * 화면 크기에 따른 반응형 높이 계산
   * 모바일: 70%, 태블릿: 85%, 데스크톱: 100%
   */
  const getResponsiveHeight = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width < 640) return Math.max(300, height * 0.7); // 모바일
      if (width < 1024) return Math.max(400, height * 0.85); // 태블릿
      return height; // 데스크톱
    }
    return height;
  };

  const [chartHeight, setChartHeight] = useState(getResponsiveHeight());

  /**
   * 윈도우 리사이즈 시 차트 높이 조정
   */
  useEffect(() => {
    const handleResize = () => {
      setChartHeight(getResponsiveHeight());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height]);

  /**
   * 차트 초기화 및 설정
   * 테마, 시간 간격, 차트 타입, 거래량 표시 여부가 변경될 때마다 실행됩니다.
   */
  useEffect(() => {
    // 차트 컨테이너가 없거나 업데이트 중이면 실행하지 않음
    if (!chartContainerRef.current || isUpdating) return;

    // 기존 차트가 있으면 안전하게 제거
    if (chartRef.current) {
      try {
        chartRef.current.remove();
      } catch (error) {
        // 차트 제거 중 에러 발생 시 무시
      }
      chartRef.current = null;
    }

    // 시리즈 참조 초기화
    candlestickSeriesRef.current = null;
    lineSeriesRef.current = null;
    volumeSeriesRef.current = null;

    // 테마에 따른 색상 설정
    const isDark = theme === 'dark';
    const backgroundColor = isDark ? '#0f172a' : '#ffffff';
    const textColor = isDark ? '#e2e8f0' : '#374151';
    const gridColor = isDark ? '#1e293b' : '#f3f4f6';
    const borderColor = isDark ? '#334155' : '#e5e7eb';

    // 새 차트 생성
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartHeight,
      layout: {
        background: { color: backgroundColor },
        textColor: textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: 1, // 십자선 모드
      },
      rightPriceScale: {
        borderColor: borderColor,
        textColor: textColor,
      },
      timeScale: {
        borderColor: borderColor,
        timeVisible: true,
        secondsVisible: timeInterval.includes('m') || timeInterval.includes('h'), // 분/시간 단위일 때만 초 표시
        rightOffset: 12,
        barSpacing: 3,
        fixLeftEdge: false,
        lockVisibleTimeRangeOnResize: true,
        rightBarStaysOnScroll: true,
        borderVisible: false,
        visible: true,
      },
    });

    chartRef.current = chart;

    // 차트 타입에 따른 시리즈 생성
    if (chartType === 'candlestick') {
      // 캔들스틱 차트 (한국식 색상: 빨간색=상승, 파란색=하락)
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#ef4444', // 상승 캔들 색상 (빨간색)
        downColor: '#3b82f6', // 하락 캔들 색상 (파란색)
        borderVisible: false,
        wickUpColor: '#ef4444', // 상승 꼬리 색상
        wickDownColor: '#3b82f6', // 하락 꼬리 색상
      });
      candlestickSeriesRef.current = candlestickSeries;
    } else {
      // 라인 차트
      const lineSeries = chart.addLineSeries({
        color: '#3b82f6',
        lineWidth: 2,
      });
      lineSeriesRef.current = lineSeries;
    }

    // 거래량 시리즈 추가 (옵션)
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: isDark ? '#475569' : '#d1d5db',
        priceFormat: {
          type: 'volume', // 거래량 형식
        },
        priceScaleId: '', // 별도의 가격 스케일 사용
      });
      volumeSeriesRef.current = volumeSeries;

      // 거래량 시리즈를 차트 하단에 배치
      chart.priceScale('').applyOptions({
        scaleMargins: {
          top: 0.8, // 상단 80% 영역은 가격 차트
          bottom: 0, // 하단 20% 영역은 거래량
        },
      });
    }

    setChartInitialized(true);

    // 윈도우 리사이즈 핸들러
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        try {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        } catch (error) {
          // 차트 리사이즈 중 에러 발생 시 무시
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // 컴포넌트 언마운트 시 정리
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (error) {
          // 차트 정리 중 에러 발생 시 무시
        }
        chartRef.current = null;
      }
      // 시리즈 참조도 정리
      candlestickSeriesRef.current = null;
      lineSeriesRef.current = null;
      volumeSeriesRef.current = null;
      setChartInitialized(false);
    };
  }, [timeInterval, chartType, showVolume, chartHeight, isUpdating, theme]);

  /**
   * 차트 초기화 완료 후 데이터 로드
   */
  useEffect(() => {
    if (chartInitialized) {
      loadInitialData();
    }
  }, [chartInitialized, symbol, timeInterval, dataLimit]);

  /**
   * 실시간 데이터 업데이트 (폴링 방식)
   * WebSocket 대신 30초마다 API를 호출하여 안정성을 높였습니다.
   */
  useEffect(() => {
    if (!chartInitialized) return;

    // 실시간 데이터 업데이트 함수
    const updateRealTimeData = async () => {
      try {
        const ticker = await BinanceAPI.getTicker(symbol);
        if (ticker) {
          // 상태 업데이트
          setCurrentPrice(parseFloat(ticker.lastPrice));
          setPriceChange(parseFloat(ticker.priceChange));
          setPriceChangePercent(parseFloat(ticker.priceChangePercent));
          setVolume24h(parseFloat(ticker.volume));
          setHigh24h(parseFloat(ticker.highPrice));
          setLow24h(parseFloat(ticker.lowPrice));
        }
      } catch (error) {
        // 실시간 데이터 업데이트 에러 발생 시 무시
      }
    };

    // 초기 데이터 로드
    updateRealTimeData();

    // 30초마다 데이터 업데이트
    const interval = setInterval(updateRealTimeData, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [symbol, chartInitialized]);

  /**
   * 초기 데이터 로드 함수
   * 티커 정보와 캔들스틱 데이터를 가져와서 차트에 표시합니다.
   */
  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null); // 에러 상태 초기화

      let tickerSuccess = false;
      let candleSuccess = false;

      // 1. 티커 정보 가져오기 (현재 가격, 변동률 등)
      try {
        const ticker = await BinanceAPI.getTicker(symbol);
        if (ticker) {
          setCurrentPrice(parseFloat(ticker.lastPrice));
          setPriceChange(parseFloat(ticker.priceChange));
          setPriceChangePercent(parseFloat(ticker.priceChangePercent));
          setVolume24h(parseFloat(ticker.volume));
          setHigh24h(parseFloat(ticker.highPrice));
          setLow24h(parseFloat(ticker.lowPrice));
          tickerSuccess = true;
        }
      } catch (tickerError) {
        // 티커 에러는 치명적이지 않으므로 계속 진행
      }

      // 2. 캔들스틱 데이터 가져오기
      try {
        const candleData = await BinanceAPI.getKlines(symbol, timeInterval, dataLimit);

        if (candleData.length > 0) {
          // 차트가 여전히 유효한지 확인
          if (!chartRef.current) {
            return;
          }

          // 캔들스틱 차트 데이터 설정
          if (chartType === 'candlestick' && candlestickSeriesRef.current) {
            try {
              const formattedCandleData: CandlestickData<Time>[] = candleData.map((candle) => ({
                ...candle,
                time: candle.time as Time,
              }));
              candlestickSeriesRef.current.setData(formattedCandleData);
            } catch (error) {
              // 캔들스틱 데이터 설정 중 에러 발생 시 무시
            }
          }
          // 라인 차트 데이터 설정
          else if (chartType === 'line' && lineSeriesRef.current) {
            try {
              const lineData: LineData<Time>[] = candleData.map((candle) => ({
                time: candle.time as Time,
                value: candle.close, // 종가만 사용
              }));
              lineSeriesRef.current.setData(lineData);
            } catch (error) {
              // 라인 데이터 설정 중 에러 발생 시 무시
            }
          }

          // 거래량 데이터 설정
          if (showVolume && volumeSeriesRef.current) {
            try {
              const volumeData: HistogramData<Time>[] = candleData.map((candle) => ({
                time: candle.time as Time,
                value: candle.volume || 0,
                // 상승/하락에 따른 색상 설정
                color:
                  candle.close >= candle.open
                    ? 'rgba(239, 68, 68, 0.5)'
                    : 'rgba(59, 130, 246, 0.5)',
              }));
              volumeSeriesRef.current.setData(volumeData);
            } catch (error) {
              // 거래량 데이터 설정 중 에러 발생 시 무시
            }
          }

          candleSuccess = true;
        } else {
          throw new Error('차트 데이터를 받지 못했습니다.');
        }
      } catch (candleError) {
        setError(
          candleError instanceof Error
            ? `차트 데이터 로드 실패: ${candleError.message}`
            : '차트 데이터를 불러올 수 없습니다.',
        );
      }

      // 성공 여부에 따른 처리
      if (!tickerSuccess && !candleSuccess) {
        setError('데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
      } else if (!candleSuccess) {
        setError('차트 데이터를 불러올 수 없지만 가격 정보는 표시됩니다.');
      }

      setIsLoading(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? `데이터 로드 실패: ${error.message}`
          : '알 수 없는 오류가 발생했습니다.',
      );
      setIsLoading(false);
    }
  };

  /**
   * 가격을 통화 형식으로 포맷팅
   */
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  /**
   * 거래량을 읽기 쉬운 형식으로 포맷팅 (K, M, B 단위)
   */
  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(2)}K`;
    }
    return volume.toFixed(2);
  };

  /**
   * 심볼 변경 핸들러
   */
  const handleSymbolChange = (newSymbol: string) => {
    if (isUpdating || newSymbol === symbol) return;
    setSymbol(newSymbol);
  };

  /**
   * 시간 간격 변경 핸들러
   */
  const handleTimeIntervalChange = (newInterval: TimeInterval) => {
    if (isUpdating || newInterval === timeInterval) return;
    setIsUpdating(true);
    setTimeInterval(newInterval);
    setTimeout(() => setIsUpdating(false), 200); // 짧은 딜레이로 중복 클릭 방지
  };

  /**
   * 차트 타입 변경 핸들러
   */
  const handleChartTypeChange = (newType: ChartType) => {
    if (isUpdating || newType === chartType) return;
    setIsUpdating(true);
    setChartType(newType);
    setTimeout(() => setIsUpdating(false), 200);
  };

  /**
   * 거래량 표시 토글 핸들러
   */
  const handleVolumeToggle = () => {
    if (isUpdating) return;
    setIsUpdating(true);
    setShowVolume(!showVolume);
    setTimeout(() => setIsUpdating(false), 200);
  };

  // === 렌더링 ===
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* 상단 정보 패널 */}
      <div className="border-b border-border p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <select
              value={symbol}
              onChange={(e) => handleSymbolChange(e.target.value)}
              className="appearance-none bg-accent border border-border rounded-xl px-3 py-2 pr-8 text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {POPULAR_SYMBOLS.map((sym) => (
                <option key={sym} value={sym}>
                  {sym.replace('USDT', '/USDT')}
                </option>
              ))}
            </select>

            <div>
              <div className="text-3xl font-bold text-foreground">{formatPrice(currentPrice)}</div>
              <div className="flex items-center space-x-2 mt-1">
                <span
                  className={`flex items-center text-sm font-medium ${
                    priceChange >= 0 ? 'text-red-500' : 'text-blue-500'
                  }`}
                >
                  {priceChange >= 0 ? (
                    <TrendingUp size={16} className="mr-1" />
                  ) : (
                    <TrendingDown size={16} className="mr-1" />
                  )}
                  {formatPrice(priceChange)} ({priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm text-center md:text-right">
            <div>
              <div className="text-muted-foreground">24h 거래량</div>
              <div className="font-semibold text-foreground">{formatVolume(volume24h)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">24h 고가</div>
              <div className="font-semibold text-foreground">{formatPrice(high24h)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">24h 저가</div>
              <div className="font-semibold text-foreground">{formatPrice(low24h)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 차트 컨트롤 영역 */}
      <div className="p-2 flex flex-wrap items-center justify-between gap-2 border-b border-border">
        <div className="flex items-center bg-accent rounded-lg p-1">
          {TIME_INTERVALS.map((interval) => (
            <button
              key={interval.value}
              onClick={() => handleTimeIntervalChange(interval.value as TimeInterval)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                timeInterval === interval.value
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {interval.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-accent rounded-lg p-1">
            <button
              onClick={() => handleChartTypeChange('candlestick')}
              className={`p-2 rounded-md ${
                chartType === 'candlestick' ? 'bg-card text-primary' : 'text-muted-foreground'
              }`}
            >
              <BarChart size={16} />
            </button>
            <button
              onClick={() => handleChartTypeChange('line')}
              className={`p-2 rounded-md ${
                chartType === 'line' ? 'bg-card text-primary' : 'text-muted-foreground'
              }`}
            >
              <LineChart size={16} />
            </button>
          </div>
          <button
            onClick={handleVolumeToggle}
            className={`flex items-center gap-1.5 p-2 rounded-md ${
              showVolume ? 'bg-accent text-primary' : 'text-muted-foreground'
            }`}
          >
            {showVolume ? <CheckSquare size={16} /> : <Square size={16} />}
            <span className="text-sm">거래량</span>
          </button>
          <button
            onClick={loadInitialData}
            disabled={isLoading}
            className="p-2 text-muted-foreground hover:text-primary disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 차트 렌더링 영역 */}
      <div className="relative">
        <div ref={chartContainerRef} className="w-full" style={{ height: `${chartHeight}px` }} />
        {(isLoading || error) && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 backdrop-blur-sm">
            {isLoading ? (
              <div className="flex items-center space-x-2 text-muted-foreground">
                <RefreshCw className="animate-spin" /> <span>데이터 로딩중...</span>
              </div>
            ) : (
              <div className="text-center text-destructive">
                <p>{error}</p>
                <button
                  onClick={loadInitialData}
                  className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  재시도
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
