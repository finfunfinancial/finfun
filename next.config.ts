import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep old Graphy URLs working. TODO: confirm the full list from the old site's analytics / Search Console.
  async redirects() {
    return [
      { source: "/s/pages/:page*", destination: "/", permanent: true },
      { source: "/s/store", destination: "/programs", permanent: true },
      { source: "/courses/:slug*", destination: "/programs", permanent: true },
      { source: "/s/authenticate", destination: "/login", permanent: true },
      { source: "/programs/basics", destination: "/programs", permanent: true },
      { source: "/courses", destination: "/programs", permanent: true },
    ];
  },
};

export default nextConfig;
