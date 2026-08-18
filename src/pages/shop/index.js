import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import sanityClient from '@/lib/server/sanity';
import { getStoreProducts } from '@/prisma/services/product';
import Footer from '@/sections/footer';
import Header from '@/sections/header';
import ShopSection from '@/sections/shop';
import Title from '@/sections/sectionTitle';

const Shop = ({ page, shop }) => {
  const { footer, header } = page;
  const [headerSection] = header?.sectionType;
  const [footerSection] = footer?.sectionType;
  return (
    <LandingLayout>
      <Meta title="Living Pupil Homeschool" />
      <Header {...headerSection} />
      <Title title="Living Pupil Homeschool Shop" />
      <ShopSection {...shop} />
      <Footer {...footerSection} />
    </LandingLayout>
  );
};

export const getServerSideProps = async () => {
  const [[header, footer], items] = await Promise.all([
    sanityClient.fetch(
      `*[_type == 'sections' && (name == 'Common Header' || name == 'Common Footer') && !(_id in path("drafts.**"))]`
    ),
    getStoreProducts(),
  ]);

  return {
    props: {
      page: { footer, header },
      shop: { categories: [], items },
    },
  };
};

export default Shop;
