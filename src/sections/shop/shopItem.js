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
        <div className="flex">
          <Image
            name={item.name}
            layout="fill"
            loading="lazy"
            objectFit="contain"
            src={image || '/images/livingpupil-homeschool-logo.png'}
          />
        </div>
        <div className="flex flex-col">
          <div className="">{item.name}</div>
        </div>
      </div>
    </section>
  );
};

export default ShopItem;
