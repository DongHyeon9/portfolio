'use client';
// 정적 export라 빌드 시점 값(builtAt)으로 먼저 그리고, 브라우저에서 현재 월로 다시 계산한다.
import { useEffect, useState } from 'react';
import type { Lang } from './i18n';
import { type Range, formatMonths, monthIndex, totalMonths } from './months';

export function CareerMonths({ ranges, builtAt, lang }: { ranges: Range[]; builtAt: number; lang: Lang }) {
  const [now, setNow] = useState(builtAt);
  useEffect(() => setNow(monthIndex(new Date())), []);
  return <>{formatMonths(totalMonths(ranges, now), lang)}</>;
}
