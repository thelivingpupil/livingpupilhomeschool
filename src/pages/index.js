import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import render from '@/lib/client/renderer';
import sanityClient from '@/lib/server/sanity';

const Home = ({ page }) => {
  return (
    <LandingLayout>
      <Meta title="Living Pupil Homeschool" />
      {render(page.content)}
    </LandingLayout>
  );
};

export const getStaticProps = async () => {
  const page = await sanityClient.fetch(
    `*[_type == 'pages' && index == true][0]{..., content[]->{...}}`
  );
  return {
    props: { page },
    revalidate: 10,
  };
};

export default Home;
