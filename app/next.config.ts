import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei', '@react-three/rapier', '@react-three/postprocessing'],
  webpack: (config) => {
    config.externals = config.externals || []
    return config
  },
}

export default nextConfig
