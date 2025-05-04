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
  // Configuração experimental para permitir módulos externos
  experimental: {
    // Permitir importações dinâmicas em tempo de execução
    serverComponentsExternalPackages: ['@google/genai', 'fs', 'path', 'dotenv'],
    // Desativar verificações de dependências para evitar erros de compilação
    externalDir: true,
  },
};

export default nextConfig;
