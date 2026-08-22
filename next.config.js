/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizeCss: false,
  },
  async redirects() {
    return [
      // Resources section removed — keep legacy links working.
      { source: "/resources", destination: "/", permanent: true },
    ];
  },
};

module.exports = nextConfig;
