import { useEffect, useMemo, useState } from 'react';
import { ChevronDownIcon, XIcon } from '@heroicons/react/outline';
import imageUrlBuilder from '@sanity/image-url';
import crypto from 'crypto';
import debounce from 'lodash.debounce';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/client/firebase';

import Modal from '@/components/Modal';
import Item from '@/components/Shop/item';

import sanityClient from '@/lib/server/sanity';
import { SHOP_SHIPPING, useCartContext, SHOP_PAYMENT_TYPE } from '@/providers/cart';
import useUser from '@/hooks/data/useUser';
import SignatureCanvas from 'react-signature-canvas';

const builder = imageUrlBuilder(sanityClient);

const CebuLocations = {
  'Liloan': 130,
  'Mandaue City': 130,
  'Consolation': 140,
  'Lapu-Lapu City': 150,
  'Cebu City': 160,
  'Talisay City': 170,
  'Minglanilia': 180,
  'Naga City': 200,
  'Compostela': 200,
};

const Shop = ({ categories, items }) => {
  const { data } = useUser();
  const [sortBy, setSortBy] = useState('alphaAsc');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [shopItems, setShopItems] = useState(items);
  const [, setQuery] = useState('');
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);

  const {
    cart,
    total,
    shippingFee,
    deliveryAddress,
    contactNumber,
    paymentType,
    signatureProgress,
    signatureLink,
    sigCanvas,
    showSignCanvas,
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
    paymentAmount,
    totalPayment,
    checkoutCart,
    setPaymentType,
    clearSignature,
    toggleSignCanvasVisibility,
    saveSignature,
    handleEndDrawing
  } = useCartContext();

  console.log(shippingFee)

  const [cebuLocation, setCebuLocation] = useState('');
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  const handleShippingChange = (e) => {
    const selectedShipping = SHOP_SHIPPING[e.target.value];

    if (e.target.value === 'withInCebu') {
      setCebuLocation('');
    }

    setShippingFee(selectedShipping);
  };

  const handleCebuLocationChange = (e) => {
    const location = e.target.value;
    setCebuLocation(location);

    if (location) {
      const fee = CebuLocations[location] || 160; // Default to Cebu City rate if location not found
      setShippingFee((prev) => ({ ...prev, fee }));
    }
  };


  const isReviewDisabled =
    !(
      shippingFee?.value &&
      (shippingFee?.value !== 'withInCebu' || cebuLocation) &&
      SHOP_PAYMENT_TYPE[paymentType] &&
      deliveryAddress &&
      contactNumber
    );

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
    const query = e.target.value.toLowerCase(); // Convert the search query to lowercase
    setQuery(query);

    if (query !== '') {
      shopItems = [
        ...items.filter(
          (item) =>
            (categoryFilter === 'all' ||
              item?.categories?.includes(categoryFilter)) &&
            item?.name?.toLowerCase().includes(query) // Convert item name to lowercase
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

  const disableShop = false;

  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const proceed = () => {
    if (paymentType === 'INSTALLMENT') {
      toggleSignCanvasVisibility()
    }
    else {
      checkoutCart()
    }
  }

  const handlePaymentProofUpload = async () => {
    if (!paymentProofFile) return;

    setUploadingProof(true);
    try {
      // Upload file to Firebase storage
      const fileName = `payment-proof-${Date.now()}.jpg`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, paymentProofFile);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progress tracking if needed
        },
        (error) => {
          toast.error('Failed to upload payment proof');
          setUploadingProof(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          toast.success('Payment proof uploaded successfully! Please contact support with your transaction details.');
          setPaymentProofFile(null);
          setUploadingProof(false);
        }
      );
    } catch (error) {
      toast.error('Failed to upload payment proof');
      setUploadingProof(false);
    }
  };
  return (
    <>
      {disableShop ? (
        <div className="flex flex-col items-center justify-center h-screen p-5 m-auto space-y-5 md:w-1/2">
          <Image
            alt="Living Pupil Homeschool"
            src="/images/megaphone.png"
            width={550}
            height={420}
          />
          <h1 className="text-4xl font-bold text-center text-primary-500">Shop Announcement</h1>
          <p className="text-center">
            Our shop is closed today due to maintenance.
          </p>
          <p className="text-center">
            We apologize for the inconvenience and appreciate your understanding.
          </p>
          <p className="text-center">
            — The Living Pupil Homeschool Team
          </p>
        </div>
      ) : (
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
                <div className="flex justify-between text-lg font-bold">
                  <div>Payment Type</div>
                  <div>
                    {SHOP_PAYMENT_TYPE[paymentType]}
                  </div>
                </div>
                {paymentType === "INSTALLMENT" && (
                  <div className="text-sm font-normal mt-1 text-red-500">
                    {/* Replace with the actual detail you want to display */}
                    <div>Payable in 5 months with 2% monthly interest</div>
                    <hr className="border-2 border-dashed my-5" />
                  </div>
                )}
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
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="radio"
                    id="termsAccepted"
                    checked={isTermsAccepted}
                    onChange={() => setIsTermsAccepted(!isTermsAccepted)}
                    className="form-radio"
                  />
                  <label htmlFor="termsAccepted" className="text-sm">
                    I agree to the <a
                      href="/files/lp-shop-cancellation-policy.pdf" // Replace with the actual path to your PDF
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      bookshop cancellation policy.
                    </a>
                  </label>
                </div>
                <button
                  className="w-full py-2 text-lg rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25 disabled:cursor-not-allowed"
                  disabled={
                    !data ||
                    isSubmitting ||
                    !cart.length ||
                    shippingFee?.fee < 0 ||
                    !deliveryAddress ||
                    !contactNumber ||
                    !isTermsAccepted
                  }
                  onClick={proceed}
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
                show={showSignCanvas}
                title=""
                toggle={toggleSignCanvasVisibility}
              >
                <div className="flex flex-col  items-center mt-5">
                  <p className="text-center text-xs mb-3">
                    By signing, you are agreeing to the <a
                      href="/files/lp-shop-cancellation-policy.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      bookshop cancellation policy
                    </a>.
                  </p>
                  <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{
                      className: `sigCanvas bg-gray-100 border ${signatureLink ? 'border-gray-400' : 'border-red-500'}`,
                      width: 350, // Set a fixed width, adjust according to your design
                      height: 200 // Set a fixed height

                    }}
                    onEnd={handleEndDrawing}
                  />
                  <div className="flex space-x-3 mt-3">
                    <button onClick={clearSignature} className="bg-red-500 text-white px-3 py-1 rounded">
                      Clear
                    </button>
                    <button onClick={saveSignature} className="bg-blue-500 text-white px-3 py-1 rounded">
                      Save
                    </button>
                  </div>
                  <div className="w-full mt-2 rounded-full shadow bg-grey-light">
                    <div
                      className="py-0.5 text-xs leading-none text-center rounded-full bg-secondary-500"
                      style={{ width: `${signatureProgress}%` }}
                    >
                      <span className="px-3">{signatureProgress}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center space-y-3">
                    {signatureLink ? (
                      <Link href={signatureLink}>
                        <a
                          className="text-sm text-blue-600 underline"
                          target="_blank"
                        >
                          Preview Image
                        </a>
                      </Link>
                    ) : (
                      <p>No signature uploaded</p>
                    )}
                  </div>
                </div>
                <button
                  className="w-full py-2 text-lg rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25 disabled:cursor-not-allowed"
                  disabled={
                    !data ||
                    isSubmitting ||
                    !cart.length ||
                    shippingFee?.fee < 0 ||
                    !deliveryAddress ||
                    !contactNumber ||
                    !isTermsAccepted
                    //!signatureLink
                  }
                  onClick={checkoutCart}
                >
                  {isSubmitting ? 'Processing...' : 'Proceed Checkout'}
                </button>
              </Modal>
              <Modal
                show={showPaymentLink}
                title="Payment Options"
                toggle={togglePaymentLinkVisibility}
              >
                <div className="space-y-6">
                  <div className="text-center bg-green-50 p-4 rounded-lg border-2 border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      {(paymentType || 'FULL_PAYMENT') === 'INSTALLMENT' ? 'First Installment Amount' : 'Total Payment Amount'}
                    </h3>
                    <div className="text-3xl font-bold text-green-600">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'PHP',
                      }).format(paymentAmount || total)}
                    </div>
                    {(paymentType || 'FULL_PAYMENT') === 'INSTALLMENT' && totalPayment > 0 && (
                      <div className="text-sm text-gray-600 mt-2">
                        Total: {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'PHP',
                        }).format(totalPayment)} (5 installments)
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Union Bank Option */}
                    <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
                      <div className="text-center mb-4">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FF7F00' }}>
                            <span className="text-white text-lg font-bold">UB</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">Union Bank</h3>
                      </div>



                      <div className="mt-4 text-center">
                        <img
                          src="/files/qr/ub_qr.jpg"
                          alt="Union Bank QR Code"
                          className="w-64 h-64 mx-auto border border-gray-300 rounded"
                        />
                        <div className="mt-2 space-y-2">
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = '/files/qr/ub_qr.jpg';
                              link.download = 'union-bank-qr.jpg';
                              link.click();
                            }}
                            className="w-full py-2 px-3 text-white rounded hover:bg-orange-600 transition-colors text-sm"
                            style={{ backgroundColor: '#FF7F00' }}
                          >
                            Download QR Code
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* GCash Option */}
                    <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-500 transition-colors">
                      <div className="text-center mb-4">
                        <div className="flex items-center justify-center mb-2">
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3B82F6' }}>
                            <span className="text-white text-lg font-bold">GC</span>
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800">GCash</h3>
                      </div>



                      <div className="mt-4 text-center">
                        <img
                          src="/files/qr/gcash_qr.png"
                          alt="GCash QR Code"
                          className="w-full h-64 mx-auto border border-gray-300 rounded object-contain"
                        />
                        <div className="mt-2 space-y-2">
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = '/files/qr/gcash_qr.png';
                              link.download = 'gcash-qr.png';
                              link.click();
                            }}
                            className="w-full py-2 px-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                          >
                            Download QR Code
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Payment Instructions:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                      <li>Choose your preferred payment method (Union Bank or GCash)</li>
                      <li>Scan the QR code or transfer the exact amount</li>
                      <li>Use your transaction reference number as payment description</li>
                      <li>Keep your payment receipt for verification</li>
                      <li>Upload your proof of payment using the form below</li>
                      <li>Payment will be verified within 24-48 hours</li>
                    </ol>
                  </div>

                  {/* Payment Proof Upload */}
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Upload Payment Proof</h4>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPaymentProofFile(e.target.files[0])}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                      {paymentProofFile && (
                        <div className="text-sm text-green-600">
                          ✓ {paymentProofFile.name} selected
                        </div>
                      )}
                      <button
                        onClick={handlePaymentProofUpload}
                        disabled={!paymentProofFile || uploadingProof}
                        className="w-full py-2 px-4 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {uploadingProof ? 'Uploading...' : 'Upload Payment Proof'}
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={togglePaymentLinkVisibility}
                      className="flex-1 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Modal>
              <div className="flex flex-col px-5 py-3 border-4 space-y-5 rounded-lg border-primary-500 md:hidden">
                <div className="flex flex-col text-sm">
                  <div>Please select a shipping area:</div>
                  <div className="flex flex-row mb-5 text-sm">
                    <div className="relative inline-block w-full rounded border">
                      <select
                        className="w-full px-3 py-2 capitalize rounded appearance-none"
                        onChange={(e) => setShippingFee(SHOP_SHIPPING[e.target.value])}
                        value={shippingFee?.value || ''}
                      >
                        <option value="">-</option>
                        {Object.entries(SHOP_SHIPPING).map(([value, { title, fee }]) => (
                          <option key={value} value={value}>
                            {title}
                            {value !== 'withInCebu' &&
                              ` ${typeof fee === 'function'
                                ? new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'PHP',
                                }).format(fee(itemCount))
                                : new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'PHP',
                                }).format(fee)
                              }`}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronDownIcon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>


                  {/* Secondary Cebu Location Selection */}
                  {shippingFee?.value === 'withInCebu' && (
                    <div className="flex flex-col text-sm">
                      <div>Please select a location within Cebu:</div>
                      <div className="flex flex-row">
                        <div className="relative inline-block w-full rounded border">
                          <select
                            className="w-full px-3 py-2 capitalize rounded appearance-none"
                            onChange={handleCebuLocationChange}
                            value={cebuLocation}
                          >
                            <option value="">Select a location</option>
                            {Object.keys(CebuLocations).map((location) => (
                              <option key={location} value={location}>
                                {location} -{" "}
                                {new Intl.NumberFormat("en-US", {
                                  style: "currency",
                                  currency: "PHP",
                                }).format(CebuLocations[location])}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <ChevronDownIcon className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col text-sm">
                  <div>Please select payment type:</div>
                  <div className="flex flex-row">
                    <div className="relative inline-block w-full rounded border">
                      <select
                        className="w-full px-3 py-2 capitalize rounded appearance-none"
                        onChange={(e) => setPaymentType(e.target.value)}
                        value={paymentType}
                      >
                        <option value="">-</option>
                        {Object.entries(SHOP_PAYMENT_TYPE).map(([key, value]) => (
                          <option key={key} value={key}>
                            {value}
                          </option>
                        ))}
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
                    className="px-5 py-2 text-white text-sm rounded-lg bg-primary-500 hover:bg-secondary-600 disabled:opacity-25 disabled:cursor-not-allowed"
                    disabled={isReviewDisabled}
                    onClick={toggleCartVisibility}
                  >
                    Review Cart
                  </button>
                </div>
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
                        { _id, code, image, name, price, categories, description, inventory },
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
                            inventory={inventory}
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
                    <div className="flex flex-row mb-5">
                      <div className="relative inline-block w-full rounded border">
                        <select
                          className="w-full px-3 py-2 capitalize rounded appearance-none"
                          onChange={(e) => setShippingFee(SHOP_SHIPPING[e.target.value])}
                          value={shippingFee?.value || ''}
                        >
                          <option value="">-</option>
                          {Object.entries(SHOP_SHIPPING).map(([value, { title, fee }]) => (
                            <option key={value} value={value}>
                              {title}
                              {value !== 'withInCebu' &&
                                ` ${typeof fee === 'function'
                                  ? new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'PHP',
                                  }).format(fee(itemCount))
                                  : new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'PHP',
                                  }).format(fee)
                                }`}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                          <ChevronDownIcon className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    {/* Secondary Cebu Location Selection */}
                    {shippingFee?.value === 'withInCebu' && (
                      <div className="flex flex-col">
                        <div>Please select a location within Cebu:</div>
                        <div className="flex flex-row">
                          <div className="relative inline-block w-full rounded border">
                            <select
                              className="w-full px-3 py-2 capitalize rounded appearance-none"
                              onChange={handleCebuLocationChange}
                              value={cebuLocation}
                            >
                              <option value="">Select a location</option>
                              {Object.keys(CebuLocations).map((location) => (
                                <option key={location} value={location}>
                                  {location} -{" "}
                                  {new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "PHP",
                                  }).format(CebuLocations[location])}

                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                              <ChevronDownIcon className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col text-lg">
                    <div>Please select payment type:</div>
                    <div className="flex flex-row">
                      <div className="relative inline-block w-full rounded border">
                        <select
                          className="w-full px-3 py-2 capitalize rounded appearance-none"
                          onChange={(e) => setPaymentType(e.target.value)}
                          value={paymentType}
                        >
                          <option value="">-</option>
                          {Object.entries(SHOP_PAYMENT_TYPE).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value}
                            </option>
                          ))}
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
                  {!data ? (
                    <Link href="/auth/login">
                      <a
                        className="inline-block w-full py-2 text-lg text-center text-white bg-gray-500 rounded hover:bg-gray-400"
                        target="_blank"
                      >
                        Sign In to Review Cart
                      </a>
                    </Link>
                  ) : (
                    <button
                      className="py-2 text-lg rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
                      disabled={isReviewDisabled}
                      onClick={toggleCartVisibility}
                    >
                      Review Shopping Cart
                    </button>
                  )}
                  <button
                    className="py-2 text-lg bg-gray-200 rounded hover:bg-gray-100 disabled:opacity-25"
                    disabled={!cart.length}
                    onClick={clearCart}
                  >
                    Clear Shopping Cart
                  </button>
                </div>
              </div>
            </div>
          </section>
        </>
      )
      }
    </>

  );
};

export default Shop;
