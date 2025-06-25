'use client';

import { useNotifications } from '@/contexts/notification-context';
import { NotificationItem } from '@/components/ui/notification-item';
import {
  Bell,
  Settings,
  Trash2,
  Power,
  PowerOff,
  BellRing,
  BellOff,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

// SSE 연결 상태 표시 컴포넌트 (Vercel 스타일)
function SseStatusIndicator({ status }: { status: 'connecting' | 'connected' | 'disconnected' }) {
  const statusConfig = {
    connected: {
      text: '실시간 연결됨',
      className: 'text-green-500 bg-green-500/10',
      dotClassName: 'bg-green-500',
    },
    connecting: {
      text: '연결 중...',
      className: 'text-yellow-500 bg-yellow-500/10',
      dotClassName: 'bg-yellow-500 animate-pulse',
    },
    disconnected: {
      text: '연결 끊김',
      className: 'text-red-500 bg-red-500/10',
      dotClassName: 'bg-red-500',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${config.className}`}
    >
      <span className={`inline-block h-2 w-2 mr-1.5 rounded-full ${config.dotClassName}`}></span>
      {config.text}
    </div>
  );
}

export default function NotificationsPage() {
  const {
    notifications,
    settings,
    sseStatus,
    updateSettings,
    markAllAsRead,
    clearAllNotifications,
  } = useNotifications();

  const [isClient, setIsClient] = useState(false);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');

  // 페이지에 들어오면 모든 알림을 읽음으로 처리
  useEffect(() => {
    markAllAsRead();
  }, [markAllAsRead]);

  // 클라이언트에서만 실행되도록 처리 및 알림 권한 확인
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return;

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
      updateSettings({ showBrowserNotifications: true });
    } else {
      updateSettings({ showBrowserNotifications: false });
    }
  };

  if (!isClient) {
    // 서버 사이드 렌더링 시 스켈레톤 UI를 보여줄 수 있습니다. (현재는 로딩 스피너)
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Bell className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              알림 센터
            </h1>
            <p className="mt-1 text-lg text-muted-foreground">
              실시간 고래 거래 알림을 관리하고, 수신 설정을 변경하세요.
            </p>
          </div>
        </div>
      </header>

      {isClient && notificationPermission === 'default' && (
        <Card className="mb-8 bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <BellRing className="w-8 h-8 text-primary shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">
                  브라우저 알림을 켜고 실시간 정보를 받으세요
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  버튼을 클릭하여 새로운 고래 거래에 대한 데스크톱 알림을 활성화하세요.
                </p>
              </div>
            </div>
            <Button onClick={requestNotificationPermission} className="shrink-0 w-full sm:w-auto">
              <Bell className="w-4 h-4 mr-2" />
              알림 활성화
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* 알림 목록 */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl font-bold">실시간 알림 피드</CardTitle>
                <SseStatusIndicator status={sseStatus} />
              </div>
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllNotifications}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  모두 지우기
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-3 max-h-[650px] overflow-y-auto p-4">
                {notifications.length > 0 ? (
                  notifications.map((n) => <NotificationItem key={n.id} notification={n} />)
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-gradient-to-br from-background to-muted/50 rounded-lg">
                    <div className="p-5 bg-primary/10 text-primary rounded-full mb-6 animate-pulse">
                      <Bell className="w-12 h-12" />
                    </div>
                    <h3 className="text-2xl font-bold">새로운 알림이 없습니다</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">
                      {settings.showNotifications
                        ? '모든 알림을 확인했거나, 설정된 조건에 맞는 거래가 아직 없습니다.'
                        : '알림 받기를 활성화하면 새로운 고래 거래 정보가 여기에 표시됩니다.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 설정 */}
        <div className="lg:col-span-1 sticky top-24">
          <Card className="shadow-lg border-border/60">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-muted-foreground" />
                <CardTitle className="text-xl font-bold">알림 설정</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                <Label htmlFor="show-notifications" className="flex flex-col gap-1 cursor-pointer">
                  <span className="flex items-center gap-2 font-semibold text-base">
                    {settings.showNotifications ? (
                      <Power className="w-5 h-5 text-green-500" />
                    ) : (
                      <PowerOff className="w-5 h-5 text-red-500" />
                    )}
                    실시간 알림
                  </span>
                  <span className="text-sm text-muted-foreground ml-7">
                    {settings.showNotifications ? '활성화됨' : '비활성화됨'}
                  </span>
                </Label>
                <Switch
                  id="show-notifications"
                  checked={settings.showNotifications}
                  onCheckedChange={(checked: boolean) =>
                    updateSettings({ showNotifications: checked })
                  }
                />
              </div>

              {settings.showNotifications && (
                <div className="space-y-8 border-t pt-8 mt-8">
                  {/* 브라우저 알림 설정 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                      <Label
                        htmlFor="browser-notifications"
                        className="flex flex-col gap-1 cursor-pointer"
                      >
                        <span className="flex items-center gap-2 font-semibold text-base">
                          {settings.showBrowserNotifications &&
                          notificationPermission === 'granted' ? (
                            <BellRing className="w-5 h-5 text-blue-500" />
                          ) : (
                            <BellOff className="w-5 h-5 text-muted-foreground" />
                          )}
                          브라우저 알림
                        </span>
                        <span className="text-sm text-muted-foreground ml-7">
                          {notificationPermission === 'granted'
                            ? '활성화됨'
                            : notificationPermission === 'denied'
                            ? '차단됨'
                            : '권한 필요'}
                        </span>
                      </Label>
                      {notificationPermission !== 'denied' ? (
                        <Switch
                          id="browser-notifications"
                          checked={
                            settings.showBrowserNotifications &&
                            notificationPermission === 'granted'
                          }
                          onCheckedChange={(checked) => {
                            if (checked && notificationPermission !== 'granted') {
                              requestNotificationPermission();
                            } else {
                              updateSettings({ showBrowserNotifications: checked });
                            }
                          }}
                        />
                      ) : (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href="https://support.google.com/chrome/answer/3220216"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <AlertCircle className="w-4 h-4" />
                            설정 방법
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 최소 거래액 설정 */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <Label htmlFor="min-btc-value" className="block text-sm font-medium mb-2">
                        최소 거래액 (BTC)
                      </Label>
                      <div className="relative">
                        <Input
                          id="min-btc-value"
                          type="number"
                          min="200"
                          value={settings.minBtcValue || ''}
                          onChange={(e) => {
                            const value = e.target.valueAsNumber;
                            updateSettings({ minBtcValue: isNaN(value) ? 0 : value });
                          }}
                          onBlur={() => {
                            if (settings.minBtcValue < 200) {
                              updateSettings({ minBtcValue: 200 });
                            }
                          }}
                          placeholder="예: 1000"
                          className="w-full pl-4 pr-14"
                          disabled={
                            settings.showBrowserNotifications &&
                            notificationPermission !== 'granted'
                          }
                        />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-sm font-medium text-muted-foreground">
                          BTC
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        이 값 이상의 BTC 거래만 알림을 받습니다. (최소 200 BTC)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
