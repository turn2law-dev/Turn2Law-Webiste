import type {NextConfig} from 'next';
import path from 'path';

const ENGINE_URL = (process.env.DOCUMENT_GENERATION_API_URL || '').replace(/\/$/, '');

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),

  async rewrites() {
    if (!ENGINE_URL) return [];
    return [
      {
        source: '/files/:path*',
        destination: ENGINE_URL + '/files/:path*',
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
