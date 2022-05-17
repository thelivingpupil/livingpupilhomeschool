import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import sanityClient from '@/lib/server/sanity';
import Footer from '@/sections/footer';
import Header from '@/sections/header';
import ShopSection from '@/sections/shop';
import Title from '@/sections/title';

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

export const getStaticProps = async () => {
  const [[header, footer], items] = await Promise.all([
    sanityClient.fetch(
      `*[_type == 'sections' && (name == 'Common Header' || name == 'Common Footer')]`
    ),
    sanityClient.fetch(`*[_type == 'shopItems']`),
  ]);
  return {
    props: {
      page: { footer, header },
      shop: { items },
    },
    revalidate: 10,
  };
};

export default Shop;
