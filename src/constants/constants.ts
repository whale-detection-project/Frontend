export const notifications = [
  {
    id: 1,
    type: 'anomaly', // 이상 패턴 감지 유형
    title: 'BTC 이상 패턴 감지',
    message: '비트코인에서 비정상적인 거래량 급증이 감지되었습니다.',
    timestamp: '2024-01-15 14:30',
    isRead: false, // 읽지 않은 알림
    severity: 'high', // 중요도 높음
    coin: 'BTC', // 관련 코인
    action: 'check_chart', // 알림 클릭 시 수행할 액션
  },
  {
    id: 2,
    type: 'price', // 가격 알림 유형
    title: 'ETH 가격 알림',
    message: '이더리움이 설정한 목표가 $2,700에 도달했습니다.',
    timestamp: '2024-01-15 13:45',
    isRead: false,
    severity: 'medium', // 중요도 중간
    coin: 'ETH',
    action: 'view_price',
  },
  {
    id: 3,
    type: 'portfolio', // 포트폴리오 알림 유형
    title: '포트폴리오 변동 알림',
    message: '포트폴리오 가치가 24시간 동안 5% 이상 상승했습니다.',
    timestamp: '2024-01-15 12:20',
    isRead: true, // 읽은 알림
    severity: 'low', // 중요도 낮음
    coin: null, // 특정 코인과 관련 없음
    action: 'view_portfolio',
  },
  {
    id: 4,
    type: 'news', // 뉴스 알림 유형
    title: '시장 뉴스',
    message:
      'SEC의 새로운 암호화폐 규제 발표가 시장에 영향을 미칠 수 있습니다.',
    timestamp: '2024-01-15 11:15',
    isRead: true,
    severity: 'medium',
    coin: null,
    action: 'read_news',
  },
  {
    id: 5,
    type: 'ai_analysis', // AI 분석 알림 유형
    title: 'AI 분석 리포트',
    message: '주간 시장 분석 리포트가 준비되었습니다.',
    timestamp: '2024-01-15 09:00',
    isRead: true,
    severity: 'low',
    coin: null,
    action: 'view_report',
  },
];

export const getSeverityColor = (severity: 'high' | 'medium' | 'low') => {
  switch (severity) {
    case 'high':
      return 'border-destructive/30 bg-destructive/10';
    case 'medium':
      return 'border-yellow-500/30 bg-yellow-500/10';
    case 'low':
      return 'border-green-500/30 bg-green-500/10';
    default:
      return 'border-border bg-card';
  }
};
