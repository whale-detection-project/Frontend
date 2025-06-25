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
  Key,
  ArrowUpDown,
} from 'lucide-react';
import { ReactNode, useState, useEffect } from 'react';
import { Modal } from './modal';
import axios from 'axios';
import { AddressDetailModal } from './address-detail-modal';
import { BtcIcon } from './btc-icon';

// 알림 데이터 타입
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

interface NotificationItemProps {
  notification: Notification;
}

export const getSeverity = (btc: number): 'high' | 'medium' | 'low' => {
  if (btc >= 1000) return 'high';
  if (btc >= 100) return 'medium';
  return 'low';
};

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
    case 4:
      return '다중 복합 유형';
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
 * BTC 값에 따라 고래 유형 문자열을 반환합니다.
 * (스크린샷 이미지의 기준을 따름)
 */
const getBitcoinHolderType = (btc: number): string => {
  if (btc >= 1000) return 'Whale'; // >1k BTC
  if (btc >= 500) return 'Shark'; // 500-1k BTC
  if (btc >= 200) return 'Dolphin'; // 200-499 BTC
  if (btc >= 50) return 'Fish'; // 50-199 BTC
  if (btc >= 10) return 'Octopus'; // 10-49 BTC
  if (btc >= 1) return 'Crab'; // 1-9 BTC
  return 'Shrimp'; // <1 BTC
};

const formatTimestamp = (utcTimestamp: string): string => {
  const utcDate = new Date(utcTimestamp.endsWith('Z') ? utcTimestamp : utcTimestamp + 'Z');

  const kstFormatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = kstFormatter.formatToParts(utcDate);
  const kstValues = parts
    .filter((part) => part.type !== 'literal')
    .reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {} as Record<string, string>);

  const kstString = `${kstValues.year}. ${kstValues.month}. ${kstValues.day}. ${kstValues.hour}시 ${kstValues.minute}분 ${kstValues.second}초`;
  const originalUtcString = utcTimestamp.replace('T', ' ').split('.')[0];

  return `${originalUtcString} (UTC) / ${kstString} (KST)`;
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const {
    type,
    title,
    message,
    timestamp,
    coin,
    predicted_cluster,
    total_input_value: btcValue,
    max_input_address,
    max_output_address,
  } = notification;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const holderType = btcValue !== undefined ? getBitcoinHolderType(btcValue) : undefined;

  let displayTitle = title;
  if (typeof title === 'string' && btcValue !== undefined) {
    displayTitle = (
      <div className="flex items-center gap-2">
        <span>{title}</span>
        <span className="font-mono text-muted-foreground">
          {btcValue.toFixed(2)}
          <BtcIcon className="inline-block w-4 h-4 ml-1" />
        </span>
      </div>
    );
  }

  const handleAddressClick = (e: React.MouseEvent, address: string) => {
    e.stopPropagation();
    setSelectedAddress(address);
    setIsAddressModalOpen(true);
  };

  // 알림 카드 컨테이너 디자인 (전역 테마 적용)
  const containerClasses = `
    group p-6 bg-card rounded-2xl border dark:border-border
    transition-colors duration-200 cursor-pointer hover:bg-secondary/50 dark:hover:bg-accent
  `;

  // 태그 공통 스타일
  const baseTagClasses =
    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold transition-colors';

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
                <h3 className="text-lg font-bold text-foreground mb-2">{displayTitle}</h3>

                {/* 태그들 */}
                <div className="flex flex-wrap items-center gap-2">
                  {coin && <span className={coinTagClasses}>{coin}</span>}
                  {holderType && <span className={holderTypeTagClasses}>{holderType}</span>}
                  {predicted_cluster !== undefined && (
                    <span className={clusterTagClasses}>{getClusterType(predicted_cluster)}</span>
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

            {/* 주소 정보 */}
            {max_input_address && max_output_address && (
              <div className="mb-3 flex items-center space-x-2 text-sm text-muted-foreground">
                <button
                  onClick={(e) => handleAddressClick(e, max_input_address)}
                  className="cursor-pointer inline-block bg-gray-100 dark:bg-gray-800 rounded-md px-2 py-1 text-xs font-mono truncate hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title={max_input_address}
                >
                  {max_input_address}
                </button>
                <ArrowRightLeft className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <button
                  onClick={(e) => handleAddressClick(e, max_output_address)}
                  className="cursor-pointer inline-block bg-gray-100 dark:bg-gray-800 rounded-md px-2 py-1 text-xs font-mono truncate hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title={max_output_address}
                >
                  {max_output_address}
                </button>
              </div>
            )}

            {/* 시간 정보 */}
            <div className="flex items-center text-xs text-muted-foreground/80">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              <span>{formatTimestamp(timestamp)}</span>
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
      <AddressDetailModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        address={selectedAddress}
      />
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
    case 4:
      return '기존에 정의된 클러스터와 거리가 멀어 특정 패턴으로 분류하기 어려운 거래입니다. 새로운 유형의 거래이거나 이상치(outlier)일 수 있습니다.';
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
    predicted_cluster,
    total_input_value,
    input_count,
    output_count,
    max_output_ratio,
    fee_per_max_ratio,
    max_input_ratio,
  } = notification;
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const handleAddressClick = (address: string) => {
    setSelectedAddress(address);
    setIsAddressModalOpen(true);
  };

  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const response = await axios.get(
          `https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT`,
        );
        setBtcPrice(parseFloat(response.data.price));
      } catch (error) {
        console.error('Error fetching Bitcoin price from Binance:', error);
      } finally {
        setIsLoadingPrice(false);
      }
    };

    fetchBtcPrice();
  }, []);

  const currentBtcValue = total_input_value ?? 0;

  const clusterType = predicted_cluster !== undefined ? getClusterType(predicted_cluster) : 'N/A';

  const analysisItems = [
    {
      icon: <Shapes className="w-6 h-6 text-blue-500" />,
      title: '거래 패턴 (AI 클러스터링)',
      value: <span className="text-blue-600 dark:text-blue-400">{clusterType}</span>,
      description: getClusterDescription(predicted_cluster),
    },
    {
      icon: <CircleDollarSign className="w-6 h-6 text-green-500" />,
      title: '거래 규모',
      value: (
        <div>
          <div className="flex items-baseline gap-2">
            <span>
              {currentBtcValue.toLocaleString('en-US', {
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-lg font-medium text-muted-foreground">BTC</span>
          </div>
          <div className="text-sm font-normal text-muted-foreground mt-1">
            {isLoadingPrice ? (
              <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            ) : btcPrice ? (
              `≈ $${(currentBtcValue * btcPrice).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            ) : (
              'USD 환산 불가'
            )}
          </div>
        </div>
      ),
      description: isLoadingPrice
        ? 'Binance에서 실시간 시세 조회 중...'
        : `1 BTC ≈ $${btcPrice ? btcPrice.toLocaleString('en-US') : '...'} (Binance)`,
    },
    {
      icon: <ArrowUpDown className="w-6 h-6 text-yellow-500" />,
      title: '총 입출금 횟수',
      value: (
        <span className="text-lg font-medium">{`${input_count || 0} IN / ${
          output_count || 0
        } OUT`}</span>
      ),
      description: '하나의 트랜잭션에 포함된 입출금 주소의 개수입니다.',
    },
    {
      icon: <Focus className="w-6 h-6 text-purple-500" />,
      title: '최대 입력/출력 비율',
      value: (
        <div className="flex flex-col space-y-1 text-lg font-medium font-mono">
          <div className="flex items-baseline">
            <span className="text-sm text-muted-foreground mr-2 w-20 shrink-0">입력(IN):</span>
            <span className="text-purple-600 dark:text-purple-400">
              {(max_input_ratio || 0).toFixed(8)}
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="text-sm text-muted-foreground mr-2 w-20 shrink-0">출력(OUT):</span>
            <span className="text-purple-600 dark:text-purple-400">
              {(max_output_ratio || 0).toFixed(8)}
            </span>
          </div>
        </div>
      ),
      description:
        '단일 주소의 최대 입력/출력 비율입니다. 1에 가까울수록 특정 주소가 거래를 주도했음을 의미합니다.',
    },
    {
      icon: <Receipt className="w-6 h-6 text-red-500" />,
      title: '총 거래 수수료 (Satoshi)',
      value: (
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-medium">
            {(currentBtcValue * (fee_per_max_ratio || 0) * 1e8).toLocaleString(undefined, {
              maximumFractionDigits: 0,
            })}
          </span>
          <span className="text-sm text-muted-foreground">Sats</span>
        </div>
      ),
      description: '사토시는 비트코인의 가장 작은 단위입니다 (1 BTC = 10^8 사토시).',
    },
  ];

  if (notification.max_input_address && notification.max_output_address) {
    analysisItems.push({
      icon: <Key className="w-6 h-6 text-indigo-500" />,
      title: '주요 거래 주소',
      value: (
        <div className="flex flex-col space-y-2 text-sm font-mono">
          <button
            onClick={() => handleAddressClick(notification.max_input_address!)}
            className="flex items-center text-left hover:text-primary transition-colors w-full cursor-pointer"
            title={notification.max_input_address}
          >
            <span className="font-semibold text-gray-400 mr-2 w-16 shrink-0">보낸 주소:</span>
            <span className="truncate">{notification.max_input_address}</span>
          </button>
          <button
            onClick={() => handleAddressClick(notification.max_output_address!)}
            className="flex items-center text-left hover:text-primary transition-colors w-full cursor-pointer"
            title={notification.max_output_address}
          >
            <span className="font-semibold text-gray-400 mr-2 w-16 shrink-0">받는 주소:</span>
            <span className="truncate">{notification.max_output_address}</span>
          </button>
        </div>
      ),
      description: '가장 많은 금액이 오고간 입출금 주소입니다. 클릭 시 상세 정보를 조회합니다.',
    });
  }

  return (
    <div className="p-1">
      <div className="divide-y divide-border">
        {analysisItems.map((item) => (
          <div key={item.title} className="py-4 first:pt-0 last:pb-0">
            <AnalysisItem {...item} />
          </div>
        ))}
      </div>
      <AddressDetailModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        address={selectedAddress}
      />
    </div>
  );
}
