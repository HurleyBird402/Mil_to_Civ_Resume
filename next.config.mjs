/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdf-extraction"], // Prevents build errors with the PDF reader
};

export default nextConfig;