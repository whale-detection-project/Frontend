import {
  Bell,
  Clock,
  TrendingDown,
  TrendingUp,
  Zap,
  AlertTriangle,
  FileText,
  Shapes,
  CircleDollarSign,
  ArrowRightLeft,
  Focus,
  Receipt,
} from 'lucide-react';
import { ReactNode, useState } from 'react';
import { Modal } from './modal';

// 알림 데이터 타입
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
  btcValue?: number;
  input_count?: number;
  output_count?: number;
  max_output_ratio?: number;
  fee_per_max_ratio?: number;
  max_input_ratio?: number;
}

interface NotificationItemProps {
  notification: Notification;
}

/**
 * 예측된 클러스터 번호에 따라 패턴 유형 문자열을 반환합니다.
 */
const getClusterType = (clusterNumber: number): string => {
  switch (clusterNumber) {
    case 0:
      return '지갑 리밸런싱';
    case 1:
      return '단순 이체형';
    case 2:
      return '자금 통합형';
    case 3:
      return '자금 분산형';
    default:
      return '알 수 없는 패턴';
  }
};

/**
 * 알림 타입에 맞는 Lucide 아이콘 컴포넌트를 반환합니다.
 */
const getNotificationIconComponent = (type: string) => {
  switch (type) {
    case 'anomaly':
      return <Zap className="w-5 h-5 text-orange-500" />;
    case 'price':
      return <TrendingUp className="w-5 h-5 text-green-500" />;
    case 'portfolio':
      return <TrendingDown className="w-5 h-5 text-blue-500" />;
    case 'news':
      return <Bell className="w-5 h-5 text-purple-500" />;
    case 'ai_analysis':
      return <AlertTriangle className="w-5 h-5 text-primary" />;
    default:
      return <Bell className="w-5 h-5 text-muted-foreground" />;
  }
};

/**
 * 알림 심각도에 따른 표시 텍스트를 반환합니다. ('높음', '보통', '낮음' 유지)
 */
const getSeverityText = (severity: Notification['severity']): string => {
  switch (severity) {
    case 'high':
      return '높음';
    case 'medium':
      return '보통';
    case 'low':
      return '낮음';
    default:
      return '';
  }
};

/**
 * BTC 값에 따라 고래 유형 문자열을 반환합니다.
 * (스크린샷 이미지의 기준을 따름)
 */
const getBitcoinHolderType = (btc: number): string => {
  if (btc >= 1000) return 'Whale'; // >1k BTC
  if (btc >= 500) return 'Shark'; // 500-1k BTC
  if (btc >= 100) return 'Dolphin'; // 100-500 BTC
  if (btc >= 50) return 'Fish'; // 50-100 BTC
  if (btc >= 10) return 'Octopus'; // 10-50 BTC
  if (btc >= 1) return 'Crab'; // 1-10 BTC
  return 'Shrimp'; // <1 BTC
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const { type, title, message, timestamp, severity, coin, predictedCluster, btcValue } =
    notification;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const holderType = btcValue !== undefined ? getBitcoinHolderType(btcValue) : undefined;

  // 알림 카드 컨테이너 디자인 (전역 테마 적용)
  const containerClasses = `
    group p-6 bg-card rounded-2xl border dark:border-border
    transition-colors duration-200 cursor-pointer hover:bg-secondary/50 dark:hover:bg-accent
  `;

  // 태그 공통 스타일
  const baseTagClasses =
    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-colors';

  // 심각도 태그 스타일
  const severityTagClasses = `
    ${baseTagClasses}
    ${
      severity === 'high'
        ? 'text-red-600 dark:text-red-500 bg-red-500/10'
        : severity === 'medium'
        ? 'text-yellow-600 dark:text-yellow-500 bg-yellow-500/10'
        : 'text-green-600 dark:text-green-500 bg-green-500/10'
    }
  `;

  // 고래 유형 태그 스타일
  const holderTypeTagClasses = `
    ${baseTagClasses}
    text-blue-600 dark:text-blue-400 bg-blue-500/10
  `;

  // 클러스터 패턴 태그 스타일
  const clusterTagClasses = `
    ${baseTagClasses}
    text-purple-600 dark:text-purple-400 bg-purple-500/10
  `;

  // 코인 태그 스타일
  const coinTagClasses = `
    ${baseTagClasses}
    text-gray-600 dark:text-muted-foreground bg-gray-500/10
  `;

  return (
    <>
      <div className={containerClasses} onClick={() => setIsModalOpen(true)}>
        <div className="flex items-start space-x-4">
          {/* 아이콘 */}
          <div className="flex-shrink-0 p-2.5 bg-secondary/50 dark:bg-secondary rounded-xl flex items-center justify-center">
            {getNotificationIconComponent(type)}
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1 min-w-0">
            {/* 상단: 제목과 태그들 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                {/* 제목 */}
                <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>

                {/* 태그들 */}
                <div className="flex flex-wrap items-center gap-2">
                  {coin && <span className={coinTagClasses}>{coin}</span>}
                  {holderType && <span className={holderTypeTagClasses}>{holderType}</span>}
                  <span className={severityTagClasses}>{getSeverityText(severity)}</span>
                  {predictedCluster !== undefined && (
                    <span className={clusterTagClasses}>{getClusterType(predictedCluster)}</span>
                  )}
                </div>
              </div>

              {/* 액션 버튼 */}
              <button
                className="flex-shrink-0 ml-4 p-2 rounded-xl text-muted-foreground/70 hover:text-foreground hover:bg-secondary dark:hover:bg-accent transition-colors"
                aria-label="알림 상세 정보 보기"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
              >
                <FileText className="w-5 h-5" />
              </button>
            </div>

            {/* 메시지 */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-3">{message}</p>

            {/* 시간 정보 */}
            <div className="flex items-center text-xs text-muted-foreground/80">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              <span>{timestamp}</span>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="거래 상세 분석"
        size="lg"
      >
        <TransactionDetail notification={notification} />
      </Modal>
    </>
  );
}

// =================================================================
// NotificationSkeleton (전역 테마 적용)
// =================================================================

export function NotificationSkeleton() {
  return (
    <div className="p-6 bg-card rounded-2xl border dark:border-border">
      <div className="flex items-start space-x-4">
        {/* 아이콘 스켈레톤 */}
        <div className="flex-shrink-0 w-12 h-12 bg-muted dark:bg-secondary rounded-xl animate-pulse"></div>

        {/* 콘텐츠 스켈레톤 */}
        <div className="flex-1 space-y-3">
          {/* 제목과 태그 영역 */}
          <div className="space-y-2">
            <div className="h-5 bg-muted dark:bg-secondary rounded-lg w-3/4 animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="h-6 bg-muted dark:bg-secondary rounded-lg w-16 animate-pulse"></div>
              <div className="h-6 bg-muted dark:bg-secondary rounded-lg w-20 animate-pulse"></div>
              <div className="h-6 bg-muted dark:bg-secondary rounded-lg w-12 animate-pulse"></div>
            </div>
          </div>

          {/* 메시지 스켈레톤 */}
          <div className="space-y-2">
            <div className="h-4 bg-muted dark:bg-secondary rounded w-full animate-pulse"></div>
            <div className="h-4 bg-muted dark:bg-secondary rounded w-2/3 animate-pulse"></div>
          </div>

          {/* 시간 스켈레톤 */}
          <div className="h-3 bg-muted dark:bg-secondary rounded w-1/3 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

const getClusterDescription = (clusterNumber?: number): string => {
  switch (clusterNumber) {
    case 0:
      return '여러 주소에 분산된 자금을 하나의 주소로 모으고, 다시 여러 주소로 재분배하는 복합적인 패턴입니다. 주로 대규모 거래소 또는 클러스터링 서비스에서 내부 자금 관리를 위해 사용됩니다.';
    case 1:
      return '하나의 주소에서 다른 하나의 주소로 자금을 보내는 가장 일반적인 거래 형태입니다. 개인 간의 송금이나 서비스 이용료 지불 등이 여기에 해당합니다.';
    case 2:
      return '여러 주소로부터 자금을 하나의 주소로 통합하는 패턴입니다. 분산된 개인 지갑의 자산을 통합하거나, 다수의 소액 입금을 받는 서비스에서 주로 발견됩니다. (예: 채굴 풀 보상 집계)';
    case 3:
      return '하나의 주소에서 여러 주소로 자금을 분산하여 보내는 패턴입니다. 기업의 급여 지급, 대규모 에어드랍, 혹은 자금 세탁 목적의 분할 거래에서 나타날 수 있습니다.';
    default:
      return '분석된 데이터가 특정 패턴에 해당하지 않거나, 새로운 유형의 거래일 수 있습니다.';
  }
};

function AnalysisItem({
  icon,
  title,
  value,
  description,
}: {
  icon: ReactNode;
  title: string;
  value: ReactNode;
  description: ReactNode;
}) {
  return (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0 mt-1 w-10 h-10 flex items-center justify-center bg-muted dark:bg-secondary rounded-lg text-muted-foreground">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        <div className="text-xl md:text-2xl font-bold text-foreground mt-1">{value}</div>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function TransactionDetail({ notification }: { notification: Notification }) {
  const {
    predictedCluster,
    btcValue,
    input_count,
    output_count,
    max_output_ratio,
    fee_per_max_ratio,
    max_input_ratio,
  } = notification;

  const clusterType = predictedCluster !== undefined ? getClusterType(predictedCluster) : 'N/A';
  const feeRatio = fee_per_max_ratio || 0;
  const satoshiValue = (feeRatio * 1e8).toFixed(2);

  const analysisItems = [
    {
      icon: <Shapes className="w-5 h-5" />,
      title: '거래 패턴 (AI 클러스터링)',
      value: <span className="text-blue-600 dark:text-blue-400">{clusterType}</span>,
      description: getClusterDescription(predictedCluster),
    },
    {
      icon: <CircleDollarSign className="w-5 h-5" />,
      title: '총 거래 규모',
      value: (
        <span className="text-green-600 dark:text-green-400">
          {(btcValue || 0).toLocaleString('en-US', {
            maximumFractionDigits: 2,
          })}{' '}
          BTC
        </span>
      ),
      description:
        '이 거래에 포함된 비트코인의 총량입니다. 거래의 영향력을 파악하는 가장 중요한 지표입니다.',
    },
    {
      icon: <ArrowRightLeft className="w-5 h-5" />,
      title: '입력/출력 주소 수',
      value: (
        <div className="flex items-center space-x-2">
          <span>
            <strong className="font-mono text-blue-600 dark:text-blue-400">
              {input_count || 0}
            </strong>{' '}
            IN
          </span>
          <span className="text-muted-foreground/50 text-base">→</span>{' '}
          <span>
            <strong className="font-mono text-blue-600 dark:text-blue-400">
              {output_count || 0}
            </strong>{' '}
            OUT
          </span>
        </div>
      ),
      description:
        '거래에 사용된 입력(보내는 주소)과 출력(받는 주소)의 개수입니다. 이 수치는 자금의 흐름을 이해하는 데 도움을 줍니다.',
    },
    {
      icon: <Focus className="w-5 h-5" />,
      title: '최대 입력/출력 비율',
      value: (
        <div className="flex items-center space-x-2 font-mono text-purple-600 dark:text-purple-400">
          <span>{(max_input_ratio || 0).toFixed(4)}</span>
          <span>/</span>
          <span>{(max_output_ratio || 0).toFixed(4)}</span>
        </div>
      ),
      description:
        '단일 주소의 최대 입력/출력 비율입니다. 1에 가까울수록 특정 주소가 거래를 주도했음을 의미합니다.',
    },
    {
      icon: <Receipt className="w-5 h-5" />,
      title: '수수료 비율',
      value: (
        <span className="font-mono text-yellow-600 dark:text-yellow-500">
          {feeRatio.toExponential(2)}
        </span>
      ),
      description: (
        <span>
          거래 금액 1 BTC당 약 <strong className="text-foreground">{satoshiValue} 사토시</strong>의
          수수료가 발생했음을 의미합니다 (1 BTC = 10<sup>8</sup> Satoshi).
          <br />이 값이 매우 낮으면 내부 자금 이동일 가능성이 높습니다.
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {analysisItems.map((item, index) => (
        <div key={item.title}>
          <AnalysisItem
            icon={item.icon}
            title={item.title}
            value={item.value}
            description={item.description}
          />
          {index < analysisItems.length - 1 && (
            <div className="border-t dark:border-border mt-6"></div>
          )}
        </div>
      ))}
    </div>
  );
}
