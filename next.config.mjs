/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  // Ensure pdf-parse is not bundled by Webpack or Turbopack
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
