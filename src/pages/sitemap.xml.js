import sanityClient from '@/lib/server/sanity';

const Sitemap = () => {};

export const getServerSideProps = async ({ res }) => {
  const publicPages = [
    'index',
    'homeschool-cottage',
    'homeschool-program',
    'shop',
    'auth/login',
  ];
  const pages = await sanityClient.fetch(
    `*[_type == 'pages' && index != true]{slug}`
  );
  publicPages.push(...pages.map((page) => page.slug.current));
  const staticPages = publicPages.map(
    (staticPagePath) =>
      `${process.env.APP_URL}${
        staticPagePath !== 'index' ? `/${staticPagePath}` : ''
      }`
  );
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${staticPages
        .map(
          (url) => `
            <url>
              <loc>${url}</loc>
              <lastmod>${new Date().toISOString()}</lastmod>
              <changefreq>monthly</changefreq>
              <priority>1.0</priority>
            </url>
          `
        )
        .join('')}
    </urlset>
  `;
  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();
  return { props: {} };
};

export default Sitemap;
