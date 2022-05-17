import { useEffect, useState } from 'react';
import { XIcon } from '@heroicons/react/outline';
import imageUrlBuilder from '@sanity/image-url';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

import Modal from '@/components/Modal';
import sanityClient from '@/lib/server/sanity';
import Item from '@/components/Shop/item';
import Link from 'next/link';

const builder = imageUrlBuilder(sanityClient);
const LPH_CART_KEY = 'LPHCART';

const Shop = ({ items }) => {
  const { data } = useSession();
  const [showCart, setCartVisibility] = useState(false);
  const [total, setTotal] = useState(0);
  const [cart, setCart] = useState([]);

  const addToCart = (item) => {
    const index = cart.map((x) => x.id).indexOf(item.id);

    if (index === -1) {
      cart.push(item);
    }

    const cartItem = cart[index];
    cartItem = { ...item };
    cart.splice(index, 1, cartItem);
    setCart([...cart]);
    computeTotal(cart);
    localStorage.setItem(LPH_CART_KEY, JSON.stringify(cart));
  };

  const computeTotal = (cart) => {
    const total = cart.reduce((a, b) => a + b.price * b.quantity, 0);
    setTotal(total);
  };

  const removeFromCart = (index) => {
    cart.splice(index, 1);
    setCart([...cart]);
    computeTotal(cart);
    localStorage.setItem(LPH_CART_KEY, JSON.stringify(cart));
  };

  const toggleCart = () => setCartVisibility(!showCart);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem(LPH_CART_KEY));

    if (items) {
      setCart([...items]);
      computeTotal(items);
    }
  }, []);

  return (
    <>
      {data && (
        <div className="w-full py-3 text-sm text-center text-white bg-primary-500">
          You are signed in as:
          <span className="ml-2 font-medium text-secondary-500">
            {data?.user?.email}
          </span>
        </div>
      )}
      <section className="px-5 py-10 md:px-0">
        <div className="container flex flex-col mx-auto space-y-10 md:flex-row md:space-y-0 md:space-x-10">
          <div className="flex items-center justify-between px-5 py-3 border-4 rounded-lg border-primary-500 md:hidden">
            <p className="text-sm">{cart.length} item(s) in cart</p>
            <button
              className="px-5 py-2 text-white rounded-lg bg-primary-500 hover:bg-secondary-600"
              onClick={toggleCart}
            >
              Review Cart
            </button>
            <Modal
              show={showCart}
              title="Review Shopping Cart"
              toggle={toggleCart}
            >
              <div className="flex flex-col items-start justify-between w-full h-full space-y-3">
                {cart.length ? (
                  cart.map(({ image, name, price, quantity }, index) => {
                    const imageAsset = builder.image(image.asset);
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between w-full"
                      >
                        <div className="flex items-center justify-center space-x-3 text-sm">
                          <Image
                            width={30}
                            height={30}
                            objectFit="cover"
                            src={imageAsset.url()}
                          />
                          <div className="flex flex-col">
                            <p className="font-bold">{name}</p>
                            <p className="text-xs">
                              {`(${quantity}x) @
                              ${new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'PHP',
                              }).format(price)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-center space-x-3">
                          <span>
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'PHP',
                            }).format(price * quantity)}
                          </span>
                          <button
                            className="p-2 hover:text-red-500"
                            onClick={() => removeFromCart(index)}
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div>Your cart is empty</div>
                )}
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
              <button
                className="w-full py-2 text-lg rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-50"
                disabled={!data}
              >
                Checkout
              </button>
              {!data && (
                <Link href="/auth/login">
                  <a
                    className="inline-block w-full py-2 text-lg text-center text-white bg-gray-500 rounded hover:bg-gray-400"
                    target="_blank"
                  >
                    Sign In to Checkout
                  </a>
                </Link>
              )}
            </Modal>
          </div>
          <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3 md:w-2/3">
            {items ? (
              items.map(({ _id, image, name, price }, index) => {
                return (
                  <Item
                    key={index}
                    id={_id}
                    addToCart={addToCart}
                    count={cart.find((x) => x.id === _id)?.quantity || 0}
                    image={image}
                    name={name}
                    price={price}
                  />
                );
              })
            ) : (
              <div>No items in store...</div>
            )}
          </div>
          <div className="flex-col justify-between hidden w-1/3 p-5 space-y-5 border-4 rounded-lg md:flex border-primary-500">
            <h2 className="text-3xl font-bold">Shopping Cart</h2>
            <div className="flex flex-col items-start justify-between w-full h-full space-y-3">
              {cart.length ? (
                cart.map(({ image, name, price, quantity }, index) => {
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
                        <div className="flex flex-col">
                          <p className="font-bold">{name}</p>
                          <p className="text-xs">
                            {`(${quantity}x) @
                              ${new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'PHP',
                              }).format(price)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center space-x-3">
                        <span>
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'PHP',
                          }).format(price * quantity)}
                        </span>
                        <button
                          className="p-2 hover:text-red-500"
                          onClick={() => removeFromCart(index)}
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div>Your cart is empty</div>
              )}
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
            <button
              className="py-2 text-lg rounded bg-secondary-500 hover:bg-secondary-400"
              onClick={toggleCart}
            >
              Review Shopping Cart
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Shop;
