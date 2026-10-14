// 경력 기간 계산. 'YYYY.MM' 문자열, end 없으면 진행 중(현재 월까지). 월 단위로 시작·종료 월 모두 포함.
export type Range = { start: string; end?: string };

export const monthIndex = (d: Date) => d.getFullYear() * 12 + d.getMonth();

const toIndex = (ym: string) => {
  const [y, m] = ym.split('.').map(Number);
  return y * 12 + m - 1;
};

// 겹치는 달(이직 월 등)은 한 번만 센다
export function totalMonths(ranges: Range[], now: number) {
  const months = new Set<number>();
  for (const r of ranges) {
    const end = r.end ? toIndex(r.end) : now;
    for (let i = toIndex(r.start); i <= end; i++) months.add(i);
  }
  return months.size;
}

export function formatMonths(n: number) {
  const y = Math.floor(n / 12);
  const m = n % 12;
  return [y && `${y}년`, m && `${m}개월`].filter(Boolean).join(' ') || '0개월';
}
