/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,

    experimental: {
        webpackBuildWorker: false,
        cpus: 1,
        staticGenerationMaxConcurrency: 1,
        staticGenerationMinPagesPerWorker: 1,
    },

};

export default nextConfig;
