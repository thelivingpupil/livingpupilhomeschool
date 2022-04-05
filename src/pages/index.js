import Meta from '@/components/Meta/index';
import { LandingLayout } from '@/layouts/index';
import Contact from '@/sections/Contact';
import {
  Blog,
  CallToAction,
  Content,
  Features,
  Footer,
  Gallery,
  Header,
  Hero,
  Quote,
  Testimonial,
} from '@/sections/index';

const Home = () => {
  return (
    <LandingLayout>
      <Meta title="The Living Pupil Homeschool" />
      <Header />
      <Hero />
      <CallToAction />
      <Features />
      <Content />
      <Gallery />
      <Blog />
      <Testimonial />
      <Quote />
      <Contact />
      <Footer />
    </LandingLayout>
  );
};

export default Home;
