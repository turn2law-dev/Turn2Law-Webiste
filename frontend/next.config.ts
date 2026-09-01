import type {NextConfig} from 'next';
import path from 'path';

const ENGINE_URL = (
  process.env.DOCUMENT_GENERATION_API_URL || 'http://127.0.0.1:8000'
).replace(/\/$/, '');

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),

  async rewrites() {
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
