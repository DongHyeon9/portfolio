import type { ReactNode } from 'react';
import { Document } from '../Document';
import { t } from '../i18n';

export const metadata = { title: t('meta.title', 'ko'), description: t('meta.description', 'ko') };

export default function KoLayout({ children }: { children: ReactNode }) {
  return <Document lang="ko">{children}</Document>;
}
