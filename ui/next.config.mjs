/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
  env: {
    SERVER_PORT: process.env.SERVER_PORT,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/150/**',
      },
    ],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  transpilePackages: ['three'],
  reactStrictMode: true,
};

export default nextConfig;
