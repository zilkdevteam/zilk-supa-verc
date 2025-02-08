/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
  images: {
    domains: ['azsydeuklnbqvsvhdcxr.supabase.co'],
  },
  serverOptions: {
    port: 3000,
  },
};

module.exports = nextConfig; 