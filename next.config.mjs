/** @type {import('next').NextConfig} */
export default {
  output: 'export',
  // GitHub Actions의 configure-pages가 넘겨주는 값 (예: /portfolio). 로컬은 빈 값.
  basePath: process.env.PAGES_BASE_PATH || '',
  images: { unoptimized: true },
};
