// 프로젝트 페이지는 public/projects/<slug>/index.html 정적 HTML. 라우트가 아니라서 next/link 대신 <a> + basePath.
import type { CSSProperties } from 'react';
import { CareerMonths } from './CareerMonths';
import { monthIndex, type Range } from './months';

const base = process.env.PAGES_BASE_PATH || '';
const builtAt = monthIndex(new Date());

const skillGroups = [
  { name: 'C++', items: ['STL', 'Boost.Asio', 'Unreal Engine', 'Protobuf', 'spdlog'] },
  { name: 'TypeScript', items: ['NestJS', 'Next.js', 'React Native (Expo)', 'TypeORM'] },
  { name: 'Java', items: ['Spring Boot'] },
  { name: 'Database', items: ['PostgreSQL', 'MSSQL'] },
  { name: 'Infra · DevOps', items: ['Docker', 'AWS', 'Jenkins', 'GitHub Actions'] },
  { name: '장비 · VR', items: ['OptiTrack', 'Varjo VR', 'Vive Tracker'] },
];

const careers: { company: string; range: Range; role: string; works: string[]; stack: string[] }[] = [
  {
    company: '프리랜서',
    range: { start: '2026.10' },
    role: '풀스택 개발',
    works: ['웹 · 앱 · 서버 외주 개발', '요구사항 분석부터 개발 · 배포까지 1인 수행'],
    stack: ['Next.js', 'NestJS', 'Spring Boot', 'React Native'],
  },
  {
    company: '넥슨코리아 · 시스템 개발실',
    range: { start: '2025.12', end: '2026.10' },
    role: '백엔드 · 서버 개발',
    works: [
      '메이플스토리 라이브 서비스 서버 개발',
      '유저 정보 저장 최적화, 데이터 파일 암호화',
      '서버 모니터링 및 인하우스 툴 유지보수',
      'JSON 데이터 생성 코드를 C++17 템플릿으로 리팩터링',
    ],
    stack: ['C++', 'MSSQL'],
  },
  {
    company: '빅게임스튜디오 · BCM 클라이언트 Cell',
    range: { start: '2025.05', end: '2025.11' },
    role: '게임 클라이언트 개발',
    works: ['전투 시스템 개발 (시뮬레이션 전투, 링크 패시브)', '떠돌이 상인 콘텐츠 개발', 'Jenkins 기반 빌드 · 배포 자동화'],
    stack: ['Jenkins'],
  },
  {
    company: '스튜디오레논 · 메타랩실',
    range: { start: '2024.02', end: '2025.05' },
    role: 'SI 개발 · 파트장',
    works: [
      '연구기관 · 기업 SI 4건 납품 — 요구사항 분석부터 현장 설치까지',
      'ETRI 경호 훈련 프로그램: OptiTrack · VR · 총기형 장비 연동',
      '현대/KIA 제품소개 · 주행 시뮬레이션: 운전대 · 페달 장치 연동, REST API 연동',
      '노인 낙상방지 학습 프로그램: NestJS 서버 개발 · AWS 배포',
    ],
    stack: ['Unreal Engine (C++)', 'OptiTrack', 'Varjo VR', 'NestJS', 'AWS'],
  },
  {
    company: '스튜디오레논 · 디지털사업본부',
    range: { start: '2021.09', end: '2023.03' },
    role: 'SI 개발',
    works: [
      'SI 3건 납품 (VR 교육, 영상 제작 시스템, 3D 콘텐츠)',
      '간호학과 감염병 대응 VR 교육: Google STT 음성인식',
      'Virtual Production: Vive Tracker 카메라 트래킹, 크로마키 합성',
      '3D 스캔 콘텐츠: 카메라 위치 이벤트, 텍스처 · 메쉬 최적화',
    ],
    stack: ['Unreal Engine (C++)', 'VR', 'Vive Tracker', 'Google STT'],
  },
];

const stats = [
  { value: <CareerMonths ranges={careers.map((c) => c.range)} builtAt={builtAt} />, label: '총 경력' },
  { value: '7건', label: 'SI 납품' },
  { value: '3곳', label: '근무 회사' },
  { value: '3개', label: '개인 프로젝트' },
];

const projects = [
  {
    slug: 'personal-sanitation',
    title: '분리집사',
    summary: '구독제 분리수거 대행 서비스 — 고객 앱 · 기사 앱 · 운영 대시보드 · API 서버',
    stack: ['React Native(Expo)', 'Next.js', 'NestJS', 'PostgreSQL', 'Docker'],
    thumb: 'images/dash-overview.png',
    accent: '#16a34a',
  },
  {
    slug: 'reserve-system',
    title: 'Popspot',
    summary: '팝업스토어 회차 예약 웹 서비스 — 고객 웹 · 관리자 콘솔 · API · 자동 배포',
    stack: ['Next.js', 'Spring Boot', 'Supabase', 'Cloud Run', 'GitHub Actions'],
    thumb: 'images/w-home.png',
    accent: '#e11d48',
  },
  {
    slug: 'jenkins-local-test',
    title: 'Jenkins VPN 사용자 관리',
    summary: 'VPN · SVN · Jenkins 계정 생성 · 수정 · 삭제를 Jenkins 파이프라인 하나로 자동화',
    stack: ['Jenkins Pipeline', 'Job DSL', 'Groovy', 'Python', 'WireGuard'],
    thumb: null,
    accent: '#ea580c',
  },
];

export default function Home() {
  return (
    <>
      <div className="bg" aria-hidden="true" />
      <nav className="nav">
        <a href="#top" className="brand">DH<span>.</span></a>
        <div>
          <a href="#career">경력</a>
          <a href="#projects">프로젝트</a>
        </div>
      </nav>

      <main id="top">
        <header className="hero">
          <div className="photo">
            <img src={`${base}/profile.jpg`} alt="한동현 프로필 사진" width={180} height={240} />
          </div>
          <div className="hero-text">
            <p className="eyebrow">Full-stack Developer</p>
            <h1>
              트러블슈팅에 강한<br />
              풀스택 개발자 <span className="grad">한동현</span>입니다.
            </h1>
            <p className="lead">
              SI 개발부터 대규모 라이브 서비스 서버 최적화까지,
              요구사항 분석부터 현장 설치 · 납품까지 수행합니다.
            </p>
            <p className="meta">1997년생</p>
          </div>
        </header>

        <ul className="stats">
          {stats.map((s) => (
            <li key={s.label} className="glass reveal">
              <strong className="grad">{s.value}</strong>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>

        <ul className="skill-groups">
          {skillGroups.map((g) => (
            <li key={g.name} className="glass reveal">
              <h3>{g.name}</h3>
              <ul className="chips small">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        <section id="career">
          <p className="eyebrow">Career</p>
          <h2>경력</h2>
          <ol className="timeline">
            {careers.map((c) => (
              <li key={c.company} className="glass reveal">
                <div className="career-head">
                  <h3>{c.company}</h3>
                  <span className="period">
                    {c.range.start} ~ {c.range.end ?? '현재'} (<CareerMonths ranges={[c.range]} builtAt={builtAt} />)
                  </span>
                </div>
                <p className="role">{c.role}</p>
                <ul className="works">
                  {c.works.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
                <ul className="chips small">
                  {c.stack.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <section id="projects">
          <p className="eyebrow">Projects</p>
          <h2>프로젝트</h2>
          <ul className="projects">
            {projects.map((p) => (
              <li key={p.slug} className="reveal" style={{ '--accent': p.accent } as CSSProperties}>
                <a href={`${base}/projects/${p.slug}/index.html`} className="card">
                  <div className="thumb">
                    {p.thumb ? (
                      <img src={`${base}/projects/${p.slug}/${p.thumb}`} alt="" loading="lazy" />
                    ) : (
                      <code className="thumb-code">
                        svn commit<br />→ seed job<br />→ vpn-user-create ✓
                      </code>
                    )}
                  </div>
                  <div className="card-body">
                    <h3>
                      {p.title} <span className="arrow">→</span>
                    </h3>
                    <p>{p.summary}</p>
                    <ul className="chips small">
                      {p.stack.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="footer">© 2026 한동현 · Built with Next.js · GitHub Pages</footer>
    </>
  );
}
