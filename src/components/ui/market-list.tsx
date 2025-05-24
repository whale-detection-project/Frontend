'use client';

import React, { useState } from 'react';
import { Star, Search } from 'lucide-react';

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  isFavorite: boolean;
}

const MOCK_MARKET_DATA: MarketData[] = [
  {
    symbol: 'BTC/USDT',
    name: '비트코인',
    price: 43250.5,
    change: 1250.3,
    changePercent: 2.98,
    volume: 1234567890,
    high24h: 44500.0,
    low24h: 42100.0,
    marketCap: 850000000000,
    isFavorite: true,
  },
  {
    symbol: 'ETH/USDT',
    name: '이더리움',
    price: 2650.75,
    change: -85.25,
    changePercent: -3.11,
    volume: 987654321,
    high24h: 2750.0,
    low24h: 2580.0,
    marketCap: 320000000000,
    isFavorite: true,
  },
  {
    symbol: 'BNB/USDT',
    name: '바이낸스코인',
    price: 315.8,
    change: 12.45,
    changePercent: 4.1,
    volume: 456789123,
    high24h: 325.0,
    low24h: 305.0,
    marketCap: 48000000000,
    isFavorite: false,
  },
  {
    symbol: 'ADA/USDT',
    name: '카르다노',
    price: 0.485,
    change: -0.025,
    changePercent: -4.9,
    volume: 234567890,
    high24h: 0.52,
    low24h: 0.47,
    marketCap: 17000000000,
    isFavorite: false,
  },
  {
    symbol: 'SOL/USDT',
    name: '솔라나',
    price: 98.45,
    change: 5.67,
    changePercent: 6.11,
    volume: 345678901,
    high24h: 102.0,
    low24h: 95.0,
    marketCap: 42000000000,
    isFavorite: true,
  },
  {
    symbol: 'XRP/USDT',
    name: '리플',
    price: 0.625,
    change: 0.035,
    changePercent: 5.93,
    volume: 567890123,
    high24h: 0.65,
    low24h: 0.6,
    marketCap: 34000000000,
    isFavorite: false,
  },
  {
    symbol: 'DOT/USDT',
    name: '폴카닷',
    price: 7.25,
    change: -0.45,
    changePercent: -5.84,
    volume: 123456789,
    high24h: 7.8,
    low24h: 7.1,
    marketCap: 9500000000,
    isFavorite: false,
  },
  {
    symbol: 'DOGE/USDT',
    name: '도지코인',
    price: 0.085,
    change: 0.008,
    changePercent: 10.39,
    volume: 789012345,
    high24h: 0.092,
    low24h: 0.078,
    marketCap: 12000000000,
    isFavorite: false,
  },
  {
    symbol: 'AVAX/USDT',
    name: '아발란체',
    price: 38.75,
    change: 2.15,
    changePercent: 5.88,
    volume: 298765432,
    high24h: 40.2,
    low24h: 36.5,
    marketCap: 15000000000,
    isFavorite: false,
  },
  {
    symbol: 'MATIC/USDT',
    name: '폴리곤',
    price: 0.925,
    change: -0.045,
    changePercent: -4.64,
    volume: 187654321,
    high24h: 0.98,
    low24h: 0.91,
    marketCap: 8500000000,
    isFavorite: false,
  },
];

export default function MarketList() {
  const [marketData, setMarketData] = useState<MarketData[]>(MOCK_MARKET_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<
    'all' | 'favorites' | 'gainers' | 'losers'
  >('all');
  const [selectedCoin, setSelectedCoin] = useState<MarketData | null>(
    MOCK_MARKET_DATA[0],
  );

  const formatPrice = (price: number) => {
    if (price < 1) {
      return price.toFixed(4);
    } else if (price < 100) {
      return price.toFixed(2);
    } else {
      return price.toFixed(0);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(1)}B`;
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(1)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(1)}K`;
    }
    return volume.toString();
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `${(marketCap / 1e6).toFixed(1)}M`;
    }
    return marketCap.toString();
  };

  const toggleFavorite = (symbol: string) => {
    setMarketData(prev =>
      prev.map(item =>
        item.symbol === symbol
          ? { ...item, isFavorite: !item.isFavorite }
          : item,
      ),
    );
  };

  const filteredAndSortedData = marketData
    .filter(item => {
      const matchesSearch =
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase());

      switch (filter) {
        case 'favorites':
          return matchesSearch && item.isFavorite;
        case 'gainers':
          return matchesSearch && item.changePercent > 0;
        case 'losers':
          return matchesSearch && item.changePercent < 0;
        default:
          return matchesSearch;
      }
    })
    .sort((a, b) => {
      // 기본적으로 시가총액 기준 내림차순 정렬
      return b.marketCap - a.marketCap;
    });

  // 시장 통계 계산
  const marketStats = {
    totalCoins: filteredAndSortedData.length,
    gainers: filteredAndSortedData.filter(item => item.changePercent > 0)
      .length,
    losers: filteredAndSortedData.filter(item => item.changePercent < 0).length,
    avgChange:
      filteredAndSortedData.reduce((sum, item) => sum + item.changePercent, 0) /
      filteredAndSortedData.length,
    totalVolume: filteredAndSortedData.reduce(
      (sum, item) => sum + item.volume,
      0,
    ),
    topGainer: filteredAndSortedData.reduce(
      (max, item) => (item.changePercent > max.changePercent ? item : max),
      filteredAndSortedData[0],
    ),
    topLoser: filteredAndSortedData.reduce(
      (min, item) => (item.changePercent < min.changePercent ? item : min),
      filteredAndSortedData[0],
    ),
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border h-fit">
      {/* 헤더 */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">마켓</h2>
          <div className="flex items-center px-2 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-xs">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
            실시간
          </div>
        </div>

        {/* 검색 */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="코인 검색..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-accent border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent"
          />
        </div>

        {/* 필터 */}
        <div className="grid grid-cols-4 bg-accent rounded-lg p-0.5 gap-0.5">
          {[
            { key: 'all', label: '전체' },
            { key: 'favorites', label: '관심' },
            { key: 'gainers', label: '상승' },
            { key: 'losers', label: '하락' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() =>
                setFilter(key as 'all' | 'favorites' | 'gainers' | 'losers')
              }
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                filter === key
                  ? 'bg-card text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 컴팩트 리스트 */}
      <div className="max-h-[515px] overflow-y-auto">
        <div className="space-y-1 p-2">
          {filteredAndSortedData.map((item, index) => (
            <div
              key={item.symbol}
              onClick={() => setSelectedCoin(item)}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer group ${
                selectedCoin?.symbol === item.symbol
                  ? 'bg-primary/10 border border-primary/20'
                  : 'hover:bg-accent/50'
              }`}
            >
              {/* 왼쪽: 순위, 코인 정보 */}
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-foreground truncate">
                        {item.symbol.replace('/USDT', '')}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.name}
                      </div>
                    </div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(item.symbol);
                      }}
                      className={`ml-1 p-0.5 rounded transition-colors ${
                        item.isFavorite
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Star
                        className={`w-3 h-3 ${
                          item.isFavorite ? 'fill-current' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* 오른쪽: 가격, 변동률 */}
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-medium text-foreground">
                  ${formatPrice(item.price)}
                </div>
                <div
                  className={`text-xs font-medium ${
                    item.changePercent >= 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}
                >
                  {item.changePercent >= 0 ? '+' : ''}
                  {item.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredAndSortedData.length === 0 && (
        <div className="p-6 text-center text-muted-foreground text-sm">
          검색 결과가 없습니다.
        </div>
      )}

      {/* 선택된 코인 상세 정보 */}
      {selectedCoin && (
        <div className="p-4 border-t border-border">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">
                {selectedCoin.name} ({selectedCoin.symbol.replace('/USDT', '')})
              </h3>
              <div
                className={`text-sm font-bold ${
                  selectedCoin.changePercent >= 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                ${formatPrice(selectedCoin.price)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h 변동</span>
                  <span
                    className={
                      selectedCoin.changePercent >= 0
                        ? 'text-red-500'
                        : 'text-blue-500'
                    }
                  >
                    {selectedCoin.changePercent >= 0 ? '+' : ''}$
                    {selectedCoin.change.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h 고가</span>
                  <span className="text-foreground">
                    ${formatPrice(selectedCoin.high24h)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h 저가</span>
                  <span className="text-foreground">
                    ${formatPrice(selectedCoin.low24h)}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">거래량</span>
                  <span className="text-foreground">
                    ${formatVolume(selectedCoin.volume)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">시가총액</span>
                  <span className="text-foreground">
                    ${formatMarketCap(selectedCoin.marketCap)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">변동률</span>
                  <span
                    className={
                      selectedCoin.changePercent >= 0
                        ? 'text-red-500'
                        : 'text-blue-500'
                    }
                  >
                    {selectedCoin.changePercent >= 0 ? '+' : ''}
                    {selectedCoin.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 시장 통계 */}
      <div className="p-4 border-t border-border bg-accent/30">
        <h4 className="text-xs font-bold text-foreground mb-3">시장 현황</h4>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">평균 변동률</span>
              <span
                className={
                  marketStats.avgChange >= 0 ? 'text-red-500' : 'text-blue-500'
                }
              >
                {marketStats.avgChange >= 0 ? '+' : ''}
                {marketStats.avgChange.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">총 거래량</span>
              <span className="text-foreground">
                ${formatVolume(marketStats.totalVolume)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">최고 상승</span>
              <span className="text-red-500">
                {marketStats.topGainer?.symbol.replace('/USDT', '')} +
                {marketStats.topGainer?.changePercent.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-red-500">상승 {marketStats.gainers}</span>
              <span className="text-blue-500">하락 {marketStats.losers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">최대 하락</span>
              <span className="text-blue-500">
                {marketStats.topLoser?.symbol.replace('/USDT', '')}{' '}
                {marketStats.topLoser?.changePercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">총 코인</span>
              <span className="text-foreground">
                {marketStats.totalCoins}개
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
