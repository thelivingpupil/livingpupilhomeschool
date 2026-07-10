import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

const sanityConfig = {
  apiVersion: '2025-02-19',
  dataset: 'production',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim(),
  useCdn: true,
  token: process.env.SANITY_API_TOKEN,
  perspective: 'published',
};

const sanityClient = createClient(sanityConfig);

export const imageBuilder = createImageUrlBuilder(sanityClient);

export default sanityClient;
