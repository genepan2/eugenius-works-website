export const SITE_NAME = 'Eugenius Works';
export const SITE_URL = 'https://eugenius-works.com';
export const SITE_DESCRIPTION =
  'Projects and writing by Eugen Panov — design, development, artificial intelligence, entrepreneurship, and business.';
export const AUTHOR = 'Eugen Panov';
export const ENTITY = 'Eugenius Works OÜ';

export const LINKEDIN_URL = 'https://www.linkedin.com/in/eugenpanov';
export const X_URL = 'https://x.com/eugenpanov';

// TODO: the owner must replace this with the real Cloudflare Web Analytics site
// token from the Cloudflare dashboard. While it is left as the placeholder below,
// the analytics script is not emitted and the site builds and runs normally.
export const CLOUDFLARE_ANALYTICS_TOKEN = 'REPLACE_WITH_CLOUDFLARE_ANALYTICS_TOKEN';

// Legal and registry details. The imprint and the privacy policy both read from
// here, so these values are never hardcoded in markup.
export const COMPANY = {
  legalName: 'Eugenius Works OÜ',
  street: 'Ahtri 12',
  postalCode: '10151',
  city: 'Tallinn',
  country: 'Estonia',
  regNo: '17328762',
  // Used for the imprint, the privacy policy, and as the contact form delivery
  // address. Changing it here changes all three.
  email: 'hey@eugenius-works.com',
  director: 'Eugen Panov',
};

// The header is the wordmark, not a menu: two words reading "Eugenius Works",
// each scrolling to its homepage section. Root-relative so they also work from
// a non-homepage page — navigate home first, then scroll.
export const NAV_LINKS = [
  { label: 'Eugenius', href: '/#eugenius' },
  { label: 'Works', href: '/#works' },
];

// The header reaches only the two homepage sections, so the footer carries
// every other page. Adding a link stays a one-line change in one of these two
// arrays. Row 1 is the site itself, row 2 is legal and social.
export const FOOTER_SITE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'RSS', href: '/rss.xml' },
];

export const FOOTER_LEGAL_LINKS = [
  { label: 'Imprint', href: '/imprint' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'LinkedIn', href: LINKEDIN_URL },
  { label: 'X', href: X_URL },
];
