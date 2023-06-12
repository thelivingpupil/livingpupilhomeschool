import { useEffect, useMemo, useState } from 'react';
import { ChevronDownIcon, XIcon } from '@heroicons/react/outline';
import imageUrlBuilder from '@sanity/image-url';
import crypto from 'crypto';
import debounce from 'lodash.debounce';
import Image from 'next/image';
import Link from 'next/link';

import Modal from '@/components/Modal';
import Item from '@/components/Shop/item';

import sanityClient from '@/lib/server/sanity';
import { SHOP_SHIPPING, useCartContext } from '@/providers/cart';
import useUser from '@/hooks/data/useUser';

const builder = imageUrlBuilder(sanityClient);

const Shop = ({ categories, items }) => {
  const { data } = useUser();

  console.log('data', data);
  const [sortBy, setSortBy] = useState('alphaAsc');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [shopItems, setShopItems] = useState(items);
  const [, setQuery] = useState('');

  const {
    cart,
    total,
    shippingFee,
    deliveryAddress,
    contactNumber,
    setShippingFee,
    setDeliveryAddress,
    setContactNumber,
    addToCart,
    removeFromCart,
    clearCart,
    showCart,
    toggleCartVisibility,
    showPaymentLink,
    togglePaymentLinkVisibility,
    isSubmitting,
    paymentLink,
    checkoutCart,
  } = useCartContext();

  useEffect(() => {
    if (!deliveryAddress || !contactNumber) {
      setDeliveryAddress(
        data?.user?.guardianInformation?.address1
          ? `${data?.user?.guardianInformation?.address1} ${data?.user?.guardianInformation?.address2}`
          : ''
      );
      setContactNumber(data?.user?.guardianInformation?.mobileNumber || '');
    }
  }, [data, deliveryAddress, contactNumber]);

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

  const debouncedChangeHandler = useMemo(
    () => debounce(handleSearch, 300),
    [items, categories]
  );

  return (
    <>
      {data && (
        <div className="flex flex-col items-center bg-primary-500">
          <div className="w-4/5 py-3 text-sm text-white bg-primary-500">
            You are signed in as:{' '}
            <span className="font-medium text-secondary-500">
              {data?.user?.email}
            </span>
          </div>
          <div className="w-4/5 py-3 text-sm text-white bg-primary-500">
            <div className="flex flex-col">
              <span className="pb-5">Shipping details provided:</span>
              <div className="flex items-center">
                Deliver Address:{' '}
                <div className="flex flex-row md:w-1/4 px-3 text-black">
                  <input
                    className="w-full px-3 py-2 border rounded"
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Delivery Address..."
                    value={deliveryAddress}
                  />
                </div>
              </div>
              <div className="flex items-center py-2">
                Contact Number:{' '}
                <div className="flex flex-row md:w-1/4 px-3 text-black">
                  <input
                    className="w-full px-3 py-2 border rounded"
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Contact Number..."
                    value={contactNumber}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <section className="px-5 py-10 md:px-0">
        <div className="container flex flex-col mx-auto space-y-10 md:flex-row md:space-y-0 md:space-x-10">
          <div className="flex items-center justify-between px-5 py-3 border-4 rounded-lg border-primary-500 md:hidden">
            <p className="text-sm">{cart.length} item(s) in cart</p>
            <button
              className="px-5 py-2 text-white rounded-lg bg-primary-500 hover:bg-secondary-600"
              onClick={toggleCartVisibility}
            >
              Review Cart
            </button>
            <Modal
              show={showCart}
              title="Review Shopping Cart"
              toggle={toggleCartVisibility}
            >
              <div className="flex flex-col items-start justify-between w-full h-full space-y-3">
                {cart.length ? (
                  cart.map(({ id, image, name, price, quantity }) => {
                    return (
                      <div
                        key={id}
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
                            onClick={() => removeFromCart(id)}
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
                className="w-full py-2 text-lg rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
                disabled={!data || isSubmitting}
                onClick={checkoutCart}
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
              toggle={togglePaymentLinkVisibility}
            >
              <p>You may view your purchase history in your account profile.</p>
              <Link href={paymentLink}>
                <a
                  className="inline-block w-full px-3 py-2 text-lg text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
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
                  cart.map(({ id, image, name, price, quantity }) => {
                    return (
                      <div
                        key={id}
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
                            onClick={() => removeFromCart(id)}
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
              <div className="flex flex-col text-lg">
                <div>Please select a shipping area:</div>
                <div className="flex flex-row">
                  <div className="relative inline-block w-full rounded border">
                    <select
                      className="w-full px-3 py-2 capitalize rounded appearance-none"
                      onChange={(e) =>
                        setShippingFee(SHOP_SHIPPING[e.target.value])
                      }
                      value={shippingFee?.value || ''}
                    >
                      <option value="">-</option>
                      {Object.entries(SHOP_SHIPPING).map(
                        ([value, { title, fee }]) => (
                          <option key={value} value={value}>
                            {title}{' '}
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'PHP',
                            }).format(fee)}
                          </option>
                        )
                      )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDownIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
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
                className="py-2 text-lg rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
                disabled={total === 0 || !shippingFee?.fee}
                onClick={toggleCartVisibility}
              >
                Review Shopping Cart
              </button>
              <button
                className="py-2 text-lg bg-gray-200 rounded hover:bg-gray-100 disabled:opacity-25"
                disabled={cart.length === 0}
                onClick={clearCart}
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
