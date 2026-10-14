import type { ReactNode } from 'react';
import './globals.css';

export const metadata = { title: '한동현 포트폴리오', description: '한동현 — 서버 · 게임 클라이언트 · SI 개발 포트폴리오' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
