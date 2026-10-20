// 프로젝트 페이지는 public/projects/<slug>/index.html 정적 HTML. 라우트가 아니라서 next/link 대신 <a> + basePath.
import { Fragment, type CSSProperties } from 'react';
import { CareerMonths } from './CareerMonths';
import { monthIndex, type Range } from './months';
import { homeHref } from './Document';
import { LANGS, htmlLang, t, type Lang } from './i18n';

const base = process.env.PAGES_BASE_PATH || '';
const langLabel: Record<Lang, string> = { ko: '한국어', en: 'English', ja: '日本語', zh: '中文' };
const builtAt = monthIndex(new Date());

const skillGroups = [
  { id: 'lang', items: ['C++ (STL)', 'C#', 'Java', 'TypeScript', 'JavaScript', 'Python'] },
  { id: 'frontend', items: ['React', 'Next.js', 'React Native (Expo)', 'Unreal Engine'] },
  { id: 'backend', items: ['NestJS', 'Spring Boot', 'Boost.Asio', 'TypeORM', 'Protobuf', 'spdlog'] },
  { id: 'db', items: ['PostgreSQL', 'MSSQL', 'Supabase'] },
  { id: 'infra', items: ['Git', 'SVN', 'Docker', 'AWS', 'Vercel', 'Jenkins', 'GitHub Actions'] },
  { id: 'hw', items: ['OptiTrack', 'Varjo VR', 'Vive Tracker', 'BLE'] },
];

const careers: { id: string; range: Range; works: number; stack: string[] }[] = [
  {
    id: 'nexon',
    range: { start: '2025.12', end: '2026.10' },
    works: 6,
    stack: ['C++', 'C#', 'JavaScript', 'Python', 'MSSQL', 'Jenkins'],
  },
  {
    id: 'biggame',
    range: { start: '2025.05', end: '2025.11' },
    works: 3,
    stack: ['Jenkins'],
  },
  {
    id: 'lennon-meta',
    range: { start: '2024.02', end: '2025.05' },
    works: 4,
    stack: ['Unreal Engine (C++)', 'OptiTrack', 'Varjo VR', 'NestJS', 'AWS'],
  },
  {
    id: 'lennon-digital',
    range: { start: '2021.09', end: '2023.03' },
    works: 4,
    stack: ['Unreal Engine (C++)', 'VR', 'Vive Tracker', 'Google STT'],
  },
];

const projects = [
  {
    slug: 'personal-sanitation',
    stack: ['React Native(Expo)', 'Next.js', 'NestJS', 'PostgreSQL', 'Docker'],
    thumb: 'images/dash-overview.png',
    thumbCode: [],
    accent: '#16a34a',
  },
  {
    slug: 'reserve-system',
    stack: ['Next.js', 'Spring Boot', 'Supabase', 'Cloud Run', 'GitHub Actions'],
    thumb: 'images/w-home.png',
    thumbCode: [],
    accent: '#e11d48',
  },
  {
    slug: 'jenkins-local-test',
    stack: ['Ubuntu Server', 'WireGuard', 'OpenSSH', 'Apache SVN', 'Jenkins', 'Nginx', 'Docker', 'Discord Webhook', 'CI/CD'],
    thumb: null,
    thumbCode: ['Windows PC → Ubuntu Server', 'WireGuard · SSH · SVN', 'svn commit → Jenkins CI/CD', 'Docker · Nginx → Discord ✓'],
    accent: '#ea580c',
  },
];

export default function Home({ lang }: { lang: Lang }) {
  const tr = (key: string) => t(key, lang);
  const projectHref = (slug: string) => `${base}/projects/${slug}/${lang === 'ko' ? '' : `${lang}/`}index.html`;
  return (
    <>
      <div className="bg" aria-hidden="true" />
      <nav className="nav">
        <a href="#top" className="brand">DH<span>.</span></a>
        <div>
          <a href="#projects">{tr('nav.projects')}</a>
          <a href="#skills">{tr('nav.skills')}</a>
          <a href="#career">{tr('nav.career')}</a>
          <details className="lang-switch">
            <summary><span className="sr-only">{tr('nav.lang')}: </span>{langLabel[lang]}</summary>
            <div>
              {LANGS.map((l) => (
                <a key={l} href={homeHref(l)} hrefLang={htmlLang(l)} lang={htmlLang(l)} aria-current={l === lang ? 'page' : undefined}>
                  {langLabel[l]}
                </a>
              ))}
            </div>
          </details>
        </div>
      </nav>

      <main id="top">
        <header className="hero">
          <div className="hero-text">
            <p className="eyebrow">Full-stack Developer</p>
            <h1>
              {tr('hero.title').split('\n').map((line, i) => {
                const [pre, post] = line.split('{name}');
                return (
                  <Fragment key={i}>
                    {i > 0 && <br />}
                    {pre}
                    {post !== undefined && <><span className="grad">{tr('hero.name')}</span>{post}</>}
                  </Fragment>
                );
              })}
            </h1>
            <ul className="why-list">
              {['troubleshooting', 'delivery', 'cross-domain'].map((item) => (
                <li key={item} className="glass reveal">
                  <h3>{tr(`why.${item}.title`)}</h3>
                  <p>{tr(`why.${item}.description`)}</p>
                </li>
              ))}
            </ul>
          </div>
        </header>

        <section id="projects">
          <p className="eyebrow">Projects</p>
          <h2>{tr('nav.projects')}</h2>
          <ul className="projects">
            {projects.map((p) => (
              <li key={p.slug} className="reveal" style={{ '--accent': p.accent } as CSSProperties}>
                <a href={projectHref(p.slug)} className="card">
                  <div className="thumb">
                    {p.thumb ? (
                      <img src={`${base}/projects/${p.slug}/${p.thumb}`} alt="" loading="lazy" />
                    ) : (
                      <code className="thumb-code">
                        {p.thumbCode.map((line) => <span key={line}>{line}</span>)}
                      </code>
                    )}
                  </div>
                  <div className="card-body">
                    <h3>
                      {tr(`projects.${p.slug}.title`)} <span className="arrow">→</span>
                    </h3>
                    <p>{tr(`projects.${p.slug}.summary`)}</p>
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

        <section id="skills">
          <p className="eyebrow">Skills</p>
          <h2>{tr('nav.skills')}</h2>
          <ul className="skill-groups">
            {skillGroups.map((g) => (
              <li key={g.id} className="glass reveal">
                <h3>{tr(`skills.group.${g.id}`)}</h3>
                <ul className="chips small">
                  {g.items.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <section id="career">
          <p className="eyebrow">Career</p>
          <h2>{tr('nav.career')}</h2>
          <ol className="timeline">
            {careers.map((c) => (
              <li key={c.id} className="glass reveal">
                <div className="career-head">
                  <h3>{tr(`career.${c.id}.company`)}</h3>
                  <span className="period">
                    {c.range.start} ~ {c.range.end ?? tr('period.present')} (
                    <CareerMonths ranges={[c.range]} builtAt={builtAt} lang={lang} />)
                  </span>
                </div>
                <p className="role">{tr(`career.${c.id}.role`)}</p>
                <ul className="works">
                  {Array.from({ length: c.works }, (_, i) => (
                    <li key={i}>{tr(`career.${c.id}.works.${i + 1}`)}</li>
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
      </main>

      <footer className="footer">{tr('footer')}</footer>
    </>
  );
}
