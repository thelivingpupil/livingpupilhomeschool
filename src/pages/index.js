import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import { About, Features, Footer, Header, Hero, Quote } from '@/sections/index';

const Home = () => {
  return (
    <LandingLayout>
      <Meta title="Living Pupil Homeschool" />
      <Header />
      <Hero />
      <About />
      <Features />
      <Quote />
      <Footer />
    </LandingLayout>
  );
};

export default Home;
