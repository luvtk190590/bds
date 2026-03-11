/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tắt StrictMode để tránh Supabase GoTrue Web Lock warning trong dev
  // (StrictMode double-mount gây orphaned lock → warning 5000ms timeout)
  // Production không bị ảnh hưởng vì StrictMode chỉ active trong development
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
