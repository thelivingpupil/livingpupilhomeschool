import { useState, useEffect } from 'react';
import crypto from 'crypto';
import { TransactionStatus } from '@prisma/client';
import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import { usePurchases, useStoreOrders } from '@/hooks/data';
import Card from '@/components/Card';
import formatDistance from 'date-fns/formatDistance';
import { STATUS_CODES } from '@/lib/server/dragonpay';
import { SHOP_SHIPPING_TYPE, STATUS_BG_COLOR } from '@/utils/constants';
import Image from 'next/image';
import { getOrderFeeDeadline } from '@/utils/index';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { SHOP_PAYMENT_TYPE } from '@/providers/cart'

const Shop = () => {
  const { data, isLoading } = usePurchases();
  const { orderData, orderDataIsLoading } = useStoreOrders();
  const [showModal, setModalVisibility] = useState(false);
  const [showModal2, setModalVisibility2] = useState(false);
  const [purchase, setPurchase] = useState(null);
  const [order, setOrder] = useState(null);
  const [sortedOrderFees, setSortedOrderFees] = useState([]);
  const [table, setTable] = useState("OLD");

  useEffect(() => {
    if (!orderDataIsLoading && orderData?.data?.orders) {
      const groupAndSortOrderFees = (orders) => {
        // Group by orderCode
        const grouped = orders.reduce((acc, order) => {
          if (!acc[order.orderCode]) {
            acc[order.orderCode] = [];
          }
          acc[order.orderCode].push(order);
          return acc;
        }, {});

        // Sort items within each group by orderNumber
        for (const key in grouped) {
          grouped[key].sort((a, b) => a.orderNumber - b.orderNumber);
        }

        // Convert the grouped object into an array of arrays
        const groupedArray = Object.values(grouped);

        return groupedArray;
      };

      // Use the function and store the result in the state
      const sortedFees = groupAndSortOrderFees(orderData.data.orders);
      setSortedOrderFees(sortedFees); // Store sorted fees in state
    }
  }, [orderDataIsLoading, orderData]);



  const toggleModal = () => setModalVisibility(!showModal);
  const toggleModal2 = () => setModalVisibility2(!showModal2);

  const view = (purchase) => {
    toggleModal();
    setPurchase(purchase);
  };
  const view2 = (order) => {
    toggleModal2();
    setOrder(order);
  };

  return (
    <AdminLayout>
      <Meta title="Living Pupil Homeschool - Students List" />
      {purchase && (
        <SideModal
          title={`Order #${crypto
            .createHash('md5')
            .update(purchase.id)
            .digest('hex')
            .substring(0, 6)}`}
          show={showModal}
          toggle={toggleModal}
        >
          <div className="space-y-5">
            <div className="flex flex-col">
              <h4 className="text-xl font-medium text-primary-500">
                Ordered {purchase.orderItems.length} Item(s)
              </h4>
              <h5 className="font-medium">
                Purchased by:{' '}
                <span className="text-xs text-gray-400">
                  {purchase.transaction.user.guardianInformation
                    ? purchase.transaction.user.guardianInformation
                      .primaryGuardianName
                    : ''}{' '}
                  - {purchase.transaction.user.email}
                </span>
              </h5>
              <h5 className="font-medium">
                Delivery Address:{' '}
                <span className="text-xs text-gray-400">
                  {purchase.transaction.user.guardianInformation
                    ? `${purchase.transaction.user.guardianInformation.address1} ${purchase.transaction.user.guardianInformation.address2}`
                    : 'Not provided by guardian'}
                </span>
              </h5>
              <h5 className="font-medium">
                Contact Information:{' '}
                <span className="text-xs text-gray-400">
                  {purchase.transaction.user.guardianInformation
                    ? `${purchase.transaction.user.guardianInformation.mobileNumber}`
                    : 'Not provided by guardian'}
                </span>
              </h5>
            </div>
            {purchase.orderItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center p-3 space-x-3 border rounded"
              >
                <div className="relative w-1/4 h-20">
                  <Image
                    alt={item.name}
                    layout="fill"
                    loading="lazy"
                    objectFit="contain"
                    src={
                      item.image || '/images/livingpupil-homeschool-logo.png'
                    }
                  />
                </div>
                <div>
                  <h3 className="font-medium text-primary-500">
                    {item.name} (x{item.quantity})
                  </h3>
                  <p className="text-xs">
                    Price:{' '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(item.basePrice)}
                  </p>
                  <p className="text-xs font-bold">
                    Subtotal:{' '}
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(item.totalPrice)}
                  </p>
                </div>
              </div>
            ))}
            <hr className="border-2 border-gray-600" />
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-left">Total</h4>
              <h5 className="font-bold text-right text-green-600">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'PHP',
                }).format(purchase.total)}
              </h5>
            </div>
          </div>
        </SideModal>
      )}
      {order && (
        <SideModal
          title={order[0].orderCode}
          show={showModal2}
          toggle={toggleModal2}
        >
          <div className="space-y-5">
            {order
              .filter(order => order.order === 0)
              .map((orderDetails, orderDeatilsIndex) => (
                <>
                  <div className="flex flex-col">
                    {/* <h4 className="text-xl font-medium text-primary-500">
                Ordered {order[0].transaction.orderItems.length} Item(s)
              </h4> */}
                    <h5 className="font-medium">
                      Purchased by:{' '}
                      <span className="text-xs text-gray-400">
                        {order[0].user.guardianInformation
                          ? order[0].user
                            .guardianInformation.primaryGuardianName
                          : order[0]?.user?.name}{' '}
                        - {order[0]?.user?.email || 'No email available'}
                      </span>
                    </h5>
                    <h5 className="font-medium">
                      Delivery Address:{' '}
                      <span className="text-xs text-gray-400">
                        {orderDetails.transaction.purchaseHistory.deliveryAddress}
                      </span>
                    </h5>
                    <h5 className="font-medium">
                      Contact Information:{' '}
                      <span className="text-xs text-gray-400">
                        {orderDetails.transaction.purchaseHistory.contactNumber
                          ? `${orderDetails.transaction.purchaseHistory.contactNumber}`
                          : 'Not provided by guardian'}
                      </span>
                    </h5>
                  </div>
                  <div
                    key={orderDeatilsIndex}
                    className="flex flex-col space-y-3"
                  >
                    <h4 className="text-xl font-medium text-primary-500">
                      Ordered {orderDetails.transaction.purchaseHistory.orderItems.length} Item(s)
                    </h4>
                    {orderDetails.transaction.purchaseHistory.orderItems.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center p-3 space-x-3 border rounded"
                      >
                        <div className="relative w-1/4 h-20">
                          <Image
                            alt={item.name}
                            layout="fill"
                            loading="lazy"
                            objectFit="contain"
                            src={
                              item.image || '/images/livingpupil-homeschool-logo.png'
                            }
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-primary-500">
                            {item.name} (x{item.quantity})
                          </h3>
                          <p className="text-xs">
                            Price:{' '}
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'PHP',
                            }).format(item.basePrice)}
                          </p>
                          <p className="text-xs font-bold">
                            Subtotal:{' '}
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'PHP',
                            }).format(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ))}
            <hr className="border-2 border-gray-600" />
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-left">Payment Type</h4>
              <h5 className="font-bold text-right">
                {SHOP_PAYMENT_TYPE[order[0].paymentType]}
              </h5>
            </div>
            {SHOP_PAYMENT_TYPE[order[0].paymentType] === "Installment" ? (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-left">Books/Merch</h4>
                  <h5 className="font-bold text-right text-green-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      order
                        .filter(order => order.order === 0)
                        .flatMap(orderDetails => orderDetails.transaction.purchaseHistory.orderItems)
                        .reduce((sum, item) => sum + Number(item.totalPrice), 0)
                    )}
                  </h5>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-left">Interest</h4>
                  <h5 className="font-bold text-right text-green-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      ((order.reduce((total, feeWrapper) => {
                        return total + (Number(feeWrapper.transaction.amount));
                      }, 0) - 100)) - (order.reduce((total, feeWrapper) => {
                        return total + (Number(feeWrapper.transaction.amount));
                      }, 0) - 100) / 1.10
                    )}
                  </h5>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-left">Delivery Fee</h4>
                  <h5 className="font-bold text-right text-green-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      ((order.reduce((total, feeWrapper) => {
                        return total + (Number(feeWrapper.transaction.amount));
                      }, 0) - 100)) // Total - Gateway fee of 100
                      -
                      (((order.reduce((total, feeWrapper) => {
                        return total + (Number(feeWrapper.transaction.amount));
                      }, 0) - 100)) - (order.reduce((total, feeWrapper) => {
                        return total + (Number(feeWrapper.transaction.amount));
                      }, 0) - 100) / 1.10 + order
                        .filter(order => order.order === 0)
                        .flatMap(orderDetails => orderDetails.transaction.purchaseHistory.orderItems)
                        .reduce((sum, item) => sum + Number(item.totalPrice), 0))
                    )}
                  </h5>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-left">Gateway Fee</h4>
                  <h5 className="font-bold text-right text-green-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(100)}
                  </h5>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-left">Books/Merch</h4>
                  <h5 className="font-bold text-right text-green-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      order
                        .filter(order => order.order === 0)
                        .flatMap(orderDetails => orderDetails.transaction.purchaseHistory.orderItems)
                        .reduce((sum, item) => sum + Number(item.totalPrice), 0)
                    )}
                  </h5>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-left">Delivery Fee</h4>
                  <h5 className="font-bold text-right text-green-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(
                      ((order.reduce((total, feeWrapper) => {
                        return total + (Number(feeWrapper.transaction.amount));
                      }, 0) - 20)) // Total - Gateway fee of 100
                      - (order
                        .filter(order => order.order === 0)
                        .flatMap(orderDetails => orderDetails.transaction.purchaseHistory.orderItems)
                        .reduce((sum, item) => sum + Number(item.totalPrice), 0))
                    )}
                  </h5>
                </div>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-left">Gateway Fee</h4>
                  <h5 className="font-bold text-right text-green-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(20)}
                  </h5>
                </div>
              </>
            )}

            <div className="flex items-center justify-between">
              <h4 className="font-medium text-left">Total</h4>
              <h5 className="font-bold text-right text-red-600">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'PHP',
                }).format(
                  order.reduce((total, feeWrapper) => {
                    return total + (Number(feeWrapper.transaction.amount));
                  }, 0)
                )}
              </h5>
            </div>
            <div className="flex flex-col space-y-4 w-full">
              <hr className="border-1 border-dashed border-gray-600" />
              {order
                .slice() // Create a copy of the array to avoid mutating the original array
                .sort((a, b) => a.order - b.order) // Sort the array based on `order` property
                .map((feeWrapper, feeIndex) => (
                  <>
                    <div key={feeIndex} className="flex items-center justify-between w-full">
                      <div className="flex flex-col items-left space-x-2">
                        <div className="flex items-center space-y-2">
                          {feeWrapper.transaction.paymentReference ? (
                            <h6 className="flex space-x-3">
                              <span className="font-mono font-bold uppercase">
                                {feeWrapper.transaction.paymentReference}
                              </span>
                              <span
                                className={`rounded-full py-0.5 text-2xs px-2 ${STATUS_BG_COLOR[
                                  feeWrapper.transaction.paymentStatus
                                ]
                                  }`}
                              >
                                {
                                  STATUS_CODES[
                                  feeWrapper.transaction.paymentStatus
                                  ]
                                }
                              </span>
                            </h6>
                          ) : (
                            <h6 className="text-xs font-bold text-gray-300">
                              -
                            </h6>
                          )}
                        </div>
                        <span className="font-mono text-2xs text-gray-400 font-bold mt-2">
                          {feeWrapper.transaction.transactionId || " "}
                        </span>
                      </div>
                      <div className='flex items-center space-x-5'>
                        <div className='flex flex-col items-center'>
                          {feeWrapper.paymentType === 'INSTALLMENT' && (
                            <>
                              <h6 className="font-bold text-sm text-center text-gray-400">
                                Payment{" #"}{feeWrapper.order + 1}
                              </h6>
                              <h6 className="font-bold text-sm text-center text-green-600">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'PHP',
                                }).format(feeWrapper.transaction.amount)}
                              </h6>
                            </>
                          )}
                          {feeWrapper.paymentType === 'FULL_PAYMENT' && (
                            <>
                              <h6 className="font-bold text-sm text-center text-green-600">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: 'PHP',
                                }).format(feeWrapper.transaction.amount)}
                              </h6>
                            </>
                          )}

                          <h6 className="font-bold text-sm text-center text-gray-400">
                            {getOrderFeeDeadline(feeWrapper.order, feeWrapper.paymentType, feeWrapper.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h6>

                        </div>

                      </div>
                    </div>
                    <hr className="border-1 border-dashed border-gray-600" />
                  </>

                ))}
            </div>
          </div>
        </SideModal>
      )}
      <Content.Title
        title="Shop Purchases"
        subtitle="View and manage all shop orders and purchases"
      />
      <Content.Divider />
      <Content.Container>
        <Card>
          <Card.Body title="Purchase Orders">
            <div>
              <div className="flex flex-col md:flex-row mb-5 md:space-x-5">
                <div className="relative inline-block w-full md:w-full lg:w-1/4 rounded border">
                  <select
                    className="w-full px-3 py-2 capitalize rounded appearance-none"
                    onChange={(e) => setTable(e.target.value)}
                    value={table}
                  >
                    <option value="OLD">Old Purchases</option>
                    <option value="NEW">New Purchases</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDownIcon className="w-5 h-5" />
                  </div>
                </div>
              </div>
              {table === "OLD" && (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-200 border-t border-b border-t-gray-300 border-b-gray-300">
                      <th className="p-2 font-medium text-left">Order Details</th>
                      <th className="p-2 font-medium text-center">
                        Shipping Area
                      </th>
                      <th className="p-2 font-medium text-center">Items</th>
                      <th className="p-2 font-medium text-center">Payment Type</th>
                      <th className="p-2 font-medium text-right">Amount</th>
                      <th className="p-2 font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!isLoading ? (
                      data ? (
                        data.purchases.map((purchase, index) => (
                          <tr
                            key={index}
                            className="text-sm border-t border-b hover:bg-gray-100 border-b-gray-300"
                          >
                            <td className="p-2 text-left">
                              <div>
                                <h4 className="flex items-center space-x-3 text-lg font-medium uppercase text-primary-500">
                                  <span>
                                    #
                                    {crypto
                                      .createHash('md5')
                                      .update(purchase.id)
                                      .digest('hex')
                                      .substring(0, 6)}
                                  </span>
                                </h4>
                                <p className="text-xs text-gray-400">
                                  Date of Order:{' '}
                                  {formatDistance(
                                    new Date(purchase.createdAt),
                                    new Date(),
                                    {
                                      addSuffix: true,
                                    }
                                  )}{' '}
                                  by{' '}
                                  <strong>
                                    {purchase.transaction.user.guardianInformation
                                      ? purchase.transaction.user
                                        .guardianInformation.primaryGuardianName
                                      : ''}{' '}
                                    - {purchase.transaction.user.email}
                                  </strong>
                                </p>
                                <p className="text-xs text-gray-400">
                                  Delivery Address:{' '}
                                  <strong>
                                    {purchase?.deliveryAddress
                                      ? purchase?.deliveryAddress
                                      : purchase.transaction.user
                                        .guardianInformation
                                        ? `${purchase.transaction.user.guardianInformation.address1} ${purchase.transaction.user.guardianInformation.address2}`
                                        : 'Not provided by guardian'}
                                  </strong>
                                </p>
                                <p className="text-xs text-gray-400">
                                  Contact Number:{' '}
                                  <strong>
                                    {purchase?.contactNumber
                                      ? purchase?.contactNumber
                                      : purchase.transaction.user
                                        .guardianInformation?.mobilenumber
                                        ? purchase.transaction.user
                                          .guardianInformation?.mobilenumber
                                        : 'Not provided by guardian'}
                                  </strong>
                                </p>
                              </div>
                            </td>
                            <td className="p-2 text-center">
                              {SHOP_SHIPPING_TYPE[purchase?.shippingType] || '-'}
                            </td>
                            <td className="p-2 text-center">
                              {purchase.orderItems.length}
                            </td>
                            <td className="p-2 text-left">
                              <div>
                                {purchase.transaction.paymentReference ? (
                                  <h4 className="flex space-x-3">
                                    <span className="font-mono font-bold uppercase">
                                      {purchase.transaction.paymentReference}
                                    </span>
                                    <span
                                      className={`rounded-full py-0.5 text-xs px-2 ${STATUS_BG_COLOR[
                                        purchase.transaction.paymentStatus
                                      ]
                                        }`}
                                    >
                                      {
                                        STATUS_CODES[
                                        purchase.transaction.paymentStatus
                                        ]
                                      }
                                    </span>
                                  </h4>
                                ) : (
                                  <h4 className="text-lg font-bold text-gray-300">
                                    -
                                  </h4>
                                )}
                                <p className="font-mono text-xs text-gray-400 lowercase">
                                  {purchase.transaction.transactionId}
                                </p>
                              </div>
                            </td>
                            <td className="p-2 text-right">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: purchase.transaction.currency,
                              }).format(purchase.transaction.amount)}
                            </td>
                            <td className="p-2 space-x-2 text-xs text-center">
                              <button
                                className="px-3 py-1 text-white rounded bg-primary-500 hover:bg-primary-400"
                                onClick={() => view(purchase)}
                              >
                                View Orders
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5}>No records found...</td>
                        </tr>
                      )
                    ) : (
                      <tr>
                        <td className="px-3 py-1 text-center" colSpan={5}>
                          Fetching records
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
              {table === "NEW" && (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-200 border-t border-b border-t-gray-300 border-b-gray-300">
                      <th className="p-2 font-medium text-left">Order Details</th>
                      <th className="p-2 font-medium text-center">
                        Shipping Area
                      </th>
                      <th className="p-2 font-medium text-center">Items</th>
                      <th className="p-2 font-medium text-center">Payment Type</th>
                      <th className="p-2 font-medium text-right">Amount</th>
                      <th className="p-2 font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!orderDataIsLoading ? (
                      sortedOrderFees ? (
                        sortedOrderFees.map((order, index) => (
                          <tr
                            key={index}
                            className="text-sm border-t border-b hover:bg-gray-100 border-b-gray-300"
                          >
                            <td className="p-2 text-left">
                              <div>
                                <h4 className="flex items-center space-x-3 text-lg font-medium uppercase text-primary-500">
                                  <span>
                                    {order[0].orderCode}
                                  </span>
                                </h4>
                                <p className="text-xs text-gray-400">
                                  Date of Order:{' '}
                                  {formatDistance(
                                    new Date(order[0].createdAt),
                                    new Date(),
                                    {
                                      addSuffix: true,
                                    }
                                  )}{' '}
                                  by{' '}
                                  <strong>
                                    {order[0].user.guardianInformation
                                      ? order[0].user
                                        .guardianInformation.primaryGuardianName
                                      : ''}{' '}
                                    - {order[0].user.email}
                                  </strong>
                                </p>
                                {order
                                  .filter(order => order.order === 0)
                                  .map((orderDetails, orderDeatilsIndex) => (
                                    <>
                                      <p className="text-xs text-gray-400">
                                        Delivery Address:{' '}
                                        <strong>
                                          {orderDetails.transaction.purchaseHistory?.deliveryAddress
                                            ? orderDetails.transaction.purchaseHistory?.deliveryAddress
                                            : orderDetails.user
                                              .guardianInformation
                                              ? `${orderDetails.user.guardianInformation.address1} ${orderDetails.user.guardianInformation.address2}`
                                              : 'Not provided by guardian'}
                                        </strong>
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        Contact Number:{' '}
                                        <strong>
                                          {orderDetails.transaction.purchaseHistory?.contactNumber
                                            ? orderDetails.transaction.purchaseHistory?.contactNumber
                                            : orderDetails.user
                                              .guardianInformation?.mobilenumber
                                              ? orderDetails.user
                                                .guardianInformation?.mobilenumber
                                              : 'Not provided by guardian'}
                                        </strong>
                                      </p>
                                    </>
                                  ))}

                              </div>
                            </td>
                            {order
                              .filter(order => order.order === 0)
                              .map((orderDetails, orderDeatilsIndex) => (
                                <>
                                  <td className="p-2 text-center">
                                    {SHOP_SHIPPING_TYPE[orderDetails?.transaction.purchaseHistory.shippingType] || '-'}
                                  </td>
                                  <td className="p-2 text-center">
                                    {orderDetails?.transaction.purchaseHistory.orderItems.length}
                                  </td>
                                </>
                              ))}
                            <td className="p-2 text-center">
                              {SHOP_PAYMENT_TYPE[order[0].paymentType]}
                            </td>
                            <td className="p-2 text-right">
                              {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'PHP',
                              }).format(
                                order.reduce((total, feeWrapper) => {
                                  return total + (Number(feeWrapper.transaction.amount));
                                }, 0)
                              )}
                            </td>

                            <td className="p-2 space-x-2 text-xs text-center">
                              <button
                                className="px-3 py-1 text-white rounded bg-primary-500 hover:bg-primary-400"
                                onClick={() => view2(order)}
                              >
                                View Orders
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5}>No records found...</td>
                        </tr>
                      )
                    ) : (
                      <tr>
                        <td className="px-3 py-1 text-center" colSpan={5}>
                          Fetching records
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Card.Body>
        </Card>
      </Content.Container>
    </AdminLayout>
  );
};

export default Shop;
