import type { NextConfig } from "next";
import { withPlausibleProxy } from "next-plausible";

const nextConfig: NextConfig = withPlausibleProxy({
    customDomain: "https://plausible.gko.gg",
})({
    experimental: {
        reactCompiler: true,
    },
});

export default nextConfig;
