// the public url of the site, used for link previews, the sitemap and robots.txt.
// set NEXT_PUBLIC_SITE_URL once you have a custom domain; until then vercel's
// production url (a system env var available at build time) is used.
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (vercel ? `https://${vercel}` : "http://localhost:3000");
