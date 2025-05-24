import React from 'react';
import { Activity, Search, Filter, Zap } from 'lucide-react'; // Lucide 아이콘 라이브러리에서 필요한 아이콘들을 가져옵니다

export default function MarketPage() {
  // 시장 통계 데이터 객체 - 전체 시장 상태를 보여주는 주요 지표들
  const marketStats = {
    totalMarketCap: 1.2, // 총 시가총액 (단위: 조 달러)
    totalVolume: 45.6, // 24시간 거래량 (단위: 십억 달러)
    btcDominance: 52.3, // 비트코인 도미넌스 (시장 점유율, %)
    activeCoins: 2847, // 활성화된 코인 수
    gainers: 1234, // 상승 중인 코인 수
    losers: 987, // 하락 중인 코인 수
  };

  // 상위 코인 목록 데이터 - 주요 암호화폐 정보
  const topCoins = [
    {
      rank: 1, // 시가총액 순위
      symbol: 'BTC', // 코인 심볼
      name: '비트코인', // 코인 이름
      price: 43250.5, // 현재 가격 (USD)
      change24h: 2.98, // 24시간 가격 변동률 (%)
      volume: 12.4, // 거래량 (단위: 십억 달러)
      marketCap: 850.2, // 시가총액 (단위: 십억 달러)
      anomalyScore: 0.15, // AI가 감지한 이상 점수 (0~1 사이, 낮을수록 정상)
    },
    {
      rank: 2,
      symbol: 'ETH',
      name: '이더리움',
      price: 2650.75,
      change24h: -3.11,
      volume: 8.7,
      marketCap: 320.1,
      anomalyScore: 0.23,
    },
    {
      rank: 3,
      symbol: 'BNB',
      name: '바이낸스코인',
      price: 315.8,
      change24h: 4.1,
      volume: 2.1,
      marketCap: 48.0,
      anomalyScore: 0.08,
    },
  ];

  // 암호화폐 섹터별 데이터 - 각 분야별 성과 지표
  const sectors = [
    { name: 'DeFi', change: 5.2, volume: 8.9, color: 'blue' }, // 탈중앙화 금융 섹터
    { name: 'Layer 1', change: -2.1, volume: 15.3, color: 'purple' }, // 기본 블록체인 플랫폼 섹터
    { name: 'NFT', change: 12.4, volume: 3.2, color: 'pink' }, // 대체불가능토큰 섹터
    { name: 'Gaming', change: 8.7, volume: 2.1, color: 'green' }, // 게임 관련 암호화폐 섹터
  ];

  return (
    // 전체 페이지 컨테이너 - 그라데이션 배경 적용
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 dark:from-background dark:to-accent/10">
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="max-w-[1440px] mx-auto">
          {/* 페이지 헤더 섹션 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  암호화폐 마켓
                </h1>
                <p className="text-muted-foreground">
                  실시간 시장 데이터와 AI 기반 이상 패턴 분석
                </p>
              </div>
              {/* 실시간 업데이트 상태 표시 */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center px-3 py-2 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  실시간 업데이트
                </div>
              </div>
            </div>

            {/* 시장 통계 카드 그리드 - 주요 지표들을 보여주는 6개의 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
              {/* 총 시가총액 카드 */}
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">
                  총 시가총액
                </div>
                <div className="text-lg font-bold text-foreground">
                  ${marketStats.totalMarketCap}T
                </div>
              </div>
              {/* 24시간 거래량 카드 */}
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">
                  24h 거래량
                </div>
                <div className="text-lg font-bold text-foreground">
                  ${marketStats.totalVolume}B
                </div>
              </div>
              {/* 비트코인 도미넌스 카드 */}
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">
                  BTC 도미넌스
                </div>
                <div className="text-lg font-bold text-foreground">
                  {marketStats.btcDominance}%
                </div>
              </div>
              {/* 활성 코인 수 카드 */}
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">
                  활성 코인
                </div>
                <div className="text-lg font-bold text-foreground">
                  {marketStats.activeCoins.toLocaleString()}
                </div>
              </div>
              {/* 상승 코인 수 카드 */}
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">상승</div>
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {marketStats.gainers}
                </div>
              </div>
              {/* 하락 코인 수 카드 */}
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="text-xs text-muted-foreground mb-1">하락</div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {marketStats.losers}
                </div>
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 영역 - 코인 리스트와 사이드바로 구성 */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* 코인 리스트 섹션 - 전체 너비의 3/4 차지 */}
            <div className="xl:col-span-3">
              <div className="bg-card rounded-2xl shadow-sm border border-border">
                {/* 코인 리스트 헤더 - 제목과 검색/필터 기능 */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">
                      전체 코인 리스트
                    </h2>
                    <div className="flex items-center space-x-3">
                      {/* 검색 입력 필드 */}
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="코인 검색..."
                          className="pl-10 pr-4 py-2 bg-accent border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      {/* 필터 버튼 */}
                      <button className="flex items-center px-3 py-2 bg-accent border border-border rounded-lg text-sm hover:bg-accent/80">
                        <Filter className="w-4 h-4 mr-2" />
                        필터
                      </button>
                    </div>
                  </div>

                  {/* 테이블 헤더 - 각 열의 제목 */}
                  <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground mb-4">
                    <div className="col-span-1">#</div>
                    <div className="col-span-3">코인</div>
                    <div className="col-span-2 text-right">가격</div>
                    <div className="col-span-2 text-right">24h 변동</div>
                    <div className="col-span-2 text-right">거래량</div>
                    <div className="col-span-2 text-right">AI 이상도</div>
                  </div>
                </div>

                {/* 코인 리스트 본문 - 각 코인 정보 행 */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* topCoins 배열을 순회하며 각 코인 정보 표시 */}
                    {topCoins.map(coin => (
                      <div
                        key={coin.symbol}
                        className="grid grid-cols-12 gap-4 items-center p-4 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer"
                      >
                        {/* 순위 */}
                        <div className="col-span-1">
                          <span className="text-sm font-medium text-muted-foreground">
                            {coin.rank}
                          </span>
                        </div>
                        {/* 코인 심볼과 이름 */}
                        <div className="col-span-3 flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {coin.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {coin.symbol}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {coin.name}
                            </div>
                          </div>
                        </div>
                        {/* 가격 */}
                        <div className="col-span-2 text-right">
                          <div className="font-semibold text-foreground">
                            ${coin.price.toLocaleString()}
                          </div>
                        </div>
                        {/* 24시간 변동률 - 상승/하락에 따라 색상 변경 */}
                        <div className="col-span-2 text-right">
                          <div
                            className={`font-semibold ${
                              coin.change24h >= 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {coin.change24h >= 0 ? '+' : ''}
                            {coin.change24h.toFixed(2)}%
                          </div>
                        </div>
                        {/* 거래량 */}
                        <div className="col-span-2 text-right">
                          <div className="text-foreground">${coin.volume}B</div>
                        </div>
                        {/* AI 이상도 - 점수에 따라 다른 상태와 색상 표시 */}
                        <div className="col-span-2 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <div
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                coin.anomalyScore < 0.1
                                  ? 'bg-green-500/10 text-green-600' // 정상 상태
                                  : coin.anomalyScore < 0.2
                                  ? 'bg-yellow-500/10 text-yellow-600' // 주의 상태
                                  : 'bg-red-500/10 text-red-600' // 경고 상태
                              }`}
                            >
                              {coin.anomalyScore < 0.1
                                ? '정상'
                                : coin.anomalyScore < 0.2
                                ? '주의'
                                : '경고'}
                            </div>
                            <Zap className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 사이드바 섹션 - 전체 너비의 1/4 차지 */}
            <div className="xl:col-span-1 space-y-6">
              {/* 섹터 분석 카드 - 암호화폐 섹터별 성과 */}
              <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  섹터 분석
                </h3>
                <div className="space-y-4">
                  {/* sectors 배열을 순회하며 각 섹터 정보 표시 */}
                  {sectors.map(sector => (
                    <div
                      key={sector.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full bg-${sector.color}-500`}
                        ></div>
                        <span className="text-sm font-medium text-foreground">
                          {sector.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-semibold ${
                            sector.change >= 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {sector.change >= 0 ? '+' : ''}
                          {sector.change}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${sector.volume}B
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 시장 히트맵 카드 - 시장 전체 상태를 시각적으로 표현 */}
              <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  시장 히트맵
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {/* 8개의 랜덤 히트맵 셀 생성 - 실제로는 동적 데이터로 대체 필요 */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-12 rounded-lg flex items-center justify-center text-xs font-medium ${
                        Math.random() > 0.5
                          ? 'bg-red-500/20 text-red-600' // 상승 표시
                          : 'bg-blue-500/20 text-blue-600' // 하락 표시
                      }`}
                    >
                      {Math.random() > 0.5 ? '+' : '-'}
                      {(Math.random() * 10).toFixed(1)}%
                    </div>
                  ))}
                </div>
              </div>

              {/* AI 인사이트 카드 - AI 분석 결과 표시 */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                <div className="flex items-center space-x-2 mb-3">
                  <Activity className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">
                    AI 인사이트
                  </h3>
                </div>
                <div className="space-y-3 text-sm">
                  {/* 이상 패턴 감지 알림 */}
                  <div className="p-3 bg-card/50 rounded-lg">
                    <div className="font-medium text-foreground mb-1">
                      이상 패턴 감지
                    </div>
                    <div className="text-muted-foreground">
                      ETH에서 비정상적인 거래량 증가 감지
                    </div>
                  </div>
                  {/* 시장 예측 알림 */}
                  <div className="p-3 bg-card/50 rounded-lg">
                    <div className="font-medium text-foreground mb-1">
                      시장 예측
                    </div>
                    <div className="text-muted-foreground">
                      향후 4시간 내 변동성 증가 예상
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
