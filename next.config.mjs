/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbcdn1.podbean.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
