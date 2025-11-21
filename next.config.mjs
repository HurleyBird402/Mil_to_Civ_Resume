/** @type {import('next').NextConfig} */
const nextConfig = {
  // ⚠️ CRITICAL: This tells Next.js "Don't try to bundle this, just run it."
  // This fixes the "Class constructor" and "Module not found" errors.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;