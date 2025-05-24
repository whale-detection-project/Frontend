import Header from '@/components/ui/header';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased max-w-[1280px] mx-auto">
        <Header />
        {children}
      </body>
    </html>
  );
}
