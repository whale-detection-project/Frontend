'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, TrendingUp, BarChart3, Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

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
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-blue-200 to-pink-500">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                {/* 상태 표시 점 (녹색 원) - 툴팁 추가 */}
                <div
                  className="absolute w-3 h-3 bg-green-500 border-2 rounded-full -top-1 -right-1 border-background"
                  title="서비스 정상 운영 중"
                ></div>
              </div>
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
              {/* 읽지 않은 알림 표시 (예시: 갯수를 표시하려면 unreadNotificationCount 상태 필요) */}
              {/* 현재는 단순히 빨간 점으로 표시 */}
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
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
