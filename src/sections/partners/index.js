import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';

import sanityClient from '@/lib/server/sanity';

const builder = imageUrlBuilder(sanityClient);

const Partners = ({ logos, name }) => {
  return (
    <section className="bg-water-500">
      <div className="container flex flex-col items-center justify-center px-20 py-10 mx-auto md:flex-row">
        <div className="md:w-1/4">
          <h3 className="text-xl font-bold">{name}</h3>
        </div>
        <div className="grid grid-cols-5 gap-5 md:w-3/4">
          {logos.map((logo, index) => {
            const imageAsset = builder.image(logo.asset);
            return (
              <div key={index} className="relative inline-block h-40">
                <Image
                  className="mix-blend-multiply"
                  layout="fill"
                  loading="lazy"
                  objectFit="contain"
                  src={imageAsset.url()}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Partners;
