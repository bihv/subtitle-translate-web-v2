import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable compression to enable streaming responses (for API translate route)
  // If behind a reverse proxy (nginx, Cloudflare), handle compression there instead
  compress: false,
};

export default nextConfig;
