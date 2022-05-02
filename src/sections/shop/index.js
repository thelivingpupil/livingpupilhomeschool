import { useEffect, useState } from 'react';
import imageUrlBuilder from '@sanity/image-url';
import Link from 'next/link';

import sanityClient from '@/lib/server/sanity';
import Image from 'next/image';
import { XIcon } from '@heroicons/react/outline';

const builder = imageUrlBuilder(sanityClient);
const LPH_CART_KEY = 'LPHCART';

const Shop = ({ items }) => {
  const [total, setTotal] = useState(0);
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    cart.push(item);
    setCart([...cart]);
    computeTotal(cart);
    localStorage.setItem(LPH_CART_KEY, JSON.stringify(cart));
  };

  const computeTotal = (cart) => {
    const total = cart.reduce((a, b) => a + b.price, 0);
    setTotal(total);
  };

  const removeFromCart = (index) => {
    cart.splice(index, 1);
    setCart([...cart]);
    computeTotal(cart);
    localStorage.setItem(LPH_CART_KEY, JSON.stringify(cart));
  };

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem(LPH_CART_KEY));

    if (items) {
      setCart([...items]);
      computeTotal(items);
    }
  }, []);

  return (
    <section className="px-5 py-10 md:px-0">
      <div className="container flex flex-row mx-auto space-x-10">
        <div className="grid w-2/3 grid-cols-3 gap-5">
          {items ? (
            items.map(({ slug, image, name, price }, index) => {
              const imageAsset = builder.image(image.asset);
              return (
                <div key={index}>
                  <div className="p-3 space-y-5 border rounded-lg hover:shadow-xl">
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
                    <button
                      className="w-full py-2 text-white rounded-lg bg-primary-500 hover:bg-secondary-600"
                      onClick={() => addToCart({ image, name, price })}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div>Your cart is empty</div>
          )}
        </div>
        <div className="flex flex-col justify-between w-1/3 p-5 space-y-5 border-4 rounded-lg border-primary-500">
          <h2 className="text-3xl font-bold">Shopping Cart</h2>
          <div className="flex flex-col items-start justify-between w-full h-full space-y-3">
            {cart.map(({ image, name, price }, index) => {
              const imageAsset = builder.image(image.asset);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <Image
                      width={30}
                      height={30}
                      objectFit="cover"
                      src={imageAsset.url()}
                    />
                    <p className="font-bold">{name}</p>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <span>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'PHP',
                      }).format(price)}
                    </span>
                    <button
                      className="hover:text-red-500"
                      onClick={() => removeFromCart(index)}
                    >
                      <XIcon className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <hr className="border-2 border-dashed" />
          <div className="flex justify-between text-2xl font-bold">
            <div>Total</div>
            <div>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PHP',
              }).format(total)}
            </div>
          </div>
          <button className="py-2 text-lg rounded bg-secondary-500 hover:bg-secondary-400">
            Checkout
          </button>
        </div>
      </div>
    </section>
  );
};

export default Shop;
