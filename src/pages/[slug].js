import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import render from '@/lib/client/renderer';
import sanityClient from '@/lib/server/sanity';

const Home = ({ page }) => {
  console.log(page);
  return (
    <LandingLayout>
      <Meta title="Living Pupil Homeschool" />
      {render(page?.content)}
    </LandingLayout>
  );
};

export const getStaticPaths = async () => {
  const paths = await sanityClient.fetch(
    `*[_type == 'pages' && index != true && defined(slug.current)][].slug.current`
  );
  return {
    paths: paths.map((slug) => ({ params: { slug } })),
    fallback: true,
  };
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params;
  const page = await sanityClient.fetch(
    `*[_type == 'pages' && index != true && slug.current == $slug][0]{..., content[]->{...}}`,
    { slug }
  );
  console.log(page);
  return {
    props: { page },
    revalidate: 10,
  };
};

export default Home;
