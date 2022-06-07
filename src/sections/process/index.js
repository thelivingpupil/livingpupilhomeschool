import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';
import Link from 'next/link';

import sanityClient from '@/lib/server/sanity';

const builder = imageUrlBuilder(sanityClient);

const Process = ({ steps }) => {
  return (
    <>
      {steps.map(({ title, description, image }, index) => {
        const imageAsset = builder.image(image?.asset);
        return (
          <section
            key={index}
            className={`relative w-full py-10 md:py-20 bg-no-repeat bg-[length:300px_300px] bg-secondary-100 bg-asset-3 ${
              index % 2 === 0
                ? 'bg-[left_-100px_top_1rem]'
                : 'bg-[right_-100px_top_1rem]'
            }`}
          >
            <div
              className={`container flex flex-col items-center justify-between px-10 mx-auto space-x-0 space-y-10 md:space-x-10 md:px-20 md:space-y-0 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              <div
                className={`flex flex-col w-full space-y-5 md:space-y-10 md:w-1/2 ${
                  index % 2 === 0 ? 'text-left' : 'text-right'
                }`}
              >
                <h2 className="flex flex-col text-5xl font-medium tracking-wide font-display">
                  {title}
                </h2>
                <PortableText value={description} />
              </div>
              <div className="relative w-full md:w-1/2 h-[400px]">
                <Image
                  alt={image.alt}
                  className="bg-white rounded-xl"
                  layout="fill"
                  loading="lazy"
                  objectFit="contain"
                  objectPosition="center"
                  src={imageAsset.url()}
                />
              </div>
            </div>
          </section>
        );
      })}
      <section className="flex items-center justify-center w-full py-10 md:py-20 bg-secondary-100">
        <Link href="/auth/login">
          <a
            className="px-10 py-5 font-bold rounded-lg bg-secondary-500"
            target="_blank"
          >
            Enroll your child now!
          </a>
        </Link>
      </section>
    </>
  );
};

export default Process;
