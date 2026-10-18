// 홈 문구: i18n/strings.csv(page=home) -> scripts/i18n.mjs build -> strings.generated.json. 서버 컴포넌트에서만 import.
import strings from './strings.generated.json';

export const LANGS = ['ko', 'en', 'ja', 'zh'] as const;
export type Lang = (typeof LANGS)[number];
export const htmlLang = (l: Lang) => (l === 'zh' ? 'zh-CN' : l);

export function t(key: string, lang: Lang): string {
  const s = (strings as Record<string, Record<Lang, string>>)[key]?.[lang];
  if (!s) throw new Error(`i18n: missing "${key}" [${lang}] — check i18n/strings.csv home rows`);
  return s;
}
