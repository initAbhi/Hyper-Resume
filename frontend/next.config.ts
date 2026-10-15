import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      { source: '/resume-checker', destination: '/tools/resume-checker', permanent: true },
      { source: '/resume-score', destination: '/tools/resume-score', permanent: true },
      { source: '/job-match', destination: '/tools/job-match', permanent: true },
      { source: '/resume-builder', destination: '/app/resumes', permanent: false },
      { source: '/resume-examples', destination: '/examples', permanent: true },
      { source: '/resume-examples/:slug', destination: '/examples/:slug', permanent: true },
    ];
  },
};

export default nextConfig;
