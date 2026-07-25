import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const app = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
const main = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const robots = await readFile(new URL("../public/robots.txt", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");

test("parent and staff login navigation use confirmed ClassMentor URL", () => {
  assert.match(app, /const LOGIN_PAGE_URL = "https:\/\/forestview\.classmentor360\.com\/auth\/login";/);
  assert.match(app, /const STAFF_LOGIN_URL = LOGIN_PAGE_URL;/);
  assert.doesNotMatch(app, /const LOGIN_PAGE_URL = "#login";/);
  assert.doesNotMatch(app, /const STAFF_LOGIN_URL = "#staff-login";/);
});

test("unknown routes render the not-found route instead of home", () => {
  assert.match(app, /return "not-found";/);
  assert.match(app, /function NotFoundPage\(\)/);
  assert.match(app, /Page not found/);
  assert.match(app, /<NotFoundPage \/>/);
});

test("route-specific metadata updates document head", () => {
  assert.match(app, /const ROUTE_META = \{/);
  assert.match(app, /updateRouteMetadata\(route\)/);
  assert.match(app, /meta\[name="description"\]/);
  assert.match(app, /meta\[property="og:title"\]/);
  assert.match(app, /link\[rel="canonical"\]/);
  assert.match(app, /https:\/\/forestviewmontessori\.org/);
  assert.doesNotMatch(app, /https:\/\/forestviewmontessori\.com/);
  assert.match(html, /<meta name="description"/);
  assert.match(html, /<link rel="canonical"/);
  assert.match(html, /<meta property="og:image"/);
  assert.match(html, /<meta name="twitter:card"/);
  assert.match(html, /application\/ld\+json/);
});

test("large App module is lazy-loaded from the entrypoint", () => {
  assert.match(main, /lazy\(\(\) => import\("\.\/App\.jsx"\)\)/);
  assert.match(main, /<Suspense fallback=\{<AppLoadingFallback \/>\}>/);
});

test("robots and sitemap expose public routes and exclude private/form routes", () => {
  assert.match(robots, /Sitemap: https:\/\/forestviewmontessori\.org\/sitemap\.xml/);
  assert.match(sitemap, /https:\/\/forestviewmontessori\.org\/about/);
  assert.match(sitemap, /https:\/\/forestviewmontessori\.org\/admissions/);
  assert.match(sitemap, /https:\/\/forestviewmontessori\.org\/blog\/welcome-to-our-school-blog/);
  assert.doesNotMatch(sitemap, /#\//);
  assert.doesNotMatch(sitemap, /\/admin/);
  assert.doesNotMatch(sitemap, /\/admission-form/);
  assert.match(robots, /Disallow: \/admin/);
  assert.match(robots, /Disallow: \/admission-form/);
});

test("navigation and metadata use clean crawlable URLs", () => {
  assert.match(app, /function getLocationRouteParts\(\)/);
  assert.match(app, /\{ href: "\/about", label: "About Us" \}/);
  assert.match(app, /path: "\/admissions"/);
  assert.doesNotMatch(app, /href="#\/about"/);
  assert.match(html, /"@type": "WebSite"/);
  assert.match(html, /"@type": "SiteNavigationElement"/);
});

test("Google Ads tag is consent-aware and uses only the supplied ID", () => {
  assert.match(app, /const GOOGLE_ADS_TAG_ID = "AW-18247447091";/);
  assert.match(app, /ad_storage: "denied"/);
  assert.match(app, /analytics_storage: "denied"/);
  assert.match(app, /loadGoogleAdsAfterConsent\(\)/);
  assert.match(app, /document\.getElementById\(GOOGLE_ADS_SCRIPT_ID\)/);
  assert.match(app, /googletagmanager\.com\/gtag\/js\?id=\$\{GOOGLE_ADS_TAG_ID\}/);
  assert.doesNotMatch(html, /AW-18247447091/);
  assert.doesNotMatch(html, /googletagmanager\.com\/gtag\/js/);
});
