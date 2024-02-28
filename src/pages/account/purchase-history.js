import { useState } from 'react';
import Content from '@/components/Content/index';
import Meta from '@/components/Meta';
import { AccountLayout } from '@/layouts/index';
import { usePurchaseHistory } from '@/hooks/data';
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

const PurchaseHistory = () => {
  const { data, isLoading } = usePurchaseHistory();
  const [isSubmitting, setSubmittingState] = useState(false);

  const renew = (transactionId, referenceNumber, renewflag) => {
    setSubmittingState(true);
    api(`/api/payments/transaction`, {
      body: {
        transactionId,
        referenceNumber,
        renewflag,
      },
      method: 'POST',
    }).then((response) => {
      setSubmittingState(false);

      if (response.errors) {
        Object.keys(response.errors).forEach((error) =>
          toast.error(response.errors[error].msg)
        );
      } else {
        window.open(response.data.paymentLink, '_blank');
        toast.success('Payment link has been updated!');
      }
    });
  };

  return (
    <AccountLayout>
      <Meta title="Living Pupil Homeschool - Shop Purchases" />
      <Content.Title
        title="Shop Purchases"
        subtitle="View your order history"
      />
      <Content.Divider />
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
                    className={`rounded-full py-0.5 text-xs px-2 ${
                      STATUS_BG_COLOR[purchase.transaction.paymentStatus]
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
                      renew(
                        purchase.transactionId,
                        purchase.transaction.referenceNumber,
                        true
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
              subtitle="You may visit the shop the in link below to start seeing your purchases here"
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
    </AccountLayout>
  );
};

export default PurchaseHistory;
