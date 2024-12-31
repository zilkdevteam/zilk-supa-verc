/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'react-native',
    'expo',
    '@expo/vector-icons',
    'react-native-web',
    '@react-native-async-storage/async-storage',
    'react-native-safe-area-context',
    'react-native-screens',
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig; 