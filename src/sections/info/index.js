import { Fragment } from 'react';
import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';

import sanityClient from '@/lib/server/sanity';

const builder = imageUrlBuilder(sanityClient);

const Info = ({ title, description, highlight, image }) => {
  const imageAsset = builder.image(image.asset);

  return (
    <section className="relative w-full py-20 bg-[left_-100px_top_1rem] bg-no-repeat bg-[length:300px_300px] bg-secondary-100 bg-asset-3">
      <div className="container flex items-center justify-between mx-auto space-x-10">
        <div className="flex flex-col w-1/2 space-y-10">
          <h2 className="flex flex-col text-5xl font-medium tracking-wide font-display">
            {title}
          </h2>
          <PortableText value={description} />
          <h3 className="flex items-center justify-center space-x-5 text-3xl font-display">
            {highlight.map((item, index) => (
              <Fragment key={index}>
                <span className="text-secondary-500">{item}</span>
                {index < highlight.length - 1 && (
                  <span className="text-primary-50">&#10022;</span>
                )}
              </Fragment>
            ))}
          </h3>
        </div>
        <div className="relative w-1/2 h-[500px]">
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
