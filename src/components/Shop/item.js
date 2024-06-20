import { useEffect, useState } from 'react';
import { PortableText } from '@portabletext/react';
import Image from 'next/image';

import { MinusIcon, PlusIcon } from '@heroicons/react/outline';
import Link from 'next/link';

const Item = ({
  id,
  addToCart,
  count,
  image,
  name,
  price,
  categories,
  description,
  inventory
}) => {
  const [showDescription, setDescriptionVisibility] = useState(false);
  const [quantity, setQuantity] = useState(count);

  const decrease = () => setQuantity(quantity - 1);

  const increase = () => setQuantity(quantity + 1);

  const toggle = () => setDescriptionVisibility(!showDescription);

  useEffect(() => {
    setQuantity(count);
  }, [count]);

  return (
    <div className="flex flex-col justify-between p-3 space-y-5 border rounded-lg hover:shadow-xl item">
      <div>
        <div className="relative inline-block w-full h-40">
          <Image
            alt={name}
            // className="rounded-lg"
            layout="fill"
            loading="lazy"
            objectFit="contain"
            src={image || '/images/livingpupil-homeschool-logo.png'}
          />
        </div>
        <Link href={`/shop/${id}`}>
          <h3 className="font-bold cursor-pointer">{name}</h3>
        </Link>
        <p className="text-gray-600">
          {new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
          }).format(price)}
        </p>
        <div className="flex flex-wrap py-2">
          {categories?.map((c, index) =>
            c ? (
              <span
                key={index}
                className="px-3 py-1 mb-2 mr-3 text-xs text-gray-600 bg-gray-100 rounded-full"
              >
                {c}
              </span>
            ) : null
          )}
        </div>
        <button
          className="px-3 py-1 text-sm underline bg-gray-100 rounded text-secondary-800 hover:text-secondary-600"
          onClick={toggle}
        >
          {showDescription ? 'Hide' : 'Read'} Item Description &raquo;
        </button>
        {showDescription
          ? description && (
            <div className="flex flex-col items-start justify-center py-2 space-y-3 text-sm">
              <PortableText value={description} />
            </div>
          )
          : null}
      </div>
      <p className={`text-xs ${inventory === 0 ? 'text-red-600' : 'text-gray-600'}`}>
        {inventory === 0 ? 'Out of stock' : `${inventory} available pieces`}
      </p>
      <div className="space-y-3">
        <div className="flex flex-row justify-between space-x-3">
          <button
            className="p-2 text-white rounded bg-primary-400 disabled:opacity-25"
            disabled={quantity === 0 || inventory === 0}
            onClick={decrease}
          >
            <MinusIcon className="w-3 h-3" />
          </button>
          <p>{quantity}x</p>
          <button
            className="p-2 text-white rounded bg-primary-400 disabled:opacity-25"
            disabled={inventory === 0 || quantity >= inventory}
            onClick={increase}
          >
            <PlusIcon className="w-3 h-3" />
          </button>
        </div>
        <button
          className="w-full py-2 text-white rounded-lg bg-primary-500 hover:bg-secondary-600 disabled:opacity-25"
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
