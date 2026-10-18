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

// 클라이언트 컴포넌트(CareerMonths)에서 쓰므로 strings.generated.json 대신 여기서 언어별 단위 처리
// [년(단수), 년(복수), 개월(단수), 개월(복수), 구분자]
const units = {
  ko: ['년', '년', '개월', '개월', ' '],
  en: [' yr', ' yrs', ' mo', ' mos', ' '],
  ja: ['年', '年', 'ヶ月', 'ヶ月', ''],
  zh: ['年', '年', '个月', '个月', ''],
};

export function formatMonths(n: number, lang: keyof typeof units = 'ko') {
  const [y1, yN, m1, mN, sep] = units[lang];
  const y = Math.floor(n / 12);
  const m = n % 12;
  return [y && `${y}${y === 1 ? y1 : yN}`, (m || !y) && `${m}${m === 1 ? m1 : mN}`].filter(Boolean).join(sep);
}
