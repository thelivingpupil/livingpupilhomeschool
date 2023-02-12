import Image from 'next/image';

import imageUrlBuilder from '@sanity/image-url';
import sanityClient from '@/lib/server/sanity';

const imageBuilder = imageUrlBuilder(sanityClient);

const ShopItem = ({ item }) => {
  const imageAsset = imageBuilder.image(item?.image?.asset);

  const image = imageAsset?.options?.source ? imageAsset?.url() : null;
  return (
    <section className="px-5 py-10 md:px-0">
      <div className="container flex mx-auto space-y-10 md:space-y-0 md:space-x-10">
        <div className="flex" style={{ flex: '0.5 1 0' }}>
          <div className="relative inline-block w-full">
            <Image
              name={item.name}
              layout="fill"
              loading="lazy"
              objectFit="contain"
              src={image || '/images/livingpupil-homeschool-logo.png'}
            />
          </div>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex text-4xl font-bold">{item.name}</div>
          <div className="flex text-2xl py-2">{item.price}</div>
          <div className="flex flex-wrap py-2">
            {item.categories?.map((category, index) => (
              <span
                key={index}
                className="px-3 py-1 mb-2 mr-3 text-xs text-gray-600 bg-gray-100 rounded-full"
              >
                {category}
              </span>
            ))}
          </div>
          <div className="text-base py-2 space-y-3 justify-center">
            {item.description}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopItem;
