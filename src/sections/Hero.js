import { Splide, SplideSlide } from '@splidejs/react-splide';
import Image from 'next/image';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="relative w-full bg-secondary-500">
      <div className="w-full pt-20 pb-40 bg-bottom bg-no-repeat shadow-inner bg-wave-2">
        <Splide
          options={{
            autoplay: true,
            speed: 1000,
            rewind: true,
            interval: 5000,
          }}
        >
          <SplideSlide>
            <div className="container flex items-center justify-between py-5 mx-auto">
              <div className="flex flex-col w-2/3 space-y-5">
                <h1 className="flex flex-col space-y-3 text-6xl font-medium tracking-wide font-display">
                  <span>The First</span>
                  <span>Charlotte Mason</span>
                  <span>Homeschool Provider</span>
                  <span>in the Philippines</span>
                </h1>
                <p className="mb-8 leading-relaxed">
                  Following Charlotte Mason&apos;s principle,&nbsp;
                  <strong>Living Pupil Homeschool</strong> gives particular
                  attention to our pupil&apos;s relationship with God, with man,
                  and with the world.
                </p>
                <div className="relative">
                  <Link href="/">
                    <a className="inline-block px-5 py-3 bg-white rounded-lg hover:bg-gray-50">
                      Get Started
                    </a>
                  </Link>
                </div>
              </div>
              <div className="relative md:w-1/3 h-96">
                <div className="absolute top-0 border-8 border-white rotate-[2deg] h-full w-full bg-gray-400" />
                <div className="border-8 border-white h-full w-full rotate-[5deg]">
                  <Image
                    alt="Actual Image"
                    layout="fill"
                    loading="lazy"
                    objectFit="cover"
                    src="https://images.pexels.com/photos/4473990/pexels-photo-4473990.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  />
                </div>
              </div>
            </div>
          </SplideSlide>
          <SplideSlide>
            <div className="container flex items-center justify-between py-5 mx-auto">
              <div className="flex flex-col w-2/3 space-y-5">
                <h1 className="flex flex-col space-y-3 text-6xl font-medium tracking-wide font-display">
                  <span>Living Pupil Homeschool</span>
                  <span>Enrollment is now open</span>
                  <span>SY 2022 - 2023</span>
                </h1>
                <p className="mb-8 leading-relaxed">
                  Enrollment for SY 2022 - 2023 for{' '}
                  <strong>Living Pupil Homeschool</strong> is now OPEN
                </p>
                <div className="relative">
                  <Link href="/">
                    <a className="inline-block px-5 py-3 bg-white rounded-lg hover:bg-gray-50">
                      Get Started
                    </a>
                  </Link>
                </div>
              </div>
              <div className="relative md:w-1/3 h-96">
                <div className="absolute top-0 border-8 border-white rotate-[2deg] h-full w-full bg-gray-400" />
                <div className="border-8 border-white h-full w-full rotate-[5deg]">
                  <Image
                    alt="Actual Image"
                    layout="fill"
                    loading="lazy"
                    objectFit="cover"
                    src="https://images.pexels.com/photos/4473990/pexels-photo-4473990.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  />
                </div>
              </div>
            </div>
          </SplideSlide>
        </Splide>
      </div>
    </section>
  );
};

export default Hero;
