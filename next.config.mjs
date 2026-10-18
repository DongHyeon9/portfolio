/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  // out/en/index.html 형태로 출력: 프로젝트 번역본의 '../../../en/' 링크와 정적 호스트가 디렉터리 경로로 열 수 있게
  trailingSlash: true,
  // GitHub Actions의 configure-pages가 넘겨주는 값 (예: /portfolio). 로컬은 빈 값.
  basePath: process.env.PAGES_BASE_PATH || '',
  images: { unoptimized: true },
};
