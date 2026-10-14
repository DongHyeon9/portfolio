// 프로젝트 페이지는 public/projects/<slug>/index.html 정적 HTML. 라우트가 아니라서 next/link 대신 <a> + basePath.
const base = process.env.PAGES_BASE_PATH || '';

const projects = [
  {
    slug: 'personal-sanitation',
    title: '분리집사',
    summary: '구독제 분리수거 대행 서비스 — 고객 앱 · 기사 앱 · 운영 대시보드 · API 서버',
    stack: 'React Native(Expo) · Next.js · NestJS · PostgreSQL · Docker',
  },
  {
    slug: 'reserve-system',
    title: 'Popspot',
    summary: '팝업스토어 회차 예약 웹 서비스 — 고객 웹 · 관리자 콘솔 · API · 자동 배포',
    stack: 'Next.js · Spring Boot · Supabase(Postgres) · Cloud Run · GitHub Actions',
  },
];

export default function Home() {
  return (
    <main>
      <h1>Portfolio</h1>
      <ul className="projects">
        {projects.map((p) => (
          <li key={p.slug}>
            <a href={`${base}/projects/${p.slug}/index.html`}>
              <h2>{p.title}</h2>
              <p>{p.summary}</p>
              <small>{p.stack}</small>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
