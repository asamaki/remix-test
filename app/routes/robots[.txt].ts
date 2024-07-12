import { generateRobotsTxt } from '@nasa-gcn/remix-seo'

export function loader() {
  return generateRobotsTxt([
    { type: "sitemap", value: "https://ghost-tools.site/sitemap.xml" },
  ]);
}