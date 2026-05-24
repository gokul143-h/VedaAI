import type { NextConfig } from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  serverExternalPackages: ['openai', 'pdf-parse', 'tesseract.js'],
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
