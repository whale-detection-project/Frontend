'use client';

import { ArrowRight, BrainCircuit, Zap, Layers } from 'lucide-react';
import Image from 'next/image';

// Main Page Component
export default function Home() {
  return (
    <div className="bg-background text-foreground w-full">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection />
        <FeaturesSection />
        <AIModelSection />
      </main>
    </div>
  );
}

const HeroSection = () => (
  <section className="text-center py-12">
    <div className="inline-flex items-center px-4 py-1.5 mb-6 text-sm font-semibold rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
      <Zap className="w-4 h-4 mr-2" />
      실시간 비트코인 고래 탐지 및 AI 분석
    </div>
    <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-gray-100 to-gray-400">
      Bitcoin Whale Detector
    </h1>
    <p className="max-w-2xl mx-auto mt-6 text-lg text-muted-foreground">
      대규모 비트코인 거래를 실시간으로 탐지하고 AI 기반 인사이트를 제공하여 시장의 중요한 움직임을
      놓치지 않도록 돕습니다.
    </p>
    <div className="mt-10 flex items-center justify-center gap-x-4">
      <a
        href="/dashboard"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-6 bg-primary text-primary-foreground shadow hover:bg-primary/90"
      >
        대시보드 바로가기 <ArrowRight className="w-4 h-4 ml-2" />
      </a>
      <a
        href="https://github.com/whale-detection-project"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-6 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
      >
        GitHub Repository
      </a>
    </div>
  </section>
);

// 2. Features Section
const features = [
  {
    icon: <Zap className="w-8 h-8 text-primary" />,
    title: '실시간 거래 탐지',
    description:
      'Binance WebSocket을 통해 1,000 BTC 이상의 대규모 거래를 실시간으로 추적하고 즉시 알림을 제공합니다.',
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    title: 'AI 기반 패턴 분석',
    description:
      'K-Means와 XGBoost를 결합한 2단계 AI 모델로 고래 거래를 4가지 핵심 패턴으로 자동 분류 및 예측합니다.',
  },
  {
    icon: <Layers className="w-8 h-8 text-primary" />,
    title: '상세 거래 정보 제공',
    description:
      '총 거래 규모, 입출력 주소 수, 수수료 등 심층 분석을 위한 상세 데이터를 시각적으로 명확하게 제공합니다.',
  },
];

const FeaturesSection = () => (
  <section className="py-16">
    <div className="text-center">
      <h2 className="text-3xl font-bold tracking-tight">주요 기능</h2>
      <p className="mt-4 text-lg text-muted-foreground">
        AI와 함께 고래의 움직임에 담긴 의미를 들여다봅니다.
      </p>
    </div>
    <div className="mt-12 grid gap-8 md:grid-cols-3">
      {features.map((feature) => (
        <div key={feature.title} className="bg-card p-6 rounded-2xl border border-border">
          <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mb-4">
            {feature.icon}
          </div>
          <h3 className="text-xl font-bold">{feature.title}</h3>
          <p className="mt-2 text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  </section>
);

const clusterData = [
  {
    id: 0,
    type: '지갑 리밸런싱',
    desc: '소수 입력에서 다수 출력으로 자금을 재배치하는 패턴입니다.',
    image: '/cluster_0.png',
  },
  {
    id: 1,
    type: '단순 이체형',
    desc: '단일 입출력에 가까운, 가장 일반적인 대규모 전송 패턴입니다.',
    image: '/cluster_1.png',
  },
  {
    id: 2,
    type: '자금 통합형',
    desc: '다수의 입력을 소수의 주소로 병합하는 패턴입니다.',
    image: '/cluster_2.png',
  },
  {
    id: 3,
    type: '자금 분산형',
    desc: '소수의 입력을 다수의 주소로 분산하는 패턴입니다.',
    image: '/cluster_3.png',
  },
];

const AIModelSection = () => (
  <section className="py-16">
    <div className="text-center">
      <h2 className="text-3xl font-bold tracking-tight">AI 모델</h2>
      <p className="mt-4 text-lg max-w-3xl mx-auto text-muted-foreground">
        비지도 학습(K-Means)과 지도 학습(XGBoost)을 결합한 2단계 파이프라인을 통해, 레이블 없는
        데이터로부터 의미있는 고래 행동 유형을 학습하고 실시간 분류합니다.
      </p>
    </div>

    <div className="mt-12">
      <h3 className="text-xl font-bold mb-8 text-center">AI가 분류한 4가지 고래 거래 패턴</h3>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {clusterData.map((cluster) => (
            <div
              key={cluster.id}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-start text-center"
            >
              <div className="relative w-full h-48 mb-4">
                <Image src={cluster.image} alt={cluster.type} layout="fill" objectFit="contain" />
              </div>
              <h4 className="text-lg font-bold text-foreground">
                <span className="mr-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold">
                  {cluster.id}
                </span>
                {cluster.type}
              </h4>
              <p className="text-sm text-muted-foreground mt-2 flex-grow">{cluster.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
