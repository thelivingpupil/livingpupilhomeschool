import { useState } from 'react';
import crypto from 'crypto';

import Meta from '@/components/Meta';
import SideModal from '@/components/Modal/side-modal';
import { AdminLayout } from '@/layouts/index';
import Content from '@/components/Content';
import { usePurchases } from '@/hooks/data';
import Card from '@/components/Card';
import formatDistance from 'date-fns/formatDistance';
import { STATUS_CODES } from '@/lib/server/dragonpay';
import { STATUS_BG_COLOR } from '@/utils/constants';
import Image from 'next/image';

const Shop = () => {
  const { data, isLoading } = usePurchases();
  const [showModal, setModalVisibility] = useState(false);
  const [purchase, setPurchase] = useState(null);

  const toggleModal = () => setModalVisibility(!showModal);

  const view = (purchase) => {
    toggleModal();
    setPurchase(purchase);
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
                    : purchase.transaction.user.email}
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
            {/*
            <div className="flex items-center justify-end">
              <a
                className="inline-block px-3 py-2 text-white rounded bg-primary-500 hover:bg-primary-400"
                href={`mailto:${inquiry.email}?subject=${encodeURI(
                  `Re:${inquiry.subject}`
                )}`}
              >
                Reply
              </a>
            </div> */}
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
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200 border-t border-b border-t-gray-300 border-b-gray-300">
                    <th className="p-2 font-medium text-left">Order Details</th>
                    <th className="p-2 font-medium text-center">Items</th>
                    <th className="p-2 font-medium text-left">
                      Transaction Details
                    </th>
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
                                    : purchase.transaction.user.email}
                                </strong>
                              </p>
                            </div>
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
                                    className={`rounded-full py-0.5 text-xs px-2 ${
                                      STATUS_BG_COLOR[
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
                                {purchase.transactionId}
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
            </div>
          </Card.Body>
        </Card>
      </Content.Container>
    </AdminLayout>
  );
};

export default Shop;
