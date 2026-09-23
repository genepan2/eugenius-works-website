export const SITE_NAME = 'Eugenious Works';
export const SITE_URL = 'https://eugenius-works.com';
export const SITE_DESCRIPTION =
  'Projects and writing by Eugen Panov — design, development, artificial intelligence, entrepreneurship, and business.';
export const AUTHOR = 'Eugen Panov';
export const ENTITY = 'Eugenious Works OÜ';

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
  phone: '+49 152 243 669 59',
  // Used for the imprint, the privacy policy, and as the contact form delivery
  // address. Changing it here changes all three.
  email: 'info@eugenius-works.com',
  director: 'Eugen Panov',
};

// Adding a social footer link later is a one-line change here. The legal links
// (imprint, privacy) are not social links and live beside the copyright line.
export const FOOTER_LINKS = [
  { label: 'LinkedIn', href: LINKEDIN_URL },
  { label: 'X', href: X_URL },
  { label: 'RSS', href: '/rss.xml' },
];

export const NAV_LINKS = [
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];
