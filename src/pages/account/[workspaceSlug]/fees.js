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

const Fees = () => {
  const { workspace } = useWorkspace();
  const [isSubmitting, setSubmittingState] = useState(false);
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


  for (const gradeLevel in fees) {
    console.log(`Grade Level: ${gradeLevel}`);
    console.log("school fees:", fees[gradeLevel].schoolFees);
  }


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

  return (
    workspace && (
      <AccountLayout>
        <Meta title={`Living Pupil Homeschool - ${workspace.name} | Profile`} />
        <Content.Title
          title={`${workspace.name} - School Fees`}
          subtitle="This is the student record information"
        />
        <Content.Divider />
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
                            <th className="px-3 py-2 text-center">
                              Action / Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {fees[level].schoolFees
                            .map((f, index) => (
                              <tr key={index}>
                                <td className="px-3 py-2">
                                  <p>
                                    {index === 0 &&
                                      f.paymentType === PaymentType.ANNUAL
                                      ? 'Total School Fee'
                                      : index === 0 &&
                                        f.paymentType !== PaymentType.ANNUAL
                                        ? 'Initial School Fee'
                                        : index > 0 &&
                                          f.paymentType === PaymentType.SEMI_ANNUAL
                                          ? `Three (3) Term Payment School Fee #${index}`
                                          : `Four (4) Term Payment School Fee #${index}`}
                                  </p>
                                  <p className="text-xs italic text-gray-400">
                                    <span className="font-medium">
                                      Reference Number:{' '}
                                    </span>
                                    <strong>
                                      {f.transaction.paymentReference}
                                    </strong>
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
                                    {f.transaction.payment ? (new Intl.NumberFormat('en-US', {
                                      style: 'currency',
                                      currency: 'PHP',
                                    }).format(f.transaction.payment)) : (
                                      '-'
                                    )}
                                    {f.transaction.balance ? (
                                      <p className="font-mono text-xs text-gray-400 lowercase">
                                        bal: {f.transaction.balance}
                                      </p>
                                    ) : (
                                      <p className="font-mono text-xs text-gray-400 lowercase">

                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-sm text-center">
                                  {getDeadline(
                                    index,
                                    f.paymentType,
                                    workspace.studentRecord.createdAt,
                                    workspace.studentRecord.schoolYear
                                  ) || '-'}
                                </td>
                                <td className="px-3 py-2 space-x-3 text-center">
                                  {f.transaction.paymentStatus ===
                                    TransactionStatus.U ||
                                    f.transaction.paymentStatus ===
                                    TransactionStatus.P ? (
                                    <>
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
                                        Get New Link
                                      </button>
                                      {/* <Link href={f.transaction.url}>
                                      <a
                                        className="inline-block px-3 py-2 text-xs rounded bg-secondary-500 hover:bg-secondary-400 disabled:opacity-25"
                                        target="_blank"
                                      >
                                        Pay Now
                                      </a>
                                    </Link> */}
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
      </AccountLayout>
    )
  );
};

export default Fees;
