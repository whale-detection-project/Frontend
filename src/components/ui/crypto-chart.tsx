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

interface CryptoChartProps {
  symbol?: string;
  height?: number;
}

type ChartType = 'candlestick' | 'line';
type TimeInterval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

const POPULAR_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'ADAUSDT',
  'SOLUSDT',
  'XRPUSDT',
  'DOTUSDT',
  'DOGEUSDT',
  'AVAXUSDT',
  'MATICUSDT',
];

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
  symbol: initialSymbol = 'BTCUSDT',
  height = 400,
}: CryptoChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // 상태 관리
  const [symbol, setSymbol] = useState(initialSymbol);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('1d');
  const [chartType, setChartType] = useState<ChartType>('candlestick');
  const [showVolume, setShowVolume] = useState(true);
  const [dataLimit, setDataLimit] = useState(100);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const [volume24h, setVolume24h] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [wsRef, setWsRef] = useState<WebSocket | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [chartInitialized, setChartInitialized] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current || isUpdating) return;

    // 기존 차트 정리 (안전하게)
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

    // 차트 생성
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#d1d4dc',
      },
      grid: {
        vertLines: { color: '#2a2a2a' },
        horzLines: { color: '#2a2a2a' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#485158',
      },
      timeScale: {
        borderColor: '#485158',
        timeVisible: true,
        secondsVisible:
          timeInterval.includes('m') || timeInterval.includes('h'),
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
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350',
      });
      candlestickSeriesRef.current = candlestickSeries;
    } else {
      const lineSeries = chart.addSeries(LineSeries, {
        color: '#2196F3',
        lineWidth: 2,
      });
      lineSeriesRef.current = lineSeries;
    }

    // 볼륨 시리즈 추가 (옵션)
    if (showVolume) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '',
      });
      volumeSeriesRef.current = volumeSeries;

      // 볼륨 시리즈를 하단에 배치
      chart.priceScale('').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
    }

    setChartInitialized(true);

    // 리사이즈 핸들러
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

    // 정리 함수
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
  }, [timeInterval, chartType, showVolume, height, isUpdating]);

  // 데이터 로드 (차트 초기화 후)
  useEffect(() => {
    if (chartInitialized) {
      loadInitialData();
    }
  }, [chartInitialized, symbol, timeInterval, dataLimit]);

  // WebSocket 연결 관리
  useEffect(() => {
    // 기존 WebSocket 연결 정리
    if (wsRef) {
      wsRef.close();
    }

    // 새 WebSocket 연결
    const ws = BinanceAPI.createWebSocket(
      symbol,
      klineData => {
        console.log('Kline data received:', klineData);
      },
      tickerData => {
        console.log('Ticker update received:', tickerData);
        setCurrentPrice(parseFloat(tickerData.c));
        setPriceChange(parseFloat(tickerData.p));
        setPriceChangePercent(parseFloat(tickerData.P));
        setVolume24h(parseFloat(tickerData.v));
      },
    );

    setWsRef(ws);

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [symbol]);

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

      // 티커 정보 가져오기
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

      // 캔들스틱 데이터 가져오기
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
          } else if (chartType === 'line' && lineSeriesRef.current) {
            try {
              console.log('Setting line data for', timeInterval);
              const lineData = candleData.map(candle => ({
                time: candle.time as Time,
                value: candle.close,
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

          // 볼륨 데이터
          if (showVolume && volumeSeriesRef.current) {
            try {
              console.log('Setting volume data for', timeInterval);
              const volumeData = candleData.map(candle => ({
                time: candle.time as Time,
                value: candle.volume || 0,
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

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

  const handleSymbolChange = (newSymbol: string) => {
    if (isUpdating || newSymbol === symbol) return;
    console.log('Symbol changed to:', newSymbol);
    setSymbol(newSymbol);
  };

  const handleTimeIntervalChange = (newInterval: TimeInterval) => {
    if (isUpdating || newInterval === timeInterval) return;
    console.log('Time interval changed to:', newInterval);
    setIsUpdating(true);
    setTimeInterval(newInterval);
    setTimeout(() => setIsUpdating(false), 200);
  };

  const handleChartTypeChange = (newType: ChartType) => {
    if (isUpdating || newType === chartType) return;
    console.log('Chart type changed to:', newType);
    setIsUpdating(true);
    setChartType(newType);
    setTimeout(() => setIsUpdating(false), 200);
  };

  const handleDataLimitChange = (newLimit: number) => {
    if (isUpdating || newLimit === dataLimit) return;
    console.log('Data limit changed to:', newLimit);
    setDataLimit(newLimit);
  };

  const handleVolumeToggle = (show: boolean) => {
    if (isUpdating || show === showVolume) return;
    console.log('Volume display toggled:', show);
    setIsUpdating(true);
    setShowVolume(show);
    setTimeout(() => setIsUpdating(false), 200);
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      {/* 컨트롤 패널 */}
      <div className="mb-4 space-y-4">
        {/* 첫 번째 행: 심볼 선택과 기본 정보 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                심볼
              </label>
              <select
                value={symbol}
                onChange={e => handleSymbolChange(e.target.value)}
                className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
              >
                {POPULAR_SYMBOLS.map(sym => (
                  <option key={sym} value={sym}>
                    {sym}
                  </option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-6 bg-gray-700 rounded w-24"></div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-white">
                  {formatPrice(currentPrice)}
                </span>
                <span
                  className={`text-sm font-medium ${
                    priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {priceChange >= 0 ? '+' : ''}
                  {priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-400">24h 거래량</div>
            <div className="text-lg font-semibold text-white">
              {formatVolume(volume24h)}
            </div>
          </div>
        </div>

        {/* 두 번째 행: 차트 옵션들 */}
        <div className="flex items-center space-x-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              시간 간격
            </label>
            <select
              value={timeInterval}
              onChange={e =>
                handleTimeIntervalChange(e.target.value as TimeInterval)
              }
              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
            >
              {TIME_INTERVALS.map(interval => (
                <option key={interval.value} value={interval.value}>
                  {interval.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              차트 타입
            </label>
            <select
              value={chartType}
              onChange={e => handleChartTypeChange(e.target.value as ChartType)}
              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="candlestick">캔들스틱</option>
              <option value="line">라인</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              데이터 개수
            </label>
            <select
              value={dataLimit}
              onChange={e => handleDataLimitChange(Number(e.target.value))}
              className="bg-gray-800 text-white border border-gray-600 rounded px-3 py-1 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={showVolume}
                onChange={e => handleVolumeToggle(e.target.checked)}
                className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
              />
              <span>거래량 표시</span>
            </label>
          </div>

          <button
            onClick={loadInitialData}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-1 rounded text-sm font-medium transition-colors"
          >
            {isLoading ? '로딩...' : '새로고침'}
          </button>
        </div>
      </div>

      {/* 차트 */}
      <div
        ref={chartContainerRef}
        className="w-full rounded"
        style={{ height: `${height}px` }}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 rounded-lg">
          <div className="text-white">데이터 로딩 중...</div>
        </div>
      )}
    </div>
  );
}
