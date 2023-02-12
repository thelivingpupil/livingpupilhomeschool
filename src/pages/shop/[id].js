import ErrorPage from 'next/error';
import { useRouter } from 'next/router';

import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import sanityClient from '@/lib/server/sanity';
import Footer from '@/sections/footer';
import Header from '@/sections/header';
import Title from '@/sections/sectionTitle';
import Item from '@/sections/shop/shopItem';

const ShopItem = ({ page, item }) => {
  const router = useRouter();

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
      <Item item={item} />
      <Footer {...footerSection} />
    </LandingLayout>
  );
};

export const getStaticPaths = async () => {
  const paths = await sanityClient.fetch(
    `*[_type == 'shopItems' && defined(_id)][]._id`
  );

  return {
    paths: paths.map((id) => ({ params: { id } })),
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const { id } = params;

  const [[header, footer], item] = await Promise.all([
    sanityClient.fetch(
      `*[_type == 'sections' && (name == 'Common Header' || name == 'Common Footer')]`
    ),
    sanityClient.fetch(`*[_type == 'shopItems' && _id == $id][0]`, {
      id,
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
