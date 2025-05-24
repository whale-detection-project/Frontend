'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  User,
  TrendingUp,
  BarChart3,
  Settings,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

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
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
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
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 로고 섹션 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                {/* 상태 표시 점 (녹색 원) */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
              </div>
              <div>
                <span className="text-xl font-bold text-foreground">
                  칠색조
                </span>
                <div className="text-xs text-muted-foreground -mt-1">
                  암호화폐 이상탐지
                </div>
              </div>
            </Link>
          </div>

          {/* 데스크톱 네비게이션 - 큰 화면에서만 표시 */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link href="/" className={getNavLinkClass('/')}>
              <BarChart3 className="w-4 h-4 mr-2" />
              대시보드
            </Link>
            <Link href="/market" className={getNavLinkClass('/market')}>
              <TrendingUp className="w-4 h-4 mr-2" />
              마켓
            </Link>
            <Link
              href="/notifications"
              className={getNavLinkClass('/notifications')}
            >
              <Bell className="w-4 h-4 mr-2" />
              알림
            </Link>
          </nav>

          {/* 우측 액션 버튼들 */}
          <div className="flex items-center space-x-2">
            {/* 다크 모드 토글 버튼 - 중간 크기 이상 화면에서만 표시 */}
            <button
              onClick={toggleTheme}
              className="hidden md:flex p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              aria-label={
                theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'
              }
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* 알림 버튼 - 중간 크기 이상 화면에서만 표시 */}
            <Link
              href="/notifications"
              className="hidden md:flex relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              aria-label="알림 확인"
            >
              <Bell className="w-5 h-5" />
              {/* 읽지 않은 알림 표시 */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Link>

            {/* 설정 버튼 - 중간 크기 이상 화면에서만 표시 */}
            <button
              className="hidden md:flex p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              aria-label="설정"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* 사용자 프로필 버튼 - 중간 크기 이상 화면에서만 표시 */}
            <button
              className="hidden md:flex items-center space-x-2 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
              aria-label="사용자 프로필"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </button>

            {/* 모바일 메뉴 버튼 - 큰 화면에서는 숨김 */}
            <button
              className="lg:hidden p-2 text-foreground hover:bg-accent rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 오버레이 - 메뉴가 열렸을 때만 표시 */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          aria-hidden="true"
        />
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
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">
                CryptoAI
              </span>
              <div className="text-xs text-muted-foreground -mt-1">
                이상탐지
              </div>
            </div>
          </div>
          <button
            className="p-2 text-muted-foreground hover:bg-accent rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="메뉴 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모바일 네비게이션 링크 */}
        <nav className="p-6 space-y-2">
          <Link
            href="/"
            className={getNavLinkClass('/', true)}
            onClick={() => setMobileMenuOpen(false)}
          >
            <BarChart3 className="w-5 h-5 mr-3" />
            대시보드
          </Link>
          <Link
            href="/market"
            className={getNavLinkClass('/market', true)}
            onClick={() => setMobileMenuOpen(false)}
          >
            <TrendingUp className="w-5 h-5 mr-3" />
            마켓
          </Link>
          <Link
            href="/notifications"
            className={getNavLinkClass('/notifications', true)}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Bell className="w-5 h-5 mr-3" />
            알림
          </Link>
        </nav>

        {/* 모바일 사용자 섹션 */}
        <div className="p-6 border-t border-border">
          {/* 사용자 정보 표시 */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-foreground">사용자</div>
              <div className="text-sm text-muted-foreground">
                user@example.com
              </div>
            </div>
          </div>
          {/* 모바일 액션 버튼들 */}
          <div className="space-y-2">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-center px-4 py-2 bg-accent text-foreground rounded-xl hover:bg-accent/80 transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 mr-2" />
                  라이트 모드
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 mr-2" />
                  다크 모드
                </>
              )}
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 bg-accent text-foreground rounded-xl hover:bg-accent/80 transition-colors">
              <Settings className="w-4 h-4 mr-2" />
              설정
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
