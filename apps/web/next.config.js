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
}

module.exports = nextConfig