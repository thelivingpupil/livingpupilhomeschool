import { useState } from 'react';
import { GradeLevel, PaymentType, TransactionStatus } from '@prisma/client';
import toast from 'react-hot-toast';

import Card from '@/components/Card';
import Content from '@/components/Content';
import Meta from '@/components/Meta';
import AccountLayout from '@/layouts/AccountLayout';
import { useWorkspace } from '@/providers/workspace';
import { GRADE_LEVEL } from '@/utils/constants';
import api from '@/lib/common/api';
import { getDeadline } from '@/utils/index';
import { WrongLocation } from '@mui/icons-material';
import CenteredModal from '@/components/Modal/centered-modal';
import Modal from '@/components/Modal';

const Fees = () => {
  const { workspace } = useWorkspace();
  const [isSubmitting, setSubmittingState] = useState(false);
  const [showPayAllModal, setShowPayAllModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const fees = {
    [GradeLevel.PRESCHOOL]: { schoolFees: [] },
    [GradeLevel.K1]: { schoolFees: [] },
    [GradeLevel.K2]: { schoolFees: [] },
    [GradeLevel.GRADE_1]: { schoolFees: [] },
    [GradeLevel.GRADE_2]: { schoolFees: [] },
    [GradeLevel.GRADE_3]: { schoolFees: [] },
    [GradeLevel.GRADE_4]: { schoolFees: [] },
    [GradeLevel.GRADE_5]: { schoolFees: [] },
    [GradeLevel.GRADE_6]: { schoolFees: [] },
    [GradeLevel.GRADE_7]: { schoolFees: [] },
    [GradeLevel.GRADE_8]: { schoolFees: [] },
    [GradeLevel.GRADE_9]: { schoolFees: [] },
    [GradeLevel.GRADE_10]: { schoolFees: [] },
    [GradeLevel.GRADE_11]: { schoolFees: [] },
    [GradeLevel.GRADE_12]: { schoolFees: [] },
  };
  workspace?.schoolFees
    ?.filter(fee => fee.deletedAt === null)
    .map((fee) => {
      fees[fee.gradeLevel].schoolFees[fee.order] = fee;
    });

  // State to store total unpaid amount
  const [unpaidTotal, setUnpaidTotal] = useState(0);

  // Function to calculate total unpaid fees
  const calculateUnpaidTotal = () => {
    let total = 0;
    Object.keys(fees).forEach((level) => {
      fees[level].schoolFees.forEach((fee) => {
        if (fee.transaction && fee.transaction.paymentStatus !== TransactionStatus.S && fee.paymentType !== "PAY_ALL") {
          // Only count unpaid fees and convert amount to a float
          total += parseFloat(fee.transaction.amount) || 0;
        }
      });
    });
    setUnpaidTotal(total);
  };


  // Function to toggle the modal and calculate the total before showing it
  const togglePayAllModal = () => {
    calculateUnpaidTotal(); // Calculate total before showing the modal
    setShowPayAllModal((prev) => !prev); // Toggle modal visibility
  };

  const renew = (transactionId, referenceNumber) => {
    setSubmittingState(true);

    api(`/api/payments/transaction`, {
      body: {
        transactionId,
        referenceNumber,
      },
      method: 'PUT',
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

  const showBankPaymentModal = (transactionId, referenceNumber, amount) => {
    setSelectedTransaction({
      transactionId,
      referenceNumber,
      amount
    });
    setShowBankModal(true);
  };

  const toggleBankModal = () => {
    setShowBankModal(!showBankModal);
  };

  const payAll = () => {
    setSubmittingState(true);

    // Check if a PAY_ALL transaction exists
    const payAllFee = workspace.schoolFees.find(
      fee => fee.paymentType === "PAY_ALL"
    );

    if (unpaidTotal < payAllFee?.transaction.amount) {
      api(`/api/payments/pay-all`, {
        body: {
          transactionId: payAllFee.transaction.transactionId,
          amount: unpaidTotal,
          description: payAllFee.transaction.description,
          description: payAllFee.transaction.source
        },
        method: 'PATCH',
      }).then((response) => {
        setSubmittingState(false);

        if (response.errors) {
          Object.keys(response.errors).forEach((error) =>
            toast.error(response.errors[error].msg)
          );
        } else {
          const paymentLink = response.data.paymentLink;
          if (paymentLink) {
            window.open(paymentLink, '_blank');
            toast.success('Pay All payment link has renewed!');
          } else {
            toast.error('Error retrieving link!')
          }
        }
      });
      setSubmittingState(false);
    } else if (payAllFee && payAllFee.transaction) {
      // If a PAY_ALL transaction exists, open its payment URL
      api(`/api/payments/pay-all`, {
        body: {
          transactionId: payAllFee.transaction.transactionId,
          amount: payAllFee.transaction.amount,
          description: payAllFee.transaction.description,
          description: payAllFee.transaction.source
        },
        method: 'PATCH',
      }).then((response) => {
        setSubmittingState(false);

        if (response.errors) {
          Object.keys(response.errors).forEach((error) =>
            toast.error(response.errors[error].msg)
          );
        } else {
          const paymentLink = response.data.paymentLink;
          if (paymentLink) {
            window.open(paymentLink, '_blank');
            toast.success('Pay All payment link has renewed!');
          } else {
            if (payAllFee.transaction.url) {
              window.open(payAllFee.transaction.url, '_blank');
              toast.success('Navigated to existing Pay All payment link!');
            } else {
              toast.error('Error retrieving link!')
            }
          }
        }
      });
      setSubmittingState(false);
    } else {
      // No PAY_ALL transaction found, proceed with API call to generate one
      api(`/api/payments/pay-all`, {
        body: {
          studentId: workspace.studentRecord.studentId,
          incomingGradeLevel: workspace.studentRecord.incomingGradeLevel,
          amount: unpaidTotal,
        },
        method: 'POST',
      }).then((response) => {
        setSubmittingState(false);

        if (response.errors) {
          Object.keys(response.errors).forEach((error) =>
            toast.error(response.errors[error].msg)
          );
        } else {
          const paymentLink = response.data.paymentLink;
          if (paymentLink) {
            window.open(paymentLink, '_blank');
            toast.success('Pay All payment link has been created!');
          } else {
            toast.error('Failed to retrieve payment link.');
          }
        }
      });
    }
  };

  return (
    workspace && (
      <AccountLayout>
        <Meta title={`Living Pupil Homeschool - ${workspace.name} | Profile`} />
        <Content.Title
          title={`${workspace.name} - School Fees`}
          subtitle="This is the student record information"
        />
        <Content.Divider />
        <CenteredModal
          show={showPayAllModal}
          toggle={togglePayAllModal}
          title="Pay All Fees"
          className="no-scrollbar" // Ensures no scrollbars appear
        >
          <div className="p-4 text-center no-scrollbar">
            <p className="text-lg">Total Unpaid School Fees:</p>
            <p className="text-2xl font-bold m-4">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'PHP',
              }).format(unpaidTotal)}
            </p>
            <button
              className="mt-4 px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-400 disabled:opacity-50"
              disabled={isSubmitting}
              onClick={payAll}
            >
              Proceed to Payment
            </button>
          </div>
        </CenteredModal>

        {workspace.studentRecord ? (
          <Content.Container>
            {Object.keys(fees).map((level) => {
              if (fees[level].schoolFees.length > 0 && fees[level].schoolFees[0].deletedAt === null) {
                return (
                  <Card key={level}>
                    <Card.Body
                      title={GRADE_LEVEL[level]}
                      subtitle="Payment links will only be available within a certain time period (1 hour for online payment and 2 days for OTC transactions). For further assistance please contact our administrators."
                    >
                      <table className="border">
                        <thead>
                          <tr className="text-left">
                            <th className="px-3 py-2">Name</th>
                            <th className="px-3 py-2">Fee</th>
                            <th className="px-3 text-center py-2">Manual Payment</th>
                            <th className="px-3 py-2 text-center">Deadline</th>
                            <th className="px-3 py-2 text-center">Action / Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fees[level].schoolFees
                            .filter((f) => f.paymentType !== PaymentType.PAY_ALL) // Filter out PAY_ALL fees
                            .map((f, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2">
                                  <p>
                                    {index === 0 && f.paymentType === PaymentType.ANNUAL
                                      ? 'Total School Fee'
                                      : index === 0 && f.paymentType !== PaymentType.ANNUAL
                                        ? 'Initial School Fee'
                                        : index > 0 && f.paymentType === PaymentType.SEMI_ANNUAL
                                          ? `Three (3) Term Payment School Fee #${index}`
                                          : index > 0 && f.paymentType === PaymentType.QUARTERLY
                                            ? `Three (4) Term Payment School Fee #${index}`
                                            : `Monthly Payment School Fee #${index}`}
                                  </p>
                                  <p className="text-xs italic text-gray-400">
                                    <span className="font-medium">Reference Number: </span>
                                    <strong>{f.transaction.paymentReference}</strong>
                                  </p>
                                </td>
                                <td className="px-3 py-2">
                                  {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'PHP',
                                  }).format(f.transaction.amount)}
                                </td>
                                <td className="px-3 py-2 text-sm text-center">
                                  <div>
                                    {f.transaction.payment ? (
                                      new Intl.NumberFormat('en-US', {
                                        style: 'currency',
                                        currency: 'PHP',
                                      }).format(f.transaction.payment)
                                    ) : (
                                      '-'
                                    )}
                                    {f.transaction.balance ? (
                                      <p className="font-mono text-xs text-gray-400 lowercase">
                                        bal: {f.transaction.balance}
                                      </p>
                                    ) : (
                                      <p className="font-mono text-xs text-gray-400 lowercase"></p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-sm text-center">
                                  {index !== 0 &&
                                    fees[level].schoolFees[0].transaction.paymentStatus !== 'S'
                                    ? '-'
                                    : index === 0
                                      ? 'Initial Fee'
                                      : getDeadline(
                                        index,
                                        f.paymentType,
                                        fees[level].schoolFees[0].transaction.updatedAt,
                                        workspace.studentRecord.schoolYear,
                                        fees[level].schoolFees[0].transaction.paymentStatus
                                      ) || '-'}
                                </td>
                                <td className="px-3 py-2 space-x-3 text-center">
                                  {f.transaction.paymentStatus !== TransactionStatus.S ? (
                                    <>
                                      {index !== 0 &&
                                        fees[level].schoolFees[0].transaction.paymentStatus !== 'S' ? (
                                        <span className="inline-block px-3 py-1 text-xs text-white bg-red-600 rounded-full">
                                          Unpaid Initial Fee
                                        </span>
                                      ) : (
                                        <div className="flex flex-col space-y-2">
                                          <button
                                            className="inline-block px-3 py-2 text-xs text-white rounded bg-primary-500 hover:bg-primary-400 disabled:opacity-25"
                                            disabled={isSubmitting}
                                            onClick={() =>
                                              renew(
                                                f.transaction.transactionId,
                                                f.transaction.referenceNumber
                                              )
                                            }
                                          >
                                            Pay via Dragonpay
                                          </button>
                                          <button
                                            className="inline-block px-3 py-2 text-xs text-white rounded bg-green-600 hover:bg-green-500 disabled:opacity-25"
                                            disabled={isSubmitting}
                                            onClick={() =>
                                              showBankPaymentModal(
                                                f.transaction.transactionId,
                                                f.transaction.referenceNumber,
                                                f.transaction.amount
                                              )
                                            }
                                          >
                                            Pay via Bank Transfer
                                          </button>
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div>
                                      <span className="inline-block px-3 py-1 text-xs text-white bg-green-600 rounded-full">
                                        Paid
                                      </span>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {/* Pay All Button */}
                      {workspace.schoolFees[0].paymentType !== "ANNUAL" && (
                        <div className="flex justify-center mt-4">
                          <button
                            className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-400 disabled:opacity-50"
                            onClick={togglePayAllModal}
                            disabled={isSubmitting}
                          >
                            Pay All
                          </button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                );
              }
            })}

          </Content.Container>
        ) : (
          <Content.Container>
            <Card>
              <Card.Body title="School Fees">
                <div className="px-3 py-3 text-sm text-red-500 border-2 border-red-600 rounded bg-red-50">
                  <p>
                    You will need to enroll your student first prior to viewing
                    the school fees.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Content.Container>
        )}

        {/* Bank Transfer Payment Modal */}
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
                  }).format(selectedTransaction.amount)}
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
                <li>Payment will be verified within 24-48 hours</li>
              </ol>
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
    )
  );
};

export default Fees;
