'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, TrendingUp, BarChart3, Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { useNotifications } from '@/contexts/notification-context';

// 네비게이션 링크 데이터 정의
const NAV_LINKS = [
  { href: '/', label: '대시보드', icon: BarChart3, mobileOnly: false },
  { href: '/market', label: '마켓', icon: TrendingUp, mobileOnly: false },
  { href: '/notifications', label: '알림', icon: Bell, mobileOnly: false },
];

// 헤더 컴포넌트: 웹사이트의 상단 네비게이션 바를 구현
export default function Header() {
  // 모바일 메뉴 상태 관리
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // 모바일 메뉴 요소에 대한 참조 생성
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  // 테마 컨텍스트에서 현재 테마와 테마 전환 함수 가져오기
  const { theme, toggleTheme } = useTheme();
  // 현재 경로 가져오기
  const pathname = usePathname();
  // 알림 컨텍스트에서 읽지 않은 알림 수 가져오기
  const { unreadCount } = useNotifications();

  // 모바일 메뉴 외부 클릭 감지 효과
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // 클릭이 메뉴 외부에서 발생했는지 확인
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    }

    // 메뉴가 열려있을 때만 이벤트 리스너 추가
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // 모바일 메뉴 열림 상태에 따라 body 스크롤 제어
  useEffect(() => {
    if (mobileMenuOpen) {
      // 메뉴가 열리면 배경 스크롤 방지
      document.body.style.overflow = 'hidden';
    } else {
      // 메뉴가 닫히면 스크롤 허용
      document.body.style.overflow = '';
    }

    // 컴포넌트 언마운트 시 스크롤 상태 복원
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // 현재 경로가 활성 상태인지 확인하는 함수
  const isActive = (path: string) => {
    if (path === '/') {
      // 홈 경로는 정확히 일치해야 함
      return pathname === '/';
    }
    // 다른 경로는 시작 부분만 일치해도 됨 (하위 경로 포함)
    return pathname.startsWith(path);
  };

  // 네비게이션 링크의 클래스를 결정하는 함수
  const getNavLinkClass = (path: string, isMobile = false) => {
    // 기본 클래스 설정 (모바일/데스크톱 구분)
    const baseClass = isMobile
      ? 'flex items-center px-4 py-3 text-base font-medium rounded-xl transition-colors'
      : 'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors';

    // 활성 상태에 따라 다른 스타일 적용
    if (isActive(path)) {
      return `${baseClass} text-primary bg-primary/10`;
    }
    return `${baseClass} text-muted-foreground hover:text-foreground hover:bg-accent`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b shadow-sm bg-background/95 backdrop-blur-md border-border">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 섹션 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2.5">
              <svg
                width="28"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-foreground"
                aria-label="로고"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M23,12a1,1,0,0,0-1-1H17V8a1,1,0,0,0-2,0v3H13.1A5.231,5.231,0,0,1,8.292,7.79,3.761,3.761,0,0,0,11,4a1,1,0,0,0-.293-.707A4.5,4.5,0,0,0,9.066,2.3,3.427,3.427,0,0,0,6,2.712,3.426,3.426,0,0,0,2.934,2.3a4.5,4.5,0,0,0-1.641.991A1,1,0,0,0,1,4,3.766,3.766,0,0,0,3.941,7.846l-.407,6.105a8.436,8.436,0,0,0,2.8,6.878,1,1,0,1,0,1.336-1.488A6.449,6.449,0,0,1,5.7,16.008a9.638,9.638,0,0,0,3.775,1.9c1.078,1.4-.245,3.448-.3,3.536A1,1,0,0,0,10.2,22.98a6.022,6.022,0,0,0,4.143-2.515,4.9,4.9,0,0,0,.737-2.486,23.388,23.388,0,0,0,4.058-.507,8.984,8.984,0,0,1-3.534,2.78,1,1,0,1,0,.8,1.832,11,11,0,0,0,5.727-5.806c.015-.029.026-.058.038-.088A10.987,10.987,0,0,0,23,12ZM3.034,4.444a1.646,1.646,0,0,1,2.259.263,1,1,0,0,0,1.414,0,1.649,1.649,0,0,1,2.259-.264A1.885,1.885,0,0,1,7,6H5.008A1.888,1.888,0,0,1,3.034,4.444ZM14,16a1.005,1.005,0,0,0-.972,1.234,3.132,3.132,0,0,1-.391,2.181,2.944,2.944,0,0,1-.87.858,4.214,4.214,0,0,0-1.06-3.98,1,1,0,0,0-.543-.279,6.809,6.809,0,0,1-4.546-3.242L5.936,8h.293a7.242,7.242,0,0,0,6.87,5h7.845a8.958,8.958,0,0,1-.487,2.042A20.318,20.318,0,0,1,14,16ZM13,3a1,1,0,0,1,0-2,3.99,3.99,0,0,1,3,1.357A3.99,3.99,0,0,1,19,1a1,1,0,0,1,0,2,2,2,0,0,0-2,2,1,1,0,0,1-2,0A2,2,0,0,0,13,3Z" />
              </svg>
              <div>
                <span className="text-xl font-bold text-foreground">Bitcoin</span>
                <div className="text-xs text-muted-foreground -mt-1">Whale Detection</div>
              </div>
            </Link>
          </div>

          {/* 데스크톱 네비게이션 - 큰 화면에서만 표시 */}
          <nav className="hidden items-center space-x-1 lg:flex" aria-label="메인 내비게이션">
            <ul className="flex space-x-1">
              {/* 모든 NAV_LINKS 항목을 데스크톱에서 렌더링 */}
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={getNavLinkClass(link.href)}>
                    <link.icon className="w-4 h-4 mr-2" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* 우측 액션 버튼들 */}
          <div className="flex items-center space-x-2">
            {/* 다크 모드 토글 버튼 - 중간 크기 이상 화면에서만 표시 */}
            <button
              onClick={toggleTheme}
              className="hidden rounded-lg p-2 transition-colors md:flex text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* 알림 버튼 - 중간 크기 이상 화면에서만 표시 */}
            <Link
              href="/notifications"
              className="relative hidden rounded-lg p-2 transition-colors md:flex text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="알림 확인"
            >
              <Bell className="h-5 w-5" />
              {/* 읽지 않은 알림 표시 */}
              {unreadCount > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* 모바일 메뉴 버튼 - 큰 화면에서는 숨김 */}
            <button
              className="rounded-lg p-2 transition-colors text-foreground hover:bg-accent lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? '내비게이션 메뉴 닫기' : '내비게이션 메뉴 열기'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      {/* 모바일 메뉴 오버레이 - 메뉴가 열렸을 때만 표시 */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" aria-hidden="true" />
      )}
      {/* 모바일 메뉴 패널 */}
      <div
        id="mobile-menu"
        ref={mobileMenuRef}
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-sm transform overflow-y-auto bg-background shadow-xl transition duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 모바일 메뉴 헤더 */}
        <div className="flex items-center justify-between border-b border-border p-6">
          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">CryptoAI</span>
              <div className="text-xs text-muted-foreground -mt-1">이상탐지</div>
            </div>
          </div>
          <button
            className="rounded-lg p-2 transition-colors text-muted-foreground hover:bg-accent"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="메뉴 닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 모바일 네비게이션 링크 */}
        <nav className="space-y-2 p-6" aria-label="모바일 내비게이션">
          <ul className="space-y-2">
            {/* 모든 NAV_LINKS 항목을 모바일에서 렌더링 */}
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={getNavLinkClass(link.href, true)} // isMobile = true
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="h-5 w-5 mr-3" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 모바일 사용자 섹션 */}
        <div className="border-t border-border p-6">
          {/* 모바일 액션 버튼들 */}
          <div className="space-y-2">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2 text-foreground transition-colors hover:bg-accent/80"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4 mr-2" />
                  라이트 모드
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 mr-2" />
                  다크 모드
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
