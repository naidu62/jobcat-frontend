/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizeCss: false, // disable critters issue
  },
};

module.exports = nextConfig;