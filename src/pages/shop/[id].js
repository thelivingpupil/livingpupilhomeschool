import ErrorPage from 'next/error';

import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import sanityClient from '@/lib/server/sanity';
import { getStoreProductById } from '@/prisma/services/product';
import Footer from '@/sections/footer';
import Header from '@/sections/header';
import Title from '@/sections/sectionTitle';
import Item from '@/sections/shop/shopItem';

const ShopItem = ({ page, item }) => {
  if (!page || !item) {
    return <ErrorPage statusCode={404} />;
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

export const getServerSideProps = async ({ params }) => {
  const { id } = params;

  const [[header, footer], item] = await Promise.all([
    sanityClient.fetch(
      `*[_type == 'sections' && (name == 'Common Header' || name == 'Common Footer')]`
    ),
    getStoreProductById(id),
  ]);

  if (!item) {
    return { notFound: true };
  }

  return {
    props: {
      page: { footer, header },
      item,
    },
  };
};

export default ShopItem;
