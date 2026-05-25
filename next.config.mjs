/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ["app", "components", "lib", "types"],
  },
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
