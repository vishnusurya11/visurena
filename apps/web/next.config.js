/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true, domains: ['img.youtube.com', 'i.ytimg.com', 'picsum.photos'] },
  output: 'export',
  trailingSlash: true,
  transpilePackages: ['@visurena/design-tokens', '@visurena/core', '@visurena/ui'],
  experimental: { externalDir: true },
}
module.exports = nextConfig
