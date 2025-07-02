/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    domains: ['img.youtube.com', 'i.ytimg.com'],
  },
  // For static export
  output: 'export',
  trailingSlash: true,
  // Base path for GitHub Pages or custom domain
  basePath: process.env.NODE_ENV === 'production' ? '' : '',
}

module.exports = nextConfig