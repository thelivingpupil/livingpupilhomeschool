import ErrorPage from 'next/error';
import { useRouter } from 'next/router';

import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import sanityClient from '@/lib/server/sanity';
import Footer from '@/sections/footer';
import Header from '@/sections/header';
import Title from '@/sections/title';

const ShopItem = ({ page, item }) => {
  const router = useRouter();
  console.log(item);

  if (!page) {
    return <ErrorPage statusCode={404} />;
  }

  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }

  const { footer, header } = page;
  const [headerSection] = header?.sectionType;
  const [footerSection] = footer?.sectionType;

  return (
    <LandingLayout>
      <Meta title="Living Pupil Homeschool" />
      <Header {...headerSection} />
      <Title title="Living Pupil Homeschool Shop" />
      <Footer {...footerSection} />
    </LandingLayout>
  );
};

export const getStaticPaths = async () => {
  const paths = await sanityClient.fetch(
    `*[_type == 'shopItems' && defined(slug.current)][].slug.current`
  );
  return {
    paths: paths.map((slug) => ({ params: { slug } })),
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;
  const [[header, footer], item] = await Promise.all([
    sanityClient.fetch(
      `*[_type == 'sections' && (name == 'Common Header' || name == 'Common Footer')]`
    ),
    sanityClient.fetch(`*[_type == 'shopItems' && slug.current == $slug][0]`, {
      slug,
    }),
  ]);
  return {
    props: {
      page: { footer, header },
      item,
    },
    revalidate: 10,
  };
};

export default ShopItem;
