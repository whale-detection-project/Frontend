import CryptoChart from '@/components/ui/crypto-chart';
import MarketList from '@/components/ui/market-list';
import {
  TrendingUp,
  Activity,
  AlertTriangle,
  BarChart3,
  Zap,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 dark:from-background dark:to-accent/10">
      {/* Hero Section */}
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="w-4 h-4 mr-2" />
              실시간 AI 분석
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              암호화폐 이상 탐지 시스템
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              LSTM 기반 머신러닝으로 실시간 암호화폐 가격 이상을 탐지하고
              <br />
              스마트한 투자 인사이트를 제공합니다
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    실시간 모니터링
                  </p>
                  <p className="text-2xl font-bold text-foreground">24/7</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-xl">
                  <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    탐지된 이상
                  </p>
                  <p className="text-2xl font-bold text-foreground">3</p>
                </div>
                <div className="p-3 bg-orange-500/10 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    정확도
                  </p>
                  <p className="text-2xl font-bold text-foreground">94.2%</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    분석 코인
                  </p>
                  <p className="text-2xl font-bold text-foreground">50+</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid - 1440px 레이아웃에 맞게 조정 */}
          <div className="grid grid-cols-1 xl:grid-cols-10 gap-8 mb-8">
            {/* Chart Section - 70% */}
            <div className="xl:col-span-7">
              <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">
                        실시간 차트 분석
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        AI 기반 이상 패턴 탐지 및 예측
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                        실시간
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <CryptoChart height={600} />
                </div>
              </div>
            </div>

            {/* Market List Section - 30% */}
            <div className="xl:col-span-3">
              <MarketList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
