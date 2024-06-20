import ErrorPage from 'next/error';
import { useRouter } from 'next/router';

import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import render from '@/lib/client/renderer';
import sanityClient from '@/lib/server/sanity';

const Page = ({ page }) => {
  const router = useRouter();

  if (!page) {
    return <ErrorPage statusCode={404} />;
  }

  if (router.isFallback) {
    return <h1>Loading...</h1>;
  }

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

  if (!page) {
    return { notFound: true };
  }

  return {
    props: { page },
    revalidate: 10,
  };
};

export default Page;
