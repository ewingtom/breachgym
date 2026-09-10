/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isGithubPages ? '/breachgym' : '',
  assetPrefix: isGithubPages ? '/breachgym' : '',
};

export default nextConfig;
