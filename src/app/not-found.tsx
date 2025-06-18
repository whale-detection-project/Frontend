'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/20 dark:from-background dark:to-accent/10 pt-30">
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-muted-foreground/30 select-none">404</h1>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">페이지를 찾을 수 없습니다</h2>
            <p className="text-muted-foreground leading-relaxed">
              요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
              <br />
              주소를 다시 확인해 주세요.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              홈으로 돌아가기
            </Link>

            <button
              onClick={() => window.history.back()}
              className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            >
              이전 페이지로
            </button>
          </div>
        </div>
      </main>

      {/* Decorative Elements */}
      <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent/20 rounded-full opacity-50 -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      <div className="absolute top-1/3 left-3/4 w-32 h-32 bg-accent/20 rounded-full opacity-50 -translate-x-1/2 -translate-y-1/2 -z-10"></div>
    </div>
  );
}
