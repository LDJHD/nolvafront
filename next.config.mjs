/** @type {import('next').NextConfig} */
const nextConfig = {
    trailingSlash: true,

    // Desactiver la minification (contourne le bug unicode SWC de Next.js 15)
    webpack: (config) => {
        config.optimization.minimize = false;
        return config;
    },

    // Workaround Windows EPERM kill error during build
    experimental: {
        workerThreads: false,
        cpus: 1,
    },
};

export default nextConfig;
