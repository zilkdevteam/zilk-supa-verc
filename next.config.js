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
};

module.exports = nextConfig; 