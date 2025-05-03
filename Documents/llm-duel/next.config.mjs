/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['oaidalleapiprodscus.blob.core.windows.net', 'api.openai.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  },
  // Configuração correta para permitir módulos do Node.js nas API Routes
  serverExternalPackages: ['fs', 'path', 'dotenv'],
  experimental: {
    // Removido serverComponentsExternalPackages daqui
  },
};

export default nextConfig;
