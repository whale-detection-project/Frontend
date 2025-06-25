'use client';

import { Api } from '@/api/generated/wt-backend-api';

import { Dropdown, DropdownOption } from '@/components/ui/dropdown';

import {
  NotificationItem,
  NotificationSkeleton,
  getSeverity,
} from '@/components/ui/notification-item';

import { BtcIcon } from '@/components/ui/btc-icon';

import { AlertTriangle, BarChart, History, Info, Siren, Zap } from 'lucide-react';

import { ReactNode, useEffect, useState } from 'react';

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';

// 과거 로그 데이터 타입 정의 (API 응답에 맞게 확장)
interface LogEntry {
  timestamp: string;
  total_input_value: number;
  predicted_cluster: number;
  input_count: number;
  output_count: number;
  max_output_ratio: number;
  fee_per_max_ratio: number;
  max_input_ratio: number;
  max_input_address?: string;
  max_output_address?: string;
}

// 실시간 알림 데이터 타입 정의
interface Notification {
  id: string;
  type: string;
  title: ReactNode;
  message: string;
  timestamp: string;
  isRead: boolean;
  severity: 'high' | 'medium' | 'low';
  coin?: string;
  predicted_cluster?: number;
  total_input_value?: number;
  input_count?: number;
  output_count?: number;
  max_output_ratio?: number;
  fee_per_max_ratio?: number;
  max_input_ratio?: number;
  max_input_address?: string;
  max_output_address?: string;
}

// 클러스터 데이터 타입
interface ClusterData {
  name: string;
  count: number;
  fill: string;
}

// API 클라이언트 인스턴스 생성
const apiClient = new Api({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// 클러스터 색상 및 이름 정의
const CLUSTER_COLORS = {
  0: '#3b82f6', // blue-500
  1: '#84cc16', // lime-500
  2: '#f97316', // orange-500
  3: '#a855f7', // purple-500
  4: '#ec4899', // pink-500
};

const CLUSTER_NAMES: { [key: number]: string } = {
  0: '지갑 리밸런싱',
  1: '단순 이체형',
  2: '자금 통합형',
  3: '자금 분산형',
  4: '다중 복합 유형',
};

const filterOptions: DropdownOption<'all' | '200-499' | '500-999' | '1000+'>[] = [
  { value: 'all', label: '전체 보기' },
  { value: '200-499', label: '200 ~ 499 BTC' },
  { value: '500-999', label: '500 ~ 999 BTC' },
  { value: '1000+', label: '1000+ BTC' },
];

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [whaleCount, setWhaleCount] = useState(0);
  const [totalDetections, setTotalDetections] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [filterValue, setFilterValue] = useState<'all' | '200-499' | '500-999' | '1000+'>('1000+');
  const [clusterCounts, setClusterCounts] = useState<ClusterData[]>([]);
  const [analysisCount, setAnalysisCount] = useState(0);

  useEffect(() => {
    const fetchInitialLogs = async () => {
      try {
        setInitialLoading(true);
        const response = await apiClient.api.getLogsApiLogsGet({ limit: 1000000 });
        if (response.data && Array.isArray(response.data.logs)) {
          const allLogs = response.data.logs as unknown as LogEntry[];

          const fetchedNotifications = allLogs.map((log: LogEntry, index: number): Notification => {
            return {
              id: `${log.timestamp}-${index}`,
              type: 'anomaly',

              title: (
                <div className="flex items-center gap-2">
                  <span>대규모 거래 감지</span>

                  <span className="font-mono text-muted-foreground">
                    {log.total_input_value.toFixed(2)}
                    <BtcIcon className="inline-block w-4 h-4 ml-1" />
                  </span>
                </div>
              ),

              message: `${log.total_input_value.toFixed(2)} BTC가 이동했습니다.`,
              timestamp: log.timestamp,
              isRead: true,
              severity: getSeverity(log.total_input_value),
              coin: 'BTC',
              predicted_cluster: log.predicted_cluster,
              total_input_value: log.total_input_value,
              input_count: log.input_count,
              output_count: log.output_count,
              max_output_ratio: log.max_output_ratio,
              fee_per_max_ratio: log.fee_per_max_ratio,
              max_input_ratio: log.max_input_ratio,
              max_input_address: log.max_input_address,
              max_output_address: log.max_output_address,
            };
          });

          setAllNotifications(fetchedNotifications);
          setTotalDetections(fetchedNotifications.length);

          // 1000 BTC 이상 거래만 필터링 (상단 고정 StatCard용)
          const whaleLogs = allLogs.filter(
            (log) => log.total_input_value && log.total_input_value >= 1000,
          );
          setWhaleCount(whaleLogs.length);
        }
      } catch (error) {
        console.error('Failed to fetch initial logs:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialLogs();
  }, []);

  useEffect(() => {
    if (initialLoading) return; // 초기 데이터 로딩 전에는 실행 방지

    const filteredLogs = allNotifications.filter((n) => {
      if (filterValue === 'all') return true;
      if (!n.total_input_value) return false;
      switch (filterValue) {
        case '200-499':
          return n.total_input_value >= 200 && n.total_input_value < 500;
        case '500-999':
          return n.total_input_value >= 500 && n.total_input_value < 1000;
        case '1000+':
          return n.total_input_value >= 1000;
        default:
          return true;
      }
    });

    setNotifications(filteredLogs);
    setAnalysisCount(filteredLogs.length);

    // 클러스터별 카운트 재계산
    const counts: { [key: number]: number } = {};
    filteredLogs.forEach((log) => {
      if (log.predicted_cluster !== undefined) {
        counts[log.predicted_cluster] = (counts[log.predicted_cluster] || 0) + 1;
      }
    });

    const chartData = Object.keys(CLUSTER_NAMES)
      .map((clusterKeyStr) => {
        const clusterKey = parseInt(clusterKeyStr, 10);
        return {
          name: CLUSTER_NAMES[clusterKey],
          count: counts[clusterKey] || 0,
          fill: CLUSTER_COLORS[clusterKey as keyof typeof CLUSTER_COLORS],
        };
      })
      .sort((a, b) => b.count - a.count); // 카운트 순으로 정렬

    setClusterCounts(chartData);
  }, [filterValue, allNotifications, initialLoading]);

  const mostFrequentCluster =
    clusterCounts.length > 0
      ? clusterCounts.reduce((max, current) => (current.count > max.count ? current : max))
      : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            <Zap className="w-4 h-4 mr-2" />
            실시간 분석 현황
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            고래 활동 대시보드
          </h1>
          <p className="max-w-3xl mx-auto mt-4 text-lg text-muted-foreground">
            탐지된 거래의 주요 지표와 AI가 분석한 거래 패턴을 확인하세요.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
          <StatCard
            icon={History}
            title="총 탐지된 거래"
            value={initialLoading ? '...' : totalDetections.toLocaleString()}
            valueColor="text-blue-500"
          />
          <StatCard
            icon={AlertTriangle}
            title="고래 탐지 (1000+ BTC)"
            value={initialLoading ? '...' : whaleCount.toLocaleString()}
            valueColor="text-orange-500"
          />
        </div>

        <div className="mb-8">
          <div className="bg-card rounded-2xl shadow-sm border border-border">
            <div className="p-4 sm:p-6 border-b border-border">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center">
                  <Siren className="w-6 h-6 mr-3 text-blue-500" />
                  <h2 className="text-xl font-bold">과거 고래 탐지 기록</h2>
                </div>
                <Dropdown
                  options={filterOptions}
                  value={filterValue}
                  onChange={(value) => setFilterValue(value)}
                />
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {initialLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <NotificationSkeleton key={i} />)
                ) : notifications.length > 0 ? (
                  notifications
                    .slice(0, 100)
                    .map((n) => <NotificationItem key={n.id} notification={n} />)
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                    <Siren className="w-12 h-12 mb-4 text-muted-foreground/30" />
                    <h3 className="text-lg font-semibold">탐지 기록 없음</h3>
                    <p className="text-muted-foreground">
                      선택한 필터에 해당하는 대규모 거래 기록이 없습니다.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <StatCard
              icon={AlertTriangle}
              title="분석된 총 거래"
              value={initialLoading ? '...' : analysisCount.toLocaleString()}
              valueColor="text-orange-500"
            />
            <StatCard
              icon={BarChart}
              title="탐지 패턴 종류"
              value={initialLoading ? '...' : clusterCounts.length.toString()}
              valueColor="text-indigo-500"
            />
            <StatCard
              icon={Info}
              title="최다 거래 유형"
              value={initialLoading || !mostFrequentCluster ? '...' : mostFrequentCluster.name}
              valueColor="text-pink-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h3 className="text-xl font-bold mb-4">고래 거래 분포</h3>
              {initialLoading ? (
                <div className="flex items-center justify-center h-80">
                  <p>차트 로딩 중...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsBarChart data={clusterCounts}>
                    <defs>
                      {clusterCounts.map((entry, index) => (
                        <linearGradient
                          key={`gradient-${index}`}
                          id={`color${index}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="5%" stopColor={entry.fill} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={entry.fill} stopOpacity={0.2} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#a1a1aa', dy: 10 }}
                    />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#a1a1aa' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.75rem',
                        boxShadow:
                          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                      }}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                      itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
                      cursor={false}
                    />
                    <Bar dataKey="count" name="거래 수" radius={[4, 4, 0, 0]}>
                      {clusterCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#color${index})`} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="lg:col-span-2 bg-card p-6 rounded-2xl shadow-sm border border-border">
              <h3 className="text-xl font-bold mb-4">고래 비율</h3>
              {initialLoading ? (
                <div className="flex items-center justify-center h-80">
                  <p>차트 로딩 중...</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <RechartsPieChart>
                    <Pie
                      data={clusterCounts}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      labelLine={false}
                      outerRadius={110}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      paddingAngle={2}
                    >
                      {clusterCounts.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} stroke={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.75rem',
                        boxShadow:
                          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                      }}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                      itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
                    />
                    <Legend
                      iconSize={12}
                      wrapperStyle={{
                        paddingTop: '20px',
                      }}
                      formatter={(value) => <span style={{ color: '#a1a1aa' }}>{value}</span>}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// StatCard 컴포넌트
function StatCard({
  icon: Icon,
  title,
  value,
  valueColor,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  valueColor: string;
}) {
  return (
    <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
        <div className="p-3 bg-accent rounded-xl">
          <Icon className={`w-6 h-6 ${valueColor}`} />
        </div>
      </div>
    </div>
  );
}
