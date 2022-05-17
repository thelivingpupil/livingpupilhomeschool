import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';

import sanityClient from '@/lib/server/sanity';
import Title from '../title';

const builder = imageUrlBuilder(sanityClient);

const Gallery = ({ title, items }) => {
  return (
    <>
      <Title title={title} />
      <section className="bg-water-500">
        <div className="container flex flex-col items-center justify-center px-20 py-10 mx-auto md:flex-row">
          <div className="grid w-full grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-4">
            {items.map((logo, index) => {
              const imageAsset = builder.image(logo.asset);
              return (
                <div
                  key={index}
                  className="relative inline-block h-40 rounded-lg shadow-lg overflow-clip"
                >
                  <Image
                    className="mix-blend-multiply"
                    layout="fill"
                    loading="lazy"
                    objectFit="cover"
                    src={imageAsset.url()}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default Gallery;
