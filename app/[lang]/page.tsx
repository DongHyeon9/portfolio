import Home from '../Home';
import type { Lang } from '../i18n';

export default async function Page({ params }: PageProps<'/[lang]'>) {
  return <Home lang={(await params).lang as Lang} />;
}
