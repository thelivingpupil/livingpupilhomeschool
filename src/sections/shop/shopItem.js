import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronDownIcon,
  MinusIcon,
  PlusIcon,
  XIcon,
} from '@heroicons/react/outline';
import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import crypto from 'crypto';

import sanityClient from '@/lib/server/sanity';
import { useEffect, useState } from 'react';
import { SHOP_SHIPPING, useCartContext } from '@/providers/cart';
import Modal from '@/components/Modal';
import useUser from '@/hooks/data/useUser';

const imageBuilder = imageUrlBuilder(sanityClient);

const ShopItem = ({ item }) => {
  const { data } = useUser();
  const {
    cart,
    total,
    deliveryAddress,
    contactNumber,
    shippingFee,
    setContactNumber,
    setDeliveryAddress,
    setShippingFee,
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
  }, [data]);

  const imageAsset = imageBuilder.image(item?.image?.asset);

  const [quantity, setQuantity] = useState(0);

  const decrease = () => setQuantity((state) => state - 1);
  const increase = () => setQuantity((state) => state + 1);

  const image = imageAsset?.options?.source ? imageAsset?.url() : null;

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
        <div className="container flex mx-auto space-y-10 md:space-y-0 md:space-x-10 flex-col md:flex-row">
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
            <div className="flex justify-between text-lg font-bold">
              <div>Shipping area fee</div>
              <div>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'PHP',
                }).format(shippingFee?.fee)}
              </div>
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
              <div className="pb-5">
                <p>Provided details for delivery</p>
                <p>Deliver Address: {deliveryAddress}</p>
                <p>Contact Number: {contactNumber}</p>
              </div>
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
          <div className="flex flex-col px-5 py-3 border-4 rounded-lg border-primary-500 md:hidden">
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
            <div className="flex items-center justify-between">
              <p className="text-sm">{cart.length} item(s) in cart</p>
              <button
                className="px-5 py-2 text-white rounded-lg bg-primary-500 hover:bg-secondary-600"
                disabled={
                  !cart.length ||
                  !shippingFee?.fee ||
                  !deliveryAddress ||
                  !contactNumber
                }
                onClick={toggleCartVisibility}
              >
                Review Cart
              </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row flex-1 gap-4">
            <div className="flex" style={{ flex: '0.5 1 0' }}>
              <div className="relative w-full hidden md:inline-block">
                <Image
                  name={item.name}
                  layout="responsive"
                  loading="lazy"
                  objectFit="contain"
                  style={{
                    verticalAlign: 'top',
                  }}
                  src={image || '/images/livingpupil-homeschool-logo.png'}
                />
              </div>
              <div className="relative inline-block w-full md:hidden">
                <Image
                  name={item.name}
                  loading="lazy"
                  width={700}
                  height={475}
                  sizes="100vw"
                  style={{
                    width: '100%',
                    height: 'auto',
                  }}
                  className="flex md:hidden"
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
              <div className="text-sm py-2 space-y-3 justify-center text-justify">
                <PortableText value={item.description} />
              </div>
              <div className="w-full md:w-1/4 flex flex-row mt-4">
                <button
                  className="p-2 text-white bg-primary-400 border border-primary-400 disabled:opacity-25"
                  disabled={quantity === 0}
                  onClick={decrease}
                >
                  <MinusIcon className="w-5 h-5" />
                </button>
                <div className="w-full flex items-center justify-center px-6 border border-primary-400 font-bold">
                  {quantity}
                </div>
                <button
                  className="p-2 text-white bg-primary-400 border border-primary-400 disabled:opacity-25"
                  disabled={quantity === item.inventory}
                  onClick={increase}
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="flex mt-4">
                <button
                  className="w-full md:w-1/4 py-2 text-white rounded-lg bg-primary-500 hover:bg-secondary-600 disabled:opacity-25"
                  disabled={quantity === 0}
                  onClick={() =>
                    addToCart({
                      id: item._id,
                      image,
                      code:
                        item.code ||
                        `CODE-${crypto
                          .createHash('md5')
                          .update(item.name)
                          .digest('hex')
                          .substring(0, 6)
                          .toUpperCase()}`,
                      name: item.name,
                      price: item.price,
                      quantity,
                    })
                  }
                >
                  Add to Cart
                </button>
              </div>
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
                disabled={
                  !cart.length ||
                  !shippingFee?.fee ||
                  !deliveryAddress ||
                  !contactNumber
                }
                onClick={toggleCartVisibility}
              >
                Review Shopping Cart
              </button>
              <button
                className="py-2 text-lg bg-gray-200 rounded hover:bg-gray-100 disabled:opacity-25"
                disabled={!cart.length}
                onClick={() => clearCart()}
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

export default ShopItem;
