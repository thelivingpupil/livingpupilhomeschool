import imageUrlBuilder from '@sanity/image-url';
import Link from 'next/link';

import sanityClient from '@/lib/server/sanity';
import Image from 'next/image';

const builder = imageUrlBuilder(sanityClient);

const Shop = ({ items }) => {
  return (
    <section className="px-5 py-10 md:px-0">
      <div className="container flex flex-row items-center justify-between mx-auto space-x-10">
        <div className="grid w-2/3 grid-cols-3 gap-5">
          {items.map(({ slug, image, name, price }, index) => {
            const imageAsset = builder.image(image.asset);
            return (
              <div
                className="p-3 space-y-5 border rounded-lg hover:shadow-xl"
                key={index}
              >
                <Link href={`/shop/${slug.current}`}>
                  <a>
                    <div className="relative inline-block w-full h-40">
                      <Image
                        alt={image.alt}
                        className="rounded-lg"
                        layout="fill"
                        loading="lazy"
                        objectFit="cover"
                        src={imageAsset.url()}
                      />
                    </div>
                    <h3 className="font-bold">{name}</h3>
                    <p className="text-gray-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'PHP',
                      }).format(price)}
                    </p>
                  </a>
                </Link>
                <button className="w-full py-2 text-white rounded-lg bg-primary-500 hover:bg-secondary-600">
                  Add to Cart
                </button>
              </div>
            );
          })}
        </div>
        <div className="w-1/3"></div>
      </div>
    </section>
  );
};

export default Shop;
