import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Photos des véhicules envoyées depuis le back-office (Vercel Blob)
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
};

export default nextConfig;
