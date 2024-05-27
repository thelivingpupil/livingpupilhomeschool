import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import Image from 'next/image';
import Link from 'next/link';

import sanityClient from '@/lib/server/sanity';

const builder = imageUrlBuilder(sanityClient);

const Hero = ({ items }) => {
  return (
    <section className="relative w-full bg-secondary-500">
      <div className="w-full pt-10 md:pt-20 pb-40 bg-bottom bg-no-repeat shadow-inner bg-wave-5">
        <Splide
          options={{
            autoplay: true,
            speed: 1000,
            rewind: true,
            interval: 5000,
          }}
        >
          {items.map(({ cta, image, subtext, title }, index) => {
            const imageAsset = builder.image(image.asset);
            return (
              <SplideSlide key={index}>
                <div className="container flex items-center justify-between px-5 py-5 md:py-5 mx-auto space-x-5 md:px-20">
                  <div className="flex flex-col space-y-5 text-center w-1/2 text-left md:w-1/2 md:text-left">
                    <h1 className="flex flex-col space-y-0 md:space-y-3 text-xl font-medium tracking-wide md:text-5xl font-display">
                      {title.map((t, index) => (
                        <span key={index}>{t}</span>
                      ))}
                    </h1>
                    <PortableText value={subtext} components={{ block: ({ children }) => <p className="text-xs md:text-base">{children}</p> }} />
                    <div className="relative space-x-2">
                      {cta.map((link, index) => (
                        <Link key={index} href={link.path}>
                          <a
                            className="inline-block px-2 py-2 text-xs bg-white md:text-lg md:px-5 md:py-3 rounded-lg hover:bg-gray-50"
                            target={link.isExternal ? '_blank' : undefined}
                          >
                            {link.name}
                          </a>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="relative w-1/2 md:flex md:w-1/2 h-64 md:h-96">
                    <div className="absolute top-0 left-0 w-full h-full border-8 border-white rotate-[1deg] bg-gray-400" />
                    <div className="relative w-full h-full border-8 border-white rotate-[4deg]">
                      <Image
                        alt={image.alt}
                        layout="fill"
                        loading="lazy"
                        objectFit="cover"
                        src={imageAsset.url()}
                      />
                    </div>
                  </div>
                </div>
              </SplideSlide>
            );
          })}
        </Splide>
      </div>
    </section>
  );
};

export default Hero;
