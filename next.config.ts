import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // ✅ add this line
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // ✅ Google profile images
      },
    ],
  },
};

export default nextConfig;