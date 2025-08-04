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
import { SHOP_SHIPPING_TYPE, STATUS_BG_COLOR, ORDER_STATUS, ORDER_STATUS_BG_COLOR } from '@/utils/constants';
import Image from 'next/image';
import { getOrderFeeDeadline } from '@/utils/index';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { SHOP_PAYMENT_TYPE } from '@/providers/cart'
import { calculateShippingFeeFromAddress } from '@/utils/index';
import CenteredModal from '@/components/Modal/centered-modal';
import toast from 'react-hot-toast';

const Shop = () => {
  const { data, isLoading } = usePurchases();
  const { orderData, orderDataIsLoading } = useStoreOrders();
  const [showModal, setModalVisibility] = useState(false);
  const [showModal2, setModalVisibility2] = useState(false);
  const [purchase, setPurchase] = useState(null);
  const [order, setOrder] = useState(null);
  const [sortedOrderFees, setSortedOrderFees] = useState([]);
  const [table, setTable] = useState("OLD");
  const [shippingData, setShippingData] = useState(null);
  const [showConfirmChange, setShowConfirmChange] = useState(false);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isUpdatingPaymentStatus, setIsUpdatingPaymentStatus] = useState(false);

  const getItemCountFromOrder = (order) => {
    const items = order.transaction?.purchaseHistory?.orderItems || [];
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  const toggleConfirmChangeModal = () => {
    setShowConfirmChange(!showConfirmChange);
  };

  const processOrders = (orders) => {
    // Filter for orders where `order === 0`
    const filteredOrders = orders?.filter((o) => o.order === 0);

    // Map results with item count and shipping fee
    return filteredOrders?.map((order) => {
      const address = order.transaction?.purchaseHistory?.deliveryAddress ?? '';
      const itemCount = getItemCountFromOrder(order);

      // Calculate shipping fee based on the actual shipping type stored in the database
      const shippingType = order.transaction?.purchaseHistory?.shippingType;
      let shippingFee = 0;

      if (shippingType === 'WITHIN_CEBU') {
        // For Within Cebu, we need to determine the specific city rate
        const lowerAddress = address.toLowerCase();
        const cebuRates = {
          'mandaue city': 130,
          'consolacion': 140,
          'lapu-lapu city': 150,
          'cebu city': 160,
          'talisay city': 170,
          'minglanilia': 180,
          'naga city': 200,
          'compostela': 200,
        };

        for (const city in cebuRates) {
          if (lowerAddress.includes(city)) {
            shippingFee = cebuRates[city];
            break;
          }
        }

        // Default to Cebu City rate if no specific city found
        if (shippingFee === 0) {
          shippingFee = 160;
        }
      } else if (shippingType === 'NCR') {
        shippingFee = itemCount >= 25 ? 500 : itemCount >= 10 ? 400 : 300;
      } else if (shippingType === 'NORTH_LUZON') {
        shippingFee = itemCount >= 25 ? 500 : itemCount >= 10 ? 400 : 300;
      } else if (shippingType === 'SOUTH_LUZON') {
        shippingFee = itemCount >= 25 ? 500 : itemCount >= 10 ? 400 : 300;
      } else if (shippingType === 'VISAYAS') {
        shippingFee = itemCount >= 25 ? 500 : itemCount >= 10 ? 400 : 300;
      } else if (shippingType === 'MINDANAO') {
        shippingFee = itemCount >= 25 ? 500 : itemCount >= 10 ? 400 : 300;
      } else if (shippingType === 'ISLANDER') {
        shippingFee = itemCount >= 25 ? 500 : itemCount >= 10 ? 400 : 300;
      } else if (shippingType === 'PICK_UP') {
        shippingFee = 0;
      }

      return {
        orderCode: order.orderCode,
        itemCount,
        shippingFee,
        deliveryAddress: address,
      };
    });
  };

  useEffect(() => {
    if (order) {
      const result = processOrders(order); // assuming this returns data
      setShippingData(result);
    }
  }, [order]);

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

  const cancelOrder = async () => {
    try {
      setIsUpdatingOrder(true);
      const res = await fetch('/api/shop', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patch: 'cancel',
          order, // your full order array/object with order.order === 0 inside
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsUpdatingOrder(false)
        toast.success('Order Cancelled');
        toggleConfirmChangeModal()
        toggleModal2()
      } else {
        toast.error(`Error cancelling order: ${data.errors?.error?.msg}`);
        console.error('Error cancelling order:', data.errors?.error?.msg || data);
        setIsUpdatingOrder(false)
      }
    } catch (err) {
      toast.error(`Error cancelling order: ${err}`);
      setIsUpdatingOrder(false)
    }
  };

  const viewPaymentDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowPaymentDetails(true);
  };

  const togglePaymentDetailsModal = () => {
    setShowPaymentDetails(!showPaymentDetails);
    if (!showPaymentDetails) {
      setSelectedTransaction(null);
    }
  };

  const updatePaymentStatus = async () => {
    if (!selectedTransaction) return;

    try {
      setIsUpdatingPaymentStatus(true);
      const response = await fetch('/api/admin/transactions/update-payment-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: selectedTransaction.transactionId,
          paymentStatus: 'S'
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Payment status updated successfully!');
        togglePaymentDetailsModal();
        // Refresh the data
        window.location.reload();
      } else {
        toast.error(`Error updating payment status: ${data.errors?.error?.msg}`);
      }
    } catch (error) {
      toast.error('Failed to update payment status');
    } finally {
      setIsUpdatingPaymentStatus(false);
    }
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
                      Shipping Type:{' '}
                      <span className="text-xs text-gray-400">
                        {SHOP_SHIPPING_TYPE[orderDetails?.transaction.purchaseHistory.shippingType]}
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
                      order
                        .filter(order => order.order === 0)
                        .flatMap(orderDetails => orderDetails.transaction.purchaseHistory.orderItems)
                        .reduce((sum, item) => sum + Number(item.totalPrice), 0) * 0.10 // Just the 10% interest
                    )}
                  </h5>
                </div>
                {order
                  .filter(order => order.order === 0)
                  .some(orderDetails => orderDetails?.transaction?.purchaseHistory?.shippingType !== 'PICK_UP') && (
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-left">Delivery Fee</h4>
                      <h5 className="font-bold text-right text-green-600">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'PHP',
                        }).format(shippingData?.[0]?.shippingFee)}
                      </h5>
                    </div>
                  )}
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
                {order
                  .filter(order => order.order === 0)
                  .some(orderDetails => orderDetails?.transaction?.purchaseHistory?.shippingType !== 'PICK_UP') && (
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-left">Delivery Fee</h4>
                      <h5 className="font-bold text-right text-green-600">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'PHP',
                        }).format(shippingData?.[0]?.shippingFee || 0)}
                      </h5>
                    </div>
                  )}
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

                      <div className='flex items-center justify-between w-full'>
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

                        {/* View Payment Details Button */}
                        <button
                          onClick={() => viewPaymentDetails(feeWrapper.transaction)}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          View Payment Details
                        </button>
                      </div>
                    </div>
                    <hr className="border-1 border-dashed border-gray-600" />

                  </>

                ))}
              <div className="flex flex-col p-3 space-y-2">
                {order[0].orderStatus !== 'Cancelled' && (
                  <button
                    className="px-3 py-1 my-1 text-white rounded bg-red-600 hover:bg-red-400"
                    onClick={() => {
                      //deleteStudentRecord(studentId, inviteCode);
                      toggleConfirmChangeModal()
                    }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </SideModal>
      )}
      {order && showConfirmChange === true && (
        <CenteredModal
          show={showConfirmChange}
          toggle={toggleConfirmChangeModal}
          title="Confirm Cancel"
        >
          <div>
            <p className="py-1">You are about to Cencel <b>{order[0].orderCode}</b>.</p>
            <p className="mt-5">This order's transaction(s) and the inventory will be updated.</p>
            <p className="mt-5">Please note that the changes may not be undone.</p>
            <p className="mt-5">Do you wish to proceed?</p>
          </div>
          <div className="w-full flex justify-end">
            <button
              className="px-3 py-1 text-white text-base text-center rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
              disabled={isUpdatingOrder}
              onClick={() => cancelOrder()}
              style={{ marginRight: '0.5rem' }}
            >
              Yes
            </button>
            <button
              className="px-3 py-1 text-white text-base text-center rounded bg-gray-500 hover:bg-gray-400 disabled:opacity-25"
              disabled={isUpdatingOrder}
              onClick={toggleConfirmChangeModal}
            >
              No
            </button>
          </div>
        </CenteredModal>
      )}

      {/* Payment Details Modal */}
      {selectedTransaction && (
        <CenteredModal
          show={showPaymentDetails}
          toggle={togglePaymentDetailsModal}
          title="Payment Details"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Transaction Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Transaction ID:</span>
                  <span className="font-mono">{selectedTransaction.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Reference Number:</span>
                  <span className="font-mono">{selectedTransaction.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Amount:</span>
                  <span className="font-bold text-green-600">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'PHP',
                    }).format(selectedTransaction.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Payment Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_BG_COLOR[selectedTransaction.paymentStatus]}`}>
                    {STATUS_CODES[selectedTransaction.paymentStatus]}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Proof Section */}
            {selectedTransaction.paymentProofLink ? (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Payment Proof</h4>
                <div className="space-y-3">
                  <div className="relative w-full h-64">
                    <Image
                      src={selectedTransaction.paymentProofLink}
                      alt="Payment Proof"
                      layout="fill"
                      objectFit="contain"
                      className="rounded border"
                    />
                  </div>
                  <a
                    href={selectedTransaction.paymentProofLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    View Full Size
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Payment Proof</h4>
                <p className="text-sm text-yellow-700">No payment proof uploaded yet.</p>
              </div>
            )}

            {/* Update Payment Status Section */}
            {selectedTransaction.paymentStatus !== 'S' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Update Payment Status</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Mark this payment as successful after verifying the payment proof.
                </p>
                <button
                  onClick={updatePaymentStatus}
                  disabled={isUpdatingPaymentStatus}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdatingPaymentStatus ? 'Updating...' : 'Mark as Paid'}
                </button>
              </div>
            )}

            {selectedTransaction.paymentStatus === 'S' && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Payment Status</h4>
                <p className="text-sm text-green-700">This payment has been marked as successful.</p>
              </div>
            )}
          </div>
        </CenteredModal>
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
                      <th className="p-2 font-medium text-right">Status</th>
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
                            <td className="p-2 text-right">
                              {order[0].orderStatus === null ? ' '
                                :
                                <>
                                  <h4 className="flex space-x-3">
                                    <span className={`rounded-full py-0.5 text-xs px-2 ${ORDER_STATUS_BG_COLOR[order[0].orderStatus]}`}>
                                      {ORDER_STATUS[order[0].orderStatus]}
                                    </span>
                                  </h4>
                                </>
                              }
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
