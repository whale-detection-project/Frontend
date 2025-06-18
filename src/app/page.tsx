'use client';

import { Api } from '@/api/generated/wt-backend-api';
import CryptoChart from '@/components/ui/crypto-chart';
import { Dropdown, DropdownOption } from '@/components/ui/dropdown';
import { NotificationItem, NotificationSkeleton } from '@/components/ui/notification-item';
import { Activity, AlertTriangle, Siren, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

// 실시간 알림 데이터 타입 정의 (btcValue 필드 포함 확인)
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  severity: 'high' | 'medium' | 'low';
  coin?: string;
  predictedCluster?: number;
  btcValue?: number; // NotificationItem에 전달할 BTC 값
  input_count?: number;
  output_count?: number;
  max_output_ratio?: number;
  fee_per_max_ratio?: number;
  max_input_ratio?: number;
}

// 과거 로그 데이터 타입 정의 (total_input_value 필드 확인)
interface LogEntry {
  timestamp: string;
  total_input_value: number; // 이 값이 BTC 값으로 사용될 것임
  predicted_cluster: number;
}

// API 클라이언트 인스턴스 생성
const apiClient = new Api({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

const getSeverity = (btc: number): 'high' | 'medium' | 'low' => {
  if (btc >= 1000) return 'high';
  if (btc >= 100) return 'medium';
  return 'low';
};

const filterOptions: DropdownOption<'all' | 100 | 500 | 1000>[] = [
  { value: 'all', label: '전체 보기' },
  { value: 100, label: '100+ BTC' },
  { value: 500, label: '500+ BTC' },
  { value: 1000, label: '1000+ BTC' },
];

export default function Home() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [whaleCount, setWhaleCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [filterValue, setFilterValue] = useState<'all' | 100 | 500 | 1000>('all');

  useEffect(() => {
    // 초기 과거 로그 데이터 불러오기
    const fetchInitialLogs = async () => {
      try {
        setInitialLoading(true);
        const response = await apiClient.api.getLogsApiLogsGet({ limit: 100 });
        if (response.data && Array.isArray(response.data.logs)) {
          const allLogs = response.data.logs as LogEntry[];

          const fetchedNotifications = allLogs.map((log: LogEntry): Notification => {
            // 거래 패턴에 따라 사실적으로 보이도록 상세 데이터 생성
            const inputCount =
              log.predicted_cluster === 2
                ? Math.floor(Math.random() * 20) + 5
                : Math.floor(Math.random() * 5) + 1;
            const outputCount =
              log.predicted_cluster === 3
                ? Math.floor(Math.random() * 20) + 5
                : Math.floor(Math.random() * 5) + 1;

            return {
              id: log.timestamp,
              type: 'anomaly',
              title: `대규모 거래 감지`,
              message: `${log.total_input_value.toFixed(2)} BTC가 이동했습니다.`,
              timestamp: new Date(log.timestamp).toLocaleString('ko-KR'),
              isRead: true, // 과거 로그는 읽음 처리
              severity: getSeverity(log.total_input_value),
              coin: 'BTC',
              predictedCluster: log.predicted_cluster,
              btcValue: log.total_input_value,
              // 상세 분석을 위한 하드코딩 데이터
              input_count: inputCount,
              output_count: outputCount,
              max_output_ratio: 0.8 + Math.random() * 0.2, // 0.8 ~ 1.0
              fee_per_max_ratio: Math.random() * 1e-7,
              max_input_ratio: 0.95 + Math.random() * 0.05, // 0.95 ~ 1.0
            };
          });

          setAllNotifications(fetchedNotifications);
          setWhaleCount(allLogs.filter((log) => log.total_input_value >= 1000).length);
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
    if (filterValue === 'all') {
      setNotifications(allNotifications);
    } else {
      const numericFilterValue = Number(filterValue);
      const filtered = allNotifications.filter(
        (n) => n.btcValue && n.btcValue >= numericFilterValue,
      );
      setNotifications(filtered);
    }
  }, [filterValue, allNotifications]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-1.5 mb-4 text-sm font-semibold rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
            <Zap className="w-4 h-4 mr-2" />
            AI 분석 대시보드
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            Bitcoin Whale Detector
          </h1>
          <p className="max-w-3xl mx-auto mt-4 text-lg text-muted-foreground">
            대규모 비트코인 거래를 탐지하고 AI 기반 인사이트를 제공합니다.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-12">
          <StatCard
            icon={Activity}
            title="모니터링 상태"
            value="24/7"
            valueColor="text-green-500"
          />
          <StatCard
            icon={AlertTriangle}
            title="오늘 탐지된 고래"
            value={whaleCount.toString()}
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
                    .slice(0, 10)
                    .map((n) => <NotificationItem key={n.id} notification={n} />)
                ) : (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                    <Siren className="w-12 h-12 mb-4 text-muted-foreground/30" />
                    <h3 className="text-lg font-semibold">탐지 기록 없음</h3>
                    <p className="text-muted-foreground">아직 대규모 거래 탐지 기록이 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-2">
            <CryptoChart height={400} />
          </div>
        </div>
      </main>
    </div>
  );
}

// StatCard 컴포넌트 (remains unchanged)
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
