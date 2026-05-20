const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.youtube-nocookie.com"
      }
    ]
  }
};

export default nextConfig;
