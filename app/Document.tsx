// 두 루트 레이아웃((ko), [lang])이 공유하는 <html>/<head>
import type { ReactNode } from 'react';
import { LANGS, htmlLang, type Lang } from './i18n';
import './globals.css';

const base = process.env.PAGES_BASE_PATH || '';
export const homeHref = (l: Lang) => `${base}/${l === 'ko' ? '' : `${l}/`}`;

export function Document({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={htmlLang(lang)}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {LANGS.map((l) => (
          <link key={l} rel="alternate" hrefLang={htmlLang(l)} href={homeHref(l)} />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
