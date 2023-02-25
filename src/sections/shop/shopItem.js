import Image from 'next/image';
import { MinusIcon, PlusIcon } from '@heroicons/react/outline';

import imageUrlBuilder from '@sanity/image-url';
import sanityClient from '@/lib/server/sanity';
import { PortableText } from '@portabletext/react';
import { useState } from 'react';

const imageBuilder = imageUrlBuilder(sanityClient);

const ShopItem = ({ item }) => {
  const imageAsset = imageBuilder.image(item?.image?.asset);

  const [quantity, setQuantity] = useState(0);

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
          <div className="flex text-2xl text-gray-600 py-2">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'PHP',
            }).format(item.price)}
          </div>
          <div className="flex flex-wrap py-2">
            {item?.categories?.map((category, index) =>
              category ? (
                <span
                  key={index}
                  className="px-3 py-1 mb-2 mr-3 text-xs text-gray-600 bg-gray-100 rounded-full"
                >
                  {category}
                </span>
              ) : null
            )}
          </div>
          <div className="text-sm py-2 space-y-3 justify-center">
            <PortableText value={item.description} />
          </div>
          <div className="flex flex-row mt-4">
            <button
              className="p-2 text-white rounded bg-primary-400 disabled:opacity-25"
              disabled={quantity === 0}
            >
              <MinusIcon className="w-3 h-3" />
            </button>
            <div className="mx-4">{quantity}</div>
            <button
              className="p-2 text-white rounded bg-primary-400 disabled:opacity-25"
              disabled={quantity === item.inventory}
            >
              <PlusIcon className="w-3 h-3" />
            </button>
          </div>
          <div className="flex mt-4">
            <button className="w-full py-2 text-white rounded-lg bg-primary-500 hover:bg-secondary-600 disabled:opacity-25">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopItem;
