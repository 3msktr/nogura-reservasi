/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config ...
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://your-cdn-url.com' : '',
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.output.filename = `static/chunks/[name].${buildId}.js`;
    config.output.chunkFilename = `static/chunks/[name].${buildId}.js`;
    return config;
  },
}

module.exports = nextConfig