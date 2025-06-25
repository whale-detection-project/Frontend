'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';

// 알림 데이터 타입
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  severity: 'high' | 'medium' | 'low';
  total_input_value: number;
  predicted_cluster: number;
  [key: string]: unknown; // any 대신 unknown 사용
}

// 알림 설정 타입
interface NotificationSettings {
  minBtcValue: number; // 알림을 받을 최소 BTC 값
  showNotifications: boolean; // 알림 활성화 여부
  showBrowserNotifications: boolean; // 브라우저 알림 활성화 여부
}

// 컨텍스트 데이터 타입
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  settings: NotificationSettings;
  sseStatus: 'connecting' | 'connected' | 'disconnected';
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 로컬 스토리지 키
const STORAGE_KEYS = {
  NOTIFICATIONS: 'whale_notifications',
  SETTINGS: 'whale_notification_settings',
};

// 기본 설정 값
const DEFAULT_SETTINGS: NotificationSettings = {
  minBtcValue: 200,
  showNotifications: false,
  showBrowserNotifications: false,
};

const getSeverity = (btc: number): 'high' | 'medium' | 'low' => {
  if (btc >= 1000) return 'high';
  if (btc >= 100) return 'medium';
  return 'low';
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const storedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return storedNotifications ? JSON.parse(storedNotifications) : [];
    } catch (error) {
      console.error('Failed to load notifications from localStorage', error);
      return [];
    }
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS;
    }
    try {
      const storedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      // 저장된 설정과 기본 설정을 병합하여 새로운 설정 속성이 추가되어도 대응
      const loadedSettings = storedSettings ? JSON.parse(storedSettings) : {};
      return { ...DEFAULT_SETTINGS, ...loadedSettings };
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
      return DEFAULT_SETTINGS;
    }
  });
  const [sseStatus, setSseStatus] = useState<'connecting' | 'connected' | 'disconnected'>(
    'disconnected',
  );
  const lastNotifiedId = useRef<string | null>(null);

  // 1. 초기화 시 읽지 않은 알림 개수 계산
  useEffect(() => {
    setUnreadCount(notifications.filter((n: Notification) => !n.isRead).length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 이 효과는 마운트 시 한 번만 실행됩니다.

  // 2. 데이터 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      setUnreadCount(notifications.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error('Failed to save notifications to localStorage', error);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
    }
  }, [settings]);

  // 3. SSE 연결 및 실시간 데이터 수신
  useEffect(() => {
    if (!settings.showNotifications) {
      setSseStatus('disconnected');
      return; // 알림이 비활성화된 경우 연결 안함
    }

    setSseStatus('connecting');
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/api/stream?min_input_value=${settings.minBtcValue}`,
    );

    eventSource.onopen = () => {
      setSseStatus('connected');
    };

    eventSource.onmessage = (event) => {
      try {
        // SSE 스트림의 데이터는 문자열이어야 합니다.
        if (typeof event.data !== 'string') {
          return;
        }

        // 비어있는 메시지(예: keep-alive)는 무시합니다.
        const trimmedData = event.data.trim();
        if (trimmedData === '') {
          return;
        }

        const data = JSON.parse(trimmedData);
        const newNotification: Notification = {
          id: data.timestamp + Math.random().toString(),
          type: 'anomaly',
          title: `대규모 거래 감지 (${data.btc.toFixed(2)} BTC)`,
          message: `${data.btc.toFixed(2)} BTC가 이동했습니다.`,
          timestamp: new Date(data.timestamp).toLocaleString('ko-KR'),
          isRead: false,
          severity: getSeverity(data.btc),
          total_input_value: data.btc,
          predicted_cluster: data.cluster,
          ...data,
        };

        setNotifications((prev) => [newNotification, ...prev].slice(0, 200)); // 최신 200개만 저장
      } catch (error) {
        // JSON 파싱 실패 시, 앱이 중단되지 않도록 오류를 콘솔에 기록하고 무시합니다.
        console.warn(
          'Could not parse SSE data into JSON. Skipping. Data:',
          event.data,
          'Error:',
          error,
        );
      }
    };

    eventSource.onerror = (error) => {
      setSseStatus('disconnected');
      console.error('SSE Error:', error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
      setSseStatus('disconnected');
    };
  }, [settings.showNotifications, settings.minBtcValue]);

  // 4. 새 알림 수신 시 브라우저 알림 표시
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (
      notifications.length > 0 &&
      settings.showNotifications &&
      settings.showBrowserNotifications &&
      Notification.permission === 'granted'
    ) {
      const latestNotification = notifications[0];
      // 중복 알림 방지
      if (latestNotification.id !== lastNotifiedId.current) {
        new Notification(latestNotification.title, {
          body: latestNotification.message,
          icon: '/logo.svg',
          tag: latestNotification.id,
        });
        lastNotifiedId.current = latestNotification.id;
      }
    }
    // settings 객체가 변경될 때마다 이 효과가 실행되도록 의존성 배열에 추가
  }, [notifications, settings]);

  // 설정 업데이트 함수
  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  // 모든 알림을 읽음으로 처리
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  // 모든 알림 삭제
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    unreadCount,
    settings,
    sseStatus,
    updateSettings,
    markAllAsRead,
    clearAllNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

// 커스텀 훅
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
