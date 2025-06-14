import type { NextConfig } from "next";
import { withPlausibleProxy } from "next-plausible";

const nextConfig: NextConfig = withPlausibleProxy({
    customDomain: "https://plausible.gko.gg",
    subdirectory: "stats",
    scriptName: "p.js",
})({
    experimental: {
        reactCompiler: true,
    },
});

export default nextConfig;
