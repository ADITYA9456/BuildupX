/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost'],
        unoptimized: true,
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60,
    },
    experimental: {
        optimizeCss: false,
    }
};

export default nextConfig;
