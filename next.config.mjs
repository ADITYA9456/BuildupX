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
    },
    // Disable font optimization to fix font manifest issues
    optimizeFonts: false,
};

export default nextConfig;
