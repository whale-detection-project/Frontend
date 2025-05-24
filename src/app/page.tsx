import CryptoChart from '@/components/ui/crypto-chart';

export default function Home() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold">암호화폐 이상 탐지 시스템</h1>
            <p className="text-gray-500 mt-2">
              LSTM 기반 머신러닝을 활용한 실시간 암호화폐 가격 이상 탐지 및 분석
              시스템입니다.
            </p>
          </div>

          {/* 메인 차트 */}
          <div className="bg-white rounded-lg shadow-sm border ">
            <CryptoChart symbol="BTC/USDT" height={500} />
          </div>
        </div>
      </div>
    </div>
  );
}
