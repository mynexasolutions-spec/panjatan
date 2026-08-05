/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      // Wildcard so any https image URL pasted into admin/CMS text fields
      // (Cloudinary, Unsplash, Google-hosted images, etc.) renders instead
      // of throwing "hostname is not configured" at request time.
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
