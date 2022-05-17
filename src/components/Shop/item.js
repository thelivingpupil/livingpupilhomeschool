import { useEffect, useState } from 'react';
import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';

import sanityClient from '@/lib/server/sanity';
import { MinusIcon, PlusIcon } from '@heroicons/react/outline';

const builder = imageUrlBuilder(sanityClient);

const Item = ({ id, addToCart, count, image, name, price }) => {
  const [quantity, setQuantity] = useState(count);
  const imageAsset = builder.image(image.asset);

  const decrease = () => setQuantity(quantity - 1);

  const increase = () => setQuantity(quantity + 1);

  useEffect(() => {
    setQuantity(count);
  }, [count]);

  return (
    <div>
      <div className="p-3 space-y-5 border rounded-lg hover:shadow-xl">
        <div>
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
        </div>
        <div className="flex flex-row justify-between space-x-3">
          <button
            className="p-2 text-white rounded bg-primary-400 disabled:opacity-50"
            disabled={quantity === 0}
            onClick={decrease}
          >
            <MinusIcon className="w-3 h-3" />
          </button>
          <p>{quantity}x</p>
          <button
            className="p-2 text-white rounded bg-primary-400"
            onClick={increase}
          >
            <PlusIcon className="w-3 h-3" />
          </button>
        </div>
        <button
          className="w-full py-2 text-white rounded-lg bg-primary-500 hover:bg-secondary-600 disabled:opacity-50"
          disabled={quantity === 0}
          onClick={() => addToCart({ id, image, name, price, quantity })}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default Item;
