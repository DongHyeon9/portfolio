import { Document } from '../Document';
import { LANGS, t, type Lang } from '../i18n';

export const dynamicParams = false;
export const generateStaticParams = () => LANGS.filter((l) => l !== 'ko').map((lang) => ({ lang }));

export async function generateMetadata({ params }: LayoutProps<'/[lang]'>) {
  const lang = (await params).lang as Lang;
  return { title: t('meta.title', lang), description: t('meta.description', lang) };
}

export default async function LangLayout({ children, params }: LayoutProps<'/[lang]'>) {
  return <Document lang={(await params).lang as Lang}>{children}</Document>;
}
