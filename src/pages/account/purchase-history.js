import { useState, useEffect } from 'react';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import { usePurchaseHistory, useOrderFees } from '@/hooks/data';
import Card from '@/components/Card';
import Link from 'next/link';
import crypto from 'crypto';
import formatDistance from 'date-fns/formatDistance';
import { STATUS_BG_COLOR } from '@/utils/constants';
import { STATUS_CODES } from '@/lib/server/dragonpay';
import Image from 'next/image';
import { TransactionStatus } from '@prisma/client';
import api from '@/lib/common/api';
import toast from 'react-hot-toast';
import { getOrderFeeDeadline } from '@/utils/index';
import { SHOP_PAYMENT_TYPE } from '@/providers/cart'
import { ChevronDownIcon } from '@heroicons/react/outline';
import Modal from '@/components/Modal';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/client/firebase';

const PurchaseHistory = () => {
  const { data, isLoading } = usePurchaseHistory();
  const { orderFeeData, orderFeeDataIsLoading } = useOrderFees();
  const [isSubmitting, setSubmittingState] = useState(false);
  const [sortedOrderFees, setSortedOrderFees] = useState([]);
  const [table, setTable] = useState("NEW");
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    // Run this effect when orderFeeDataIsLoading changes and is false
    if (!orderFeeDataIsLoading && orderFeeData?.data?.orderFees) {
      const groupAndSortOrderFees = (orderFees) => {
        // Group by orderCode
        const grouped = orderFees.reduce((acc, fee) => {
          if (!acc[fee.orderCode]) {
            acc[fee.orderCode] = [];
          }
          acc[fee.orderCode].push(fee);
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
      const { orderFee } = orderFeeData.data.orderFees;
      const sortedFees = groupAndSortOrderFees(orderFee);
      setSortedOrderFees(sortedFees); // Store sorted fees in state
    }
  }, [orderFeeDataIsLoading, orderFeeData]);

  const showBankPaymentModal = (transactionId, referenceNumber, amount, total) => {
    setSelectedTransaction({
      transactionId,
      referenceNumber,
      amount,
      total
    });
    setShowBankModal(true);
  };

  const toggleBankModal = () => {
    setShowBankModal(!showBankModal);
    if (!showBankModal) {
      setPaymentProofFile(null);
    }
  };

  const handlePaymentProofUpload = async () => {
    if (!paymentProofFile || !selectedTransaction) return;

    setUploadingProof(true);
    try {
      // Upload file to Firebase storage
      const fileName = `payment-proof-${selectedTransaction.transactionId}-${Date.now()}.jpg`;
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

          // Update transaction with payment proof link
          const response = await api('/api/transactions/payment-proof', {
            method: 'PUT',
            body: {
              transactionId: selectedTransaction.transactionId,
              paymentProofLink: downloadURL
            }
          });

          if (response.errors) {
            Object.keys(response.errors).forEach((error) =>
              toast.error(response.errors[error].msg)
            );
          } else {
            toast.success('Payment proof uploaded successfully!');
            setPaymentProofFile(null);
            toggleBankModal();
          }
          setUploadingProof(false);
        }
      );
    } catch (error) {
      toast.error('Failed to upload payment proof');
      setUploadingProof(false);
    }
  };

  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - Shop Purchases" />
      <Content.Title
        title="Shop Purchases"
        subtitle="View your order history"
      />
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
      <Content.Divider />
      {table === "OLD" && (
        <Content.Container>
          {!data?.purchaseHistory || isLoading ? (
            <Card>
              <Card.Body />
            </Card>
          ) : data?.purchaseHistory.length > 0 ? (
            data.purchaseHistory.map((purchase, index) => (
              <Card key={index}>
                <Card.Body
                  title={`Order #${crypto
                    .createHash('md5')
                    .update(purchase.id)
                    .digest('hex')
                    .substring(0, 6)
                    .toUpperCase()}`}
                  subtitle={`Date of Order: ${formatDistance(
                    new Date(purchase.createdAt),
                    new Date(),
                    {
                      addSuffix: true,
                    }
                  )}`}
                >
                  <hr />
                  {purchase.orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 space-x-5 border rounded"
                    >
                      <div className="relative w-20 h-20">
                        <Image
                          alt={item.name}
                          layout="fill"
                          loading="lazy"
                          objectFit="contain"
                          src={
                            item.image ||
                            '/images/livingpupil-homeschool-logo.png'
                          }
                        />
                      </div>
                      <div>
                        <h3 className="text-2xl font-medium text-primary-500">
                          {item.name} (x{item.quantity})
                        </h3>
                        <p>
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
                </Card.Body>
                <Card.Footer>
                  <div className="flex items-center space-x-5">
                    {purchase.transaction.paymentReference ? (
                      <h4 className="text-lg font-bold text-gray-400">
                        Payment Reference:{' '}
                        <span className="font-mono font-bold uppercase">
                          {purchase.transaction.paymentReference}
                        </span>
                      </h4>
                    ) : (
                      <h4 className="text-lg font-bold text-gray-400">
                        Payment Reference:{' '}
                        <span className="font-mono font-bold uppercase">
                          {purchase.transaction.paymentReference}
                        </span>
                      </h4>
                    )}
                    <span
                      className={`rounded-full py-0.5 text-xs px-2 ${STATUS_BG_COLOR[purchase.transaction.paymentStatus]
                        }`}
                    >
                      {STATUS_CODES[purchase.transaction.paymentStatus]}
                    </span>
                  </div>
                  {purchase.transaction.paymentStatus !== TransactionStatus.S && (
                    <button
                      className="inline-block px-3 py-2 text-white rounded bg-primary-500 hover:bg-primary-400 disabled:opacity-25"
                      disabled={isSubmitting}
                      onClick={() =>
                        showBankPaymentModal(
                          purchase.transactionId,
                          purchase.transaction.referenceNumber,
                          purchase.total,
                          purchase.total
                        )
                      }
                    >
                      Pay Now
                    </button>
                  )}
                </Card.Footer>
              </Card>
            ))
          ) : (
            <Card>
              <Card.Body
                title="You haven't purchased anything from the Living Pupil Homeschool Shop yet..."
                subtitle="You may visit the shop the in link below. All future purchases will be listed under 'New Purchases.'"
              >
                <Link href="/shop">
                  <a
                    className="w-full py-2 text-center rounded-lg text-primary-500 bg-secondary-500 hover:bg-secondary-600 disabled:opacity-25"
                    target="_blank"
                  >
                    Visit Shop
                  </a>
                </Link>
              </Card.Body>
            </Card>
          )}
        </Content.Container>
      )}
      {table === "NEW" && (
        <Content.Container>
          {!orderFeeData?.data?.orderFees?.orderFee || orderFeeDataIsLoading ? (
            <Card>
              <Card.Body />
            </Card>
          ) :
            sortedOrderFees.length > 0 ? (
              sortedOrderFees.map((order, index) => (
                <Card key={index}>
                  <Card.Body
                    title={`${order[0].orderCode}`}
                    subtitle={`Date of Order: ${formatDistance(
                      new Date(order[0].createdAt), // Assuming current date for simplicity
                      new Date(),
                      { addSuffix: true }
                    )}`}
                  >
                    <hr />
                    {order
                      .filter(order => order.order === 0)
                      .map((order, orderIndex) => (
                        <div key={orderIndex} className="flex flex-col p-3 space-y-4">
                          {order.transaction.purchaseHistory.orderItems.map((item, itemIndex) => (
                            <div
                              key={itemIndex}
                              className="flex items-center space-x-5 p-3 border rounded"
                            >
                              <div className="relative w-20 h-20 flex-shrink-0">
                                <Image
                                  alt={item.name}
                                  layout="fill"
                                  loading="lazy"
                                  objectFit="contain"
                                  src={
                                    item.image ||
                                    '/images/livingpupil-homeschool-logo.png'
                                  }
                                />
                              </div>
                              <div>
                                <h3 className="text-2xl font-medium text-primary-500">
                                  {item.name} (x{item.quantity})
                                </h3>
                                <p>
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
                      ))}

                    <hr className="border-2 border-gray-600" />
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-left">Payment Type</h4>
                      <h5 className="font-bold text-right">
                        {SHOP_PAYMENT_TYPE[order[0].paymentType]}
                      </h5>
                    </div>
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-left">Total</h4>
                      <h5 className="font-bold text-right text-green-600">
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

                  </Card.Body>
                  <Card.Footer>
                    <div className="flex flex-col space-y-4 w-full">
                      {order
                        .slice() // Create a copy of the array to avoid mutating the original array
                        .sort((a, b) => a.order - b.order) // Sort the array based on `order` property
                        .map((feeWrapper, feeIndex) => (
                          <div key={feeIndex} className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-2">
                              <h6 className="font-bold text-gray-400">
                                Payment Reference:{" "}
                                <span className="font-mono font-bold uppercase">
                                  {feeWrapper.transaction.paymentReference || " "}
                                </span>
                              </h6>
                              <span
                                className={`rounded-full py-0.5 text-xs px-2 ${STATUS_BG_COLOR[feeWrapper.transaction.paymentStatus]}`}
                              >
                                {STATUS_CODES[feeWrapper.transaction.paymentStatus]}
                              </span>
                            </div>
                            {feeWrapper.transaction.paymentStatus !== TransactionStatus.S && (
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

                                  <h6 className="font-bold text-sm text-center text-gray-400">
                                    {getOrderFeeDeadline(feeWrapper.order, feeWrapper.paymentType, feeWrapper.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </h6>

                                </div>
                                <button
                                  className="ml-auto px-3 py-2 text-white rounded bg-primary-500 hover:bg-primary-400 disabled:opacity-25"
                                  disabled={isSubmitting}
                                  onClick={() =>
                                    showBankPaymentModal(
                                      feeWrapper.transaction.transactionId,
                                      feeWrapper.transaction.referenceNumber,
                                      feeWrapper.transaction.amount,
                                      feeWrapper.transaction.amount
                                    )
                                  }
                                >
                                  Pay Now
                                </button>
                              </div>
                            )}
                          </div>
                        ))}

                    </div>
                  </Card.Footer>

                </Card>
              ))
            ) : (
              <Card>
                <Card.Body
                  title="You haven't purchased anything from the Living Pupil Homeschool Shop yet or the order you're looking for is in the Old Purchases..."
                  subtitle="You may select the Old Purchases above or visit the shop the in link below to start seeing your purchases here"
                >
                  <Link href="/shop">
                    <a
                      className="w-full py-2 text-center rounded-lg text-primary-500 bg-secondary-500 hover:bg-secondary-600 disabled:opacity-25"
                      target="_blank"
                    >
                      Visit Shop
                    </a>
                  </Link>
                </Card.Body>
              </Card>
            )}
        </Content.Container>
      )}

      {/* Payment QR Modal */}
      <Modal
        show={showBankModal}
        title="Payment Options"
        toggle={toggleBankModal}
      >
        <div className="space-y-6">
          {selectedTransaction && (
            <div className="text-center bg-green-50 p-4 rounded-lg border-2 border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Total Payment Amount</h3>
              <div className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'PHP',
                }).format(selectedTransaction.total)}
              </div>
            </div>
          )}

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

          {selectedTransaction && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Transaction Details:</h4>
              <div className="space-y-1 text-sm text-yellow-700">
                <div>Transaction ID: <span className="font-mono">{selectedTransaction.transactionId}</span></div>
                <div>Reference Number: <span className="font-mono">{selectedTransaction.referenceNumber}</span></div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={toggleBankModal}
              className="flex-1 py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

    </AccountLayout>
  );
};

export default PurchaseHistory;
