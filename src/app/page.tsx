'use client';

import { ArrowRight, BrainCircuit, Zap, Bell, Search, AlertTriangle } from 'lucide-react';
import Image from 'next/image';

// Main Page Component
export default function Home() {
  return (
    <div className="bg-background text-foreground w-full">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
      '네트워크에서 발생하는 대규모 거래(고래 거래)를 실시간으로 포착하여 즉각적으로 대시보드에 표시합니다.',
  },
  {
    icon: <BrainCircuit className="w-8 h-8 text-primary" />,
    title: 'AI 기반 패턴 분석',
    description:
      'K-Means와 MLP(다층 퍼셉트론) 신경망을 결합하여, 복잡한 거래 데이터를 5가지 핵심 패턴으로 자동 분류합니다.',
  },
  {
    icon: <Search className="w-8 h-8 text-primary" />,
    title: '상세 거래 및 지갑 분석',
    description:
      '개별 거래의 상세 정보는 물론, 주소 클릭 한 번으로 지갑의 잔고, 총 입출금 내역 등 심층 정보를 제공합니다.',
  },
  {
    icon: <Bell className="w-8 h-8 text-primary" />,
    title: '사용자 맞춤형 알림',
    description:
      '데스크톱 알림을 활성화하고, 최소 알림 금액을 직접 설정하여 원하는 정보만 필터링하여 받아볼 수 있습니다.',
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
    <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
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
    desc: '여러 주소의 자금을 통합 후 재분배하는 복합 패턴입니다.',
    image: '/cluster_0.png',
  },
  {
    id: 1,
    type: '단순 이체형',
    desc: '일반적인 1:1 주소 간의 거래 패턴입니다.',
    image: '/cluster_1.png',
  },
  {
    id: 2,
    type: '자금 통합형',
    desc: '여러 주소에서 단일 주소로 자금을 모으는 패턴입니다.',
    image: '/cluster_2.png',
  },
  {
    id: 3,
    type: '자금 분산형',
    desc: '단일 주소에서 여러 주소로 자금을 흩뿌리는 패턴입니다.',
    image: '/cluster_3.png',
  },
  {
    id: 4,
    type: '다중 복합 유형',
    desc: '기존 패턴과 다른 새로운 유형이거나 복합 거래일 가능성이 있는 거래입니다.',
    image: null, // 이미지가 없음을 표시
  },
];

const AIModelSection = () => (
  <section className="py-16">
    <div className="text-center">
      <h2 className="text-3xl font-bold tracking-tight">AI가 분석한 거래 패턴</h2>
      <p className="mt-4 text-lg max-w-3xl mx-auto text-muted-foreground">
        K-Means 클러스터링으로 주요 거래 패턴을 그룹화하고, MLP(다층 퍼셉트론) 신경망 모델을 통해 각
        거래를 5가지 유형으로 정교하게 분류합니다.
      </p>
    </div>

    <div className="mt-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {clusterData.map((cluster) => (
            <div
              key={cluster.id}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center justify-start text-center"
            >
              <div className="relative w-full h-48 mb-4 flex items-center justify-center bg-muted/20 rounded-lg">
                {cluster.image ? (
                  <Image src={cluster.image} alt={cluster.type} layout="fill" objectFit="contain" />
                ) : (
                  <AlertTriangle className="w-16 h-16 text-muted-foreground/50" />
                )}
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
