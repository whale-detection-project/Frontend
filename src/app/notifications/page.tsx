import React from 'react';
import {
  Bell,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Settings,
  Check,
  X,
  Clock,
  Zap,
  Filter,
} from 'lucide-react';

export default function NotificationsPage() {
  // 알림 데이터 배열 - 각 알림은 id, 유형, 제목, 메시지 등의 속성을 가짐
  const notifications = [
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

  // 알림 설정 데이터 배열 - 각 설정은 카테고리, 설명, 활성화 여부, 중요도를 가짐
  const alertSettings = [
    {
      category: '이상 패턴 감지',
      description: 'AI가 감지한 비정상적인 가격 패턴',
      enabled: true, // 활성화됨
      severity: 'high', // 중요도 높음
    },
    {
      category: '가격 알림',
      description: '설정한 목표가 도달 시 알림',
      enabled: true,
      severity: 'medium',
    },
    {
      category: '포트폴리오 변동',
      description: '포트폴리오 가치 급변 시 알림',
      enabled: true,
      severity: 'medium',
    },
    {
      category: '시장 뉴스',
      description: '중요한 시장 뉴스 및 이벤트',
      enabled: false, // 비활성화됨
      severity: 'low',
    },
    {
      category: 'AI 분석 리포트',
      description: '정기 AI 분석 리포트 발행',
      enabled: true,
      severity: 'low',
    },
  ];

  // 알림 유형에 따라 적절한 아이콘을 반환하는 함수
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'anomaly':
        return <Zap className="w-5 h-5 text-orange-600" />; // 이상 패턴은 번개 아이콘
      case 'price':
        return <TrendingUp className="w-5 h-5 text-green-600" />; // 가격 알림은 상승 그래프 아이콘
      case 'portfolio':
        return <TrendingDown className="w-5 h-5 text-blue-600" />; // 포트폴리오는 하락 그래프 아이콘
      case 'news':
        return <Bell className="w-5 h-5 text-purple-600" />; // 뉴스는 종 아이콘
      case 'ai_analysis':
        return <AlertTriangle className="w-5 h-5 text-primary" />; // AI 분석은 경고 삼각형 아이콘
      default:
        return <Bell className="w-5 h-5 text-muted-foreground" />; // 기본값은 종 아이콘
    }
  };

  // 중요도에 따라 적절한 배경색과 테두리 색상 클래스를 반환하는 함수
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500/20 bg-red-500/5'; // 높은 중요도는 빨간색 계열
      case 'medium':
        return 'border-yellow-500/20 bg-yellow-500/5'; // 중간 중요도는 노란색 계열
      case 'low':
        return 'border-green-500/20 bg-green-500/5'; // 낮은 중요도는 초록색 계열
      default:
        return 'border-border bg-card'; // 기본값은 카드 배경색
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 dark:from-background dark:to-accent/10">
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="max-w-[1440px] mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  알림 센터
                </h1>
                <p className="text-muted-foreground">
                  실시간 이상 패턴 감지 및 중요 시장 이벤트 알림
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 bg-accent hover:bg-accent/80 text-foreground rounded-lg">
                  <Filter className="w-4 h-4 mr-2" />
                  필터
                </button>
                <button className="flex items-center px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium">
                  <Settings className="w-4 h-4 mr-2" />
                  알림 설정
                </button>
              </div>
            </div>

            {/* 알림 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      읽지 않음
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {notifications.filter(n => !n.isRead).length}
                    </div>
                  </div>
                  <div className="p-2 bg-red-500/10 rounded-lg">
                    <Bell className="w-5 h-5 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      이상 패턴
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {notifications.filter(n => n.type === 'anomaly').length}
                    </div>
                  </div>
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Zap className="w-5 h-5 text-orange-600" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      가격 알림
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {notifications.filter(n => n.type === 'price').length}
                    </div>
                  </div>
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">
                      활성 알림
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {alertSettings.filter(s => s.enabled).length}
                    </div>
                  </div>
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* 알림 리스트 */}
            <div className="xl:col-span-2">
              <div className="bg-card rounded-2xl shadow-sm border border-border">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-foreground">
                      최근 알림
                    </h2>
                    <button className="text-sm text-primary hover:text-primary/80">
                      모두 읽음 처리
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {notifications.map(notification => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-xl border transition-colors cursor-pointer hover:bg-accent/30 ${
                          notification.isRead
                            ? 'border-border bg-card opacity-70'
                            : getSeverityColor(notification.severity)
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-foreground">
                                  {notification.title}
                                </h3>
                                {notification.coin && (
                                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                                    {notification.coin}
                                  </span>
                                )}
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{notification.timestamp}</span>
                                </div>
                                <span
                                  className={`px-2 py-0.5 rounded-full ${
                                    notification.severity === 'high'
                                      ? 'bg-red-500/10 text-red-600'
                                      : notification.severity === 'medium'
                                      ? 'bg-yellow-500/10 text-yellow-600'
                                      : 'bg-green-500/10 text-green-600'
                                  }`}
                                >
                                  {notification.severity === 'high'
                                    ? '높음'
                                    : notification.severity === 'medium'
                                    ? '보통'
                                    : '낮음'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button className="p-1 hover:bg-accent rounded">
                              <Check className="w-4 h-4 text-green-600" />
                            </button>
                            <button className="p-1 hover:bg-accent rounded">
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 사이드바 */}
            <div className="xl:col-span-1 space-y-6">
              {/* 알림 설정 */}
              <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  알림 설정
                </h3>
                <div className="space-y-4">
                  {alertSettings.map((setting, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-foreground text-sm">
                          {setting.category}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {setting.description}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            setting.severity === 'high'
                              ? 'bg-red-500'
                              : setting.severity === 'medium'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                        ></div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={setting.enabled}
                            className="sr-only peer"
                            readOnly
                          />
                          <div className="w-9 h-5 bg-accent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 빠른 액션 */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  빠른 액션
                </h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-between p-3 bg-card/50 rounded-lg hover:bg-card/70 transition-colors">
                    <span className="text-sm font-medium text-foreground">
                      가격 알림 추가
                    </span>
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-card/50 rounded-lg hover:bg-card/70 transition-colors">
                    <span className="text-sm font-medium text-foreground">
                      포트폴리오 알림 설정
                    </span>
                    <Settings className="w-4 h-4 text-primary" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 bg-card/50 rounded-lg hover:bg-card/70 transition-colors">
                    <span className="text-sm font-medium text-foreground">
                      AI 분석 구독
                    </span>
                    <Zap className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>

              {/* 알림 통계 */}
              <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  이번 주 통계
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">총 알림</span>
                    <span className="font-medium text-foreground">24</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      이상 패턴 감지
                    </span>
                    <span className="font-medium text-orange-600">8</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">가격 알림</span>
                    <span className="font-medium text-green-600">12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">정확도</span>
                    <span className="font-medium text-primary">92.5%</span>
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
