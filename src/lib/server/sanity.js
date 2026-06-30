import sanityClient from '@sanity/client';

export default sanityClient({
  apiVersion: '2025-02-19',
  dataset: 'production',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
  perspective: 'published',
});
