import { useEffect, useMemo, useState } from 'react';
import { ChevronDownIcon, XIcon } from '@heroicons/react/outline';
import imageUrlBuilder from '@sanity/image-url';
import crypto from 'crypto';
import debounce from 'lodash.debounce';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

import Modal from '@/components/Modal';
import Item from '@/components/Shop/item';
import api from '@/lib/common/api';
import sanityClient from '@/lib/server/sanity';

const builder = imageUrlBuilder(sanityClient);
const LPH_CART_KEY = 'LPHCART';

const Shop = ({ categories, items }) => {
  const { data } = useSession();
  const [sortBy, setSortBy] = useState('alphaAsc');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isSubmitting, setSubmittingState] = useState(false);
  const [showCart, setCartVisibility] = useState(false);
  const [showPaymentLink, setPaymentLinkVisibility] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [total, setTotal] = useState(0);
  const [shopItems, setShopItems] = useState(items);
  const [cart, setCart] = useState([]);
  const [, setQuery] = useState('');

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

  const checkout = () => {
    setSubmittingState(true);
    api('/api/shop', {
      body: { items: cart },
      method: 'POST',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        toggleCart();
        setPaymentLink(response.data.paymentLink);
        togglePaymentLink();
        setCart([]);
        computeTotal([]);
        localStorage.setItem(LPH_CART_KEY, JSON.stringify([]));
        toast.success('Posted items for purchase!');
      }
    });
  };

  const clear = () => {
    setCart([]);
    computeTotal([]);
  };

  const computeTotal = (cart) => {
    const total = cart.reduce((a, b) => a + b.price * b.quantity, 0);
    setTotal(total);
  };

  const onChangeFilter = (e) => {
    const category = e.target.value;
    setCategoryFilter(category);
    setQuery('');

    if (category !== 'all') {
      shopItems = [
        ...items.filter((item) => item?.categories?.includes(category)),
      ];
    } else {
      shopItems = [...items];
    }

    handleSort(sortBy);
  };

  const onSort = (e) => {
    const sortBy = e.target.value;
    setSortBy(sortBy);
    handleSort(sortBy);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setQuery(query);

    if (query !== '') {
      shopItems = [
        ...items.filter(
          (item) =>
            (categoryFilter === 'all' ||
              item?.categories?.includes(categoryFilter)) &&
            item?.name?.toLowerCase().includes(query)
        ),
      ];
    } else {
      shopItems = [...items];
    }

    handleSort(sortBy);
  };

  const handleSort = (sortBy) => {
    let sort = (a, b) => {
      const first = a.name.toUpperCase();
      const second = b.name.toUpperCase();
      let comparison = 0;

      if (first > second) {
        comparison = 1;
      } else if (first < second) {
        comparison = -1;
      }

      return comparison;
    };

    switch (sortBy) {
      case 'alphaDesc': {
        sort = (a, b) => {
          const first = b.name.toUpperCase();
          const second = a.name.toUpperCase();
          let comparison = 0;

          if (first > second) {
            comparison = 1;
          } else if (first < second) {
            comparison = -1;
          }

          return comparison;
        };
        break;
      }
      case 'priceDesc': {
        sort = (a, b) => b.price - a.price;
        break;
      }
      case 'priceAsc': {
        sort = (a, b) => a.price - b.price;
        break;
      }
    }

    shopItems.sort(sort);
    setShopItems([...shopItems]);
  };

  const removeFromCart = (index) => {
    cart.splice(index, 1);
    setCart([...cart]);
    computeTotal(cart);
    localStorage.setItem(LPH_CART_KEY, JSON.stringify(cart));
  };

  const toggleCart = () => setCartVisibility(!showCart);

  const togglePaymentLink = () => setPaymentLinkVisibility(!showPaymentLink);

  const debouncedChangeHandler = useMemo(
    () => debounce(handleSearch, 300),
    [items, categories]
  );

  useEffect(() => {
    localStorage.clear();
    const items = JSON.parse(localStorage.getItem(LPH_CART_KEY));

    if (items) {
      setCart([...items]);
      computeTotal(items);
    }

    return () => {
      debouncedChangeHandler.cancel();
    };
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
                            src={
                              image || '/images/livingpupil-homeschool-logo.png'
                            }
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
              <div className="text-xs">
                <p>
                  Please be informed of the following expiry time of each
                  transaction:
                </p>
                <ul className="px-5 list-disc">
                  <li>
                    Online Banking - <strong>1 hour</strong>
                  </li>
                  <li>
                    OTC (Bank and Non-Bank) - <strong>2 days</strong>
                  </li>
                </ul>
                <p>
                  The payment link will expire beyond the allocated transaction
                  allowance.
                </p>
                <p>
                  If the link is expired, you will be required to send another
                  checkout request.
                </p>
              </div>
              <button
                className="w-full py-2 text-lg rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-50"
                disabled={!data || isSubmitting}
                onClick={checkout}
              >
                {isSubmitting ? 'Processing...' : 'Checkout'}
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
            <Modal
              show={showPaymentLink}
              title="Go To Payment Link"
              toggle={togglePaymentLink}
            >
              <p>You may view your purchase history in your account profile.</p>
              <Link href={paymentLink}>
                <a
                  className="inline-block w-full px-3 py-2 text-lg text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-50"
                  target="_blank"
                >
                  Pay Now
                </a>
              </Link>
            </Modal>
          </div>
          <div className="w-full space-y-5 md:w-2/3">
            <div className="flex space-x-5 space-between">
              <div className="relative inline-block w-1/2 border rounded">
                <select
                  className="w-full py-2 pl-3 pr-10 capitalize rounded appearance-none"
                  onChange={onSort}
                  value={sortBy}
                >
                  <option value="alphaAsc">
                    Sort Alphabetical: A &rarr; Z
                  </option>
                  <option value="alphaDesc">
                    Sort Alphabetical: Z &rarr; A
                  </option>
                  <option value="priceAsc">Sort Price: Low &rarr; High</option>
                  <option value="priceDesc">Sort Price: High &rarr; Low</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDownIcon className="w-5 h-5" />
                </div>
              </div>
              <div className="relative inline-block w-1/2 border rounded">
                <select
                  className="w-full py-2 pl-3 pr-10 capitalize rounded appearance-none"
                  onChange={onChangeFilter}
                  value={categoryFilter}
                >
                  <option value="all">All Categories</option>
                  {categories.map((c, index) => (
                    <option key={index} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <ChevronDownIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div className="flex space-x-5 space-between">
              <input
                className="w-full py-2 pl-3 border rounded"
                onChange={debouncedChangeHandler}
                placeholder="Looking for something?"
              />
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {shopItems ? (
                shopItems.map(
                  (
                    { _id, code, image, name, price, categories, description },
                    index
                  ) => {
                    const imageAsset = builder.image(image?.asset);
                    return price ? (
                      <Item
                        key={index}
                        id={_id}
                        addToCart={addToCart}
                        categories={categories}
                        code={
                          code ||
                          `CODE-${crypto
                            .createHash('md5')
                            .update(name)
                            .digest('hex')
                            .substring(0, 6)
                            .toUpperCase()}`
                        }
                        count={cart.find((x) => x.id === _id)?.quantity || 0}
                        description={description}
                        image={
                          imageAsset.options.source ? imageAsset?.url() : null
                        }
                        name={name}
                        price={price}
                      />
                    ) : null;
                  }
                )
              ) : (
                <div>No items in store...</div>
              )}
            </div>
          </div>
          <div className="w-1/4">
            <div className="sticky flex-col justify-between hidden p-5 space-y-5 border-4 rounded-lg md:flex border-primary-500">
              <h2 className="text-3xl font-bold">Shopping Cart</h2>
              <div className="flex flex-col items-start justify-between w-full h-full space-y-3">
                {cart.length ? (
                  cart.map(({ image, name, price, quantity }, index) => {
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
                            src={
                              image || '/images/livingpupil-homeschool-logo.png'
                            }
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
                            className="w-5 h-5 p-2 hover:text-red-500"
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
                className="py-2 text-lg rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-50"
                disabled={total === 0}
                onClick={toggleCart}
              >
                Review Shopping Cart
              </button>
              <button
                className="py-2 text-lg bg-gray-200 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={cart.length === 0}
                onClick={clear}
              >
                Clear Shopping Cart
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Shop;
