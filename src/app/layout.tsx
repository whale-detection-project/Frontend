import Header from '@/components/ui/header';
import { ThemeProvider } from '@/contexts/theme-context';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased max-w-[1440px] mx-auto bg-background text-foreground">
        <ThemeProvider>
          <Header />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
