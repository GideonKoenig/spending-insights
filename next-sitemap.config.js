/** @type {import('next-sitemap').IConfig} */
const config = {
    siteUrl: process.env.SITE_URL || "https://spendinginsights.app",
    generateRobotsTxt: true,
    changefreq: "daily",
    priority: 0.7,
    robotsTxtOptions: {
        policies: [
            {
                userAgent: "*",
                allow: "/",
            },
        ],
    },
};

export default config;
