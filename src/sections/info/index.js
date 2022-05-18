import { Fragment } from 'react';
import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';

import sanityClient from '@/lib/server/sanity';

const builder = imageUrlBuilder(sanityClient);

const Info = ({ title, description, highlight, image }) => {
  const imageAsset = builder.image(image.asset);

  return (
    <section className="relative w-full py-10 md:py-20 bg-[left_-100px_top_1rem] bg-no-repeat bg-[length:300px_300px] bg-secondary-100 bg-asset-3">
      <div className="container flex flex-col items-center justify-between px-10 mx-auto space-x-0 space-y-10 md:space-x-10 md:flex-row md:px-20 md:space-y-0">
        <div className="flex flex-col w-full space-y-5 md:space-y-10 md:w-1/2">
          <h2 className="flex flex-col text-5xl font-medium tracking-wide font-display">
            {title}
          </h2>
          <PortableText value={description} />
          {highlight && (
            <h3 className="flex items-center justify-center space-x-5 text-sm md:text-3xl font-display">
              {highlight.map((item, index) => (
                <Fragment key={index}>
                  <span className="text-secondary-500">{item}</span>
                  {index < highlight.length - 1 && (
                    <span className="text-primary-50">&#10022;</span>
                  )}
                </Fragment>
              ))}
            </h3>
          )}
        </div>
        <div className="relative w-full md:w-1/2 h-[500px]">
          <Image
            alt={image.alt}
            className="rounded-xl"
            layout="fill"
            loading="lazy"
            objectFit="cover"
            objectPosition="top"
            src={imageAsset.url()}
          />
        </div>
      </div>
    </section>
  );
};

export default Info;
