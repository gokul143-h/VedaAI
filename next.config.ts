import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['openai', 'pdf-parse', 'tesseract.js'],
  // Monorepo-style repo has lockfiles at root and frontend — pin tracing to this app
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
