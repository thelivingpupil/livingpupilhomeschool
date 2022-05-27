import { createHash } from 'crypto';

import Meta from '@/components/Meta';
import { PublicLayout } from '@/layouts/index';
import { updateTransaction } from '@/prisma/services/transaction';

const Callback = ({ success, transaction }) => {
  return (
    <PublicLayout>
      <Meta title="Living Pupil Homeschool - Payment Transaction Status" />
      <div className="w-full py-5">
        <div className="relative flex flex-col items-center justify-center px-10 mx-auto space-y-5">
          <div className="flex flex-col items-center justify-center pt-10 pb-5 mx-auto">
            <h1 className="text-3xl font-medium text-center">
              <span className="block">Transaction Details</span>
            </h1>
            <h2
              className={`text-4xl font-bold text-center ${
                success ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              Payment {success ? 'Successful' : 'Failed'}
            </h2>
          </div>
          {success ? (
            <>
              <div>
                <h3 className="text-5xl text-center">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: transaction.currency,
                  }).format(transaction.amount)}
                </h3>
              </div>
              <div className="w-full p-10 space-y-5 bg-gray-100 rounded-lg md:w-1/2">
                <table className="table w-full">
                  <tbody>
                    <tr>
                      <td className="py-2 text-gray-400">Transaction ID</td>
                      <td className="py-2 font-medium text-right">
                        {transaction.transactionId}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-400">Reference No.</td>
                      <td className="py-2 font-medium text-right">
                        {transaction.paymentReference}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-gray-400">Payment Date</td>
                      <td className="py-2 font-medium text-right">
                        {transaction.createdAt}
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-sm text-center">
                  Check your account for additional details of your purchase or
                  enrollment history.
                </p>
              </div>
            </>
          ) : (
            <p className="text-center">Please contact your administrator.</p>
          )}
          <div className="px-5 py-2 text-white rounded bg-primary-500">
            You may now close this page
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export const getServerSideProps = async ({ query }) => {
  const { txnid, refno, status, message, digest } = query;
  let success = false;
  let transaction = null;
  const hash = createHash('sha1')
    .update(
      `${txnid}:${refno}:${status}:${message}:${process.env.PAYMENTS_SECRET_KEY}`
    )
    .digest('hex');

  if (hash === digest) {
    success = true;
    transaction = await updateTransaction(txnid, refno, status, message);
  }

  console.log(transaction);

  return {
    props: {
      success,
      transaction,
    },
  };
};

export default Callback;
