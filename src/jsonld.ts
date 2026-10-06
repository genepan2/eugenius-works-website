import { AUTHOR, COMPANY, LINKEDIN_URL, SITE_NAME, SITE_URL, X_URL } from './consts';

const CONTEXT = 'https://schema.org';
export const PERSON_ID = `${SITE_URL}/#person`;

/** The owner, with the company he works through. Referenced by `@id` from other pages. */
export const person = {
  '@context': CONTEXT,
  '@type': 'Person',
  '@id': PERSON_ID,
  name: AUTHOR,
  url: SITE_URL,
  sameAs: [LINKEDIN_URL, X_URL],
  worksFor: {
    '@type': 'Organization',
    legalName: COMPANY.legalName,
    url: SITE_URL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.street,
      postalCode: COMPANY.postalCode,
      addressLocality: COMPANY.city,
      addressCountry: COMPANY.country,
    },
  },
};

export const website = {
  '@context': CONTEXT,
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
};

export const workLd = (name: string, description: string, url: string, projectUrl?: string) => ({
  '@context': CONTEXT,
  '@type': 'CreativeWork',
  name,
  description,
  url,
  author: { '@id': PERSON_ID },
  ...(projectUrl && { sameAs: [projectUrl] }),
});

export const postLd = (headline: string, datePublished: Date, url: string) => ({
  '@context': CONTEXT,
  '@type': 'BlogPosting',
  headline,
  datePublished: datePublished.toISOString(),
  author: { '@id': PERSON_ID },
  url,
});
