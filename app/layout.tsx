import type { ReactNode } from 'react';
import './globals.css';

export const metadata = { title: 'Portfolio', description: 'DongHyeon 포트폴리오' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
