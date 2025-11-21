/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚠️ CRITICAL: This prevents Vercel from crashing when building pdfjs-dist
  serverExternalPackages: ["pdfjs-dist"],
};

export default nextConfig;