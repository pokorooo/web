/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
const nextConfig = {
  poweredByHeader: false,
  basePath,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
}

module.exports = nextConfig
