/**
 * 암호화폐 차트 컴포넌트
 * TradingView의 Lightweight Charts 라이브러리를 사용하여 실시간 암호화폐 차트를 표시합니다.
 * 캔들스틱, 라인 차트, 거래량 등을 지원하며 반응형 디자인을 적용했습니다.
 */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  Time,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from 'lightweight-charts';
import { BinanceAPI } from '@/lib/binance-api';
import { useTheme } from '@/contexts/theme-context';

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
  const [dataLimit, setDataLimit] = useState(100); // 가져올 데이터 개수

  // 실시간 가격 정보 상태
  const [currentPrice, setCurrentPrice] = useState<number>(0); // 현재 가격
  const [priceChange, setPriceChange] = useState<number>(0); // 24시간 가격 변동
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0); // 24시간 가격 변동률
  const [volume24h, setVolume24h] = useState<number>(0); // 24시간 거래량

  // UI 상태
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [isUpdating, setIsUpdating] = useState(false); // 업데이트 중 상태
  const [chartInitialized, setChartInitialized] = useState(false); // 차트 초기화 완료 여부

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
        console.warn('Chart removal warning:', error);
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
        secondsVisible:
          timeInterval.includes('m') || timeInterval.includes('h'), // 분/시간 단위일 때만 초 표시
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
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#dc2626', // 상승 캔들 색상 (빨간색)
        downColor: '#2563eb', // 하락 캔들 색상 (파란색)
        borderVisible: false,
        wickUpColor: '#dc2626', // 상승 꼬리 색상
        wickDownColor: '#2563eb', // 하락 꼬리 색상
      });
      candlestickSeriesRef.current = candlestickSeries;
    } else {
      // 라인 차트
      const lineSeries = chart.addSeries(LineSeries, {
        color: '#2563eb',
        lineWidth: 2,
      });
      lineSeriesRef.current = lineSeries;
    }

    // 거래량 시리즈 추가 (옵션)
    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: isDark ? '#64748b' : '#9ca3af',
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
          console.warn('Chart resize warning:', error);
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
          console.warn('Chart cleanup warning:', error);
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

    console.log('Setting up real-time data polling for symbol:', symbol);

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
        }
      } catch (error) {
        console.error('Real-time data update error:', error);
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

      console.log(
        'Loading initial data for symbol:',
        symbol,
        'interval:',
        timeInterval,
        'limit:',
        dataLimit,
      );

      // 1. 티커 정보 가져오기 (현재 가격, 변동률 등)
      try {
        const ticker = await BinanceAPI.getTicker(symbol);
        console.log('Ticker data received:', ticker);
        if (ticker) {
          setCurrentPrice(parseFloat(ticker.lastPrice));
          setPriceChange(parseFloat(ticker.priceChange));
          setPriceChangePercent(parseFloat(ticker.priceChangePercent));
          setVolume24h(parseFloat(ticker.volume));
        }
      } catch (tickerError) {
        console.error('Ticker fetch error:', tickerError);
      }

      // 2. 캔들스틱 데이터 가져오기
      try {
        const candleData = await BinanceAPI.getKlines(
          symbol,
          timeInterval,
          dataLimit,
        );
        console.log(
          'Candle data received:',
          candleData.length,
          'items for interval:',
          timeInterval,
        );
        console.log('Sample candle data:', candleData.slice(0, 2));
        console.log(
          'Time format for',
          timeInterval,
          ':',
          candleData.length > 0 ? candleData[0].time : 'No data',
        );

        if (candleData.length > 0) {
          // 차트가 여전히 유효한지 확인
          if (!chartRef.current) {
            console.warn('Chart is not available, skipping data update');
            return;
          }

          // 시간 데이터 검증
          const timeFormat = candleData[0].time;
          console.log(
            'Using time format:',
            timeFormat,
            'for interval:',
            timeInterval,
          );

          // 캔들스틱 차트 데이터 설정
          if (chartType === 'candlestick' && candlestickSeriesRef.current) {
            try {
              console.log('Setting candlestick data for', timeInterval);
              const formattedCandleData = candleData.map(candle => ({
                ...candle,
                time: candle.time as Time,
              }));
              candlestickSeriesRef.current.setData(formattedCandleData);
              console.log(
                'Candlestick data set successfully for',
                timeInterval,
              );
            } catch (error) {
              console.error(
                'Failed to set candlestick data for',
                timeInterval,
                ':',
                error,
              );
            }
          }
          // 라인 차트 데이터 설정
          else if (chartType === 'line' && lineSeriesRef.current) {
            try {
              console.log('Setting line data for', timeInterval);
              const lineData = candleData.map(candle => ({
                time: candle.time as Time,
                value: candle.close, // 종가만 사용
              }));
              lineSeriesRef.current.setData(lineData);
              console.log('Line data set successfully for', timeInterval);
            } catch (error) {
              console.error(
                'Failed to set line data for',
                timeInterval,
                ':',
                error,
              );
            }
          }

          // 거래량 데이터 설정
          if (showVolume && volumeSeriesRef.current) {
            try {
              console.log('Setting volume data for', timeInterval);
              const volumeData = candleData.map(candle => ({
                time: candle.time as Time,
                value: candle.volume || 0,
                // 상승/하락에 따른 색상 설정
                color: candle.close >= candle.open ? '#26a69a' : '#ef5350',
              }));
              volumeSeriesRef.current.setData(volumeData);
              console.log('Volume data set successfully for', timeInterval);
            } catch (error) {
              console.error(
                'Failed to set volume data for',
                timeInterval,
                ':',
                error,
              );
            }
          }

          console.log('Chart data set successfully for', timeInterval);
        } else {
          console.warn('No candle data received for', timeInterval);
        }
      } catch (candleError) {
        console.error(
          'Candle data fetch error for',
          timeInterval,
          ':',
          candleError,
        );
      }

      setIsLoading(false);
    } catch (error) {
      console.error('전체 데이터 로드 실패:', error);
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

  // === 이벤트 핸들러들 ===

  /**
   * 심볼 변경 핸들러
   */
  const handleSymbolChange = (newSymbol: string) => {
    if (isUpdating || newSymbol === symbol) return;
    console.log('Symbol changed to:', newSymbol);
    setSymbol(newSymbol);
  };

  /**
   * 시간 간격 변경 핸들러
   */
  const handleTimeIntervalChange = (newInterval: TimeInterval) => {
    if (isUpdating || newInterval === timeInterval) return;
    console.log('Time interval changed to:', newInterval);
    setIsUpdating(true);
    setTimeInterval(newInterval);
    setTimeout(() => setIsUpdating(false), 200); // 짧은 딜레이로 중복 클릭 방지
  };

  /**
   * 차트 타입 변경 핸들러
   */
  const handleChartTypeChange = (newType: ChartType) => {
    if (isUpdating || newType === chartType) return;
    console.log('Chart type changed to:', newType);
    setIsUpdating(true);
    setChartType(newType);
    setTimeout(() => setIsUpdating(false), 200);
  };

  /**
   * 데이터 개수 변경 핸들러
   */
  const handleDataLimitChange = (newLimit: number) => {
    if (isUpdating || newLimit === dataLimit) return;
    console.log('Data limit changed to:', newLimit);
    setDataLimit(newLimit);
  };

  /**
   * 거래량 표시 토글 핸들러
   */
  const handleVolumeToggle = (show: boolean) => {
    if (isUpdating || show === showVolume) return;
    console.log('Volume display toggled:', show);
    setIsUpdating(true);
    setShowVolume(show);
    setTimeout(() => setIsUpdating(false), 200);
  };

  // === 렌더링 ===
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
      {/* 상단 정보 패널 */}
      <div className="border-b border-border p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 lg:mb-6 space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* 심볼 선택 드롭다운 */}
            <div className="relative">
              <select
                value={symbol}
                onChange={e => handleSymbolChange(e.target.value)}
                className="appearance-none bg-accent border border-border rounded-xl px-3 py-2 pr-8 text-base sm:text-lg font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-full sm:w-auto min-w-[140px]"
              >
                {POPULAR_SYMBOLS.map(sym => (
                  <option key={sym} value={sym}>
                    {sym.replace('USDT', '/USDT')} {/* 표시용 형식 변환 */}
                  </option>
                ))}
              </select>
              {/* 드롭다운 화살표 아이콘 */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* 가격 정보 표시 */}
            {isLoading ? (
              // 로딩 중 스켈레톤 UI
              <div className="animate-pulse space-y-2">
                <div className="h-6 sm:h-8 bg-muted rounded w-24 sm:w-32"></div>
                <div className="h-3 sm:h-4 bg-muted rounded w-20 sm:w-24"></div>
              </div>
            ) : (
              <div>
                {/* 현재 가격 */}
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
                  {formatPrice(currentPrice)}
                </div>
                {/* 24시간 변동 정보 */}
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs sm:text-sm font-medium ${
                      priceChange >= 0
                        ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {priceChange >= 0 ? '▲' : '▼'}{' '}
                    {Math.abs(priceChange).toFixed(2)}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      priceChange >= 0
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {priceChangePercent >= 0 ? '+' : ''}
                    {priceChangePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 24시간 통계 정보 */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:gap-6 text-center lg:text-right">
            <div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                24h 거래량
              </div>
              <div className="text-sm sm:text-base lg:text-lg font-semibold text-foreground">
                {formatVolume(volume24h)}
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                24h 고가
              </div>
              <div className="text-sm sm:text-base lg:text-lg font-semibold text-red-600 dark:text-red-400">
                {formatPrice(currentPrice * 1.05)} {/* 임시 계산값 */}
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                24h 저가
              </div>
              <div className="text-sm sm:text-base lg:text-lg font-semibold text-blue-600 dark:text-blue-400">
                {formatPrice(currentPrice * 0.95)} {/* 임시 계산값 */}
              </div>
            </div>
          </div>
        </div>

        {/* 차트 컨트롤 영역 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* 시간 간격 선택 버튼들 */}
            <div className="flex items-center bg-accent rounded-xl p-1 overflow-x-auto">
              <div className="flex space-x-1 min-w-max">
                {TIME_INTERVALS.map(interval => (
                  <button
                    key={interval.value}
                    onClick={() =>
                      handleTimeIntervalChange(interval.value as TimeInterval)
                    }
                    className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                      timeInterval === interval.value
                        ? 'bg-card text-primary shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {interval.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 차트 타입 선택 */}
            <div className="flex items-center bg-accent rounded-xl p-1">
              <button
                onClick={() => handleChartTypeChange('candlestick')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  chartType === 'candlestick'
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                캔들
              </button>
              <button
                onClick={() => handleChartTypeChange('line')}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                  chartType === 'line'
                    ? 'bg-card text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                라인
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            {/* 거래량 표시 토글 */}
            <label className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={showVolume}
                onChange={e => handleVolumeToggle(e.target.checked)}
                className="w-4 h-4 text-primary bg-accent border-border rounded focus:ring-ring focus:ring-2"
              />
              <span>거래량</span>
            </label>

            {/* 데이터 개수 선택 */}
            <select
              value={dataLimit}
              onChange={e => handleDataLimitChange(Number(e.target.value))}
              className="bg-accent border border-border rounded-lg px-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            >
              <option value={50}>50개</option>
              <option value={100}>100개</option>
              <option value={200}>200개</option>
              <option value={500}>500개</option>
            </select>

            {/* 새로고침 버튼 */}
            <button
              onClick={loadInitialData}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-1.5 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground text-xs sm:text-sm font-medium rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  {/* 로딩 스피너 */}
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="hidden sm:inline">로딩중</span>
                  <span className="sm:hidden">로딩</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">새로고침</span>
                  <span className="sm:hidden">새로고침</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 차트 렌더링 영역 */}
      <div className="relative">
        <div
          ref={chartContainerRef}
          className="w-full"
          style={{
            height: `${chartHeight}px`,
            minHeight: '300px', // 최소 높이 보장
          }}
        />

        {/* 로딩 오버레이 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/90">
            <div className="flex items-center space-x-3">
              <svg
                className="animate-spin h-6 w-6 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-foreground font-medium text-sm sm:text-base">
                <span className="hidden sm:inline">차트 데이터 로딩중...</span>
                <span className="sm:hidden">로딩중...</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
