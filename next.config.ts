/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Bu ayar, Vercel'in derleme sırasında ESLint hatalarını yoksaymasını sağlar
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;