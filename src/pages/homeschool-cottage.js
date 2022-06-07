import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import sanityClient from '@/lib/server/sanity';
import Footer from '@/sections/footer';
import Header from '@/sections/header';
import Title from '@/sections/sectionTitle';

const HomeschoolCottage = ({ page, fees }) => {
  const { footer, header } = page;
  const [headerSection] = header?.sectionType;
  const [footerSection] = footer?.sectionType;
  return (
    <LandingLayout>
      <Meta title="Living Pupil Homeschool" />
      <Header {...headerSection} />
      <Title
        title="Homeschool Cottage"
        subtitle="Grade School - Senior High School"
      />
      <Footer {...footerSection} />
    </LandingLayout>
  );
};

export const getStaticProps = async () => {
  const [[header, footer], schoolFees] = await Promise.all([
    sanityClient.fetch(
      `*[_type == 'sections' && (name == 'Common Header' || name == 'Common Footer')]`
    ),
    sanityClient.fetch(
      `*[_type == 'schoolFees' && program == 'HOMESCHOOL_COTTAGE']{...}`
    ),
  ]);
  return {
    props: {
      page: { footer, header },
      fees: { schoolFees },
    },
    revalidate: 10,
  };
};

export default HomeschoolCottage;
